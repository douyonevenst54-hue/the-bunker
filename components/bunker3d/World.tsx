"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import Icon from "../Icon";

export type V3 = [number, number, number];

/* ------------------------------------------------------------------ layout
   Outside: ground, hill and concrete facade at z = 0 with the main door.
   Corridor: x -1.5..1.5, z 0..-12. Room door on the right wall at z = -7.5.
   Room: x 1.5..10.5, z -3..-12. Everything is built from simple shapes. */
export const VIEWS = {
  outside: { pos: [0, 1.6, 9] as V3, look: [0, 1.4, 0] as V3 },
  corridor: { pos: [0, 1.6, -1.5] as V3, look: [0, 1.4, -12] as V3 },
  atDoor: { pos: [0, 1.6, -7.5] as V3, look: [1.5, 1.3, -7.5] as V3 },
  room: { pos: [3.2, 1.7, -7.5] as V3, look: [8, 0.9, -7.5] as V3 },
  pallet: { pos: [4.6, 2.0, -7.5] as V3, look: [7.4, 0.4, -7.5] as V3 },
  terminal: { pos: [3.6, 1.6, -9.4] as V3, look: [1.6, 1.5, -10.6] as V3 },
};

/** Station spots for the placement zones, around the room walls. */
export const SLOTS: { at: V3; view: { pos: V3; look: V3 }; kind: string }[] = [
  { at: [3.6, 0, -11.55], view: { pos: [3.8, 1.7, -8.5], look: [3.6, 1.0, -11.5] }, kind: "shelf" },
  { at: [6.6, 0, -11.55], view: { pos: [6.6, 1.7, -8.5], look: [6.6, 1.9, -11.5] }, kind: "high" },
  { at: [10.05, 0, -10.2], view: { pos: [7.2, 1.7, -9.6], look: [10.0, 1.0, -10.2] }, kind: "counter" },
  { at: [10.05, 0, -5.4], view: { pos: [7.2, 1.7, -6.0], look: [10.0, 1.4, -5.4] }, kind: "window" },
  { at: [8.6, 0, -3.45], view: { pos: [7.8, 1.7, -6.4], look: [8.6, 0.7, -3.5] }, kind: "hazard" },
  { at: [4.4, 0, -3.45], view: { pos: [4.6, 1.7, -6.4], look: [4.4, 0.4, -3.5] }, kind: "kids" },
  { at: [9.0, 0, -11.55], view: { pos: [8.4, 1.7, -8.6], look: [9.0, 1.0, -11.5] }, kind: "shelf" },
  { at: [6.4, 0, -3.45], view: { pos: [6.4, 1.7, -6.6], look: [6.4, 0.7, -3.5] }, kind: "counter" },
];

/** Which piece of furniture to draw for a placement spot, by the spot's id. */
const ZONE_KIND: Record<string, string> = {
  shelf: "shelf", high: "high", kitchen: "counter", window: "window", fuel: "hazard", kids: "kids",
  closet: "closet", highcab: "high", bath: "bath", fridge: "fridge", attic: "attic", table: "table",
  // security
  hall: "hall", bedroom: "bed", kitchenexit: "exitdoor", stove: "stove", backdoor: "backdoor", upwindow: "upwindow",
  // food
  pantry: "pantry", kit: "bin", freezer: "freezer", floor: "basement",
  // air
  bedrooms: "hall", interior: "interior", porch: "porch", garage: "garage", yard: "yard",
  // energy
  panel: "panel", outlet: "outlet", bedside: "bedside", drawer: "drawers",
};

export type Theme = { wall: string; floor: string; ceil: string; door: string; pallet: string; light: string; decor: "water" | "medical" | "security" | "food" | "air" | "energy" | "none" };
export const THEMES: Record<string, Theme> = {
  water: { wall: "#606870", floor: "#40464c", ceil: "#4a5056", door: "#2f6f9f", pallet: "#8b6a45", light: "#ffeccc", decor: "water" },
  medical: { wall: "#c9d3d6", floor: "#7f8c8f", ceil: "#dfe6e8", door: "#b8322c", pallet: "#e7ecef", light: "#f2fbff", decor: "medical" },
  security: { wall: "#5a5f66", floor: "#33373c", ceil: "#43474d", door: "#c0392b", pallet: "#6b7178", light: "#fff1d6", decor: "security" },
  food: { wall: "#d8c9a8", floor: "#8a6a45", ceil: "#e6dcc4", door: "#4f8a3a", pallet: "#a07a4c", light: "#fff0cf", decor: "food" },
  air: { wall: "#a9bcc6", floor: "#5f6e75", ceil: "#c3d2d9", door: "#5aa9c9", pallet: "#8fa3ad", light: "#eaf7ff", decor: "air" },
  energy: { wall: "#3f444b", floor: "#2b2f34", ceil: "#363a40", door: "#e0a326", pallet: "#55595f", light: "#ffe6a8", decor: "energy" },
};
export const themeFor = (id: string): Theme => THEMES[id] ?? { ...THEMES.water, decor: "none" };

