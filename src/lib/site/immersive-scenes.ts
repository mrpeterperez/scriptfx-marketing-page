import { cellOf, insideRoom, type Orb, type Place } from "@/components/site/immersive-world";

/** Your ears, seated in the chair; sounds are placed and heard relative to this height. */
export const EAR = 1.1;

/**
 * The Immersive thriller: a cabin in a storm, someone tied to the chair, and an
 * intruder whose boots and whistling ride one orb that walks slowly around them.
 * Each sound: when it starts, which orb plays it, and how loud.
 */
const THRILLER_LENGTH = 43;
const THRILLER_SOUNDS = [
  { id: "storm", file: "storm", at: 0, orb: "storm", gain: 1, until: 42.9, fade: 1 },
  { id: "score", file: "score", at: 0, orb: "score", gain: 1 },
  { id: "narrator", file: "narrator", at: .5, orb: "narrator", gain: 1 },
  { id: "door", file: "door", at: 10.5, orb: "door", gain: 1 },
  { id: "steps", file: "steps", at: 11.5, orb: "intruder", gain: 1.4, until: 33.5 },
  { id: "whistle", file: "whistle", at: 12, orb: "intruder", gain: .9, until: 33.5, fade: 1 },
  { id: "board", file: "board", at: 16, orb: "floorboards", gain: 1 },
  { id: "thunder", file: "thunder", at: 21, orb: "thunder", gain: .8 },
  { id: "whimper", file: "whimper", at: 19, orb: "victim", gain: .85 },
  { id: "victim", file: "victim", at: 30.5, orb: "victim", gain: 1 },
  { id: "punchline", file: "punchline", at: 37.6, orb: "intruder", gain: 1 },
] as const;
/** The same scene as a table read: the narrator reads the heading and action lines and the actors read theirs, with the room, the sounds, and the score under them, each sound landing on the line that names it. */
const READ_SOUNDS = [
  { id: "read-storm", file: "storm", at: 0, orb: "storm", gain: .8, until: 36.4, fade: 1.5 },
  { id: "read-score", file: "score", at: 0, orb: "score", gain: .8, until: 36.4, fade: 1.5 },
  { id: "read-n1", file: "read-n1", at: .4, orb: "narrator", gain: 1 },
  { id: "read-thunder", file: "thunder", at: 5.5, orb: "thunder", gain: .6 },
  { id: "read-whimper", file: "whimper", at: 9, orb: "victim", gain: .6 },
  { id: "read-n2", file: "read-n2", at: 11, orb: "narrator", gain: 1 },
  { id: "read-door", file: "door", at: 11.8, orb: "door", gain: .85 },
  { id: "read-steps", file: "steps", at: 13, orb: "intruder", gain: 1.1, until: 27.5 },
  { id: "read-whistle", file: "whistle", at: 15, orb: "intruder", gain: .7, until: 27.5, fade: 1 },
  { id: "read-board", file: "board", at: 19, orb: "floorboards", gain: .8 },
  { id: "read-victim", file: "victim", at: 21.4, orb: "victim", gain: 1 },
  { id: "read-n3", file: "read-n3", at: 28.2, orb: "narrator", gain: 1 },
  { id: "read-punchline", file: "punchline", at: 30.6, orb: "intruder", gain: 1 },
] as const;
/** `until`: cut the sound off there with a short fade (or `fade` seconds), like boots stopping on the last square or a scene fading to black. */
export type CabinSound = { id: string; file: string; at: number; orb: string; gain: number; until?: number; fade?: number };
/** Each way to hear the cabin: how long it runs, when the intruder walks and leans in, its sounds, and its waveform. */
/** A walk: start walking at `from`, reach the last square at `arrive` (or `to`), lean in from `to` to `ear` (toward `lean`, or the nearer ear of the chair), and step back at `back`. */
export type Walk = { from: number; to: number; ear: number; arrive?: number; back?: number; lean?: { x: number; z: number } };
export type Cut = { label: string; length: number; walk: Walk; sounds: readonly CabinSound[]; peaks: string; walks?: Record<string, { from: number; to: number }> };
const CUTS: Record<"read" | "drama", Cut> = {
  read: { label: "Table read", length: 36.5, walk: { from: 13, to: 27.5, ear: 30.4 }, sounds: READ_SOUNDS, peaks: "thriller-read" },
  drama: { label: "Audio drama", length: THRILLER_LENGTH, walk: { from: 11.5, to: 33.5, ear: 37.2 }, sounds: THRILLER_SOUNDS, peaks: "thriller" },
};

