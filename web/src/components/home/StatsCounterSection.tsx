"use client";

import React from "react";
import { CounterItem } from "./AnimatedCounters";

interface CounterData {
  value: number;
  label: string;
  icon: React.ComponentType<any>;
}

interface StatsCounterSectionProps {
  counters: CounterData[];
}

export default function StatsCounterSection({ counters }: StatsCounterSectionProps) {
  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 py-16 md:py-20 border-y border-emerald-800/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center justify-center divide-x-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {counters.map((item, idx) => (
            <div key={idx} className={idx > 0 ? "pt-6 md:pt-0" : ""}>
              <CounterItem
                value={item.value}
                label={item.label}
                icon={item.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
