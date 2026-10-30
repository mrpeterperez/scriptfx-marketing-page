"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { Box, Grid2x2 } from "lucide-react";

/** A sound on the stage, in the sound stage's colors. */
export type Orb = { id: string; name: string; color: string };
/** A sound that walks: which orb, the floor squares it walks through in order, and what tapping a square does. */
export type Walker = { id: string; cells: { x: number; z: number }[]; onTap: (cell: { x: number; z: number }) => void; onStroke: (cells: { x: number; z: number }[], erase: boolean) => void };
/** Where a sound is: meters from the chair (x right, z in front is negative), and its height. */
export type Place = { x: number; z: number; y: number };
type View = "angle" | "top";

/** The room is 8 by 8 meters around the chair. Past its walls, a sound is a stereo layer, like the app's beds. */
const ROOM = 8, HALF = ROOM / 2, CELLS = 9, STEP = ROOM / CELLS, REACH = HALF + 2.6;
/** The center of the floor square a point falls in. */
export const cellOf = (v: number) => (Math.min(CELLS - 1, Math.max(0, Math.floor((v + HALF) / STEP))) + .5) * STEP - HALF;
export const insideRoom = (place: { x: number; z: number }) => Math.abs(place.x) <= HALF && Math.abs(place.z) <= HALF;
/** Where the camera sits for each view, like the sound stage's view switcher. Angle starts as a high aerial shot. */
const VIEWS: Record<View, { position: [number, number, number]; target: [number, number, number] }> = {
  angle: { position: [0, 12, 9.8], target: [0, .2, -.3] },
  top: { position: [0, 17, .01], target: [0, 0, 0] },
};
const VIEW_BUTTONS = [{ id: "angle", label: "Angle", Icon: Box }, { id: "top", label: "Top", Icon: Grid2x2 }] as const;

