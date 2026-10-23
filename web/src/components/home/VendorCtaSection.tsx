"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendorCtaConfig {
  badge?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface VendorCtaSectionProps {
  config: VendorCtaConfig;
}

export default function VendorCtaSection({ config: vendorCta }: VendorCtaSectionProps) {
  return (
    <div className="my-16 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 py-12 md:py-16 rounded-[24px] md:rounded-[40px] border border-slate-800 shadow-xl">
        {/* Professional subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-5 pointer-events-none" />

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 sm:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">

            {/* Left: Text Content */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {vendorCta.badge || "B2B Portal"}
              </div>

              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {vendorCta.title || "Are you a vendor or service provider?"}
              </h3>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {vendorCta.subtitle || "Join the Delala Home Rentals ecosystem. Accelerate your listing growth, manage units seamlessly, track real-time analytics, and streamline your tenant contracts all from one unified landlord dashboard."}
              </p>
            </div>

            {/* Right: Action Button */}
            <div className="shrink-0">
              <Link href={vendorCta.buttonLink || "/register?role=vendor"}>
                <Button
                  className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {vendorCta.buttonText || "Become a Vendor"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
