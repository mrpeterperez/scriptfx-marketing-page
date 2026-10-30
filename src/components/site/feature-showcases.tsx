"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { ImmersiveWorld, insideRoom, type Place } from "./immersive-world";
import { defaultTrails, EAR, SCENES, tapSquare, walkerAt, type CabinSound, type Cell, type Scene } from "@/lib/site/immersive-scenes";
import { SpatialBlob } from "./spatial-blob";
import { useLandingSound } from "@/components/home/landing-sound";
import { useProductDemo } from "./product-demo";
import samples from "@/lib/site/audio-samples.json";
import { AudiencePreview, BeatsPreview, HumanCoveragePreview, InstantNotesPreview, ScriptPageNotesPreview, TogetherPreview } from "./product-previews";

type Word = { w: string; s: number; e: number };
type Sample = { peaks: number[]; duration: number; words: Word[]; lines?: Record<string, Word[]> };
const SAMPLES = samples as unknown as Record<string, Sample>;
type Cue = "n1" | "mara" | "leo" | "n2" | "rain" | "booth" | "cup" | "keys" | "length";
/** When each line and sound lands in the table read and in the audio drama, measured from the real takes. */
const TIMING = (samples as unknown as { timing: Record<"read" | "drama", Record<Cue, number>> }).timing;

/** Every scene's audio files, fetched once and early (before anyone presses play), so playback starts at once. */
const sceneFiles = new Map<string, Promise<ArrayBuffer>>();
const fileUrl = (scene: Scene, file: string) => `/audio/examples/${scene.folder}/${file}.mp3`;
/** Each cut's Steam Audio render: the whole scene ray-traced and mastered offline, played while nothing on the stage has moved. */
const bakedFile = (cut: string) => `steam-${cut}`;
const prefetchScenes = () => {
  for (const scene of Object.values(SCENES)) for (const [key, cut] of Object.entries(scene.cuts)) for (const file of [bakedFile(key), ...cut.sounds.map(sound => sound.file)]) {
    const url = fileUrl(scene, file);
    if (!sceneFiles.has(url)) sceneFiles.set(url, fetch(url).then(response => response.arrayBuffer()));
  }
};
/**
 * iPhones mute Web Audio while the ring/silent switch is on. A silent media
 * element playing alongside moves the page into playback mode, so the scene is
 * heard either way. Built once, on the first tap.
 */
let unmuteElement: HTMLAudioElement | null = null;
function unmuteIOS() {
  if (!unmuteElement) {
    const rate = 8000, samples = rate / 2, data = new DataView(new ArrayBuffer(44 + samples * 2));
    const text = (at: number, value: string) => [...value].forEach((c, i) => data.setUint8(at + i, c.charCodeAt(0)));
    text(0, "RIFF"); data.setUint32(4, 36 + samples * 2, true); text(8, "WAVEfmt "); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 1, true);
    data.setUint32(24, rate, true); data.setUint32(28, rate * 2, true); data.setUint16(32, 2, true); data.setUint16(34, 16, true); text(36, "data"); data.setUint32(40, samples * 2, true);
    unmuteElement = new Audio(URL.createObjectURL(new Blob([data], { type: "audio/wav" })));
    unmuteElement.loop = true;
    unmuteElement.setAttribute("x-webkit-airplay", "deny");
  }
  void unmuteElement.play().catch(() => {});
}
/** Closer than NEAR meters, a sound is at full volume; past it, it falls off like a real room. */
const NEAR = 1.1;
/** How long a sound with an `until` takes to fade out. */
const FADE = .25;
/**
 * A room's reverb: Steam Audio's ray-traced response of a furnished wooden
 * room, baked from the spatial editor's renderer.
 * The mix's room size stretches it.
 */
const roomFiles = new Map<string, Promise<ArrayBuffer>>();
async function roomResponse(context: BaseAudioContext, scene: Scene, size: number) {
  if (!roomFiles.has(scene.room.ir)) roomFiles.set(scene.room.ir, fetch(`/audio/rooms/${scene.room.ir}.wav`).then(response => response.arrayBuffer()));
  const baked = await context.decodeAudioData((await roomFiles.get(scene.room.ir)!).slice(0));
  if (Math.abs(size - 1) < .01) return baked;
  const length = Math.round(baked.length * size), stretched = context.createBuffer(2, length, baked.sampleRate);
  for (let channel = 0; channel < 2; channel++) { const from = baked.getChannelData(channel), to = stretched.getChannelData(channel); for (let i = 0; i < length; i++) to[i] = from[Math.min(from.length - 1, Math.floor(i / size))]; }
  return stretched;
}

/** The live mix: reverb, room size, distance falloff, and a level for each kind of sound. */
type Mix = { reverb: number; room: number; falloff: number; voices: number; effects: number; ambience: number; score: number; master: number };
const MIX: Mix = { reverb: 1, room: 1, falloff: .9, voices: 1, effects: 1, ambience: 1, score: 1, master: 1.25 };
const AMBIENCE = new Set(["rain", "storm", "window", "diner"]), VOICES = new Set(["narrator", "victim", "intruder", "steve", "john", "waitress", "blonde", "waiter", "kitchen"]), EFFECTS = new Set(["whistle", "steps", "group-steps", "board", "door", "thunder", "whimper", "cheer", "breath"]);
/** Which mix level a sound rides on: its file says what it is, its orb says who makes it. */
const mixLevel = (mix: Mix, sound: CabinSound) => sound.orb === "score" || sound.file === "music" ? mix.score : AMBIENCE.has(sound.orb) || sound.file === "room" ? mix.ambience : EFFECTS.has(sound.file) || !VOICES.has(sound.orb) ? mix.effects : mix.voices;
/**
 * Immersive: a thriller on the real ScriptFX sound stage, to play in headphones.
 * The intruder walks around the chair on its own; drag any sound, in the room
 * or out of it, to hear it from somewhere else.
 */
