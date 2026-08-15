"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import {
  Eye,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Layers,
  Sun,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- 3D HOUSE MESH COMPONENT ---
function House3DModel({ activeRoom }: { activeRoom: string }) {
  const meshRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      {/* House Base / Structure */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Main Glass Walls (Transparent Outer Building Wireframe) */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[3, 2, 3]} />
        <meshPhysicalMaterial
          color={activeRoom === "living" ? "#10b981" : activeRoom === "master" ? "#0284c7" : "#8b5cf6"}
          transparent
          opacity={0.25}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Wireframe Outline */}
      <lineSegments position={[0, 0.6, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(3.02, 2.02, 3.02)]} />
        <lineBasicMaterial color="#34d399" linewidth={2} />
      </lineSegments>

      {/* Room Highlight Cubes Inside */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-0.7, 0.5, -0.7]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial
            color={activeRoom === "living" ? "#34d399" : "#334155"}
            emissive={activeRoom === "living" ? "#059669" : "#000000"}
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[0.7, 0.5, 0.7]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial
            color={activeRoom === "master" ? "#38bdf8" : "#334155"}
            emissive={activeRoom === "master" ? "#0284c7" : "#000000"}
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[0.7, 0.5, -0.7]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial
            color={activeRoom === "kitchen" ? "#a78bfa" : "#334155"}
            emissive={activeRoom === "kitchen" ? "#7c3aed" : "#000000"}
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </Float>

      {/* Roof Wireframe Cone */}
      <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.4, 1, 4]} />
        <meshStandardMaterial color="#059669" wireframe />
      </mesh>
    </group>
  );
}

const roomDetails = [
  {
    id: "living",
    label: "Executive Living Room",
    description: "Panoramic double-height glass windows with Bole Medhaniallem skyline views, plush velvet seating, and built-in ambient LED cove lighting.",
    hotspots: [
      { name: "Skyline Glass Balcony", detail: "Double-glazed acoustic glass" },
      { name: "Smart Climate Control", detail: "Dual zone AC & heating" },
      { name: "24/7 Power Outlet", detail: "Connected to automatic generator" }
    ],
    image: "/images/residential_apartments.png"
  },
  {
    id: "master",
    label: "Master Suite & En-Suite",
    description: "Spacious master bedroom with walk-in closet, teak hardwood flooring, en-suite marble bathroom with rainfall shower & Jacuzzi.",
    hotspots: [
      { name: "Marble En-Suite Bathroom", detail: "Italian Jacuzzi & rainfall head" },
      { name: "Walk-In Dressing Room", detail: "Built-in cedarwood wardrobes" },
      { name: "Soundproof Walls", detail: "52dB noise isolation index" }
    ],
    image: "/images/penthouse_duplex.png"
  },
  {
    id: "kitchen",
    label: "European Fitted Kitchen",
    description: "Chef's kitchen featuring quartz stone countertops, Bosch integrated appliances, island breakfast bar, and dedicated pantry space.",
    hotspots: [
      { name: "Integrated Oven & Range", detail: "Bosch German engineering" },
      { name: "Water Filtration System", detail: "5-stage Reverse Osmosis filter" },
      { name: "Quartz Center Island", detail: "Seating for 4 breakfast diner" }
    ],
    image: "/images/studio_flat.png"
  }
];

export default function Virtual3DTourSection() {
  const [activeRoomId, setActiveRoomId] = useState<string>("living");

  const currentRoom = roomDetails.find(r => r.id === activeRoomId) || roomDetails[0];

  return (
    <section className="bg-slate-950 text-white py-24 relative overflow-hidden border-t border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Eye className="h-4 w-4" /> Next-Gen Property Viewing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Interactive 360° Virtual <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              House & Room Walkthrough
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Inspect every corner of your future Ethiopian home before booking an in-person walkthrough. Powered by interactive 3D spatial canvas rendering.
          </p>
        </div>

        {/* Room Navigation Tabs */}
        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {roomDetails.map(room => (
            <button
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeRoomId === room.id
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {room.label}
            </button>
          ))}
        </div>

        {/* Main Grid: 3D Interactive Canvas & Room Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 3D Canvas Box (7 columns) */}
          <div className="lg:col-span-7 relative h-[420px] sm:h-[480px] rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
            <Canvas>
              <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={45} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <House3DModel activeRoom={activeRoomId} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
            </Canvas>

            {/* Canvas Controls Overlay Overlay */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-emerald-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Live 3D Spatial Wireframe • Drag to Rotate
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2">
              <Maximize2 className="h-3.5 w-3.5 text-emerald-400" /> Full Interactive Mode
            </div>
          </div>

          {/* Room Specifications Card (5 columns) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">Selected Room View</span>
              <h3 className="text-2xl font-bold text-white">{currentRoom.label}</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                {currentRoom.description}
              </p>
            </div>

            {/* Image Preview Thumbnail */}
            <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-800">
              <img src={currentRoom.image} alt={currentRoom.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-3 flex items-end">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full">
                  Verified Real Estate Photo
                </span>
              </div>
            </div>

            {/* Room Features Hotspots */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Highlights</h4>
              {currentRoom.hotspots.map((hs, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{hs.name}</h5>
                      <p className="text-[10px] text-slate-400">{hs.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <a href="/browse-houses" className="block pt-2">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 text-xs flex items-center justify-center gap-2">
                Browse Matching Homes <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
