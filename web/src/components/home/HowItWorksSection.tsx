"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Store, Wrench, CreditCard, Truck, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowItWorksConfig {
  badge?: string;
  title?: string;
  subtitle?: string;
  steps?: Array<{ step: string; title: string; description: string }>;
  ctaText?: string;
  ctaLink?: string;
}

interface HowItWorksSectionProps {
  config: HowItWorksConfig;
}

const DEFAULT_STEPS = [
  { step: "01", title: "Search & Filter Homes", description: "Filter apartments, villas, and townhouses by location, monthly budget, bedrooms, and amenities across Addis Ababa." },
  { step: "02", title: "Schedule Inspection & Tour", description: "Book in-person physical property walkthroughs or 360° virtual tours directly with verified property owners." },
  { step: "03", title: "Secure Lease & Chapa Pay", description: "Pay security deposit and first month's rent securely via Chapa with instant digital lease contract generation." },
  { step: "04", title: "Move In & Enjoy Services", description: "Schedule move-in deep cleaning, luggage transport, key collection, and access 24/7 tenant maintenance support." },
];

const STEP_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-purple-500 to-pink-500",
];

const STEP_ICONS = [Store, Wrench, CreditCard, Truck];

export default function HowItWorksSection({ config: howItWorks }: HowItWorksSectionProps) {
  return (
    <div className="my-16 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
      <section className="w-full bg-white py-16 md:py-24 relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-slate-100 shadow-sm">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-100 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] pointer-events-none" />

        <div className="px-6 sm:px-10 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-xs font-semibold text-blue-700 tracking-wide uppercase mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {howItWorks.badge || "Simple Rental Process"}
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {howItWorks.title || "How Delala Home Rentals Works"}
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            {howItWorks.subtitle || "From searching verified listings to signing your digital lease and moving in—renting a home in Ethiopia is fast and secure."}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 z-0" />

          {(howItWorks.steps || DEFAULT_STEPS).map((item: any, i: number) => {
            const gradient = STEP_GRADIENTS[i % 4];
            const StepIcon = STEP_ICONS[i % 4];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative z-10 group"
              >
                <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
                    Step {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">{item.description}</p>
                  <div className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${gradient} opacity-40 group-hover:opacity-100 group-hover:w-full transition-all duration-500`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link href={howItWorks.ctaLink || "/services"}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg hover:-translate-y-0.5 group">
              {howItWorks.ctaText || "Start Renting Today"}
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </div>
);
}
