"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";

function MorphingMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(elapsed * 0.15) * 0.2;
    meshRef.current.rotation.y = Math.cos(elapsed * 0.1) * 0.2;
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.4}>
        <MeshDistortMaterial
          color="#059669" 
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.1}
        />
      </Sphere>
    </Float>
  );
}

export default function HeroAnimation() {
  return (
    /* Change 1: Added z-0 to pull it ahead of solid CSS backgrounds, 
       and fixed explicit min-h positions so the canvas fills out screen real estate */
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={2.0} />
        <pointLight position={[-10, -10, -5]} intensity={1.0} color="#0d9488" />
        <MorphingMesh />
      </Canvas>
    </div>
  );
}