export function crateSpot(i: number): V3 {
  const col = i % 4, row = Math.floor(i / 4);
  return [6.3 + col * 0.72, 0.25, -8.6 + row * 0.72];
}

/* ---------------------------------------------------------------- helpers */

/** Tap (not drag) handler for meshes. */
export function tap(fn: () => void) {
  return (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta <= 8) fn(); };
}
const hover = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; },
  onPointerOut: () => { document.body.style.cursor = ""; },
};

/** Standard material that pulses when it's the thing to tap next. */
function GlowMat({ color, glow, emissive = "#ffb02e", roughness = 0.85 }: { color: string; glow?: boolean; emissive?: string; roughness?: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.emissiveIntensity = glow ? 0.35 + 0.35 * Math.sin(clock.elapsedTime * 4) : 0;
  });
  return <meshStandardMaterial ref={ref} color={color} emissive={emissive} emissiveIntensity={0} roughness={roughness} />;
}

function Box({ p, s, c, r = 0.9 }: { p: V3; s: V3; c: string; r?: number }) {
  return <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={r} /></mesh>;
}

/** HTML label pinned in 3D. Stays mounted and is hidden with CSS (unmounting drei's Html mid-frame can throw). */
function Label({ p, children, size = 13, show = true }: { p: V3; children: React.ReactNode; size?: number; show?: boolean }) {
  return (
    <Html position={p} center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: "none", display: show ? "block" : "none" }}>
      <div className="b3-label" style={{ fontSize: size }}>{children}</div>
    </Html>
  );
}

/* ----------------------------------------------------------------- camera */

/** Glides to the current view; drag (mouse or finger) looks around from there. */
export function CameraRig({ pos, look, shift = 0.17 }: { pos: V3; look: V3; shift?: number }) {
  const { camera, gl, size } = useThree();
  // Lift the picture so what you're looking at sits above the bottom panel.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.setViewOffset(size.width, size.height, 0, size.height * shift, size.width, size.height);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, shift]);
  const off = useRef({ yaw: 0, pitch: 0 });
  const cur = useRef(new THREE.Vector3(...look));
  const key = pos.join() + look.join();
  useEffect(() => { off.current = { yaw: 0, pitch: 0 }; }, [key]);
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    let last: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY }; };
    const move = (e: PointerEvent) => {
      if (!last) return;
      off.current.yaw -= (e.clientX - last.x) * 0.005;
      off.current.pitch = Math.max(-0.7, Math.min(0.7, off.current.pitch - (e.clientY - last.y) * 0.004));
      last = { x: e.clientX, y: e.clientY };
    };
    const up = () => { last = null; };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { el.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [gl]);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), d: new THREE.Vector3(), s: new THREE.Spherical(), l: new THREE.Vector3() }), []);
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.03, Math.min(dt, 0.1));
    tmp.p.set(...pos);
    camera.position.lerp(tmp.p, k);
    tmp.d.set(...look).sub(tmp.p);
    tmp.s.setFromVector3(tmp.d);
    tmp.s.theta += off.current.yaw;
    tmp.s.phi = Math.max(0.35, Math.min(Math.PI - 0.35, tmp.s.phi - off.current.pitch));
    tmp.l.setFromSpherical(tmp.s).add(tmp.p);
    cur.current.lerp(tmp.l, k);
    camera.lookAt(cur.current);
  });
  return null;
}

/* ------------------------------------------------------------------ doors */