/** The intruder's slow walk, square by square: in through the door behind you, one clean square loop around the chair, two squares out, so you hear him go all the way around, then one step in behind you. Tap the floor to change it. */
/** One floor square, in meters: the room is 8 meters across in 9 squares. */
const ROOM_STEP = 8 / 9;
const RING = 2 * ROOM_STEP, INTRUDER_STOPS: [number, number][] = [[-RING, RING], [-RING, -RING], [RING, -RING], [RING, RING], [0, RING], [0, ROOM_STEP]];
export type Cell = { x: number; z: number };
const INTRUDER_SQUARES: Cell[] = INTRUDER_STOPS.reduce<Cell[]>((path, [x, z]) => tapSquare(path, { x: cellOf(x), z: cellOf(z) }), []);
/** The walk starts with the boots and ends when they stop; then one last step in to the victim's ear. */
const VICTIM_EAR: Cell = { x: .3, z: .05 };
/** One orb per sound, in the sound stage's colors. The narrator, the storm, and the score start outside the room as stereo layers. */
const ORBS: Orb[] = [
  { id: "narrator", name: "Narrator", color: "#9d84ff" },
  { id: "storm", name: "Storm", color: "#51cadd" },
  { id: "score", name: "Score", color: "#df87cb" },
  { id: "victim", name: "Victim", color: "#f2a65a" },
  { id: "intruder", name: "Intruder", color: "#ef6f6c" },
  { id: "door", name: "Door", color: "#84c6a1" },
  { id: "floorboards", name: "Floorboards", color: "#c9a46b" },
  { id: "thunder", name: "Thunder", color: "#e8d27a" },
];
const START: Record<string, Place> = {
  narrator: { x: -6, z: -1.6, y: 1.1 }, storm: { x: 6, z: -1.6, y: 1.1 }, score: { x: 6, z: 2.4, y: 1.1 },
  victim: { x: 0, z: -.15, y: 1.25 }, door: { x: -3.4, z: 3.3, y: 1.2 }, floorboards: { x: 0, z: 3.1, y: .1 }, thunder: { x: -1.2, z: -3.6, y: 2.6 },
};
/** Tap a square: an empty one extends the path to it square by square, so it stays one connected trail; one on the path cuts the path back to it, or drops it if it's the last. */
export function tapSquare(squares: Cell[], cell: Cell): Cell[] {
  const at = squares.findIndex(square => square.x === cell.x && square.z === cell.z);
  if (at >= 0) return at === squares.length - 1 ? squares.slice(0, -1) : squares.slice(0, at + 1);
  if (!squares.length) return [cell];
  const step = ROOM_STEP, path = [...squares];
  let { x, z } = path[path.length - 1];
  while (Math.abs(cell.x - x) > step / 2 || Math.abs(cell.z - z) > step / 2) {
    if (Math.abs(cell.x - x) >= Math.abs(cell.z - z)) x = cellOf(x + Math.sign(cell.x - x) * step); else z = cellOf(z + Math.sign(cell.z - z) * step);
    path.push({ x, z });
  }
  return path;
}
/** Where a sound with a path is at a moment: the scene's walker walks with its boots; any other sound walks its path over the whole scene. */
export function walkerAt(id: string, t: number, squares: Cell[], cut: Cut, scene: Scene): Place {
  if (id === scene.walker) return intruderAt(t, squares, cut.walk);
  // Another walker crosses its path over its own stretch of the scene, or the whole scene if it has none.
  const span = cut.walks?.[id] ?? { from: 1, to: cut.length - 2 };
  const y = scene.start[id]?.y ?? 1.2, along = Math.min(1, Math.max(0, (t - span.from) / (span.to - span.from))) * (squares.length - 1), i = Math.min(squares.length - 2, Math.floor(along));
  if (squares.length === 1) return { ...squares[0], y };
  const a = squares[i], b = squares[i + 1], f = along - i;
  return { x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f, y: insideRoom(a) ? Math.max(.3, Math.min(2.6, y)) : 1.1 };
}
function intruderAt(t: number, squares: Cell[], walk: Walk): Place {
  if (!squares.length) return { x: -2.2, z: 2.6, y: 1.6 };
  const last = squares[squares.length - 1], lerp = (a: Cell, b: Cell, f: number): Place => ({ x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f, y: 1.6 });
  // He leans in toward the given spot, or the ear on the side he arrives from, but only if the path brings him right up to the chair.
  const target = walk.lean ?? (Math.hypot(last.x, last.z) < 1.3 ? { x: (last.x < 0 ? -1 : 1) * Math.abs(VICTIM_EAR.x), z: VICTIM_EAR.z } : last);
  if (walk.back !== undefined && t >= walk.back) return lerp(target, last, Math.min(1, (t - walk.back) / .6));
  if (t >= walk.to) return lerp(last, target, Math.min(1, (t - walk.to) / Math.max(.1, walk.ear - walk.to)));
  const arrive = walk.arrive ?? walk.to;
  if (t >= arrive) return lerp(last, last, 0);
  if (t <= walk.from || squares.length === 1) return lerp(squares[0], squares[0], 0);
  const along = (t - walk.from) / (arrive - walk.from) * (squares.length - 1), i = Math.floor(along);
  return lerp(squares[i], squares[i + 1], along - i);
}