// The orb shader from the ScriptFX sound stage: a rippling glass sphere that swells with its sound.
const vertex = `uniform float time;uniform float energy;varying vec3 normalW;varying vec3 positionW;varying float ripple;
void main(){vec3 p=position;float wave=sin(p.x*7.+time*.9)*sin(p.y*6.-time*.7)*sin(p.z*8.+time*.5);p+=normal*(wave*(.035+energy*.09));ripple=wave;vec4 w=modelMatrix*vec4(p,1.);positionW=w.xyz;normalW=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const fragment = `uniform vec3 tint;uniform float energy;uniform float time;varying vec3 normalW;varying vec3 positionW;varying float ripple;
void main(){vec3 v=normalize(cameraPosition-positionW);float fres=pow(1.-abs(dot(normalize(normalW),v)),2.);float bands=.5+.5*sin(ripple*6.+positionW.y*12.-time);vec3 c=tint*(.48+bands*.5+energy*.65)+vec3(.8,.87,1.)*pow(fres,3.)*.8;gl_FragColor=vec4(c,.72+fres*.2);}`;

/**
 * A scene on the ScriptFX sound stage, in its dark theme: the director's chair
 * where you sit, and an orb for each sound. Drag an orb to move its sound,
 * drag the floor to turn the room, and pinch to zoom. `where` says where each
 * sound is right now, so a sound that walks moves on its own.
 */
export function ImmersiveWorld({ orbs, where, level, onMove, onSelect, walker, note, label, showControls = true }: { orbs: Orb[]; where: (id: string) => Place; level: (id: string) => number; onMove: (id: string, place: Place) => void; onSelect: (id: string) => void; walker: Walker; note?: React.ReactNode; label: string; showControls?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View>("angle");
  const live = useRef({ where, level, onMove, onSelect, view, walker });
  live.current = { where, level, onMove, onSelect, view, walker };

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let stopped = false, frame = 0, visible = false, dispose = () => {};
    void (async () => {
      const T = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (stopped) return;
      const renderer = new T.WebGLRenderer({ canvas: element, antialias: true, alpha: true });
      // Phones render at a lower resolution: smoother, and easier on the battery.
      const touch = matchMedia("(pointer: coarse)").matches;
      renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2));
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      const world = new T.Scene();
      world.add(new T.HemisphereLight("#e6eeff", "#323c55", 1.2));
      const sun = new T.DirectionalLight("#ffffff", 2); sun.position.set(-5, 8, 6); world.add(sun);
      const camera = new T.PerspectiveCamera(42, 1, .05, 100);

      // The stage: a solid rounded slab in the brand black.
      const corner = ROOM * .025, board = new T.Shape();
      board.moveTo(corner, 0); board.lineTo(ROOM - corner, 0); board.quadraticCurveTo(ROOM, 0, ROOM, corner); board.lineTo(ROOM, ROOM - corner); board.quadraticCurveTo(ROOM, ROOM, ROOM - corner, ROOM);
      board.lineTo(corner, ROOM); board.quadraticCurveTo(0, ROOM, 0, ROOM - corner); board.lineTo(0, corner); board.quadraticCurveTo(0, 0, corner, 0);
      const slab = new T.Mesh(new T.ExtrudeGeometry(board, { depth: .1, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .024, bevelThickness: .024, curveSegments: 12 }), [new T.MeshBasicMaterial({ color: "#202020" }), new T.MeshBasicMaterial({ color: "#202020" })]);
      slab.rotation.x = Math.PI / 2; slab.position.set(-HALF, -.03, -HALF); world.add(slab);
      const line = (points: THREE.Vector3[], color: string, opacity: number) => new T.Line(new T.BufferGeometry().setFromPoints(points), new T.LineBasicMaterial({ color, transparent: true, opacity }));
      world.add(line(board.getPoints(96).map(p => new T.Vector3(p.x - HALF, -.01, p.y - HALF)), "#4a4c50", .7));
      // The floor grid as lines, one square per step a sound can take.
      const grid: THREE.Vector3[] = [];
      for (let i = 1; i < CELLS; i++) { const at = i * STEP - HALF; grid.push(new T.Vector3(at, .02, -HALF), new T.Vector3(at, .02, HALF), new T.Vector3(-HALF, .02, at), new T.Vector3(HALF, .02, at)); }
      world.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(grid), new T.LineBasicMaterial({ color: "#9198a7", transparent: true, opacity: .32 })));

      // The room's walls: a faint blue box with its edges.
      const box = new T.BoxGeometry(ROOM, 2.8, ROOM);
      const walls = new T.Mesh(box, new T.MeshBasicMaterial({ color: "#469ded", transparent: true, opacity: .025, side: T.DoubleSide, depthWrite: false }));
      walls.position.y = 1.4; world.add(walls);
      const edges = new T.LineSegments(new T.EdgesGeometry(box), new T.LineBasicMaterial({ color: "#69b8ff", transparent: true, opacity: .25 }));
      edges.position.y = 1.4; world.add(edges);

      const tag = (text: string) => {
        const c = document.createElement("canvas"), ctx = c.getContext("2d")!;
        ctx.font = "500 44px system-ui"; c.width = Math.ceil(ctx.measureText(text).width + 40); c.height = 80;
        ctx.fillStyle = "#303233"; ctx.beginPath(); ctx.roundRect(0, 0, c.width, 80, 16); ctx.fill();
        ctx.fillStyle = "#e5e5e5"; ctx.font = "500 44px system-ui"; ctx.textAlign = "center"; ctx.fillText(text, c.width / 2, 56);
        const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace;
        const sprite = new T.Sprite(new T.SpriteMaterial({ map: texture, transparent: true, toneMapped: false, depthTest: false }));
        sprite.scale.set(c.width / 80 * .38, .38, 1); sprite.raycast = () => {};
        return sprite;
      };

      // Each sound: the orb, a ring on the floor under it while it's in the room, and its name.
      const items = orbs.map(orb => {
        const group = new T.Group();
        const shader = new T.ShaderMaterial({ uniforms: { time: { value: 0 }, energy: { value: 0 }, tint: { value: new T.Color(orb.color) } }, vertexShader: vertex, fragmentShader: fragment, transparent: true });
        const ball = new T.Mesh(new T.SphereGeometry(.48, touch ? 28 : 48, touch ? 20 : 32), shader); group.add(ball);
        // A bigger, invisible target so a fingertip can grab the orb.
        const grab = new T.Mesh(new T.SphereGeometry(touch ? .95 : .6, 8, 6), new T.MeshBasicMaterial({ visible: false })); ball.add(grab);
        const ring = new T.Mesh(new T.TorusGeometry(.72, .025, 10, 64), new T.MeshBasicMaterial({ color: orb.color, transparent: true, opacity: .35, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = .04; ring.raycast = () => {}; group.add(ring);
        const name = tag(orb.name); name.position.y = .85; ball.add(name);
        const place = live.current.where(orb.id); group.position.set(place.x, 0, place.z); ball.position.y = place.y;
        world.add(group);
        return { orb, group, ball, ring };
      });

      // The walking sound's route: a Walk of Fame star on each floor square it walks through, joined by a thin gold current in walking order.
      // Plates drop onto the floor in order when the stage first shows, and each new one drops in when you add it.
      const walkerColor = new T.Color(orbs.find(orb => orb.id === live.current.walker.id)?.color ?? "#ffffff");
      const tileShape = new T.BoxGeometry(STEP * .86, .05, STEP * .86), tileEdge = new T.EdgesGeometry(tileShape);
      const route = new T.Group(); world.add(route);
      const tiles = new Map<string, THREE.Mesh>();
      // A Walk of Fame star on each plate: coral terrazzo with a brass outline, its top point aimed at the next square.
      const starPoints = Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? .12 : .29, a = k * Math.PI / 5; return new T.Vector2(Math.sin(a) * r, Math.cos(a) * r); });
      const starShape = new T.ShapeGeometry(new T.Shape(starPoints)), starOutline = new T.BufferGeometry().setFromPoints([...starPoints, starPoints[0]].map(p => new T.Vector3(p.x, p.y, .001)));
      const BRASS = new T.Color("#c9a46b"), CORAL = new T.Color("#e59a98"), GOLD = new T.Color("#ffd27a");
      // The current: a thin gold core with soft pulses running toward the end, a faint glow, and a quiet crackle.
      const cordShader = (glow: number) => new T.ShaderMaterial({
        uniforms: { time: { value: 0 }, length: { value: 1 }, reveal: { value: 0 }, tint: { value: GOLD }, glow: { value: glow } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
        fragmentShader: `uniform float time; uniform float length; uniform float reveal; uniform vec3 tint; uniform float glow; varying vec2 vUv;
          float hash(float n){ return fract(sin(n) * 43758.5453); }
          void main(){ if (vUv.x > reveal) discard;
            float d = fract(vUv.x * length * .55 - time * 1.4), pulse = smoothstep(0., .05, d) * (1. - smoothstep(.05, .4, d));
            float flicker = .75 + .25 * hash(floor(time * 24.) + floor(vUv.x * length * 6.));
            vec3 c = tint * (.35 + 1.3 * pulse) * flicker + vec3(1., .95, .85) * pulse * (1. - glow) * .5;
            gl_FragColor = vec4(c, (glow > 0. ? .08 + .18 * pulse : .45 + .35 * pulse) * flicker); }`,
        transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, side: T.DoubleSide,
      });
      const core = new T.Mesh(new T.BufferGeometry(), cordShader(0)), halo = new T.Mesh(new T.BufferGeometry(), cordShader(1));
      const arc = new T.Line(new T.BufferGeometry(), new T.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .3, blending: T.AdditiveBlending, toneMapped: false }));
      for (const part of [core, halo, arc]) { part.raycast = () => {}; part.renderOrder = 2; route.add(part); }
      let cordCurve: THREE.CatmullRomCurve3 | null = null, cordBorn = -1, lastArc = 0;
      let routeKey = "", firstPaint = true;
      const paintRoute = () => {
        const cells = live.current.walker.cells, key = JSON.stringify(cells);
        if (key === routeKey) return;
        routeKey = key;
        const keep = new Set(cells.map(cell => `${cell.x}:${cell.z}`));
        let added = 0;
        for (const [name, tile] of tiles) if (!keep.has(name)) { route.remove(tile); tile.traverse(part => { const m = (part as THREE.Mesh).material as THREE.Material | undefined; if (m) m.dispose(); }); tiles.delete(name); }
        cells.forEach((cell, i) => {
          const name = `${cell.x}:${cell.z}`;
          if (tiles.has(name)) return;
          const tile = new T.Mesh(tileShape, new T.MeshStandardMaterial({ color: "#3a3637", emissive: walkerColor, emissiveIntensity: 0, roughness: .6, transparent: true, opacity: 0, depthWrite: false }));
          tile.add(new T.LineSegments(tileEdge, new T.LineBasicMaterial({ color: BRASS, transparent: true, opacity: 0 })));
          tile.position.set(cell.x, 3, cell.z); tile.raycast = () => {};
          tile.userData = { born: -1, delay: (firstPaint ? i : added++) * (firstPaint ? .045 : .03), phase: i * .7 };
          route.add(tile); tiles.set(name, tile);
        });
        cells.forEach((cell, i) => {
          const tile = tiles.get(`${cell.x}:${cell.z}`)!, next = cells[i + 1];
          let pivot = tile.userData.star as THREE.Group | undefined;
          if (!pivot) {
            pivot = new T.Group(); pivot.position.y = .03;
            const star = new T.Mesh(starShape, new T.MeshBasicMaterial({ color: CORAL.clone(), transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
            star.add(new T.Line(starOutline, new T.LineBasicMaterial({ color: BRASS, transparent: true, opacity: 0, toneMapped: false })));
            star.rotation.x = -Math.PI / 2; star.raycast = () => {}; pivot.add(star); tile.add(pivot); tile.userData.star = pivot;
          }
          if (next && (next.x !== cell.x || next.z !== cell.z)) pivot.rotation.y = Math.atan2(-(next.x - cell.x), -(next.z - cell.z));
          tile.userData.order = i;
        });
        // Rebuild the cord through the squares in walking order.
        core.geometry.dispose(); halo.geometry.dispose(); arc.geometry.dispose();
        cordCurve = cells.length > 1 ? new T.CatmullRomCurve3(cells.map(cell => new T.Vector3(cell.x, .11, cell.z)), false, "centripetal", .2) : null;
        const segments = Math.max(8, cells.length * 10);
        core.geometry = cordCurve ? new T.TubeGeometry(cordCurve, segments, .014, 6) : new T.BufferGeometry();
        halo.geometry = cordCurve ? new T.TubeGeometry(cordCurve, segments, .05, 8) : new T.BufferGeometry();
        arc.geometry = new T.BufferGeometry();
        const length = cordCurve?.getLength() ?? 1;
        for (const part of [core, halo]) (part.material as THREE.ShaderMaterial).uniforms.length.value = length;
        if (firstPaint) cordBorn = -1;
        firstPaint = false;
      };

      // The square under the pointer, so the floor reads as tappable.
      const hover = new T.Mesh(new T.PlaneGeometry(STEP * .94, STEP * .94), new T.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: .1, side: T.DoubleSide, depthWrite: false }));
      hover.rotation.x = -Math.PI / 2; hover.position.y = .045; hover.visible = false; hover.raycast = () => {}; world.add(hover);

      // The director's chair at the center, facing front; you sit here.
      new GLTFLoader().load("/models/directors-chair.glb", asset => {
        if (stopped) return;
        const chair = asset.scene;
        chair.children[0]?.quaternion.identity();
        chair.rotation.y = Math.PI; chair.updateMatrixWorld(true);
        const bounds = new T.Box3().setFromObject(chair), center = bounds.getCenter(new T.Vector3()), scale = 1.5 / bounds.getSize(new T.Vector3()).y;
        chair.scale.multiplyScalar(scale);
        chair.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
        world.add(chair);
      });

      // Dragging an orb moves its sound anywhere, in the room or out of it. It runs before the orbit controls so a grabbed orb never turns the room.
      const ray = new T.Raycaster(), floor = new T.Plane(new T.Vector3(0, 1, 0), 0), point = new T.Vector3();
      let dragging: string | null = null;
      const aim = (event: PointerEvent) => { const r = element.getBoundingClientRect(); ray.setFromCamera(new T.Vector2((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1), camera); };
      const hit = (event: PointerEvent) => { aim(event); return items.find(item => ray.intersectObject(item.ball, true).length > 0)?.orb.id ?? null; };
      let press: { x: number; y: number } | null = null, painting: { erase: boolean; cells: { x: number; z: number }[] } | null = null;
      // While you paint, a light trail shows where tiles will drop; while you erase, the tiles you cross fade.
      const preview = new T.Group(); world.add(preview);
      const previewMaterial = new T.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: .18, side: T.DoubleSide, depthWrite: false });
      const previewShape = new T.PlaneGeometry(STEP * .86, STEP * .86);
      const paintPreview = () => {
        preview.clear();
        if (!painting || painting.erase) return;
        for (const cell of painting.cells) { const ghost = new T.Mesh(previewShape, previewMaterial); ghost.rotation.x = -Math.PI / 2; ghost.position.set(cell.x, .06, cell.z); ghost.raycast = () => {}; preview.add(ghost); }
      };
      const floorCell = (event: PointerEvent) => { aim(event); if (!ray.ray.intersectPlane(floor, point) || !insideRoom(point)) return null; return { x: cellOf(point.x), z: cellOf(point.z) }; };
      const down = (event: PointerEvent) => {
        if (!event.isPrimary) return;
        press = { x: event.clientX, y: event.clientY };
        dragging = hit(event);
        // In Top view, press and drag paints the path: starting on a path square erases, anywhere else adds.
        const cell = !dragging && live.current.view === "top" ? floorCell(event) : null;
        if (cell) {
          const erase = live.current.walker.cells.some(square => square.x === cell.x && square.z === cell.z);
          painting = { erase, cells: [cell] }; paintPreview();
          element.setPointerCapture(event.pointerId);
          return;
        }
        if (dragging) { live.current.onSelect(dragging); controls.enabled = false; element.setPointerCapture(event.pointerId); element.style.cursor = "grabbing"; }
      };
      const move = (event: PointerEvent) => {
        if (painting) {
          const cell = floorCell(event), last = painting.cells[painting.cells.length - 1];
          if (cell && (cell.x !== last.x || cell.z !== last.z)) { painting.cells.push(cell); paintPreview(); }
          return;
        }
        if (!dragging) {
          const over = hit(event), cell = over ? null : floorCell(event);
          hover.visible = !!cell && event.pointerType === "mouse";
          if (cell) hover.position.set(cell.x, .045, cell.z);
          element.style.cursor = over ? "grab" : cell ? "pointer" : live.current.view === "angle" ? "move" : "default";
          return;
        }
        aim(event);
        if (ray.ray.intersectPlane(floor, point)) live.current.onMove(dragging, { ...live.current.where(dragging), x: Math.max(-REACH, Math.min(REACH, point.x)), z: Math.max(-REACH, Math.min(REACH, point.z)) });
      };
      // A tap on the floor (not a drag) adds that square to the walk, or takes it off.
      const up = (event: PointerEvent) => {
        const tapped = press && !dragging && !painting && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 6;
        // Letting go of a stroke drops the painted squares in, or takes the erased ones off.
        if (painting) { live.current.walker.onStroke(painting.cells, painting.erase); painting = null; paintPreview(); }
        if (tapped) { const cell = floorCell(event); if (cell) live.current.walker.onTap(cell); }
        if (dragging) controls.enabled = live.current.view === "angle";
        dragging = null; press = null; element.style.cursor = "default";
      };
      const leave = () => { hover.visible = false; };
      // The wheel scrolls the page; a trackpad pinch (a wheel with Ctrl) zooms the stage.
      const wheel = (event: WheelEvent) => { if (!event.ctrlKey) event.stopImmediatePropagation(); };
      element.addEventListener("pointerdown", down, { capture: true }); element.addEventListener("pointermove", move); element.addEventListener("pointerup", up); element.addEventListener("pointercancel", up); element.addEventListener("pointerleave", leave);
      element.addEventListener("wheel", wheel, { capture: true });

      // Drag the floor to turn the room all the way around in Angle view; pinch to zoom.
      const controls = new OrbitControls(camera, element);
      controls.enablePan = false; controls.enableDamping = true; controls.zoomSpeed = 1.4;
      controls.minDistance = 6; controls.maxDistance = 20;
      controls.minPolarAngle = Math.PI * .08; controls.maxPolarAngle = Math.PI * .44;
      element.style.touchAction = "pan-y";

      let shown: View | null = null, flight = 1;
      const from = new T.Vector3(), fromTarget = new T.Vector3(), to = new T.Vector3(), toTarget = new T.Vector3();
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const draw = () => {
        frame = 0;
        if (stopped || !visible) return;
        const time = performance.now() / 1000, view = live.current.view;
        if (view !== shown) {
          shown = view; flight = reduced ? 1 : 0;
          from.copy(camera.position); fromTarget.copy(controls.target);
          to.set(...VIEWS[view].position); toTarget.set(...VIEWS[view].target);
          controls.enabled = false;
        }
        if (flight < 1) {
          flight = Math.min(1, flight + .035);
          const ease = 1 - (1 - flight) ** 3;
          camera.position.lerpVectors(from, to, ease); controls.target.lerpVectors(fromTarget, toTarget, ease);
          if (flight === 1) controls.enabled = view === "angle";
        }
        if (flight === 1 && view === "top") { camera.position.copy(to); controls.target.copy(toTarget); }
        if (controls.enabled) controls.update(); else camera.lookAt(controls.target);
        for (const { orb, group, ball, ring } of items) {
          const place = live.current.where(orb.id), energy = live.current.level(orb.id), outside = !insideRoom(place);
          // Outside the room a sound floats and drifts, like the app's stereo layers.
          const drift = outside && !reduced && dragging !== orb.id;
          group.position.x += (place.x + (drift ? Math.sin(time * .28 + place.x) * .16 : 0) - group.position.x) * .35;
          group.position.z += (place.z + (drift ? Math.cos(time * .23 + place.z) * .16 : 0) - group.position.z) * .35;
          ball.position.y += ((outside ? 2.2 : place.y) + (reduced ? 0 : Math.sin(time * .9 + place.x) * .05) - ball.position.y) * .2;
          ring.visible = !outside;
          const material = ball.material as THREE.ShaderMaterial;
          material.uniforms.time.value = reduced ? 0 : time;
          material.uniforms.energy.value += (energy - material.uniforms.energy.value) * .35;
          ball.scale.setScalar(1 + material.uniforms.energy.value * .7);
          // The selected sound, whose path is showing, gets a bright ring.
          (ring.material as THREE.MeshBasicMaterial).opacity = (orb.id === live.current.walker.id ? .85 : .25) + material.uniforms.energy.value * .55;
        }
        paintRoute();
        const walking = live.current.where(live.current.walker.id), onX = cellOf(walking.x), onZ = cellOf(walking.z);
        for (const tile of tiles.values()) {
          const data = tile.userData as { born: number; delay: number; phase: number };
          if (data.born < 0) data.born = time;
          // Fall, then settle with a small bounce; afterwards, a slow float.
          const t = reduced ? 1 : Math.max(0, Math.min(1, (time - data.born - data.delay) / .7)), bounce = 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;
          const erasing = painting?.erase && painting.cells.some(cell => cell.x === tile.position.x && cell.z === tile.position.z);
          const on = tile.position.x === onX && tile.position.z === onZ, material = tile.material as THREE.MeshStandardMaterial, edge = (tile.children[0] as THREE.LineSegments).material as THREE.LineBasicMaterial;
          const rest = .05 + (on ? .08 : 0) + (reduced ? 0 : Math.sin(time * 1.3 + data.phase) * .02);
          tile.position.y = 3 + (rest - 3) * bounce;
          material.opacity += ((erasing ? .08 : .92) * t - material.opacity) * .2;
          material.emissiveIntensity += ((on ? .45 : 0) - material.emissiveIntensity) * .2;
          edge.opacity = (on ? 1 : .55) * t;
          const star = (tile.userData.star as THREE.Group | undefined)?.children[0] as THREE.Mesh | undefined;
          if (star) {
            const pulse = reduced ? .4 : Math.max(0, Math.sin(time * 3 - (tile.userData.order as number) * .45)), face = star.material as THREE.MeshBasicMaterial;
            face.opacity = (erasing ? 0 : .7 + .3 * pulse) * t;
            face.color.copy(CORAL).lerp(GOLD, on ? 1 : pulse * .35);
            ((star.children[0] as THREE.Line).material as THREE.LineBasicMaterial).opacity = (erasing ? 0 : .9) * t;
          }
        }
        // The cord draws itself in along the path, then current runs through it; the arc re-crackles a few times a second.
        if (cordBorn < 0) cordBorn = time;
        const reveal = reduced ? 1 : Math.min(1, Math.max(0, (time - cordBorn - .3) / 1.6));
        for (const part of [core, halo]) { const uniforms = (part.material as THREE.ShaderMaterial).uniforms; uniforms.time.value = reduced ? 0 : time; uniforms.reveal.value = reveal; }
        arc.visible = !!cordCurve && reveal === 1 && !painting?.erase;
        if (cordCurve && arc.visible && time - lastArc > .06) {
          lastArc = time;
          const count = Math.max(24, live.current.walker.cells.length * 6), points: THREE.Vector3[] = [];
          for (let k = 0; k <= count; k++) { const at = cordCurve.getPointAt(k / count); points.push(at.add(new T.Vector3((Math.random() - .5) * .06, (Math.random() - .5) * .04, (Math.random() - .5) * .06))); }
          arc.geometry.dispose(); arc.geometry = new T.BufferGeometry().setFromPoints(points);
          (arc.material as THREE.LineBasicMaterial).opacity = .12 + Math.random() * .22;
        }
        const { width, height } = element.getBoundingClientRect();
        if (element.width !== Math.floor(width * renderer.getPixelRatio())) renderer.setSize(width, height, false);
        // On a tall phone screen, zoom out so the whole room and the sounds around it stay in frame.
        camera.aspect = width / Math.max(1, height); camera.zoom = Math.max(.68, Math.min(1, camera.aspect / 1.4)); camera.updateProjectionMatrix();
        renderer.render(world, camera);
        frame = requestAnimationFrame(draw);
      };
      camera.position.set(...VIEWS.angle.position); controls.target.set(...VIEWS.angle.target);
      const watcher = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !frame) frame = requestAnimationFrame(draw); });
      watcher.observe(element);

      dispose = () => {
        watcher.disconnect(); controls.dispose();
        element.removeEventListener("pointerdown", down, { capture: true }); element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", up); element.removeEventListener("pointercancel", up); element.removeEventListener("pointerleave", leave);
        element.removeEventListener("wheel", wheel, { capture: true });
        world.traverse(object => { const mesh = object as THREE.Mesh; mesh.geometry?.dispose(); const material = mesh.material as THREE.Material | THREE.Material[] | undefined; for (const m of Array.isArray(material) ? material : material ? [material] : []) { (m as THREE.SpriteMaterial).map?.dispose(); m.dispose(); } });
        renderer.dispose();
      };
    })();
    return () => { stopped = true; cancelAnimationFrame(frame); dispose(); };
  }, [orbs]);

  return <div className="relative">
    {(showControls || note) && <div className="relative z-10 flex flex-col items-center gap-2">
      {showControls && <div role="group" aria-label="View" className="flex gap-1 rounded-2xl bg-[#303233]/90 p-1 text-xs font-medium text-[#e5e5e5] backdrop-blur">
        {VIEW_BUTTONS.map(({ id, label: name, Icon }) => <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)} className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 transition-colors ${view === id ? "bg-[#93acff26] text-[#93acff]" : "hover:bg-white/5"}`}><Icon className="size-4" />{name}</button>)}
      </div>}
      {note && <div className="text-xs text-white/50">{note}</div>}
    </div>}
    <canvas ref={canvas} className="mt-2 block aspect-square w-full [mask-image:radial-gradient(ellipse_at_center,black_62%,transparent_98%)] sm:aspect-[5/2]" aria-label={label} />
  </div>;
}
