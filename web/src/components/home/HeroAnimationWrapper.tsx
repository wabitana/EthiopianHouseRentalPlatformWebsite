"use client";

import dynamic from "next/dynamic";

// Uses a relative folder path to import the local file safely
const HeroAnimation = dynamic(() => import("./HeroAnimation"), {
  ssr: false,
});

export default function HeroAnimationWrapper() {
  return <HeroAnimation />;
}