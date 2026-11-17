"use client";
// Real objects in the room (instead of crates on a pallet), built from simple shapes so phones stay fast.
import type { V3 } from "./World";

export type ItemPlace = { at: V3; rotY?: number; model: string };

/** Rooms whose supplies sit where they belong. Index = the room's item order. */
export const LAYOUTS: Record<string, { items: ItemPlace[]; table?: V3; removeBoxesFromBackdoor?: boolean }> = {
  security: {
    table: [6.2, 0, -7.1],
    removeBoxesFromBackdoor: true,
    items: [
      { at: [5.0, 2.95, -7.6], model: "smokeAlarm" },             // working smoke alarm, on the ceiling
      { at: [10.44, 0.85, -8.5], rotY: -Math.PI / 2, model: "extinguisher" }, // wall-mounted, by the kitchen exit
      { at: [5.85, 0.78, -7.25], model: "flashlight" },           // on the table
      { at: [3.3, 0, -3.75], rotY: Math.PI, model: "ladder" },     // under the upstairs window
      { at: [1.66, 1.45, -5.6], rotY: Math.PI / 2, model: "whistle" }, // on a hook by the door
      { at: [10.47, 1.4, -11.05], rotY: -Math.PI / 2, model: "keys" }, // key hook next to the exit door
      { at: [6.5, 0.78, -6.95], model: "candles" },               // on the table
      { at: [8.4, 2.95, -9.0], model: "smokeAlarmOff" },          // alarm with the battery taken out
      { at: [8.6, 0, -4.2], model: "boxes" },                      // blocking the back door
      { at: [8.6, 1.75, -3.6], rotY: Math.PI, model: "wreath" },   // on the back door
    ],
  },
};

/** Size factor for the inspection viewer, so every object fills the small window. */
export const VIEW_SCALE: Record<string, number> = {
  smokeAlarm: 4, smokeAlarmOff: 3.2, extinguisher: 1.6, flashlight: 3.4, ladder: 1.2, whistle: 6, keys: 4.5, candles: 4.2, boxes: 1.1, wreath: 2.6, crate: 1.6,
};
/** Where the model's centre sits relative to its origin (for framing in the viewer). */
export const VIEW_CENTER: Record<string, number> = {
  smokeAlarm: -0.03, smokeAlarmOff: -0.12, extinguisher: 0.3, flashlight: 0.04, ladder: 0.45, whistle: 0, keys: 0, candles: 0.08, boxes: 0.45, wreath: 0, crate: 0.2,
};

function M({ p = [0, 0, 0], s, c, r = 0.7, m = 0, e }: { p?: V3; s: V3; c: string; r?: number; m?: number; e?: string }) {
  return <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000"} emissiveIntensity={e ? 0.9 : 0} /></mesh>;
}
function Cyl({ p = [0, 0, 0], r, h, c, rot, e, m = 0 }: { p?: V3; r: number; h: number; c: string; rot?: V3; e?: string; m?: number }) {
  return <mesh position={p} rotation={rot}><cylinderGeometry args={[r, r, h, 18]} /><meshStandardMaterial color={c} roughness={0.5} metalness={m} emissive={e ?? "#000"} emissiveIntensity={e ? 1 : 0} /></mesh>;
}

