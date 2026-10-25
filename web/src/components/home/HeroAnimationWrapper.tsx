"use client";

import React, { useEffect, useState, Component, ErrorInfo } from "react";
import dynamic from "next/dynamic";

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
    // Suppress WebGL context creation error from crashing the UI
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
        canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const HeroAnimation = dynamic(() => import("./HeroAnimation"), {
  ssr: false,
});

export default function HeroAnimationWrapper() {
  const [mounted, setMounted] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebGLAvailable(isWebGLSupported());
  }, []);

  const fallback = (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl animate-pulse" />
    </div>
  );

  if (!mounted || !webGLAvailable) {
    return fallback;
  }

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <HeroAnimation />
    </WebGLErrorBoundary>
  );
}