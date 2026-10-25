"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaConfig {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface CtaBannerSectionProps {
  config: CtaConfig;
}

export default function CtaBannerSection({ config: cta }: CtaBannerSectionProps) {
  return (
    <section className="py-12 sm:py-16 bg-white relative z-20">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-emerald-950/50 to-slate-950 border border-emerald-500/20 p-8 md:p-14 text-center shadow-2xl backdrop-blur-sm">
          <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex h-1 w-16 bg-emerald-400/50 rounded-full mb-8 mx-auto" />

            <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {cta.title || "Ready to Find Your Ideal Ethiopian Home?"}
            </h3>

            <p className="mt-4 text-emerald-100/80 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              {cta.subtitle || "Join thousands of tenants, landlords, and property managers operating on Ethiopia's unified rental ecosystem."}
            </p>

            <div className="mt-8 flex justify-center">
              <Link href={cta.buttonLink || "/register"}>
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-6 rounded-2xl text-base shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group border-0"
                >
                  {cta.buttonText || "Browse All Home Rentals"}
                  <ArrowRight className="h-5 w-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
