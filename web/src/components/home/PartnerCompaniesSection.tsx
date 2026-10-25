"use client";

import React from "react";
import { motion } from "framer-motion";

interface Partner {
  name: string;
  logo: string;
}

interface PartnerCompaniesSectionProps {
  partners: Partner[];
}

export default function PartnerCompaniesSection({ partners }: PartnerCompaniesSectionProps) {
  return (
    <section className="py-20 sm:py-24 bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        {/* Enclosing card with matching margins, padding, and subtle backdrop */}
        <div className="w-full px-6 sm:px-10 py-12 sm:py-16 border border-slate-200/80 rounded-[2.5rem] bg-slate-50/60 shadow-sm relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Partner Companies
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              Institutional partners and enterprise organizations supporting our platform ecosystem.
            </p>
          </div>

          {/* Animated Marquee with Smooth Edge Fading */}
          <div className="relative overflow-hidden w-full">
            {/* Fade Gradients at the Edges */}
            <div className="absolute top-0 left-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <motion.div
              className="flex gap-6 sm:gap-8 items-center w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 22,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-44 sm:w-48 h-24 bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-center shadow-sm hover:shadow-md hover:border-emerald-500/50 hover:scale-[1.02] transition-all group"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-12 max-w-[130px] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