function Door({ hinge, width, open, glow, onTap, color, side = 1 }: {
  hinge: V3; width: number; open: boolean; glow?: boolean; onTap?: () => void; color: string; side?: 1 | -1;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const target = open ? side * 1.75 : 0;
    g.current.rotation.y += (target - g.current.rotation.y) * Math.min(1, dt * 3);
  });
  return (
    <group ref={g} position={hinge}>
      <mesh position={[width / 2, 1.3, 0]} onClick={onTap ? tap(onTap) : undefined} {...(onTap ? hover : {})}>
        <boxGeometry args={[width, 2.6, 0.12]} />
        <GlowMat color={color} glow={glow && !open} roughness={0.5} />
      </mesh>
      <mesh position={[width - 0.18, 1.25, 0.09]}><cylinderGeometry args={[0.05, 0.05, 0.3, 8]} /><meshStandardMaterial color="#c9ced3" metalness={0.6} roughness={0.3} /></mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- outside */

function Outside({ doorOpen, glow, onDoor, showLabels, title }: { doorOpen: boolean; glow: boolean; onDoor: () => void; showLabels: boolean; title: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]}><planeGeometry args={[80, 30]} /><meshStandardMaterial color="#3d4a36" roughness={1} /></mesh>
      <mesh position={[0, -1.2, -7.5]} scale={[14, 6.5, 7.5]}><sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#4b5a42" roughness={1} /></mesh>
      {/* concrete facade with the doorway */}
      <Box p={[-4.25, 1.9, 0]} s={[6.5, 3.8, 0.8]} c="#7b8085" />
      <Box p={[4.25, 1.9, 0]} s={[6.5, 3.8, 0.8]} c="#7b8085" />
      <Box p={[0, 3.3, 0]} s={[2, 1, 0.8]} c="#7b8085" />
      {/* hazard frame */}
      {[-1.12, 1.12].map((x) => <Box key={x} p={[x, 1.4, 0.42]} s={[0.22, 2.8, 0.05]} c="#e0a326" />)}
      <Box p={[0, 2.82, 0.42]} s={[2.46, 0.2, 0.05]} c="#e0a326" />
      <Door hinge={[-1, 0, 0.1]} width={2} open={doorOpen} glow={glow} onTap={onDoor} color="#5c6b52" />
      <Label p={[0, 3.35, 0.5]} size={18} show={showLabels}>☢ {title}</Label>
      {/* path to the door */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]}><planeGeometry args={[2.4, 9]} /><meshStandardMaterial color="#6b6f6a" roughness={1} /></mesh>
    </group>
  );
}

/* --------------------------------------------------------------- corridor */

function Corridor({ roomDoorOpen, glow, onRoomDoor, showLabels, roomTitle, others, doorColor }: {
  roomDoorOpen: boolean; glow: boolean; onRoomDoor: () => void; showLabels: boolean; roomTitle: string; others: string[]; doorColor: string;
}) {
  const wall = "#5d6166", floor = "#3b3f44";
  const lights = [-2, -6, -10];
  const fake: [number, number][] = [[-1.5, -3], [-1.5, -7.5], [-1.5, -11], [1.5, -3], [1.5, -11]];
  return (
    <group>
      <Box p={[0, 0, -6]} s={[3, 0.1, 12]} c={floor} />
      <Box p={[0, 3, -6]} s={[3, 0.1, 12]} c="#45494e" />
      <Box p={[-1.55, 1.5, -6]} s={[0.1, 3, 12]} c={wall} />
      <Box p={[1.55, 1.5, -3.4]} s={[0.1, 3, 6.8]} c={wall} />
      <Box p={[1.55, 1.5, -10.1]} s={[0.1, 3, 3.8]} c={wall} />
      <Box p={[1.55, 2.8, -7.5]} s={[0.1, 0.4, 1.4]} c={wall} />
      <Box p={[0, 1.5, -12.05]} s={[3, 3, 0.1]} c={wall} />
      {/* stripe along the floor */}
      <Box p={[0, 0.06, -6]} s={[0.12, 0.01, 11.8]} c="#e0a326" />
      {lights.map((z) => (
        <group key={z}>
          <Box p={[0, 2.93, z]} s={[0.6, 0.05, 0.25]} c="#fff3c4" r={0.2} />
          <pointLight position={[0, 2.6, z]} intensity={6} distance={7} color="#ffe7b0" />
        </group>
      ))}
      {/* the other rooms: closed doors for now */}
      {fake.map(([x, z], i) => (
        <group key={i}>
          <Box p={[x > 0 ? x - 0.07 : x + 0.07, 1.25, z]} s={[0.06, 2.5, 1.2]} c="#4a5560" />
          <Label p={[x > 0 ? x - 0.15 : x + 0.15, 2.7, z]} show={showLabels}>{others[i] ?? ""}</Label>
        </group>
      ))}
      {/* this room's door */}
      <group rotation={[0, -Math.PI / 2, 0]} position={[1.5, 0, -6.8]}>
        <Door hinge={[0, 0, 0]} width={1.4} open={roomDoorOpen} glow={glow} onTap={onRoomDoor} color={doorColor} />
      </group>
      <Label p={[1.4, 2.75, -7.5]} size={15} show={showLabels}>{roomTitle}</Label>
    </group>
  );
}

/* ------------------------------------------------------------------- room */

