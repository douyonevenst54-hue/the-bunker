"use client";
// Small 3D viewer in the inspect panel: the object turns slowly; drag to rotate, pinch or scroll to zoom.
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ItemModel, VIEW_SCALE, VIEW_CENTER } from "./Props";

export default function Inspector({ model }: { model: string }) {
  const k = VIEW_SCALE[model] ?? 1.5, c = VIEW_CENTER[model] ?? 0.1;
  const ceiling = model === "smokeAlarm" || model === "smokeAlarmOff";
  return (
    <div className="b3-inspect" aria-hidden>
      <Canvas camera={{ fov: 35, position: [0, 0.35, 2.4] }} dpr={[1, 2]}>
        <color attach="background" args={["#0d1218"]} />
        <hemisphereLight args={["#ffffff", "#334", 1.3]} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} />
        <group scale={k} rotation={[ceiling ? Math.PI * 0.75 : 0, 0, 0]} position={[0, -c * k * (ceiling ? -1 : 1), 0]}>
          <ItemModel kind={model} />
        </group>
        <OrbitControls autoRotate autoRotateSpeed={2.5} enablePan={false} minDistance={1.2} maxDistance={4} />
      </Canvas>
    </div>
  );
}