/** A scene on the stage: its heading, where its audio lives, its sounds and where they start, who walks, the walk, and its two cuts. */
export type Scene = { label: string; heading: string; folder: string; orbs: Orb[]; start: Record<string, Place>; walker: string; squares: Cell[]; paths?: Record<string, Cell[]>; cuts: Record<"read" | "drama", Cut>; room: { wet: number; ir: string } };
export const SCENES: Record<"cabin" | "diner", Scene> = {
  cabin: { label: "Cabin", heading: "INT. CABIN – NIGHT", folder: "thriller", orbs: ORBS, start: START, walker: "intruder", squares: INTRUDER_SQUARES, cuts: CUTS, room: { wet: .06, ir: "cabin" } },
  /**
   * The diner, from Peter's script: you're in the booth with Steve (front left)
   * and John (front right). The crew finishes singing to the cops across the
   * room; the happy waitress walks over, leans in to whisper to Steve, and the
   * blonde waitress and a waiter come over to sing around him. Waitress #3
   * calls out from the kitchen. Christmas music plays on the speakers throughout.
   */
  diner: {
    label: "Diner", heading: "INT. DINER – DAY", folder: "diner", room: { wet: .03, ir: "diner" },
    orbs: [
      { id: "narrator", name: "Narrator", color: "#9d84ff" },
      { id: "diner", name: "Diner & music", color: "#51cadd" },
      { id: "cops", name: "Cops", color: "#e8d27a" },
      { id: "steve", name: "Steve", color: "#f2a65a" },
      { id: "john", name: "John", color: "#84c6a1" },
      { id: "waitress", name: "Waitress", color: "#ef6f6c" },
      { id: "blonde", name: "Blonde waitress", color: "#df87cb" },
      { id: "waiter", name: "Waiter", color: "#c9a46b" },
      { id: "kitchen", name: "Waitress #3", color: "#9198a7" },
    ],
    start: { narrator: { x: -6, z: -1.6, y: 1.1 }, diner: { x: 6, z: -1.6, y: 1.1 }, cops: { x: -3.4, z: -3.4, y: 1.2 }, steve: { x: -.8, z: -.9, y: 1.15 }, john: { x: .8, z: -.9, y: 1.15 }, kitchen: { x: 1.78, z: 1.78, y: 1.6 } },
    walker: "waitress",
    // From the cops' table to the end of your booth, by the aisle.
    squares: ([[-2.67, -2.67], [-1.78, -0.89]] as [number, number][]).reduce<Cell[]>((path, [x, z]) => tapSquare(path, { x: cellOf(x), z: cellOf(z) }), []),
    // The blonde (with the cake) and the waiter walk over from the cops' table and gather around Steve.
    paths: { blonde: ([[-2.67, -1.78], [-0.89, -1.78]] as [number, number][]).reduce<Cell[]>((path, [x, z]) => tapSquare(path, { x: cellOf(x), z: cellOf(z) }), []), waiter: ([[-1.78, -2.67], [-1.78, -1.78]] as [number, number][]).reduce<Cell[]>((path, [x, z]) => tapSquare(path, { x: cellOf(x), z: cellOf(z) }), []) },
    cuts: {
      read: { label: "Table read", length: 116.48, walk: { from: 14.88, arrive: 18.68, to: 65.86, ear: 66.36, back: 70.29, lean: { x: -1.2, z: -.8 } }, walks: { blonde: { from: 71.95, to: 75.95 }, waiter: { from: 71.95, to: 75.95 } }, peaks: "diner-read", sounds: [
        { id: "dr-diner", file: "diner", at: 0.0, orb: "diner", gain: .9, until: 116.48, fade: 3 },
        { id: "dr-music", file: "music", at: 0.0, orb: "diner", gain: .45, until: 116.48, fade: 3 },
        { id: "dr-n1", file: "n1", at: 0.5, orb: "narrator", gain: 1 },
        { id: "dr-sing0", file: "sing0", at: 8.74, orb: "waitress", gain: 0.85 },
        { id: "dr-sing3", file: "sing3", at: 8.78, orb: "waiter", gain: 0.85 },
        { id: "dr-sing1", file: "sing1", at: 8.8, orb: "blonde", gain: 0.85 },
        { id: "dr-cheer", file: "cheer", at: 13.48, orb: "cops", gain: 1 },
        { id: "dr-steps", file: "steps", at: 14.88, orb: "waitress", gain: 1, until: 18.68 },
        { id: "dr-n2", file: "n2", at: 15.08, orb: "narrator", gain: 1 },
        { id: "dr-hw1", file: "hw1", at: 18.48, orb: "waitress", gain: 1 },
        { id: "dr-s1", file: "s1", at: 20.54, orb: "steve", gain: 1 },
        { id: "dr-hw2", file: "hw2", at: 24.52, orb: "waitress", gain: 1 },
        { id: "dr-s2", file: "s2", at: 27.14, orb: "steve", gain: 1 },
        { id: "dr-n3", file: "n3", at: 29.48, orb: "narrator", gain: 1 },
        { id: "dr-hw3", file: "hw3", at: 31.1, orb: "waitress", gain: 1 },
        { id: "dr-j1", file: "j1", at: 33.96, orb: "john", gain: 1 },
        { id: "dr-s3", file: "s3", at: 36.26, orb: "steve", gain: 1 },
        { id: "dr-j2", file: "j2", at: 39.28, orb: "john", gain: 1 },
        { id: "dr-hw4", file: "hw4", at: 42.38, orb: "waitress", gain: 1 },
        { id: "dr-n8", file: "n8", at: 47.56, orb: "narrator", gain: 1 },
        { id: "dr-s4", file: "s4", at: 51.64, orb: "steve", gain: 1 },
        { id: "dr-hw5", file: "hw5", at: 60.34, orb: "waitress", gain: 1 },
        { id: "dr-s5", file: "s5", at: 63.36, orb: "steve", gain: 1 },
        { id: "dr-n4", file: "n4", at: 64.68, orb: "narrator", gain: 1 },
        { id: "dr-hw6", file: "hw6", at: 66.46, orb: "waitress", gain: 1 },
        { id: "dr-hw7", file: "hw7", at: 70.39, orb: "waitress", gain: 1 },
        { id: "dr-group-steps", file: "group-steps", at: 71.95, orb: "blonde", gain: 0.8, until: 75.95 },
        { id: "dr-n5", file: "n5", at: 71.95, orb: "narrator", gain: 1 },
        { id: "dr-group-steps-1", file: "group-steps", at: 72.25, orb: "waiter", gain: 0.8, until: 75.95 },
        { id: "dr-s6", file: "s6", at: 74.87, orb: "steve", gain: 1 },
        { id: "dr-hw8", file: "hw8", at: 81.57, orb: "waitress", gain: 1.26 },
        { id: "dr-hw9", file: "hw9", at: 84.11, orb: "waitress", gain: 1 },
        { id: "dr-s7", file: "s7", at: 86.89, orb: "steve", gain: 0.84 },
        { id: "dr-n6", file: "n6", at: 87.95, orb: "narrator", gain: 1 },
        { id: "dr-bw1", file: "bw1", at: 91.11, orb: "blonde", gain: 1 },
        { id: "dr-w3", file: "w3", at: 93.81, orb: "kitchen", gain: 1.6 },
        { id: "dr-j3", file: "j3", at: 97.39, orb: "john", gain: 1 },
        { id: "dr-j4", file: "j4", at: 99.45, orb: "john", gain: 1 },
        { id: "dr-n7", file: "n7", at: 104.13, orb: "narrator", gain: 1 },
        { id: "dr-breath", file: "breath", at: 110.51, orb: "waitress", gain: 0.3 },
        { id: "dr-breath-1", file: "breath", at: 110.62, orb: "blonde", gain: 0.3 },
        { id: "dr-breath-2", file: "breath", at: 110.74, orb: "waiter", gain: 0.3 },
      ] },
      drama: { label: "Audio drama", length: 115.64, walk: { from: 20.6, arrive: 24.4, to: 67.65, ear: 68.15, back: 72.08, lean: { x: -1.2, z: -.8 } }, walks: { blonde: { from: 73.74, to: 77.74 }, waiter: { from: 73.74, to: 77.74 } }, peaks: "diner", sounds: [
        { id: "dd-diner", file: "diner", at: 0.0, orb: "diner", gain: .9, until: 115.64, fade: 3 },
        { id: "dd-music", file: "music", at: 0.0, orb: "diner", gain: .45, until: 115.64, fade: 3 },
        { id: "dd-an1", file: "an1", at: 0.5, orb: "narrator", gain: 1 },
        { id: "dd-sing0", file: "sing0", at: 14.46, orb: "waitress", gain: 0.85 },
        { id: "dd-sing3", file: "sing3", at: 14.5, orb: "waiter", gain: 0.85 },
        { id: "dd-sing1", file: "sing1", at: 14.52, orb: "blonde", gain: 0.85 },
        { id: "dd-cheer", file: "cheer", at: 19.2, orb: "cops", gain: 1 },
        { id: "dd-steps", file: "steps", at: 20.6, orb: "waitress", gain: 1, until: 24.4 },
        { id: "dd-hw1", file: "hw1", at: 24.2, orb: "waitress", gain: 1 },
        { id: "dd-s1", file: "s1", at: 26.26, orb: "steve", gain: 1 },
        { id: "dd-hw2", file: "hw2", at: 30.24, orb: "waitress", gain: 1 },
        { id: "dd-s2", file: "s2", at: 32.86, orb: "steve", gain: 1 },
        { id: "dd-hw3", file: "hw3", at: 34.75, orb: "waitress", gain: 1 },
        { id: "dd-j1", file: "j1", at: 37.61, orb: "john", gain: 1 },
        { id: "dd-s3", file: "s3", at: 39.91, orb: "steve", gain: 1 },
        { id: "dd-j2", file: "j2", at: 42.93, orb: "john", gain: 1 },
        { id: "dd-hw4", file: "hw4", at: 46.03, orb: "waitress", gain: 1 },
        { id: "dd-an4", file: "an4", at: 51.21, orb: "narrator", gain: 1 },
        { id: "dd-s4", file: "s4", at: 55.21, orb: "steve", gain: 1 },
        { id: "dd-hw5", file: "hw5", at: 63.91, orb: "waitress", gain: 1 },
        { id: "dd-s5", file: "s5", at: 66.93, orb: "steve", gain: 1 },
        { id: "dd-hw6", file: "hw6", at: 68.25, orb: "waitress", gain: 1 },
        { id: "dd-hw7", file: "hw7", at: 72.18, orb: "waitress", gain: 1 },
        { id: "dd-group-steps", file: "group-steps", at: 73.74, orb: "blonde", gain: 0.8, until: 77.74 },
        { id: "dd-s6", file: "s6", at: 73.74, orb: "steve", gain: 1 },
        { id: "dd-group-steps-1", file: "group-steps", at: 74.04, orb: "waiter", gain: 0.8, until: 77.74 },
        { id: "dd-hw8", file: "hw8", at: 80.44, orb: "waitress", gain: 1.26 },
        { id: "dd-hw9", file: "hw9", at: 82.98, orb: "waitress", gain: 1 },
        { id: "dd-an5", file: "an5", at: 85.76, orb: "narrator", gain: 1 },
        { id: "dd-s7", file: "s7", at: 89.6, orb: "steve", gain: 0.84 },
        { id: "dd-bw1", file: "bw1", at: 90.51, orb: "blonde", gain: 1 },
        { id: "dd-w3", file: "w3", at: 93.11, orb: "kitchen", gain: 1.6 },
        { id: "dd-j3", file: "j3", at: 96.49, orb: "john", gain: 1 },
        { id: "dd-j4", file: "j4", at: 98.55, orb: "john", gain: 1 },
        { id: "dd-an3", file: "an3", at: 103.23, orb: "narrator", gain: 1 },
        { id: "dd-breath", file: "breath", at: 109.61, orb: "waitress", gain: 0.3 },
        { id: "dd-breath-1", file: "breath", at: 109.72, orb: "blonde", gain: 0.3 },
        { id: "dd-breath-2", file: "breath", at: 109.84, orb: "waiter", gain: 0.3 },
      ] },
    },
  },
};

/** Every path a scene starts with: its walker's, and any other sound that walks. */
export const defaultTrails = (scene: Scene): Record<string, Cell[]> => ({ [scene.walker]: scene.squares, ...scene.paths });