function StationModel({ kind }: { kind: string }) {
  switch (kind) {
    case "shelf":
      return (<group>
        {[0.3, 0.9, 1.5].map((y) => <Box key={y} p={[0, y, 0]} s={[1.6, 0.06, 0.5]} c="#7a5c3e" />)}
        {[-0.78, 0.78].map((x) => <Box key={x} p={[x, 0.9, 0]} s={[0.06, 1.8, 0.5]} c="#6a4f35" />)}
      </group>);
    case "high":
      return (<group>
        <Box p={[0, 2.0, 0.05]} s={[1.3, 0.9, 0.5]} c="#8a2f2f" />
        <Box p={[0.3, 2.0, 0.31]} s={[0.12, 0.12, 0.02]} c="#d8d8d8" />
      </group>);
    case "counter":
      return (<group>
        <Box p={[0, 0.45, 0]} s={[1.6, 0.9, 0.6]} c="#9aa3a8" />
        <Box p={[0, 0.92, 0]} s={[1.7, 0.06, 0.66]} c="#d9d4c7" />
      </group>);
    case "window":
      return (<group>
        <mesh position={[0, 1.6, 0.02]}><planeGeometry args={[1.4, 1.0]} /><meshStandardMaterial color="#ffe08a" emissive="#ffd25a" emissiveIntensity={0.8} /></mesh>
        <Box p={[0, 1.05, 0.12]} s={[1.6, 0.08, 0.3]} c="#b9b2a2" />
      </group>);
    case "hazard":
      return (<group>
        {[[-0.35, 0], [0.05, 0.1], [0.4, -0.05]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.3, z + 0.1]}><cylinderGeometry args={[0.16, 0.16, 0.6, 12]} /><meshStandardMaterial color={i === 1 ? "#c9381e" : "#d1a21b"} /></mesh>
        ))}
      </group>);
    case "kids":
      return (<group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.4]}><planeGeometry args={[1.6, 1.0]} /><meshStandardMaterial color="#5aa4d6" /></mesh>
        <mesh position={[-0.3, 0.12, 0.4]}><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color="#e2504a" /></mesh>
        <Box p={[0.3, 0.1, 0.5]} s={[0.2, 0.2, 0.2]} c="#f1c232" />
      </group>);
    case "closet":
      return (<group>
        <Box p={[0, 1.1, 0]} s={[1.5, 2.2, 0.55]} c="#8c7a64" />
        <Box p={[-0.37, 1.1, 0.29]} s={[0.7, 2.0, 0.02]} c="#a08c72" />
        <Box p={[0.37, 1.1, 0.29]} s={[0.7, 2.0, 0.02]} c="#a08c72" />
        <Box p={[0.06, 1.1, 0.32]} s={[0.04, 0.25, 0.04]} c="#d8d8d8" />
      </group>);
    case "bath":
      return (<group>
        <Box p={[0, 0.42, 0.1]} s={[1.2, 0.84, 0.5]} c="#e9eef0" />
        <mesh position={[0, 0.86, 0.1]}><cylinderGeometry args={[0.3, 0.26, 0.08, 20]} /><meshStandardMaterial color="#cfe3ea" /></mesh>
        <Box p={[0, 1.75, 0.05]} s={[0.9, 0.7, 0.18]} c="#dfe7ea" />
        <mesh position={[0, 1.75, 0.15]}><planeGeometry args={[0.8, 0.6]} /><meshStandardMaterial color="#9fc4d4" metalness={0.6} roughness={0.15} /></mesh>
        {[[-0.3, 2.35], [0.05, 2.5], [0.35, 2.3]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.3]}><sphereGeometry args={[0.16, 10, 10]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.35} /></mesh>
        ))}
      </group>);
    case "fridge":
      return (<group>
        <Box p={[0, 0.95, 0]} s={[0.9, 1.9, 0.7]} c="#eef1f2" r={0.4} />
        <Box p={[0.35, 1.2, 0.36]} s={[0.04, 0.5, 0.04]} c="#9aa3a8" />
        <Box p={[-0.15, 1.45, 0.36]} s={[0.3, 0.4, 0.01]} c="#ffe9a8" />
        <Box p={[0.75, 1.3, -0.25]} s={[0.25, 0.4, 0.08]} c="#2c2f33" />
      </group>);
    case "attic":
      return (<group>
        <Box p={[0, 2.93, 0.5]} s={[1.0, 0.06, 0.8]} c="#6a5640" />
        {[-0.25, 0.25].map((x) => <Box key={x} p={[x, 1.45, 0.75]} s={[0.05, 2.9, 0.05]} c="#8a7350" />)}
        {[0.4, 0.9, 1.4, 1.9, 2.4].map((y) => <Box key={y} p={[0, y, 0.75]} s={[0.5, 0.04, 0.05]} c="#8a7350" />)}
        <Box p={[0, 2.75, 0.92]} s={[0.18, 0.18, 0.08]} c="#c9a227" />
      </group>);
    case "table":
      return (<group>
        <Box p={[0, 0.5, 0.35]} s={[1.3, 0.06, 0.8]} c="#b07a48" />
        {[[-0.55, 0.05], [0.55, 0.05], [-0.55, 0.65], [0.55, 0.65]].map(([x, z], i) => <Box key={i} p={[x, 0.25, z]} s={[0.06, 0.5, 0.06]} c="#8b5e36" />)}
        <mesh position={[-0.3, 0.6, 0.35]}><sphereGeometry args={[0.09, 12, 12]} /><meshStandardMaterial color="#e2504a" /></mesh>
        <Box p={[0.25, 0.6, 0.4]} s={[0.15, 0.15, 0.15]} c="#4f9be0" />
      </group>);
    case "hall":
      return (<group>
        <Box p={[0, 1.15, 0]} s={[1.1, 2.3, 0.08]} c="#7d6a55" />
        <Box p={[0, 2.35, 0]} s={[1.3, 0.1, 0.1]} c="#5b4b3b" />
        <mesh position={[0, 2.92, 0.5]}><cylinderGeometry args={[0.16, 0.16, 0.06, 20]} /><meshStandardMaterial color="#f2f2ee" /></mesh>
      </group>);
    case "bed":
      return (<group>
        <Box p={[0, 0.25, 0.7]} s={[1.3, 0.3, 1.6]} c="#5a4632" />
        <Box p={[0, 0.45, 0.7]} s={[1.25, 0.15, 1.55]} c="#e8e2d5" />
        <Box p={[0, 0.58, 0.15]} s={[0.9, 0.12, 0.35]} c="#ffffff" />
        <Box p={[0, 0.7, 1.25]} s={[1.26, 0.06, 0.5]} c="#4f7fb3" />
        <Box p={[0, 0.75, -0.02]} s={[1.3, 1.0, 0.08]} c="#4a3a29" />
      </group>);
    case "exitdoor":
      return (<group>
        <Box p={[0, 1.15, 0]} s={[1.0, 2.3, 0.08]} c="#8a2f2f" />
        <Box p={[0, 2.55, 0.05]} s={[0.6, 0.22, 0.04]} c="#1f9d55" />
        <Box p={[0.75, 0.45, 0.3]} s={[0.5, 0.9, 0.6]} c="#9aa3a8" />
      </group>);
    case "stove":
      return (<group>
        <Box p={[0, 0.45, 0.25]} s={[0.9, 0.9, 0.6]} c="#d9d9d4" />
        {[[-0.2, 0.1], [0.2, 0.1], [-0.2, 0.4], [0.2, 0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.91, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.06, 0.11, 16]} /><meshStandardMaterial color="#2b2b2b" /></mesh>
        ))}
        <mesh position={[-0.2, 0.92, 0.1]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.06, 16]} /><meshStandardMaterial color="#ff5a2a" emissive="#ff3b0f" emissiveIntensity={0.8} /></mesh>
        <Box p={[0, 1.9, 0.2]} s={[0.9, 0.3, 0.5]} c="#b9bec2" />
      </group>);
    case "backdoor":
      return (<group>
        <Box p={[0, 1.15, 0]} s={[1.0, 2.3, 0.08]} c="#6b5a45" />
        <Box p={[-0.15, 0.25, 0.45]} s={[0.55, 0.5, 0.5]} c="#b88a55" />
        <Box p={[0.2, 0.7, 0.45]} s={[0.5, 0.4, 0.45]} c="#c79b63" />
      </group>);
    case "upwindow":
      return (<group>
        <mesh position={[0, 1.8, 0.02]}><planeGeometry args={[1.0, 0.9]} /><meshStandardMaterial color="#9fd0ef" emissive="#6fb6e6" emissiveIntensity={0.4} /></mesh>
        <Box p={[0, 1.33, 0.1]} s={[1.2, 0.06, 0.2]} c="#e6e2d8" />
        <Box p={[0, 0.3, 0.35]} s={[1.0, 0.25, 0.4]} c="#7a5c3e" />
      </group>);
    case "pantry":
      return (<group>
        {[0.3, 0.9, 1.5].map((y) => <Box key={y} p={[0, y, 0]} s={[1.6, 0.06, 0.5]} c="#9b7a52" />)}
        {[-0.78, 0.78].map((x) => <Box key={x} p={[x, 0.9, 0]} s={[0.06, 1.8, 0.5]} c="#7a5c3e" />)}
        {[-0.5, -0.2, 0.1, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 1.03, 0]}><cylinderGeometry args={[0.09, 0.09, 0.2, 12]} /><meshStandardMaterial color={["#c0392b", "#2e86c1", "#27ae60", "#d4ac0d"][i]} /></mesh>
        ))}
      </group>);
    case "bin":
      return (<group>
        <Box p={[0, 0.3, 0.3]} s={[1.0, 0.6, 0.6]} c="#d35400" r={0.5} />
        <Box p={[0, 0.63, 0.3]} s={[1.05, 0.06, 0.65]} c="#a04000" />
        <Box p={[0, 0.35, 0.61]} s={[0.4, 0.12, 0.02]} c="#ffffff" />
      </group>);
    case "freezer":
      return (<group>
        <Box p={[0, 0.45, 0.35]} s={[1.3, 0.9, 0.7]} c="#eef3f5" r={0.4} />
        <Box p={[0, 0.92, 0.35]} s={[1.32, 0.05, 0.72]} c="#cfe1ea" />
        <Box p={[0, 0.8, 0.71]} s={[0.5, 0.05, 0.03]} c="#9aa3a8" />
      </group>);
    case "basement":
      return (<group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.6]}><circleGeometry args={[0.7, 24]} /><meshStandardMaterial color="#4f7f99" transparent opacity={0.7} metalness={0.3} roughness={0.2} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0.6]}><circleGeometry args={[0.1, 12]} /><meshStandardMaterial color="#2b2f34" /></mesh>
      </group>);
    case "interior":
      return (<group>
        <Box p={[0, 1.15, 0]} s={[1.0, 2.3, 0.08]} c="#7d6a55" />
        <Box p={[0.75, 0.4, 0.3]} s={[0.5, 0.8, 0.5]} c="#6b5a45" />
        <Box p={[0.75, 0.9, 0.3]} s={[0.3, 0.18, 0.12]} c="#2c2f33" />
      </group>);
    case "porch":
      return (<group>
        <mesh position={[0, 1.7, 0.02]}><planeGeometry args={[1.0, 0.8]} /><meshStandardMaterial color="#9fd0ef" /></mesh>
        <Box p={[0, 0.06, 0.6]} s={[1.8, 0.12, 1.0]} c="#8a6a45" />
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => <Box key={x} p={[x, 0.45, 1.05]} s={[0.05, 0.7, 0.05]} c="#e8e2d5" />)}
        <Box p={[0, 0.8, 1.05]} s={[1.7, 0.05, 0.05]} c="#e8e2d5" />
      </group>);
    case "garage":
      return (<group>
        <Box p={[0, 1.1, 0]} s={[1.8, 2.2, 0.08]} c="#9aa3a8" />
        {[0.5, 0.9, 1.3, 1.7].map((y) => <Box key={y} p={[0, y, 0.05]} s={[1.8, 0.03, 0.02]} c="#7a8a94" />)}
        <Box p={[0, 0.35, 0.6]} s={[1.4, 0.5, 0.9]} c="#2e5f8a" />
      </group>);
    case "yard":
      return (<group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.6]}><planeGeometry args={[1.8, 1.2]} /><meshStandardMaterial color="#4f8a3a" /></mesh>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => <Box key={x} p={[x, 0.45, 0.02]} s={[0.12, 0.9, 0.05]} c="#e8e2d5" />)}
        <mesh position={[0.6, 0.9, 0.5]}><coneGeometry args={[0.35, 0.9, 10]} /><meshStandardMaterial color="#2f6b2f" /></mesh>
        <Box p={[0.6, 0.25, 0.5]} s={[0.1, 0.5, 0.1]} c="#6b4a2b" />
      </group>);
    case "panel":
      return (<group>
        <Box p={[0, 1.4, 0.06]} s={[0.7, 1.0, 0.12]} c="#8d969c" />
        {[1.65, 1.5, 1.35, 1.2].map((y) => <Box key={y} p={[0, y, 0.13]} s={[0.45, 0.08, 0.02]} c="#3a3f44" />)}
        <Box p={[0.5, 1.4, 0.08]} s={[0.25, 0.5, 0.15]} c="#e0a326" />
      </group>);
    case "outlet":
      return (<group>
        <Box p={[0, 0.45, 0.02]} s={[0.3, 0.4, 0.03]} c="#f2f2ee" />
        <Box p={[-0.05, 0.5, 0.04]} s={[0.03, 0.08, 0.02]} c="#2c2f33" />
        <Box p={[0.05, 0.5, 0.04]} s={[0.03, 0.08, 0.02]} c="#2c2f33" />
        <Box p={[-0.05, 0.38, 0.04]} s={[0.03, 0.08, 0.02]} c="#2c2f33" />
        <Box p={[0.05, 0.38, 0.04]} s={[0.03, 0.08, 0.02]} c="#2c2f33" />
      </group>);
    case "bedside":
      return (<group>
        <Box p={[0, 0.3, 0.25]} s={[0.6, 0.6, 0.45]} c="#7a5c3e" />
        <mesh position={[0, 0.75, 0.25]}><cylinderGeometry args={[0.05, 0.08, 0.3, 10]} /><meshStandardMaterial color="#c9ced3" /></mesh>
        <mesh position={[0, 0.98, 0.25]}><coneGeometry args={[0.18, 0.22, 16, 1, true]} /><meshStandardMaterial color="#f5e6c4" emissive="#ffd890" emissiveIntensity={0.4} side={THREE.DoubleSide} /></mesh>
        <Box p={[-0.9, 0.3, 0.7]} s={[1.0, 0.3, 1.4]} c="#e8e2d5" />
      </group>);
    case "drawers":
      return (<group>
        <Box p={[0, 0.45, 0.3]} s={[1.4, 0.9, 0.6]} c="#a07a4c" />
        {[0.7, 0.42, 0.14].map((y) => <Box key={y} p={[0, y, 0.61]} s={[1.3, 0.22, 0.02]} c="#b88a55" />)}
        {[0.7, 0.42, 0.14].map((y) => <Box key={"h" + y} p={[0, y, 0.63]} s={[0.25, 0.04, 0.03]} c="#d8d8d8" />)}
        <Box p={[0, 0.92, 0.3]} s={[1.45, 0.05, 0.65]} c="#d9d4c7" />
      </group>);
    default:
      return <Box p={[0, 0.5, 0]} s={[1, 1, 0.5]} c="#777" />;
  }
}