export function ImmersiveStage({ presentation = false }: { presentation?: boolean } = {}) {
  const landingSound = useLandingSound();
  const demo = useProductDemo();
  const previewTime = useRef(0);
  previewTime.current = demo?.active ? demo.time : 0;
  const [loading, setLoading] = useState(false);
  // Fetch the scene's sounds as the section comes near, so play is instant.
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const watcher = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { prefetchScenes(); watcher.disconnect(); } }, { rootMargin: "800px" });
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);
  const [sceneName, setSceneName] = useState<keyof typeof SCENES>(presentation ? "diner" : "cabin");
  const scene = SCENES[sceneName];
  const [cutName, setCutName] = useState<keyof Scene["cuts"]>(presentation ? "read" : "drama");
  const cut = scene.cuts[cutName];
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  /** Where you've put each sound. The intruder walks until you grab it. */
  const [places, setPlaces] = useState<Record<string, Place>>(scene.start);
  /** Each sound's path, in squares; the intruder starts with one. The selected sound's path is the one showing and the one you draw. */
  const [trails, setTrails] = useState<Record<string, Cell[]>>(defaultTrails(scene));
  const [selected, setSelected] = useState(scene.walker);
  const walk = useRef(trails);
  useEffect(() => { walk.current = trails; }, [trails]);
  const squares = trails[selected] ?? [];
  const setSquares = (change: (current: Cell[]) => Cell[]) => { setTrails(current => ({ ...current, [selected]: change(current[selected] ?? []) })); setPlaces(({ [selected]: _, ...rest }) => rest); };
  type Engine = { output: GainNode; baked: GainNode; context: AudioContext; buffers: Record<string, AudioBuffer>; gains: Record<string, GainNode>; air: Record<string, BiquadFilterNode>; panners: Record<string, PannerNode>; sends: Record<string, GainNode>; meters: Record<string, AnalyserNode>; sink: GainNode; master: GainNode; reverb: ConvolverNode; roomFor: string; sources: AudioBufferSourceNode[]; startedAt: number };
  const audio = useRef<Engine | null>(null);
  const playRequest = useRef(0);
  /** The mastering chain every sound ends in: a real room's reverb and a limiter that only catches stray peaks. No bus compression, so whispers stay quiet and hits stay loud, like the rendered mix. */
  const engine = (): Engine => {
    if (audio.current) return audio.current;
    const context = new AudioContext(), master = context.createGain(), reverb = context.createConvolver(), wet = context.createGain();
    const limiter = new DynamicsCompressorNode(context, { threshold: -1, knee: 0, ratio: 20, attack: .002, release: .06 });
    const output = context.createGain(); output.gain.value = editedRef.current ? MIX.master : 0;
    reverb.connect(wet).connect(master);
    master.connect(limiter).connect(output).connect(context.destination);
    // The Steam Audio render plays on its own bus, already mastered; the live mix fades in once the stage is changed.
    const baked = context.createGain(); baked.gain.value = editedRef.current ? 0 : 1; baked.connect(context.destination);
    // Meters feed a muted sink so Safari keeps them measuring; it only runs nodes that reach the speakers.
    const sink = context.createGain(); sink.gain.value = 0; sink.connect(context.destination);
    audio.current = { output, baked, context, buffers: {}, gains: {}, air: {}, panners: {}, sends: {}, meters: {}, sink, master, reverb, roomFor: "", sources: [], startedAt: 0 };
    return audio.current;
  };
  const samples = useRef(new Float32Array(256));
  const placed = useRef(places);
  useEffect(() => { placed.current = places; }, [places]);

  /** Where the scene is paused, so it picks up there and the intruder stays put meanwhile. */
  const pausedAt = useRef(0);
  const clock = () => { const live = audio.current; return live?.sources.length ? live.context.currentTime - live.startedAt : demo?.active ? previewTime.current % cut.length : pausedAt.current; };
  const where = (id: string): Place => placed.current[id] ?? (walk.current[id]?.length ? walkerAt(id, clock(), walk.current[id], cut, scene) : scene.start[id] ?? { x: -2.2, z: 2.6, y: 1.6 });

  /** Every panner sits where its orb is; outside the room, a sound plays as a plain stereo layer. */
  const aim = () => {
    const live = audio.current;
    if (!live) return;
    for (const sound of cut.sounds) {
      const panner = live.panners[sound.id];
      // A sound this scene hasn't loaded yet has nothing to aim.
      if (!panner) continue;
      const place = where(sound.orb), inside = insideRoom(place), now = live.context.currentTime;
      // In the room a sound is a mono point source, so your ears can place it; outside it's a full-width stereo layer.
      panner.panningModel = inside ? "HRTF" : "equalpower";
      panner.channelCount = inside ? 1 : 2;
      panner.positionX.setTargetAtTime(inside ? place.x : 0, now, .05);
      panner.positionY.setTargetAtTime(inside ? place.y - EAR : 0, now, .05);
      panner.positionZ.setTargetAtTime(inside ? place.z : -NEAR, now, .05);
      // Far sounds lose their highs, the way air muffles them.
      const distance = inside ? Math.hypot(place.x, place.y - EAR, place.z) : 0;
      live.air[sound.id].frequency.setTargetAtTime(Math.max(1800, 20000 / (1 + distance * distance * .35)), now, .05);
      // Sounds in the room ring in it, more the farther they are; inside a meter the voice drowns its room out, like a whisper at your ear. Layers outside it stay dry.
      const closeness = Math.min(1, Math.max(.3, distance));
      live.sends[sound.id].gain.setTargetAtTime(inside ? scene.room.wet * MIX.reverb * closeness * (.6 + Math.min(1, distance / 4)) : 0, now, .05);
    }
  };
  useEffect(aim, [places]);
  /** Whether anything on the stage differs from how the scene was rendered: then the live mix plays instead of the Steam Audio render. */
  const edited = JSON.stringify(places) !== JSON.stringify(scene.start) || JSON.stringify(trails) !== JSON.stringify(defaultTrails(scene));
  const editedRef = useRef(edited);
  useEffect(() => {
    editedRef.current = edited;
    const live = audio.current;
    if (!live) return;
    const now = live.context.currentTime;
    live.baked.gain.setTargetAtTime(edited ? 0 : 1, now, .15);
    live.output.gain.setTargetAtTime(edited ? MIX.master : 0, now, .15);
  }, [edited]);

  /** Pause where it is; at the end, rewind to the top. */
  function stop(rewind = false) {
    playRequest.current++;
    pausedAt.current = rewind ? 0 : clock();
    unmuteElement?.pause();
    audio.current?.sources.forEach(source => { try { source.stop(); } catch {} });
    if (audio.current) audio.current.sources = [];
    setPlaying(false);
    if (rewind) setProgress(0);
  }
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const elapsed = clock();
      aim();
      setProgress(Math.min(1, elapsed / cut.length));
      if (elapsed >= cut.length) { stop(true); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  useEffect(() => () => { audio.current?.sources.forEach(source => { try { source.stop(); } catch {} }); }, []);

  async function play() {
    if (playing) { stop(); return; }
    if (landingSound && !landingSound.sound) landingSound.setSound(true);
    // Start the audio engine inside the tap itself, before any waiting, or phones keep it silent.
    unmuteIOS();
    void engine().context.resume();
    setLoading(true);
    try { await begin(); } finally { setLoading(false); }
  }
  /** Click or drag on the waveform to scrub: the scene jumps there, and plays on from where you let go if it was playing. */
  const scrub = useRef<{ resume: boolean } | null>(null);
  const scrubTo = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect(), at = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    pausedAt.current = at * cut.length;
    setProgress(at);
  };
  const scrubStart = (event: React.PointerEvent<HTMLDivElement>) => {
    scrub.current = { resume: playing };
    if (playing) stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubTo(event);
  };
  const scrubEnd = () => { const resume = scrub.current?.resume; scrub.current = null; if (resume) void begin(); };
  /** Start the scene from where it's paused. */
  async function begin() {
    const request = ++playRequest.current;
    if (playingClip) playingClip.pause();
    unmuteIOS();
    const live0 = engine();
    // The room's reverb, sized for this scene.
    if (live0.roomFor !== `${sceneName}:${MIX.room}`) { live0.reverb.buffer = await roomResponse(live0.context, scene, Math.max(.2, MIX.room)); live0.roomFor = `${sceneName}:${MIX.room}`; }
    // Load and wire each sound this cut needs the first time it plays.
    const { context, buffers, gains, air, panners, sends, meters, sink, master, reverb } = live0;
    await Promise.all(cut.sounds.filter(sound => !buffers[sound.id]).map(async sound => {
      prefetchScenes();
      buffers[sound.id] = await context.decodeAudioData((await sceneFiles.get(fileUrl(scene, sound.file))!).slice(0));
      const gain = context.createGain(); gain.gain.value = sound.gain * mixLevel(MIX, sound); gains[sound.id] = gain;
      const meter = context.createAnalyser(); meter.fftSize = 256; gain.connect(meter).connect(sink); meters[sound.id] = meter;
      const filter = context.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 20000; air[sound.id] = filter;
      const panner = new PannerNode(context, { panningModel: "HRTF", distanceModel: "inverse", refDistance: NEAR, rolloffFactor: MIX.falloff, channelCount: 1, channelCountMode: "explicit" });
      const send = context.createGain(); send.gain.value = 0; sends[sound.id] = send;
      gain.connect(filter).connect(panner).connect(master);
      panner.connect(send).connect(reverb);
      panners[sound.id] = panner;
    }));
    const bakedKey = `${sceneName}:${cutName}`;
    if (!buffers[bakedKey]) buffers[bakedKey] = await context.decodeAudioData((await sceneFiles.get(fileUrl(scene, bakedFile(cutName)))!).slice(0));
    const live = live0;
    await live.context.resume();
    if (request !== playRequest.current) return;
    const start = live.context.currentTime + .1, offset = pausedAt.current;
    live.sources = cut.sounds.filter(sound => offset < Math.min(sound.at + live.buffers[sound.id].duration, sound.until ?? Infinity)).map(sound => {
      const source = live.context.createBufferSource(); source.buffer = live.buffers[sound.id];
      if (sound.at >= offset) source.start(start + sound.at - offset); else source.start(start, offset - sound.at);
      // A sound with an `until` (boots on the last square) fades out there.
      const end = start + (sound.until ?? cut.length) - offset;
      if (sound.until === undefined) source.connect(live.gains[sound.id]);
      else { const fade = live.context.createGain(); fade.gain.setValueAtTime(1, Math.max(start, end - (sound.fade ?? FADE))); fade.gain.linearRampToValueAtTime(0, end); source.connect(fade).connect(live.gains[sound.id]); }
      source.stop(end);
      return source;
    });
    const render = live.context.createBufferSource(); render.buffer = buffers[bakedKey]; render.connect(live.baked);
    if (offset < render.buffer.duration) { render.start(start, offset); live.sources.push(render); }
    live.startedAt = start - offset;
    aim();
    setPlaying(true);
  }

  /** How loud an orb is right now, from its sounds' live level, so it pulses as it talks. */
  const level = (id: string) => {
    const live = audio.current;
    if (!live || !live.sources.length) return 0;
    let loudest = 0;
    for (const sound of cut.sounds) {
      const meter = live.meters[sound.id];
      if (sound.orb !== id || !meter) continue;
      meter.getFloatTimeDomainData(samples.current);
      let sum = 0;
      for (const value of samples.current) sum += value * value;
      loudest = Math.max(loudest, Math.min(1, Math.sqrt(sum / samples.current.length) * 8));
    }
    return loudest;
  };

  /** Switch scenes: stop, rewind, and put every sound and path back where the new scene starts them. */
  const switchScene = (key: keyof typeof SCENES) => {
    if (key === sceneName) return;
    stop(true);
    const next = SCENES[key];
    setSceneName(key); setPlaces(next.start); setTrails(defaultTrails(next)); setSelected(next.walker);
  };
  const pill = (on: boolean) => `cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${on ? "bg-white text-[#202020]" : "text-white/70 hover:text-white"}`;

  const syncDemo = useEffectEvent((active: boolean, sound: boolean) => {
    if (active && sound) void play().catch(() => stop());
    else stop();
  });
  const stopDemo = useEffectEvent(() => stop());
  const embedded = demo !== null;
  useEffect(() => {
    if (!embedded) return;
    const frame = requestAnimationFrame(() => syncDemo(!!demo?.active, !!demo?.sound));
    return () => { cancelAnimationFrame(frame); stopDemo(); };
  }, [embedded, demo?.active, demo?.sound]);

  if (!demo) return <section ref={section} id="immersive" className="hear-stage scroll-mt-20" aria-label="Immersive">
    <div className="hear-panel">
    <div className="relative mx-auto max-w-[1200px] px-6 text-white">
      <header className="mx-auto max-w-2xl text-center"><h2 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Don’t just hear it. Experience it.</h2><p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">Spatial audio · Powered by
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ScriptFXLogo.svg" alt="ScriptFX" className="h-[14px] w-auto translate-y-[1.5px]" /></p><p className="mt-5 text-lg leading-8 text-white/70">Immersive sound all around your readers. Put on headphones, press play, and drag any sound around the room. Just don’t turn around.</p></header>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <div role="group" aria-label="Scene" className="flex rounded-full bg-white/10 p-1">{(Object.keys(SCENES) as (keyof typeof SCENES)[]).map(key => <button key={key} type="button" aria-pressed={sceneName === key} onClick={() => switchScene(key)} className={pill(sceneName === key)}>{SCENES[key].label}</button>)}</div>
        <div role="group" aria-label="How to hear the scene" className="flex rounded-full bg-white/10 p-1">{(Object.keys(scene.cuts) as (keyof Scene["cuts"])[]).map(key => <button key={key} type="button" aria-pressed={cutName === key} onClick={() => { if (cutName !== key) { stop(true); setCutName(key); } }} className={pill(cutName === key)}>{scene.cuts[key].label}</button>)}</div>
      </div>
      <div className="mx-auto mt-6 flex max-w-xl items-center gap-4">
        <button type="button" onClick={() => void play()} aria-label={loading ? "Loading the scene" : playing ? "Pause the scene" : "Play the scene"} aria-busy={loading} className="grid size-14 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-[#202020] transition-transform hover:scale-105">{loading ? <i className="size-5 animate-spin rounded-full border-2 border-[#202020] border-t-transparent" /> : playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</button>
        <div className="min-w-0 flex-1 text-left"><p className="text-sm font-medium">{scene.heading}</p><div role="slider" aria-label="Scene position" aria-valuemin={0} aria-valuemax={Math.round(cut.length)} aria-valuenow={Math.round(progress * cut.length)} tabIndex={0} className="mt-1 flex cursor-pointer touch-none" onPointerDown={scrubStart} onPointerMove={event => { if (scrub.current) scrubTo(event); }} onPointerUp={scrubEnd} onPointerCancel={scrubEnd}><Wave peaks={SAMPLES[cut.peaks].peaks} progress={progress} dark /></div></div>
      </div>
    </div>
    <div className="relative mx-auto mt-6 max-w-[1600px] px-2">
      <ImmersiveWorld key={sceneName} orbs={scene.orbs} where={where} level={level} onMove={(id, place) => setPlaces(current => ({ ...current, [id]: place }))}
        onSelect={setSelected}
        walker={{ id: selected, cells: squares, onTap: cell => setSquares(current => tapSquare(current, cell)),
          onStroke: (cells, erase) => setSquares(current => erase ? current.filter(square => !cells.some(cell => cell.x === square.x && cell.z === square.z)) : cells.reduce((path, cell) => path.some(square => square.x === cell.x && square.z === cell.z) ? path : tapSquare(path, cell), current)) }}
        note={<>Tap a sound, then tap the floor to draw its path · <span className="text-white">{scene.orbs.find(orb => orb.id === selected)?.name}</span>{JSON.stringify(trails) !== JSON.stringify(defaultTrails(scene)) && <> · <button type="button" onClick={() => { setTrails(defaultTrails(scene)); setSelected(scene.walker); }} className="cursor-pointer text-white underline underline-offset-2">Reset</button></>}</>} label={`${scene.heading} on the ScriptFX sound stage. Drag any sound to move it, drag the floor to turn the room, and pinch to zoom.`} />
    </div>
    <div className="relative mx-auto max-w-[1200px] px-6 text-white">
      <div className="mt-5 text-center"><Link href="/products/audio-drama" className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#202020] transition-colors hover:bg-white/85">Learn more</Link></div>
      <div className="mt-10"><PoweredBy dark /></div>
    </div>
    </div>
  </section>;

  return <section ref={section} id="immersive" data-presentation={presentation} className="hear-stage scroll-mt-20" aria-label="Immersive">
    <div className="hear-panel">
    <div className="relative mx-auto max-w-[1200px] px-6 text-white">
      <header className="mx-auto max-w-2xl text-center"><h2 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Don’t just hear it. Experience it.</h2><p className="mt-5 text-lg leading-8 text-white/70">Immersive sound all around your readers. Put on headphones, press play, and drag any sound around the room. Just don’t turn around.</p></header>
      {!presentation && <div className="mt-8 flex flex-wrap justify-center gap-3">
        <div role="group" aria-label="Scene" className="flex rounded-full bg-white/10 p-1">{(Object.keys(SCENES) as (keyof typeof SCENES)[]).map(key => <button key={key} type="button" aria-pressed={sceneName === key} onClick={() => switchScene(key)} className={pill(sceneName === key)}>{SCENES[key].label}</button>)}</div>
        {!demo && <div role="group" aria-label="How to hear the scene" className="flex rounded-full bg-white/10 p-1">{(Object.keys(scene.cuts) as (keyof Scene["cuts"])[]).map(key => <button key={key} type="button" aria-pressed={cutName === key} onClick={() => { if (cutName !== key) { stop(true); setCutName(key); } }} className={pill(cutName === key)}>{scene.cuts[key].label}</button>)}</div>}
      </div>}
      <div className="mx-auto mt-6 flex max-w-xl items-center gap-4">
        <button type="button" onClick={() => void play()} aria-label={loading ? "Loading the scene" : playing ? "Pause the scene" : "Play the scene"} aria-busy={loading} className="grid size-14 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-[#202020] transition-transform hover:scale-105">{loading ? <i className="size-5 animate-spin rounded-full border-2 border-[#202020] border-t-transparent" /> : playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</button>
        <div className="min-w-0 flex-1 text-left"><p className="text-sm font-medium">{scene.heading}</p><div role="slider" aria-label="Scene position" aria-valuemin={0} aria-valuemax={Math.round(cut.length)} aria-valuenow={Math.round(progress * cut.length)} tabIndex={0} className="mt-1 flex cursor-pointer touch-none" onPointerDown={scrubStart} onPointerMove={event => { if (scrub.current) scrubTo(event); }} onPointerUp={scrubEnd} onPointerCancel={scrubEnd}><Wave peaks={SAMPLES[cut.peaks].peaks} progress={demo?.active && !playing ? (demo.time % cut.length) / cut.length : progress} dark /></div></div>
      </div>
    </div>
    <div className="relative mx-auto mt-6 max-w-[1600px] px-2">
      <div style={presentation ? { pointerEvents: "none" } : undefined}>
      {(!demo || demo.visible) && <ImmersiveWorld key={sceneName} showControls={false} orbs={scene.orbs} where={where} level={level} onMove={(id, place) => setPlaces(current => ({ ...current, [id]: place }))}
        onSelect={setSelected}
        walker={{ id: selected, cells: squares, onTap: cell => setSquares(current => tapSquare(current, cell)),
          onStroke: (cells, erase) => setSquares(current => erase ? current.filter(square => !cells.some(cell => cell.x === square.x && cell.z === square.z)) : cells.reduce((path, cell) => path.some(square => square.x === cell.x && square.z === cell.z) ? path : tapSquare(path, cell), current)) }}
        note={JSON.stringify(trails) !== JSON.stringify(defaultTrails(scene)) ? <button type="button" onClick={() => { setTrails(defaultTrails(scene)); setSelected(scene.walker); }} className="cursor-pointer text-white/70 underline underline-offset-2">Reset sound positions</button> : undefined} label={presentation ? `${scene.heading}. Animated spatial audio table read.` : `${scene.heading} on the ScriptFX sound stage. Drag any sound to move it, drag the floor to turn the room, and pinch to zoom.`} />}
      </div>
      <p className="spatial-audio-credit"><span>Spatial audio</span><span>·</span><span>Powered by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ScriptFXLogo.svg" alt="ScriptFX" /></p>
    </div>
    <div className="relative mx-auto max-w-[1200px] px-6 text-white">
      <div className="mt-5 text-center"><Link href="/products/audio-drama" className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#202020] transition-colors hover:bg-white/85">Learn more</Link></div>
      <div className="mt-10"><PoweredBy dark /></div>
    </div>
    </div>
  </section>;
}

const TOOLS: { title: string; text: string; points: string[]; link?: { href: string; label: string }; visual: React.ReactNode }[] = [
  { title: "Coverage from reputable readers", text: "Vetted readers who cover scripts for a living read every page in your genre. Each reader sets their own rate.", points: ["Notes in your margins", "Ratings for premise, story, characters, and dialogue", "A verdict, like studio coverage"], link: { href: "/solutions/script-readers", label: "Script reader? Apply to read with us." }, visual: <HumanCoveragePreview /> },
  { title: "Instant notes when you’re stuck", text: "We’re writers too. When a scene won’t move at 2 a.m., AI readers give you notes in minutes. Tested against produced screenplays.", points: ["Notes on premise, story, characters, and dialogue", "See what the readers agree on", "Notes, not a co-writer"], visual: <InstantNotesPreview /> },
  { title: "Every note on its line", text: "Readers’ notes sit in the margin next to the line they’re about.", points: ["Open a note to see its line", "Fix it and move on"], visual: <ScriptPageNotesPreview /> },
  { title: "Test the read", text: "An AI audience, tested against produced screenplays, watches every scene and tells you how it landed.", points: ["A popcorn rating for the whole script", "Everyday crowd or a tough one", "A dial line that shows where it drops"], link: { href: "/products/test-the-read", label: "Explore Test the read" }, visual: <AudiencePreview /> },
  { title: "Beats", text: "See every act at once and drag scenes into the beats they belong to.", points: ["Save the Cat!®, three acts, or the Story Circle", "Start from a few guided questions", "Scenes stay in sync with the page"], visual: <BeatsPreview /> },
  { title: "Write it together", text: "Bring your co-writer, producer, and readers into one script.", points: ["See who’s here and follow along", "Every note sits next to its line", "Roles and approvals on Studio Team"], link: { href: "/products/team-collaboration", label: "Explore team collaboration" }, visual: <TogetherPreview /> },
  { title: "You direct. AI helps.", text: "Ask for a beat, a fix, or a whole scene, out loud or by typing. It does only what you ask.", points: ["Every change is marked", "Keep it, rewrite it, or undo it", "Never changes your script on its own"], link: { href: "/products/live-directing", label: "Explore Live Directing" }, visual: <DirectStage /> },
];

/** Directing in one exchange: the orb, what you asked, what changed, and keep or undo. */
function DirectStage() {
  return <div className="relative grid size-full min-h-[380px] place-items-center">
    <div className="direct-orb"><SpatialBlob /></div>
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2.5">
    <p className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-sm text-[#202020] shadow-sm"><span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a8a8a]">You</span>“Make the diner scene tenser.”</p>
    <p className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-sm text-[#6b6b6b] shadow-sm">Changed 3 lines in Scene 12<b className="rounded-full bg-[#202020] px-2.5 py-0.5 text-xs text-white">Keep</b><b className="rounded-full px-2.5 py-0.5 text-xs text-[#202020] ring-1 ring-[#e0e0e0]">Undo</b></p>
    </div>
  </div>;
}

/**
 * The writing tools as one calm scroll, like xAI's voice page: on the left an
 * icon, a line, and a few checks per tool; on the right one picture, pinned,
 * that changes to match the tool in view.
 */
export function ToolsStory() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step)); }), { rootMargin: "-45% 0px -45% 0px" });
    steps.current.forEach(step => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);
  return <section className="tools-story" aria-label="Writing tools">
    <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div>{TOOLS.map((tool, index) => <article key={tool.title} ref={node => { steps.current[index] = node; }} data-step={index} className={`flex flex-col justify-center py-10 transition-opacity duration-500 lg:min-h-[64vh] ${active === index ? "lg:opacity-100" : "lg:opacity-30"}`}>
        <h2>{tool.title}</h2>
        <p>{tool.text}</p>
        <ul>{tool.points.map(point => <li key={point}><Check size={16} aria-hidden="true" />{point}</li>)}</ul>
        {tool.link ? <Link href={tool.link.href} className="writing-row-link">{tool.link.label}</Link> : null}
        <div className="tools-art tools-art-inline">{tool.visual}</div>
      </article>)}</div>
      <div className="tools-pin-column"><div className="tools-art tools-pin">{TOOLS.map((tool, index) => <div key={tool.title} aria-hidden={active !== index} className={`absolute inset-0 grid place-items-center p-10 transition-all duration-500 ${active === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>{tool.visual}</div>)}</div></div>
    </div>
  </section>;
}


/** One clip playing at a time across the page: starting another stops this one. */
let playingClip: HTMLAudioElement | null = null;
function useClip(src: string, autoAt = 0) {
  const landingSound = useLandingSound();
  const demo = useProductDemo();
  const data = SAMPLES[src.replace("/audio/examples/", "").replace(".mp3", "")];
  const duration = data?.duration || 10;
  const preview = demo ? Math.max(0, Math.min(duration, demo.time - autoAt)) : 0;
  const shouldPlay = !!demo?.active && !!demo.sound && demo.time >= autoAt && demo.time < autoAt + duration;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const getClip = () => {
    if (!audio.current) {
      const clip = new Audio(src);
      clip.preload = "none";
      clip.onplay = () => setPlaying(true);
      clip.onpause = () => setPlaying(false);
      clip.ontimeupdate = () => { setTime(clip.currentTime); setProgress(clip.duration ? clip.currentTime / clip.duration : 0); };
      clip.onended = () => { setPlaying(false); setProgress(0); setTime(0); };
      audio.current = clip;
    }
    return audio.current;
  };
  const start = () => {
    if (landingSound && !landingSound.sound) landingSound.setSound(true);
    const clip = getClip();
    if (playingClip && playingClip !== clip) playingClip.pause();
    playingClip = clip;
    if (clip.ended) clip.currentTime = 0;
    void clip.play().catch(() => setPlaying(false));
  };
  useEffect(() => () => audio.current?.pause(), []);
  const syncDemoClip = useEffectEvent((play: boolean) => { if (play) start(); else audio.current?.pause(); });
  const embedded = demo !== null;
  useEffect(() => {
    if (embedded) syncDemoClip(shouldPlay);
  }, [embedded, shouldPlay, demo?.active, demo?.sound]);
  const toggle = () => { if (audio.current && !audio.current.paused) audio.current.pause(); else start(); };
  const seek = (at: number) => { start(); getClip().currentTime = Math.max(0, at - .05); };
  return { playing, progress: demo?.active && !playing ? preview / duration : progress, time: demo?.active && !playing ? preview : time, toggle, seek };
}

const PlayButton = ({ playing, onClick, label, dark = true }: { playing: boolean; onClick: () => void; label: string; dark?: boolean }) =>
  <button type="button" onClick={onClick} aria-label={`${playing ? "Pause" : "Play"} ${label}`} className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-full transition-transform hover:scale-105 ${dark ? "bg-[#202020] text-white" : "bg-white text-[#202020] shadow-sm"}`}>{playing ? <span className="flex gap-[3px]"><i className="h-3 w-[3px] bg-current" /><i className="h-3 w-[3px] bg-current" /></span> : <Play className="ml-0.5 size-4 fill-current" />}</button>;

/** A waveform that fills with gold as the clip plays. */
/** The clip's real waveform, from its measured peaks, filling with gold as it plays. */
const Wave = ({ peaks, progress, every = 1, dark = false }: { peaks: number[]; progress: number; every?: number; dark?: boolean }) => {
  const bars = peaks.filter((_, i) => i % every === 0);
  return <svg className="demo-wave" viewBox={`0 0 ${bars.length} 100`} preserveAspectRatio="none" aria-hidden="true">{bars.map((peak, i) => {
    const height = Math.max(8, peak * 100);
    return <rect key={i} x={i + .15} y={(100 - height) / 2} width={.7} height={height} rx={.35} fill={i / bars.length < progress ? "#c79a3c" : dark ? "#ffffff33" : "#d6d6d6"} />;
  })}</svg>;
};

/** A line with its tags drawn as the editor draws them: [emotion] tags as italic purple pills and {sound} tags as plain ones, brackets kept. */
/** Sound tags by kind, as the editor marks them: an icon for each, and here a color for each too. */
const SOUND_KINDS = {
  effect: { icon: "💥", className: "bg-[#e6eefc] text-[#2f5fb8]" },
  ambience: { icon: "🌧", className: "bg-[#e2f4ef] text-[#1f7a64]" },
  music: { icon: "🎵", className: "bg-[#fbf0d6] text-[#94660f]" },
} as const;
const SOUND_KIND_OF: Record<string, keyof typeof SOUND_KINDS> = { "diner at night": "ambience", "noir score": "music" };
/** A {sound} tag: its kind's icon and color, braces kept. */
const SoundPill = ({ tag, live = false }: { tag: string; live?: boolean }) => { const kind = SOUND_KINDS[SOUND_KIND_OF[tag] ?? "effect"]; return <span className={`justify-self-start whitespace-nowrap rounded-[0.55em] px-[0.4ch] transition-shadow duration-150 [box-decoration-break:clone] ${kind.className} ${live ? "shadow-[0_0_0_2px_currentColor]" : ""}`}><span aria-hidden="true" className="mr-[0.25ch] text-[0.8em]">{kind.icon}</span>{`{${tag}}`}</span>; };
/** When each {tag}'s sound is playing, as start and end seconds. */
type Cues = Record<string, [number, number]>;
const Tagged = ({ line, words, time = -1, cues, onSeek }: { line: string; words?: Word[]; time?: number; cues?: Cues; onSeek?: (time: number) => void }) => {
  let spoken = 0;
  return <>{line.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((part, i) => {
    if (part.startsWith("{")) { const tag = part.slice(1, -1), cue = cues?.[tag]; return <SoundPill key={i} tag={tag} live={!!cue && time >= cue[0] && time < cue[1]} />; }
    if (part.startsWith("[")) return <span key={i} className="rounded-[0.55em] bg-[#efe9ff] px-[0.3ch] italic text-[#6d3fd9] [box-decoration-break:clone]">{part}</span>;
    return <span key={i}>{part.split(/(\s+)/).map((token, j) => { if (!token.trim()) return token; const word = words?.[spoken++]; const live = !!word && time >= word.s && time < word.e + .05; return <span key={j} onClick={word && onSeek ? () => onSeek(word.s) : undefined} className={`rounded-[3px] transition-colors duration-100 ${live ? "bg-[#c79a3c40]" : ""} ${word && onSeek ? "cursor-pointer hover:bg-[#c79a3c26]" : ""}`}>{token}</span>; })}</span>;
  })}</>;
};

/** A draft of a line you can play. */
function DraftLine({ label, line, sample, note }: { label: string; line: string; sample: string; note: string }) {
  const clip = useClip(`/audio/examples/${sample}.mp3`, sample === "draft-2" ? SAMPLES["draft-1"].duration + 1 : 0), data = SAMPLES[sample];
  return <div className="draft-line grid min-w-0 gap-4 rounded-3xl bg-white p-6 text-left shadow-[0_8px_30px_#0000000d]">
    <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-[#8a8a8a]"><span>{label}</span><span className="normal-case tracking-normal">{note}</span></p>
    <div className="font-mono text-[14px] leading-relaxed"><p className="ml-[30%]">MARA</p><p className="ml-[12%] mr-[8%]"><Tagged line={line} words={data.words} time={clip.time} onSeek={clip.seek} /></p></div>
    <div className="flex items-center gap-3"><PlayButton playing={clip.playing} onClick={clip.toggle} label={label} /><Wave peaks={data.peaks} progress={clip.progress} /></div>
  </div>;
}

/**
 * The new way to write, shown with a real line: write it, hear it, rewrite it,
 * and hear the difference.
 */
export function WriteListenRewrite() {
  return <section className="write-listen" aria-label="Write, listen, rewrite">
    <header><h2>Write it. Hear it. Rewrite it.</h2><p>The new way to write: hear every line the moment you write it, then fix what sounds wrong and tell the voice how to say it. Press play on both drafts.</p></header>
    <div className="write-listen-drafts">
      <DraftLine label="Draft 1" note="No direction. Sounds like a speech." line="I want the car. And I want the money. I want the car, Leo, and I want the money, and I want it tonight." sample="draft-1" />
      <span className="write-listen-arrow" aria-hidden="true">→</span>
      <DraftLine label="Draft 2" note="Cut it down. Added emotion." line="[quietly] The car. The money... [firm] Tonight, Leo." sample="draft-2" />
    </div>
    <div className="mt-5"><PoweredBy /></div>
  </section>;
}

/** Who makes our voices, sound, and music: the ElevenLabs mark, and our own models under the ScriptFX mark. */
export function PoweredBy({ dark = false }: { dark?: boolean }) {
  return <p className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs ${dark ? "text-white/60" : "text-[#8a8a8a]"}`}>Voices, sound, and music by
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`/brand/partners/elevenlabs-logo-${dark ? "white" : "black"}.svg`} alt="ElevenLabs" className="h-[11px] w-auto" />
    <span>&amp;</span>
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dark ? "/brand/ScriptFXLogo.svg" : "/brand/scriptfx-logo-black.svg"} alt="ScriptFX" className="h-[14px] w-auto translate-y-[1.5px]" />
      <span className={`font-medium ${dark ? "text-white" : "text-[#202020]"}`}>Voices · Foley · Score</span>
    </span></p>;
}

/** The two ways to hear a scene, each a set of stems that play together. */
const PLAYS = {
  read: { label: "Table read", length: TIMING.read.length, voices: "drama/table" },
  drama: { label: "Audio drama", length: TIMING.drama.length, voices: "drama/voices" },
} as const;
/** The layers under the voices, on in both: the room, the sounds tagged on the page, and the score. */
const LAYERS = [{ id: "ambience", label: "Ambience", source: "ScriptFX Foley" }, { id: "effects", label: "Sound effects", source: "ScriptFX Foley" }, { id: "score", label: "Music", source: "ScriptFX Score" }] as const;
/** The short sounds tagged on the page, placed on the words they belong to. */
const FOLEY = [{ id: "booth" }, { id: "cup" }, { id: "keys" }] as const;
const stemFor = (mode: keyof typeof PLAYS, layer: string) => layer === "voices" ? PLAYS[mode].voices : `drama/${mode}-${layer === "effects" ? "rain" : layer}`;
/** The audio drama as the app converts it: narration rewritten for the ear like a 1950s radio play, dialogue word for word, one ambience, and effects from the action. */
const DRAMA_BLOCKS: { kind: "narration" | "dialogue" | "ambience" | "effect" | "music"; who: string; text: string; line?: string }[] = [
  { kind: "ambience", who: "Ambience", text: "diner at night" },
  { kind: "music", who: "Music", text: "noir score" },
  { kind: "narration", who: "Narrator", text: "It was a cold, wet night out on Route Nine. The {rain on glass} rain came down hard on the windows of Sal's roadside diner... and in the back {booth creaks} booth, Mara slid in across from Leo. She hadn't come to talk.", line: "narrator" },
  { kind: "dialogue", who: "Mara", text: "[quietly] I want the car, Leo.", line: "mara" },
  { kind: "dialogue", who: "Leo", text: "[tired] You always did.", line: "leo" },
  { kind: "effect", who: "Sound", text: "cup set down" },
  { kind: "narration", who: "Narrator", text: "Leo pushed his car {keys slide} keys across the table. Mara never touched them. Some things, you just can't take back.", line: "narrator-2" },
];

/**
 * One scene, two ways to hear it. A table read plays the script as written.
 * An audio drama converts it, the way the app does: narration rewritten for
 * the ear, the dialogue untouched, and ambience, effects, and a score you can
 * switch on while it plays.
 */
export function SceneBuilder() {
  const landingSound = useLandingSound();
  const demo = useProductDemo();
  const playRequest = useRef(0);
  const [mode, setMode] = useState<keyof typeof PLAYS>("drama");
  const [on, setOn] = useState<Record<string, boolean>>({ ambience: true, effects: true, score: true });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const play = PLAYS[mode], time = progress * play.length;
  const lines = SAMPLES[mode === "drama" ? "drama/voices" : "drama/table"].lines!;
  const audio = useRef<{ context: AudioContext; buffers: Record<string, AudioBuffer>; gains: Record<string, GainNode>; sources: AudioBufferSourceNode[]; startedAt: number } | null>(null);
  const stop = () => { playRequest.current++; audio.current?.sources.forEach(source => { try { source.stop(); } catch {} }); if (audio.current) audio.current.sources = []; setPlaying(false); setProgress(0); };
  useEffect(() => {
    const live = audio.current;
    if (!live) return;
    for (const layer of LAYERS) live.gains[layer.id]?.gain.setTargetAtTime(on[layer.id] ? 1 : 0, live.context.currentTime, .12);
  }, [on, playing]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const live = audio.current;
      if (!live) return;
      const elapsed = live.context.currentTime - live.startedAt;
      setProgress(Math.min(1, elapsed / play.length));
      if (elapsed >= play.length) { setPlaying(false); setProgress(0); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, play.length]);
  useEffect(() => () => { audio.current?.sources.forEach(source => { try { source.stop(); } catch {} }); }, []);
  /** Play the scene from a moment: the stems pick up there, and each tagged sound still to come lands on its word. */
  async function startAt(offset: number) {
    const request = ++playRequest.current;
    if (playingClip) playingClip.pause();
    audio.current?.sources.forEach(source => { try { source.stop(); } catch {} });
    if (!audio.current) audio.current = { context: new AudioContext(), buffers: {}, gains: {}, sources: [], startedAt: 0 };
    const live = audio.current;
    const layers = ["voices", ...LAYERS.map(layer => layer.id)];
    for (const layer of layers) if (!live.gains[layer]) { const gain = live.context.createGain(); gain.connect(live.context.destination); live.gains[layer] = gain; }
    for (const layer of LAYERS) live.gains[layer.id].gain.value = on[layer.id] ? 1 : 0;
    const foley = FOLEY.map(sound => `fx/${sound.id}-1`);
    await Promise.all([...layers.map(layer => stemFor(mode, layer)), ...foley].filter(stem => !live.buffers[stem]).map(async stem => { live.buffers[stem] = await live.context.decodeAudioData(await (await fetch(`/audio/examples/${stem}.mp3`)).arrayBuffer()); }));
    await live.context.resume();
    if (request !== playRequest.current) return;
    const start = live.context.currentTime + .05;
    live.sources = layers.map(layer => { const source = live.context.createBufferSource(); source.buffer = live.buffers[stemFor(mode, layer)]; source.connect(live.gains[layer]); source.start(start, offset); return source; });
    FOLEY.forEach((sound, i) => { const at = TIMING[mode][sound.id] - offset; if (at < 0) return; const source = live.context.createBufferSource(); source.buffer = live.buffers[foley[i]]; source.connect(live.gains.effects); source.start(start + at); live.sources.push(source); });
    live.startedAt = start - offset;
    setPlaying(true);
  }
  /** Pause where it is; play picks up from there. */
  async function toggle() {
    if (playing) { audio.current?.sources.forEach(source => { try { source.stop(); } catch {} }); if (audio.current) audio.current.sources = []; setPlaying(false); return; }
    if (landingSound && !landingSound.sound) landingSound.setSound(true);
    await startAt(progress * play.length);
  }
  /** Tap a word: the scene jumps there and plays on, like scrubbing in the app. */
  const seek = (time: number) => { if (landingSound && !landingSound.sound) landingSound.setSound(true); void startAt(Math.max(0, time - .05)); };
  const switchMode = (next: keyof typeof PLAYS) => { stop(); setMode(next); };
  const syncDemoScene = useEffectEvent((active: boolean, sound: boolean) => {
    if (active && sound) void startAt(0).catch(stop);
    else stop();
  });
  const stopDemoScene = useEffectEvent(() => stop());
  const embedded = demo !== null;
  useEffect(() => {
    if (!embedded) return;
    const frame = requestAnimationFrame(() => syncDemoScene(!!demo?.active, !!demo?.sound));
    return () => { cancelAnimationFrame(frame); stopDemoScene(); };
  }, [embedded, demo?.active, demo?.sound, mode]);
  const previewTime = demo?.active ? demo.time % play.length : -1;
  const at = playing ? time : previewTime;
  const t = TIMING[mode];
  const cues: Cues = {
    ...(on.ambience ? { "diner at night": [0, play.length] } : {}),
    ...(on.score ? { "noir score": [0, play.length] } : {}),
    ...(on.effects ? { "rain on glass": [t.rain, play.length], "booth creaks": [t.booth, t.booth + 2], "cup set down": [t.cup, t.cup + 1.5], "keys slide": [t.keys, t.keys + 2] } : {}),
  };
  const wave = SAMPLES[play.voices].peaks.map((peak, i) => Math.max(peak, ...LAYERS.filter(layer => on[layer.id]).map(layer => SAMPLES[stemFor(mode, layer.id)].peaks[i] * .8)));
  return <section className="scene-builder" aria-label="Table read and audio drama">
    <header><h2>Then make it sound like a film.</h2><p>A table read plays your script as written. An audio drama converts it. Add the room, the sounds, and a score to either one. Try both below.</p></header>
    <div className="mb-6 flex justify-center"><div role="group" aria-label="How to hear the scene" className="flex rounded-full bg-[#f0f0f0] p-1">{(Object.keys(PLAYS) as (keyof typeof PLAYS)[]).map(key => <button key={key} type="button" aria-pressed={mode === key} onClick={() => switchMode(key)} className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${mode === key ? "bg-[#202020] text-white" : "text-[#6b6b6b]"}`}>{PLAYS[key].label}</button>)}</div></div>
    <div className="scene-builder-body">
      {mode === "read" ? <div className="scene-builder-page">
        <p className="mb-1"><Tagged line="{noir score} {diner at night}" time={at} cues={cues} onSeek={seek} /></p>
        <p className="font-bold"><span onClick={() => seek(lines.narrator[0].s)} className={`cursor-pointer rounded-[3px] transition-colors duration-100 hover:bg-[#c79a3c26] ${at >= lines.narrator[0].s && at < lines.narrator[2].e + .05 ? "bg-[#c79a3c40]" : ""}`}>INT. DINER – NIGHT</span></p>
        <p className="mt-3"><Tagged line="{rain on glass} Rain streaks the diner glass. Mara slides into the {booth creaks} booth across from Leo." words={lines.narrator.slice(3)} time={at} cues={cues} onSeek={seek} /></p>
        <p className="mt-4 ml-[34%]">MARA</p><p className="ml-[16%] mr-[10%]"><Tagged line="[quietly] I want the car, Leo." words={lines.mara} time={at} /></p>
        <p className="mt-4 ml-[34%]">LEO</p><p className="ml-[16%] mr-[10%]"><Tagged line="[tired] You always did. {cup set down}" words={lines.leo} time={at} cues={cues} onSeek={seek} /></p>
        <p className="mt-4"><Tagged line="He slides the {keys slide} keys across the table. She does not take them." words={lines["narrator-2"]} time={at} cues={cues} onSeek={seek} /></p>
      </div> : <ol className="scene-builder-blocks">{DRAMA_BLOCKS.map((block, i) => <li key={i} data-kind={block.kind}>
        <span className="scene-builder-who">{block.who}</span>
        {block.kind === "ambience" || block.kind === "effect" || block.kind === "music" ? <SoundPill tag={block.text} live={!!cues[block.text] && at >= cues[block.text][0] && at < cues[block.text][1]} /> : <span><Tagged line={block.text} words={block.line ? lines[block.line] : undefined} time={at} cues={cues} onSeek={seek} /></span>}
      </li>)}</ol>}
      <div className="scene-builder-mixer">
        <p className="text-xs font-medium uppercase tracking-wider text-[#8a8a8a]">{mode === "read" ? "Your script, as written" : "Converted to an audio drama"}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{play.label}</p>
        <ul className="mt-6 grid gap-2.5">{LAYERS.map(layer => <li key={layer.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <button type="button" role="switch" aria-checked={on[layer.id]} aria-label={layer.label} onClick={() => setOn(current => ({ ...current, [layer.id]: !current[layer.id] }))} className={`relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors ${on[layer.id] ? "bg-[#202020]" : "bg-[#e0e0e0]"}`}><i className={`absolute top-1 size-4 rounded-full bg-white transition-all ${on[layer.id] ? "left-5" : "left-1"}`} /></button>
          <span className="flex-1 text-sm font-medium">{layer.label}</span><span className="text-xs text-[#8a8a8a]">{layer.source}</span>
        </li>)}</ul>
        <div className="mt-6 flex items-center gap-3"><PlayButton playing={playing} onClick={() => void toggle()} label={`the ${play.label.toLowerCase()}`} /><Wave peaks={wave} progress={demo?.active && !playing ? previewTime / play.length : progress} /></div>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium"><a href="#immersive" className="underline underline-offset-4">🎧 Hear it in Immersive ↓</a><Link href={mode === "read" ? "/products/table-reads" : "/products/audio-drama"} className="underline underline-offset-4">{mode === "read" ? "Explore table reads" : "Explore audio drama"}</Link></p>
      </div>
    </div>
    <div className="mt-5"><PoweredBy /></div>
  </section>;
}

/** A cast voice card you can play. */
function VoiceCard({ name, hue, sample, line }: { name: string; hue: number; sample: string; line: string }) {
  const clip = useClip(`/audio/examples/${sample}.mp3`, ["mara", "leo", "ruiz", "narrator"].slice(0, ["mara", "leo", "ruiz", "narrator"].indexOf(sample)).reduce((sum, key) => sum + SAMPLES[key].duration + .4, 0)), data = SAMPLES[sample];
  return <div className={`voice-cast-card min-w-0 rounded-xl p-3 text-left transition-colors ${clip.playing ? "bg-white shadow-sm" : "bg-white/60"}`}>
    <p className="flex items-center gap-2 text-sm font-medium"><i className="size-5 rounded-full" style={{ background: `radial-gradient(circle at 30% 25%, hsl(${hue} 85% 72%), hsl(${hue + 70} 70% 46%))` }} />{name}<span className="ml-auto"><PlayButton playing={clip.playing} onClick={clip.toggle} label={name} dark={false} /></span></p>
    <p className="mt-1.5 truncate text-[12px] text-[#6b6b6b]"><Tagged line={line} words={data.words} time={clip.time} onSeek={clip.seek} /></p>
    <span className="flex w-full"><Wave peaks={data.peaks} progress={clip.progress} every={2} /></span>
  </div>;
}

/** A voice model's maker, as its mark: ElevenLabs' logo, or ours. */
function MakerMark({ maker }: { maker: "ElevenLabs" | "ScriptFX" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={maker === "ScriptFX" ? "/brand/scriptfx-logo-black.svg" : "/brand/partners/elevenlabs-logo-black.svg"} alt={maker} className={`w-auto ${maker === "ScriptFX" ? "h-[13px]" : "h-[10px]"}`} />;
}
const CAST = [["Mara", 20, "mara", "[quietly] I want the car, Leo."], ["Leo", 210, "leo", "[tired] You always did."], ["Ruiz", 140, "ruiz", "[angry] Who let him walk?"], ["Narrator", 280, "narrator", "Interior. Diner. Night. Rain streaks the diner glass. Mara slides into the booth across from Leo."]] as const;

/** The cast's voices, with the marks of who makes them. */
export function VoiceCast() {
  return <div className="voice-cast grid min-w-0 w-full max-w-md gap-3">
    <p className="flex items-center gap-2 text-sm text-[#6b6b6b]">Voice model<span className="inline-flex items-center gap-1.5 opacity-70" aria-hidden="true"><MakerMark maker="ElevenLabs" /><span>·</span><MakerMark maker="ScriptFX" /></span></p>
    <div className="grid grid-cols-2 gap-2.5">{CAST.map(([name, hue, file, line]) => <VoiceCard key={name} name={name} hue={hue} sample={file} line={line} />)}</div>
  </div>;
}

/** Listen back to a short scene, start to finish. */
export function ListenBack() {
  const clip = useClip("/audio/examples/scene.mp3"), data = SAMPLES.scene;
  const script = [["narrator", "Narrator", "Interior. Diner. Night. Rain streaks the diner glass. Mara slides into the booth across from Leo."], ["mara", "Mara", "[quietly] I want the car, Leo."], ["leo", "Leo", "[tired] You always did."]] as const;
  const current = [...script].reverse().find(([id]) => clip.time >= (data.lines?.[id]?.[0]?.s ?? 0) - .1) ?? script[0];
  return <div className="min-w-0 w-full max-w-md"><span className="mx-auto mb-2 block w-fit rounded-md bg-white px-2 py-1 font-mono text-[11px] shadow-sm">INT. DINER – NIGHT · Scene 12</span><span className="flex w-full"><Wave peaks={data.peaks} progress={clip.progress} /></span><p className="mt-3 flex items-center gap-3 text-left text-sm"><PlayButton playing={clip.playing} onClick={clip.toggle} label="the scene" /><span className="min-w-0 flex-1"><span className="block text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]">{current[1]}</span><Tagged line={current[2]} words={data.lines?.[current[0]]} time={clip.time} onSeek={clip.seek} /></span><span className="font-mono text-xs text-[#8a8a8a]">0:{String(Math.floor(clip.time)).padStart(2, "0")} / 0:10</span></p></div>;
}

/** One card in the grid below the tools: a title, a line, and a small piece of the app. */
function BentoCard({ title, text, wide = false, children }: { title: string; text: string; wide?: boolean; children: React.ReactNode }) {
  return <article className={`more-bento-card ${wide ? "is-wide" : ""}`}><h3>{title}</h3><p>{text}</p><div className="more-bento-art" aria-hidden="true">{children}</div></article>;
}

/** More of the writing app, xAI-style: a grid of small cards, each with a live-looking piece of the product. */
export function MoreBento() {
  return <section className="more-bento" aria-label="More in the writing app">
    <div className="more-bento-row">
      <BentoCard title="Start from questions" text="Not sure where to begin? Answer a few questions about your hero, the conflict, and the ending.">
        <div className="w-full rounded-xl bg-white p-4 text-left shadow-sm"><p className="text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]">Character · 3 of 12</p><p className="mt-2 text-sm font-medium">What does Mara want more than anything?</p><p className="mt-2 rounded-lg bg-[#f5f5f4] px-3 py-2 font-mono text-[12px]">To get out of this town before it swallows her.<i className="basics-caret" /></p></div>
      </BentoCard>
      <BentoCard title="Find any scene" text="Every scene on a card, with its page, length, and time of day.">
        <ul className="grid w-full gap-1.5 text-left">{[["12", "INT. DINER – NIGHT", "#5b8def", "p. 18"], ["13", "EXT. PIER – DAWN", "#f2b544", "p. 20"], ["14", "INT. MARA’S CAR – DAY", "#f2d16b", "p. 22"]].map(([n, slug, color, page], i) => <li key={n} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] ${i === 0 ? "bg-white shadow-sm" : ""}`}><i className="h-6 w-1 rounded-full" style={{ background: color }} /><span className="w-5 text-[#8a8a8a]">{n}</span><span className="min-w-0 flex-1 truncate font-mono">{slug}</span><span className="text-[#8a8a8a]">{page}</span></li>)}</ul>
      </BentoCard>
      <BentoCard title="Paste anything" text="Paste a scene from anywhere and it lands in proper screenplay format.">
        <div className="relative w-full rounded-xl bg-white p-4 text-left shadow-sm"><span className="absolute -top-3 right-4 rounded-full bg-[#202020] px-2.5 py-1 text-[11px] font-medium text-white">⌘V</span><p className="font-mono text-[12px] font-bold">INT. PRECINCT – DAY</p><p className="mt-1.5 font-mono text-[12px]">Phones ring. Nobody answers.</p><p className="mt-1.5 ml-[36%] font-mono text-[12px]">DETECTIVE RUIZ</p><p className="ml-[20%] font-mono text-[12px]">Who let him walk?</p></div>
      </BentoCard>
    </div>
    <div className="more-bento-row is-two">
      <BentoCard wide title="A voice for every character" text="Expressive voices that take direction like [quietly] or [angry]. Cast your whole script in a click. Press play.">
        <VoiceCast />
      </BentoCard>
      <BentoCard wide title="Listen back" text="Play any scene start to finish and hear exactly how the dialogue lands. Press play.">
        <ListenBack />
      </BentoCard>
    </div>
    <div className="more-bento-row is-two">
      <BentoCard title="Know your runtime" text="Page count and screen time update as you write.">
        <div className="flex items-baseline gap-6"><span><strong className="text-4xl font-semibold tracking-tight">104</strong><span className="ml-1 text-sm text-[#8a8a8a]">pages</span></span><span><strong className="text-4xl font-semibold tracking-tight">~1:52</strong><span className="ml-1 text-sm text-[#8a8a8a]">runtime</span></span></div>
      </BentoCard>
      <BentoCard title="Three formats" text="Write a screenplay, an audio drama, or a manuscript, each with its own elements.">
        <div className="flex gap-1.5 rounded-full bg-white p-1 text-xs shadow-sm">{["Screenplay", "Audio drama", "Manuscript"].map((format, i) => <span key={format} className={`rounded-full px-3 py-1.5 ${i === 0 ? "bg-[#202020] text-white" : "text-[#6b6b6b]"}`}>{format}</span>)}</div>
      </BentoCard>
    </div>
  </section>;
}
