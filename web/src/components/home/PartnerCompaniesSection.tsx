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
    <section className="py-16 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-900">Partner Companies</h2>
        <p className="text-slate-600 mt-2">Institutional partners supporting our ecosystem.</p>
      </div>

      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...partners, ...partners].map((partner, index) => (
            <div key={index} className="flex-shrink-0 w-40 h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