export type CrateState = "open" | "right" | "wrong";

function RoomShell({ th }: { th: Theme }) {
  return (
    <group>
      <Box p={[6, 0, -7.5]} s={[9, 0.1, 9]} c={th.floor} />
      <Box p={[6, 3, -7.5]} s={[9, 0.1, 9]} c={th.ceil} />
      <Box p={[6, 1.5, -12.05]} s={[9, 3, 0.1]} c={th.wall} />
      <Box p={[6, 1.5, -2.95]} s={[9, 3, 0.1]} c={th.wall} />
      <Box p={[10.55, 1.5, -7.5]} s={[0.1, 3, 9]} c={th.wall} />
      <pointLight position={[6, 2.7, -7.5]} intensity={14} distance={12} color={th.light} />
      <pointLight position={[3.5, 2.6, -10]} intensity={4} distance={6} color="#bfe6ff" />
      {th.decor === "medical" && (
        <group>
          {/* red cross on the back wall and a wall stripe */}
          <Box p={[5.1, 2.35, -11.98]} s={[0.7, 0.22, 0.02]} c="#c62f2a" />
          <Box p={[5.1, 2.35, -11.98]} s={[0.22, 0.7, 0.02]} c="#c62f2a" />
          <Box p={[6, 1.0, -11.99]} s={[9, 0.08, 0.01]} c="#3aa6a0" />
          <Box p={[10.49, 1.0, -7.5]} s={[0.01, 0.08, 9]} c="#3aa6a0" />
        </group>
      )}
      {th.decor === "security" && (
        <group>
          <Box p={[5.1, 2.45, -11.98]} s={[0.9, 0.3, 0.03]} c="#1f9d55" />
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => <Box key={x} p={[x, 0.08, -11.98]} s={[0.5, 0.16, 0.01]} c={x % 2 ? "#e0a326" : "#222"} />)}
        </group>
      )}
      {th.decor === "food" && (
        <group>
          <Box p={[6, 1.0, -11.99]} s={[9, 0.08, 0.01]} c="#6f9a3e" />
          <mesh position={[5.1, 2.35, -11.98]}><circleGeometry args={[0.3, 24]} /><meshStandardMaterial color="#e67e22" /></mesh>
        </group>
      )}
      {th.decor === "air" && (
        <group>
          {[3.5, 6, 8.5].map((x) => <Box key={x} p={[x, 2.85, -11.9]} s={[0.8, 0.25, 0.2]} c="#c3cbd0" />)}
          <Box p={[6, 2.95, -7.5]} s={[0.4, 0.15, 8.5]} c="#b7c2c8" />
        </group>
      )}
      {th.decor === "energy" && (
        <group>
          <Box p={[5.1, 2.35, -11.98]} s={[0.7, 0.7, 0.02]} c="#e0a326" />
          <mesh position={[5.1, 2.35, -11.96]}><circleGeometry args={[0.18, 3]} /><meshStandardMaterial color="#222" /></mesh>
          <Box p={[6, 0.08, -11.99]} s={[9, 0.16, 0.01]} c="#e0a326" />
        </group>
      )}
      {th.decor === "water" && (
        <group>
          <mesh position={[5.1, 2.35, -11.98]}><circleGeometry args={[0.32, 24]} /><meshStandardMaterial color="#3d8fd1" /></mesh>
          <Box p={[6, 1.0, -11.99]} s={[9, 0.08, 0.01]} c="#3d8fd1" />
        </group>
      )}
    </group>
  );
}

