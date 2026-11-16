"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

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

function Label({ p, children, size = 13, show = true }: { p: V3; children: React.ReactNode; size?: number; show?: boolean }) {
  if (!show) return null;
  return (
    <Html position={p} center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className="b3-label" style={{ fontSize: size }}>{children}</div>
    </Html>
  );
}

/* ----------------------------------------------------------------- camera */

/** Glides to the current view; drag (mouse or finger) looks around from there. */
export function CameraRig({ pos, look }: { pos: V3; look: V3 }) {
  const { camera, gl } = useThree();
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

function Corridor({ roomDoorOpen, glow, onRoomDoor, showLabels, roomTitle, others }: {
  roomDoorOpen: boolean; glow: boolean; onRoomDoor: () => void; showLabels: boolean; roomTitle: string; others: string[];
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
          <Label p={[x > 0 ? x - 0.15 : x + 0.15, 2.7, z]} show={showLabels}>🔒 {others[i] ?? ""}</Label>
        </group>
      ))}
      {/* this room's door */}
      <group rotation={[0, -Math.PI / 2, 0]} position={[1.5, 0, -6.8]}>
        <Door hinge={[0, 0, 0]} width={1.4} open={roomDoorOpen} glow={glow} onTap={onRoomDoor} color="#2f6f9f" />
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
    default:
      return <Box p={[0, 0.5, 0]} s={[1, 1, 0.5]} c="#777" />;
  }
}

export type CrateState = "open" | "right" | "wrong";

function RoomShell() {
  const wall = "#606870";
  return (
    <group>
      <Box p={[6, 0, -7.5]} s={[9, 0.1, 9]} c="#40464c" />
      <Box p={[6, 3, -7.5]} s={[9, 0.1, 9]} c="#4a5056" />
      <Box p={[6, 1.5, -12.05]} s={[9, 3, 0.1]} c={wall} />
      <Box p={[6, 1.5, -2.95]} s={[9, 3, 0.1]} c={wall} />
      <Box p={[10.55, 1.5, -7.5]} s={[0.1, 3, 9]} c={wall} />
      <pointLight position={[6, 2.7, -7.5]} intensity={14} distance={12} color="#ffeccc" />
      <pointLight position={[3.5, 2.6, -10]} intensity={4} distance={6} color="#bfe6ff" />
    </group>
  );
}

export function Room({ items, crates, glowCrates, onCrate, zones, glowZones, onZone, placedAt, terminalGlow, onTerminal, showLabels, terminalLabel }: {
  items: { e: string }[]; crates: CrateState[]; glowCrates: boolean; onCrate: (i: number) => void;
  zones: string[]; glowZones: boolean; onZone: (z: number) => void; placedAt: string[][];
  terminalGlow: boolean; onTerminal: () => void; showLabels: boolean; terminalLabel: string;
}) {
  return (
    <group>
      <RoomShell />
      {/* supply pallet */}
      <Box p={[7.4, 0.06, -7.5]} s={[3.2, 0.12, 3.2]} c="#8b6a45" />
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
            <Label p={[0, 0.5, 0]} size={24} show={showLabels}>{it.e}</Label>
          </group>
        );
      })}
      {/* placement stations */}
      {zones.map((label, z) => {
        const slot = SLOTS[z] ?? SLOTS[0];
        const facing = slot.at[0] > 10 ? -Math.PI / 2 : slot.at[2] > -4 ? Math.PI : 0;
        return (
          <group key={z} position={slot.at} rotation={[0, facing, 0]}>
            <StationModel kind={slot.kind} />
            <mesh position={[0, 1.1, 0.35]} onClick={tap(() => onZone(z))} {...hover}>
              <boxGeometry args={[1.8, 2.2, 0.05]} />
              <meshStandardMaterial color="#ffb02e" transparent opacity={glowZones ? 0.16 : 0} depthWrite={false} />
            </mesh>
            <Label p={[0, 2.65, 0.3]} show={showLabels}>{label}</Label>
            {placedAt[z]?.length > 0 && <Label p={[0, 1.2, 0.5]} size={22} show={showLabels}>{placedAt[z].join(" ")}</Label>}
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
      {props.showRoom && <Room {...props.room} />}
    </>
  );
}
