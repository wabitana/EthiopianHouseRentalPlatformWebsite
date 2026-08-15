"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileText, Key, CheckCircle2, Award, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityGuaranteeSection() {
  return (
    <section className="bg-slate-950 text-white py-24 relative overflow-hidden border-t border-slate-800">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Award className="h-4 w-4" /> 100% Verified Tenant Security
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            The Delala Rental Security & <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Escrow Guarantee
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Renting in Ethiopia without stress. Our platform provides complete financial escrow, legally verified contracts, and pre-move inspections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Lock,
              title: "Chapa Escrow Deposit Protection",
              desc: "Security deposits are safely held in escrow and released only upon successful key handover & physical walkthrough.",
              badge: "Escrow Protected",
            },
            {
              icon: FileText,
              title: "Legal Digital Rental Lease",
              desc: "Standardized bilingual Amharic & English lease contracts compliant with Ethiopian civil law.",
              badge: "Gov Compliant",
            },
            {
              icon: ShieldCheck,
              title: "Pre-Move Inventory Verification",
              desc: "High-resolution photo inventory report before you move in to protect your security deposit refund.",
              badge: "Verified Inspection",
            },
            {
              icon: Key,
              title: "24-Hour Key Handover Guarantee",
              desc: "If the property condition does not match the online listing upon key handover, receive a 100% full refund.",
              badge: "Full Money-Back",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{card.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{card.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Guarantee Included
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
