/**
 * Renders each Immersive scene through Steam Audio, the way the ScriptFX
 * spatial editor exports a scene: every sound from its place and walk, the
 * listener in the chair, the room as real geometry (a furnished cabin, a
 * diner) with Steam Audio's standard materials, then a plain-gain master to -18 LUFS.
 *
 * The sound aims for golden-age radio drama at full quality: close and dry,
 * with only a touch of the room, warm low mids, and gentle compression.
 *
 * Needs the scriptfx-spatial repo built (`npm run build` there) and ffmpeg.
 * Run from this repo: `npx tsx scripts/bake-immersive.mts`
 * Point SCRIPTFX_SPATIAL at the spatial repo if it is not beside this one.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { defaultTrails, EAR, SCENES, walkerAt, type Cut, type Scene } from "../src/lib/site/immersive-scenes";
import { insideRoom, type Place } from "../src/components/site/immersive-world";

const SPATIAL = process.env.SCRIPTFX_SPATIAL ?? `${process.env.HOME}/Documents/Clients/scriptfx-spatial`;
const RATE = 48000, N = 512, HALF = 4, ROOM = 8;
/** The radio-drama finish: a little low-mid warmth and a softened top. No compression: the mix keeps its quiet whispers and loud hits. */
const FINISH = "equalizer=f=220:t=q:w=1:g=1.5,treble=g=-1.5:f=9000";
/** Loudness for publishing: -18 LUFS (dialogue mixes normalized for release), peaks under -3 dB (Audible ACX), applied as plain gain so dynamics survive. */
const LOUDNESS = "I=-18:TP=-3:LRA=20";
/** Steam Audio's standard materials, as the renderer numbers them (after its own hard, mixed, and soft). */
const MATERIAL = { generic: 3, brick: 4, concrete: 5, ceramic: 6, gravel: 7, carpet: 8, glass: 9, plaster: 10, wood: 11, metal: 12, rock: 13 };
type Surfaces = { floor: number; ceiling: number; front: number; right: number; back: number; left: number };
/** Each room: its height, what every surface is made of (front is the wall you face from the chair), and how much of its reverb reaches the mix (0 to 2; 1 is the room as simulated). */
const ROOMS: Record<string, { height: number; surfaces: Surfaces; reverb: number }> = {
  // A log cabin: wood all around.
  cabin: { height: 2.8, surfaces: { floor: MATERIAL.wood, ceiling: MATERIAL.wood, front: MATERIAL.wood, right: MATERIAL.wood, back: MATERIAL.wood, left: MATERIAL.wood }, reverb: .1 },
  // A diner: tile floor, plaster walls, a drop ceiling, and the big front window by the booth. Barely any room, so voices stay close.
  diner: { height: 3, surfaces: { floor: MATERIAL.ceramic, ceiling: MATERIAL.generic, front: MATERIAL.glass, right: MATERIAL.plaster, back: MATERIAL.plaster, left: MATERIAL.plaster }, reverb: .05 },
};

const decode = (file: string, channels: number) => {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", String(channels), "-ar", String(RATE), "-f", "f32le", "-"], { maxBuffer: 200_000_000 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
};

/** The room's walls, floor, and ceiling as triangles: nine corner coordinates and a material each. */
function roomGeometry(height: number, surfaces: Surfaces) {
  const triangles: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[], material: number) => triangles.push(...a, ...b, ...c, material, ...a, ...c, ...d, material);
  const [x0, x1, z0, z1] = [0, ROOM, 0, ROOM];
  quad([x0, 0, z0], [x0, 0, z1], [x1, 0, z1], [x1, 0, z0], surfaces.floor);
  quad([x0, height, z0], [x1, height, z0], [x1, height, z1], [x0, height, z1], surfaces.ceiling);
  // Walls in order: front (low z, the way the chair faces), right, back, left.
  const walls = [[[x0, z0], [x1, z0], surfaces.front], [[x1, z0], [x1, z1], surfaces.right], [[x1, z1], [x0, z1], surfaces.back], [[x0, z1], [x0, z0], surfaces.left]] as const;
  for (const [a, b, material] of walls) quad([a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], height, b[1]], [a[0], height, a[1]], material);
  return new Float32Array(triangles);
}

/** Sounds that set the room rather than speak: they dip under the dialogue, the way a film mixer rides them. */
const BEDS = new Set(["diner", "music", "storm", "score", "rain", "room", "window"]);
/** Footsteps and whistling dip too, but only about 4 dB, so the walk stays readable under a line. */
const WALKING = new Set(["steps", "group-steps", "whistle"]);
/** How far beds dip while anyone speaks, and how fast they move. */
const DUCK = .4, DUCK_ATTACK = .15, DUCK_RELEASE = .4, DUCK_HOLD = .6;
/** How long a sound with an `until` takes to fade out. */
const FADE = .25;

