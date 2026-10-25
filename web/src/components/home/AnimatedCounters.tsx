"use client";

import React, { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface CounterItemProps {
  value: number;
  label: string;
  icon: React.ComponentType<any>;
}

const CounterNumber = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView || value === undefined || value === null) return;

    let startTimestamp: number | null = null;
    const duration = 1600; // 1.6s smooth easing
    const startValue = 0;
    const endValue = Math.max(0, Number(value) || 0);

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutExpo curve: starts energetic and settles cleanly
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startValue + (endValue - startValue) * easeOut);

      if (ref.current) {
        ref.current.textContent = current.toLocaleString();
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else if (ref.current) {
        ref.current.textContent = endValue.toLocaleString();
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
      0
    </span>
  );
};

export const CounterItem = ({ value, label, icon: Icon }: CounterItemProps) => {
  return (
    <div className="flex flex-col items-center text-center p-4 relative group">
      <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-7 w-7 stroke-[2]" />
      </div>
      <CounterNumber value={value} />
      <p className="mt-3 text-xs sm:text-sm font-medium tracking-wide text-emerald-100/70 max-w-[180px]">
        {label}
      </p>
    </div>
  );
};

export default CounterItem;