export function ItemModel({ kind }: { kind: string }) {
  switch (kind) {
    case "smokeAlarm":
      return (<group>
        <Cyl p={[0, -0.03, 0]} r={0.14} h={0.05} c="#f4f4f0" />
        <Cyl p={[0, -0.06, 0]} r={0.09} h={0.015} c="#dcdcd6" />
        <mesh position={[0.08, -0.06, 0.03]}><sphereGeometry args={[0.012, 8, 8]} /><meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={1.4} /></mesh>
      </group>);
    case "smokeAlarmOff":
      return (<group>
        <Cyl p={[0, -0.01, 0]} r={0.1} h={0.02} c="#cfcfc8" />
        <group position={[0.06, -0.15, 0]} rotation={[0, 0, 1.0]}>
          <Cyl r={0.14} h={0.05} c="#f4f4f0" />
        </group>
        <mesh position={[0.02, -0.08, 0]}><cylinderGeometry args={[0.004, 0.004, 0.14, 6]} /><meshStandardMaterial color="#c0392b" /></mesh>
        <M p={[-0.05, -0.1, 0.02]} s={[0.05, 0.03, 0.02]} c="#2b2b2b" />
      </group>);
    case "extinguisher":
      return (<group>
        <M p={[0, 0.35, -0.02]} s={[0.12, 0.08, 0.03]} c="#3a3f44" m={0.4} />
        <Cyl p={[0, 0.27, 0.08]} r={0.085} h={0.48} c="#c62828" m={0.2} />
        <mesh position={[0, 0.53, 0.08]}><sphereGeometry args={[0.085, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#c62828" /></mesh>
        <M p={[0, 0.6, 0.08]} s={[0.05, 0.06, 0.05]} c="#2b2b2b" m={0.5} />
        <M p={[0.05, 0.64, 0.08]} s={[0.12, 0.015, 0.03]} c="#1d1d1d" />
        <Cyl p={[-0.07, 0.42, 0.13]} r={0.012} h={0.3} c="#1d1d1d" rot={[0.3, 0, 0.2]} />
        <M p={[0, 0.3, 0.17]} s={[0.1, 0.08, 0.005]} c="#f1f1ee" />
      </group>);
    case "flashlight":
      return (<group>
        <Cyl p={[0, 0.03, 0]} r={0.025} h={0.2} c="#1f2327" rot={[0, 0, Math.PI / 2]} m={0.3} />
        <mesh position={[0.12, 0.03, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.04, 0.026, 0.05, 18]} /><meshStandardMaterial color="#2b3035" metalness={0.3} /></mesh>
        <mesh position={[0.146, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}><circleGeometry args={[0.035, 18]} /><meshStandardMaterial color="#fff6c8" emissive="#fff0a0" emissiveIntensity={0.8} side={2} /></mesh>
        <Cyl p={[-0.03, 0.015, 0.08]} r={0.013} h={0.05} c="#d9a21b" rot={[0, 0, Math.PI / 2]} />
        <Cyl p={[0.03, 0.015, 0.08]} r={0.013} h={0.05} c="#1d1d1d" rot={[0, 0, Math.PI / 2]} />
      </group>);
    case "ladder":
      return (<group>
        {[-0.18, 0.18].map((x) => <M key={x} p={[x, 0.45, 0]} s={[0.04, 0.9, 0.04]} c="#9aa3a8" m={0.6} r={0.3} />)}
        {[0.12, 0.3, 0.48, 0.66, 0.84].map((y) => <M key={y} p={[0, y, 0]} s={[0.36, 0.03, 0.05]} c="#c9ced3" m={0.6} r={0.3} />)}
        {[-0.18, 0.18].map((x) => <M key={"h" + x} p={[x, 0.93, -0.06]} s={[0.05, 0.05, 0.14]} c="#2b2f33" />)}
      </group>);
    case "whistle":
      return (<group>
        <M p={[0, 0, 0.03]} s={[0.07, 0.025, 0.03]} c="#ff7a1a" r={0.4} />
        <Cyl p={[-0.03, 0, 0.03]} r={0.022} h={0.03} c="#ff7a1a" rot={[Math.PI / 2, 0, 0]} />
        <mesh position={[0.05, 0.03, 0.03]}><torusGeometry args={[0.02, 0.004, 6, 16]} /><meshStandardMaterial color="#c9ced3" metalness={0.7} /></mesh>
        <M p={[0.05, 0.05, 0]} s={[0.012, 0.012, 0.03]} c="#3a3f44" />
      </group>);
    case "keys":
      return (<group>
        <M p={[0, 0, 0.01]} s={[0.22, 0.14, 0.02]} c="#8a6a45" />
        {[-0.05, 0.05].map((x, i) => (
          <group key={x} position={[x, -0.03, 0.035]}>
            <mesh position={[0, 0.05, 0]}><torusGeometry args={[0.015, 0.004, 6, 14]} /><meshStandardMaterial color="#c9ced3" metalness={0.7} /></mesh>
            <M p={[0, 0, 0]} s={[0.012, 0.06, 0.006]} c={i ? "#c9ced3" : "#d4a72c"} m={0.8} r={0.3} />
            <M p={[0.008, -0.02, 0]} s={[0.01, 0.01, 0.006]} c={i ? "#c9ced3" : "#d4a72c"} m={0.8} r={0.3} />
          </group>
        ))}
      </group>);
    case "candles":
      return (<group>
        {[[-0.05, 0.12], [0.02, 0.16], [0.07, 0.1]].map(([x, h], i) => (
          <group key={i} position={[x, 0, i === 1 ? -0.03 : 0.02]}>
            <Cyl p={[0, h / 2, 0]} r={0.022} h={h} c="#f3eee2" />
            <mesh position={[0, h + 0.025, 0]}><coneGeometry args={[0.012, 0.04, 10]} /><meshStandardMaterial color="#ffb02e" emissive="#ff8a00" emissiveIntensity={1.6} /></mesh>
          </group>
        ))}
      </group>);
    case "boxes":
      return (<group>
        <M p={[-0.25, 0.25, 0]} s={[0.55, 0.5, 0.5]} c="#b88a55" />
        <M p={[0.28, 0.22, 0.05]} s={[0.5, 0.44, 0.45]} c="#c79b63" />
        <M p={[0, 0.7, 0.02]} s={[0.5, 0.4, 0.45]} c="#a97b48" />
        <M p={[0, 0.91, 0.02]} s={[0.5, 0.01, 0.06]} c="#d8c39a" />
      </group>);
    case "wreath":
      return (<group>
        <mesh><torusGeometry args={[0.2, 0.06, 10, 28]} /><meshStandardMaterial color="#2f7d3c" roughness={0.9} /></mesh>
        {[0.6, 2.2, 3.8, 5.2].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.05]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#d23b2f" /></mesh>
        ))}
        <M p={[0, -0.21, 0.06]} s={[0.12, 0.06, 0.02]} c="#d23b2f" />
      </group>);
    default:
      return <M p={[0, 0.2, 0]} s={[0.5, 0.4, 0.5]} c="#a07a4c" />;
  }
}

/** A small table the room's tabletop items sit on. */
export function Table({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <M p={[0, 0.74, 0]} s={[1.2, 0.06, 0.8]} c="#7a5c3e" />
      {[[-0.52, -0.32], [0.52, -0.32], [-0.52, 0.32], [0.52, 0.32]].map(([x, z], i) => <M key={i} p={[x, 0.37, z]} s={[0.06, 0.74, 0.06]} c="#5e452e" />)}
    </group>
  );
}