async function bake(key: string, scene: Scene, cutKey: string, cut: Cut) {
  const frames = Math.ceil((cut.length + 2.1) * RATE / N), room = ROOMS[key];
  // Where dialogue plays, from each spoken line's start and length, smoothed into a gain the beds follow.
  const speech = new Float32Array(frames);
  for (const sound of cut.sounds.filter(each => !BEDS.has(each.file) && !["steps", "group-steps", "cheer", "door", "board", "thunder", "whistle", "pour", "bell", "passing", "slam"].includes(each.file))) {
    const length = decode(`public/audio/examples/${scene.folder}/${sound.file}.mp3`, 1).length / RATE;
    for (let f = Math.floor(sound.at * RATE / N); f < Math.min(frames, Math.ceil((sound.at + length) * RATE / N)); f++) speech[f] = 1;
  }
  // Hold the dip through short gaps between lines so the beds don't swell up and back down.
  const hold = Math.round(DUCK_HOLD * RATE / N);
  for (let f = frames - 1, next = -Infinity; f >= 0; f--) { if (speech[f]) next = f; else if (next - f <= hold && f > 0 && speech.subarray(Math.max(0, f - hold), f).some(Boolean)) speech[f] = 1; }
  const duck = new Float32Array(frames);
  for (let f = 0, level = 1; f < frames; f++) { const target = speech[f] ? DUCK : 1, rate = N / RATE / (target < level ? DUCK_ATTACK : DUCK_RELEASE); level += (target - level) * Math.min(1, rate); duck[f] = level; }
  const trails = defaultTrails(scene);
  const placeAt = (id: string, t: number): Place => trails[id] ? walkerAt(id, t, trails[id], cut, scene) : scene.start[id] ?? { x: 0, z: 0, y: EAR };
  const geometry = roomGeometry(room.height, room.surfaces), listener = new Float32Array(frames * 4);
  for (let f = 0; f < frames; f++) listener.set([HALF, EAR, HALF, 0], f * 4);
  const tracks: Buffer[][] = [];
  for (const orb of scene.orbs) {
    // A sound outside the room is a stereo bed; inside it, a mono point source Steam Audio places and reflects.
    const bed = !trails[orb.id] && !insideRoom(placeAt(orb.id, 0)), channels = bed ? 2 : 1;
    const pcm = new Float32Array(frames * N * channels), poses = new Float32Array(frames * 4);
    for (const sound of cut.sounds.filter(each => each.orb === orb.id)) {
      const data = decode(`public/audio/examples/${scene.folder}/${sound.file}.mp3`, channels), at = Math.round(sound.at * RATE) * channels;
      const end = Math.min(pcm.length, at + data.length, Math.round((sound.until ?? cut.length) * RATE) * channels), fade = (sound.fade ?? FADE) * RATE * channels;
      const ducked = BEDS.has(sound.file), walking = WALKING.has(sound.file);
      for (let i = at; i < end; i++) pcm[i] += data[i - at] * sound.gain * (ducked ? duck[Math.floor(i / channels / N)] : walking ? 1 - (1 - duck[Math.floor(i / channels / N)]) * .62 : 1) * (sound.until ? Math.min(1, (end - i) / fade) : 1);
    }
    for (let f = 0; f < frames; f++) { const p = placeAt(orb.id, Math.min(f * N / RATE, cut.length)); poses.set([p.x + HALF, p.y, p.z + HALF, 0], f * 4); }
    const mode = Buffer.alloc(4); mode.writeUInt32LE(bed ? 1 : 0);
    tracks.push([mode, Buffer.from(poses.buffer), Buffer.from(pcm.buffer)]);
  }
  // The renderer takes up to eight sources at a time; sound adds up, so larger scenes render in batches and sum.
  const mix = new Float32Array(frames * N * 2);
  for (let first = 0; first < tracks.length; first += 8) {
    const batch = tracks.slice(first, first + 8), header = Buffer.alloc(24);
    [0x34584653, frames, batch.length, geometry.length / 10].forEach((n, i) => header.writeUInt32LE(n, i * 4));
    header.writeFloatLE(room.reverb, 16); header.writeFloatLE(1, 20);
    const out = execFileSync(`${SPATIAL}/build/scene-render`, [], { input: Buffer.concat([header, Buffer.from(geometry.buffer), Buffer.from(listener.buffer), ...batch.flat()]), maxBuffer: 300_000_000 });
    const part = new Float32Array(out.buffer, out.byteOffset, out.length / 4);
    for (let i = 0; i < Math.min(mix.length, part.length); i++) mix[i] += part[i];
  }
  const rendered = Buffer.from(mix.buffer);
  const { masterMix } = await import(`${SPATIAL}/src/mastering.mjs`);
  const { pcm } = await masterMix(rendered, { normalize: false });
  const raw = `/tmp/steam-${key}-${cutKey}.f32`;
  writeFileSync(raw, pcm);
  const out = `public/audio/examples/${scene.folder}/steam-${cutKey}.mp3`;
  // Two-pass loudness: measure, then apply it as one linear gain; the limiter only catches stray peaks.
  const input = ["-f", "f32le", "-ar", String(RATE), "-ac", "2", "-i", raw, "-t", String(cut.length)];
  const report = spawnSync("ffmpeg", ["-v", "info", "-hide_banner", ...input, "-af", `${FINISH},loudnorm=${LOUDNESS}:print_format=json`, "-f", "null", "-"]).stderr.toString();
  const stats = JSON.parse(report.match(/\{[^{}]*"input_i"[^{}]*\}/)![0]);
  const measured = `measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...input, "-af", `${FINISH},loudnorm=${LOUDNESS}:${measured},alimiter=limit=0.6:attack=1:release=60:level=false`, "-ar", "48000", "-b:a", "192k", out]);
  console.log("rendered", out);
}

for (const [key, scene] of Object.entries(SCENES)) for (const [cutKey, cut] of Object.entries(scene.cuts)) await bake(key, scene, cutKey, cut);
