"use client";
// First-person movement: eye-level camera, joystick / keys to walk, drag to look, walls and furniture
// you can't walk through, and automatic moves that go through doorways (never through walls).
import { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { blocked, pathTo, regionAt, EYE, type AABB, type Region } from "./nav";
import type { V3 } from "./World";

export type Interactable = { id: string; at: V3; range: number };
export type MoveInput = { fx: number; fz: number }; // joystick: fx = strafe right, fz = forward
export type WalkerApi = {
  walkTo: (x: number, z: number, look: V3, done?: () => void) => void;
  lookAt: (look: V3) => void;
  where: () => { x: number; z: number };
};

const SPEED = 2.4, AUTO_SPEED = 4.5;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export function Walker({ api, input, obstacles, start, interactables, onFocus, onRegion, paused, shift = 0.12 }: {
  api: React.Ref<WalkerApi>;
  input: React.RefObject<MoveInput>;
  obstacles: AABB[];
  start: { x: number; z: number; yaw: number };
  interactables: Interactable[];
  onFocus: (id: string | null) => void;
  onRegion: (r: Region) => void;
  paused: boolean;
  shift?: number;
}) {
  const { camera, gl, size } = useThree();
  const s = useRef({ x: start.x, z: start.z, yaw: start.yaw, pitch: -0.05, tYaw: start.yaw, tPitch: -0.05 });
  const path = useRef<{ pts: [number, number][]; look: V3; done?: () => void } | null>(null);
  const keys = useRef(new Set<string>());
  const focus = useRef<string | null>(null);
  const region = useRef<Region>(regionAt(start.x, start.z));
  const obsRef = useRef(obstacles); obsRef.current = obstacles;
  const itRef = useRef(interactables); itRef.current = interactables;
  const pausedRef = useRef(paused); pausedRef.current = paused;

  // Lift the picture a little so what you look at sits above the controls.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.setViewOffset(size.width, size.height, 0, size.height * shift, size.width, size.height);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, shift]);

  function face(look: V3) {
    const dx = look[0] - s.current.x, dz = look[2] - s.current.z;
    s.current.tYaw = Math.atan2(-dx, -dz);
    s.current.tPitch = Math.atan2(look[1] - EYE, Math.hypot(dx, dz) || 1);
  }
  useImperativeHandle(api, () => ({
    walkTo: (x, z, look, done) => { path.current = { pts: pathTo(s.current.x, s.current.z, x, z), look, done }; },
    lookAt: (look) => face(look),
    where: () => ({ x: s.current.x, z: s.current.z }),
  }));

  // drag to look (mouse or finger on the 3D view), keys to walk
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    let last: { x: number; y: number; id: number } | null = null;
    const down = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY, id: e.pointerId }; };
    const move = (e: PointerEvent) => {
      if (!last || e.pointerId !== last.id || pausedRef.current) return;
      // swipe right = look right, swipe up = look up
      s.current.tYaw -= (e.clientX - last.x) * 0.006;
      s.current.tPitch = Math.max(-1.1, Math.min(1.1, s.current.tPitch - (e.clientY - last.y) * 0.005));
      s.current.yaw = s.current.tYaw; s.current.pitch = s.current.tPitch;
      last = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const up = () => { last = null; };
    const kd = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.tagName === "INPUT") return; keys.current.add(e.key.toLowerCase()); };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      el.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
    };
  }, [gl]);

  const fwd = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const st = s.current;
    if (!pausedRef.current) {
      const k = keys.current, inp = input.current ?? { fx: 0, fz: 0 };
      let fz = inp.fz, fx = inp.fx;
      if (k.has("w") || k.has("arrowup")) fz += 1;
      if (k.has("s") || k.has("arrowdown")) fz -= 1;
      if (k.has("d")) fx += 1;
      if (k.has("a")) fx -= 1;
      if (k.has("arrowleft")) { st.tYaw += 1.8 * dt; st.yaw = st.tYaw; }
      if (k.has("arrowright")) { st.tYaw -= 1.8 * dt; st.yaw = st.tYaw; }
      const manual = Math.abs(fx) > 0.05 || Math.abs(fz) > 0.05;
      if (manual) {
        path.current = null; // the player took over
        const len = Math.min(1, Math.hypot(fx, fz));
        const ang = Math.atan2(fx, fz);
        const dir = st.yaw - ang;
        const dx = -Math.sin(dir) * SPEED * len * dt, dz = -Math.cos(dir) * SPEED * len * dt;
        if (!blocked(st.x + dx, st.z, obsRef.current)) st.x += dx;
        if (!blocked(st.x, st.z + dz, obsRef.current)) st.z += dz;
      } else if (path.current) {
        const p = path.current, [tx, tz] = p.pts[0];
        // automatic moves keep real time even on slow phones (bigger steps when frames are slow)
        const dx = tx - st.x, dz = tz - st.z, d = Math.hypot(dx, dz), stepLen = AUTO_SPEED * Math.min(dtRaw, 0.25);
        if (d <= stepLen) {
          st.x = tx; st.z = tz; p.pts.shift();
          if (!p.pts.length) { path.current = null; face(p.look); p.done?.(); }
        } else {
          st.x += (dx / d) * stepLen; st.z += (dz / d) * stepLen;
          st.tYaw = Math.atan2(-dx, -dz); st.tPitch = -0.05;
        }
      }
    }
    // smooth turning
    st.yaw += wrap(st.tYaw - st.yaw) * Math.min(1, dt * 7);
    st.pitch += (st.tPitch - st.pitch) * Math.min(1, dt * 7);
    camera.position.set(st.x, EYE, st.z);
    camera.rotation.set(st.pitch, st.yaw, 0, "YXZ");

    // region changes (outside → corridor → room)
    const r = regionAt(st.x, st.z);
    if (r !== region.current) { region.current = r; onRegion(r); }

    // what's in front of you and close enough to use
    fwd.set(-Math.sin(st.yaw), 0, -Math.cos(st.yaw));
    let best: string | null = null, bestAng = 0.75;
    for (const it of itRef.current) {
      const dx = it.at[0] - st.x, dz = it.at[2] - st.z, d = Math.hypot(dx, dz);
      if (d > it.range) continue;
      const ang = d < 0.5 ? 0 : Math.acos(Math.max(-1, Math.min(1, (dx * fwd.x + dz * fwd.z) / d)));
      if (ang < bestAng) { bestAng = ang; best = it.id; }
    }
    if (best !== focus.current) { focus.current = best; onFocus(best); }
  });
  return null;
}