export function Room({ theme, items, crates, glowCrates, onCrate, zones, zoneIds, glowZones, onZone, placedAt, terminalGlow, onTerminal, showLabels, terminalLabel }: {
  theme: Theme; items: { e: string }[]; crates: CrateState[]; glowCrates: boolean; onCrate: (i: number) => void;
  zones: string[]; zoneIds: string[]; glowZones: boolean; onZone: (z: number) => void; placedAt: string[][];
  terminalGlow: boolean; onTerminal: () => void; showLabels: boolean; terminalLabel: string;
}) {
  return (
    <group>
      <RoomShell th={theme} />
      {/* supply pallet */}
      <Box p={[7.4, 0.06, -7.5]} s={[3.2, 0.12, 3.2]} c={theme.pallet} />
      {items.map((it, i) => {
        const p = crateSpot(i);
        const st = crates[i];
        const col = st === "right" ? "#3f8f4e" : st === "wrong" ? "#9b3b33" : "#a07a4c";
        return (
          <group key={i} position={p}>
            <mesh onClick={tap(() => onCrate(i))} {...hover}>
              <boxGeometry args={[0.5, 0.4, 0.5]} />
              <GlowMat color={col} glow={glowCrates && st === "open"} />
            </mesh>
            <Label p={[0, 0.5, 0]} size={24} show={showLabels}><Icon e={it.e} /></Label>
          </group>
        );
      })}
      {/* placement stations */}
      {zones.map((label, z) => {
        const slot = SLOTS[z] ?? SLOTS[0];
        const facing = slot.at[0] > 10 ? -Math.PI / 2 : slot.at[2] > -4 ? Math.PI : 0;
        return (
          <group key={z} position={slot.at} rotation={[0, facing, 0]}>
            <StationModel kind={ZONE_KIND[zoneIds[z]] ?? slot.kind} />
            <mesh position={[0, 1.1, 0.35]} onClick={tap(() => onZone(z))} {...hover}>
              <boxGeometry args={[1.8, 2.2, 0.05]} />
              <meshStandardMaterial color="#ffb02e" transparent opacity={glowZones ? 0.16 : 0} depthWrite={false} />
            </mesh>
            <Label p={[0, 2.65, 0.3]} show={showLabels}>{label}</Label>
            <Label p={[0, 1.2, 0.5]} size={22} show={showLabels && (placedAt[z]?.length ?? 0) > 0}>{(placedAt[z] ?? []).map((e, k) => <Icon key={k} e={e} />)}</Label>
          </group>
        );
      })}
      {/* survival terminal */}
      <group position={[1.62, 0, -10.6]} rotation={[0, Math.PI / 2, 0]}>
        <Box p={[0, 0.6, 0.15]} s={[0.9, 1.2, 0.3]} c="#30363c" />
        <mesh position={[0, 1.55, 0.06]} onClick={tap(onTerminal)} {...hover}>
          <boxGeometry args={[1.1, 0.75, 0.08]} />
          <GlowMat color="#0f3a4a" emissive="#35d0ff" glow={terminalGlow} />
        </mesh>
        <Label p={[0, 2.15, 0.1]} show={showLabels}>🖥 {terminalLabel}</Label>
      </group>
    </group>
  );
}

export function Scene(props: {
  view: { pos: V3; look: V3 };
  outside: React.ComponentProps<typeof Outside>;
  corridor: React.ComponentProps<typeof Corridor>;
  room: React.ComponentProps<typeof Room>;
  showRoom: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#141a24"]} />
      <fog attach="fog" args={["#141a24", 14, 40]} />
      <hemisphereLight args={["#b9c8ff", "#2b2a24", 0.9]} />
      <directionalLight position={[6, 10, 8]} intensity={1.1} />
      <CameraRig {...props.view} />
      <Outside {...props.outside} />
      <Corridor {...props.corridor} />
      <group visible={props.showRoom}><Room {...props.room} /></group>
    </>
  );
}
