import { useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

type Props = { mode: "dark" | "light" };

function makeStarField(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // bias forward depth to feel like "looking out"
    const z = -Math.random() * spread;
    positions[i3 + 0] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.55;
    positions[i3 + 2] = z;
  }
  return positions;
}

function Haze({ color, z, opacity, r }: { color: string; z: number; opacity: number; r: number }) {
  return (
    <mesh position={[0, 0.6, z]}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

export default function StarfieldSubtleScene({ mode }: Props) {
  const starsA = useMemo(() => makeStarField(5200, 190), []);
  const starsB = useMemo(() => makeStarField(2800, 240), []);
  const group = useRef<THREE.Group>(null!);

  useFrame(({ camera, mouse }, dt) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.75, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + mouse.y * 0.45, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8.0, 0.02);
    camera.lookAt(0, 0.2, -22);

    if (group.current) {
      group.current.rotation.y += dt * 0.006;
      group.current.rotation.x += dt * 0.003;
    }
  });

  const bg = mode === "dark" ? "#000006" : "#eef2ff";

  return (
    <group>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 26, 260]} />

      <ambientLight intensity={mode === "dark" ? 0.22 : 0.7} />

      <group ref={group}>
        <Points positions={starsB} stride={3} frustumCulled={false}>
          <PointMaterial transparent color={mode === "dark" ? "#e5e7eb" : "#1f2937"} size={0.012} sizeAttenuation depthWrite={false} opacity={0.55} />
        </Points>
        <Points positions={starsA} stride={3} frustumCulled={false}>
          <PointMaterial transparent color={mode === "dark" ? "#ffffff" : "#0f172a"} size={0.017} sizeAttenuation depthWrite={false} opacity={0.7} />
        </Points>

        <Float speed={0.15} rotationIntensity={0.15} floatIntensity={0.35}>
          <Haze color={mode === "dark" ? "#93c5fd" : "#2563eb"} z={-60} opacity={mode === "dark" ? 0.06 : 0.05} r={9.5} />
          <Haze color={mode === "dark" ? "#ffffff" : "#0f172a"} z={-110} opacity={mode === "dark" ? 0.03 : 0.03} r={16} />
        </Float>
      </group>
    </group>
  );
}
