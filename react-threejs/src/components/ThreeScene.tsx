"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

export function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <OrbitControls />
      <Sphere args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial distort={0.4} speed={2} color="#ff2060" />
      </Sphere>
    </Canvas>
  );
}
