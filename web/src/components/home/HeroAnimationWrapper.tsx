"use client";

import React, { useEffect, useState, Component, ErrorInfo } from "react";
import dynamic from "next/dynamic";

// Organic Morphing Sphere & Specular Light Reflection
// Matches the Three.js MorphingMesh visual look perfectly with smooth GPU animation
export function MorphingFallback() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden select-none">
      {/* Animated Organic Morphing Sphere */}
      <div
        className="absolute -right-20 -top-12 w-[650px] h-[650px] sm:w-[800px] sm:h-[800px] lg:w-[950px] lg:h-[950px] opacity-95 animate-hero-morph"
        style={{
          background:
            "radial-gradient(circle at 65% 28%, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.9) 40%, rgba(6, 78, 59, 0.8) 75%)",
          boxShadow: "inset -25px -25px 65px rgba(6, 78, 59, 0.85)",
        }}
      >
        {/* Secondary soft undulating surface ripple */}
        <div
          className="absolute inset-0 rounded-full animate-hero-ripple pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 30%, rgba(52, 211, 153, 0.4) 0%, transparent 60%)",
          }}
        />

        {/* Specular White Light Highlight (Directional Light Glare from Image 2) */}
        <div
          className="absolute top-[26%] left-[64%] w-32 h-32 sm:w-40 sm:h-40 rounded-full pointer-events-none animate-hero-specular"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.3) 55%, transparent 75%)",
            filter: "blur(5px)",
          }}
        />

        {/* Secondary soft light bloom */}
        <div
          className="absolute top-[28%] left-[63%] w-52 h-52 sm:w-64 sm:h-64 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-45"
          style={{
            background:
              "radial-gradient(circle, rgba(167, 243, 208, 0.85) 0%, rgba(52, 211, 153, 0.35) 45%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </div>
    </div>
  );
}

class WebGLErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress console crash on WebGL failure
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Safely test WebGL without emitting unhandled console errors in Next.js
export function isWebGLAvailableSafely(): boolean {
  if (typeof window === "undefined") return false;
  const originalError = console.error;
  const originalWarn = console.warn;
  try {
    console.error = () => {};
    console.warn = () => {};
    const canvas = document.createElement("canvas");
    let failed = false;
    canvas.addEventListener("webglcontextcreationerror", (e) => {
      failed = true;
      e.preventDefault();
      e.stopPropagation();
    });
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    console.error = originalError;
    console.warn = originalWarn;
    if (!gl || failed) return false;
    const ext = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
    return true;
  } catch {
    console.error = originalError;
    console.warn = originalWarn;
    return false;
  }
}

const HeroAnimation = dynamic(() => import("./HeroAnimation"), {
  ssr: false,
});

export default function HeroAnimationWrapper() {
  const [mounted, setMounted] = useState(false);
  const [webGLWorking, setWebGLWorking] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebGLWorking(isWebGLAvailableSafely());
  }, []);

  if (!mounted) {
    return <MorphingFallback />;
  }

  if (!webGLWorking) {
    return <MorphingFallback />;
  }

  return (
    <WebGLErrorBoundary fallback={<MorphingFallback />}>
      <HeroAnimation />
    </WebGLErrorBoundary>
  );
}