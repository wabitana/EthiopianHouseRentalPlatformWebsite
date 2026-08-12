"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Wallet,
  FileText,
  Users,
  Sparkles,
  Lock,
  Plus,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandlordSellerCtaSection() {
  return (
    <section className="bg-white text-slate-900 py-20 border-y border-slate-200 relative overflow-hidden">
      {/* Background Subtle Mesh Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT CONTENT (6 Columns) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800 uppercase tracking-widest">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> For Landlords & Property Owners
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
              List Your Ethiopian Property & <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Rent Out 3x Faster
              </span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Connect directly with verified tenants in Addis Ababa, Hawassa, Adama & Bahir Dar. Receive guaranteed monthly ETB rent via Chapa and safeguard your property with digital lease contracts.
            </p>

            {/* Checklist Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: "100% Free Property Listing", desc: "No upfront fees or hidden broker cuts" },
                { title: "Automated Chapa Rent Payouts", desc: "Direct deposits to your bank account" },
                { title: "Tenant Screening & National ID", desc: "Verified background & employment history" },
                { title: "Amharic/English Digital Leases", desc: "Legal protection under Ethiopian civil law" },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href="/register?role=vendor">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-4 w-4 text-emerald-400" /> List Your Property for Free <ArrowRight className="h-4 w-4" />
                </Button>
              </a>

              <a href="/browse-houses">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm">
                  View Market Rates
                </Button>
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: FEMALE SELLER PORTRAIT ON PURE WHITE BACKGROUND (6 Columns) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md sm:max-w-lg">
              {/* Pure White Background Frame */}
              <div className="relative h-[440px] sm:h-[480px] rounded-3xl overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/images/ethiopian_woman_seller_white_bg.png"
                  alt="Ethiopian Property Owner & Landlord"
                  className="w-full h-full object-contain"
                />

                {/* Subtle Bottom Partner Badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-1.5 rounded-full shadow-md text-center shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified Property Owner Partner
                  </span>
                </div>
              </div>

              {/* Floating Badge Graphic 1 (Top Right) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-2 sm:-right-4 z-20 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex items-center gap-3 text-slate-900"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black">Chapa Protected</h5>
                  <p className="text-[10px] text-slate-500 font-semibold">100% Escrow Guarantee</p>
                </div>
              </motion.div>

              {/* Floating Badge Graphic 2 (Bottom Left) */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: [0, 10, 0], opacity: 1 }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-2 sm:-left-4 z-20 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex items-center gap-3 text-slate-900"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black">+145,000 ETB / mo</h5>
                  <p className="text-[10px] text-slate-500 font-semibold">Direct Bank Payouts</p>
                </div>
              </motion.div>

              {/* Floating Badge Graphic 3 (Middle Right Rating) */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-4 sm:-right-6 z-20 bg-slate-900 text-white rounded-2xl p-3 shadow-xl flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black">4.9/5 Rating</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
