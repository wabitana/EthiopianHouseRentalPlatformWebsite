"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, ShieldCheck, CheckCircle2, ArrowRight, Zap, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EcosystemPortalSection() {
  const [activePersona, setActivePersona] = useState<"tenants" | "landlords">("tenants");

  return (
    <section className="bg-white py-24 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-800 uppercase tracking-widest">
            <Building2 className="h-4 w-4 text-blue-600" /> Complete Rental Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Tailored Experiences for <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Tenants, Landlords & Agents
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Switch between tenant search mode and landlord management mode to see how Delala unifies Ethiopian real estate.
          </p>
        </div>

        {/* Persona Switcher Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex gap-2 max-w-md w-full shadow-inner">
            <button
              onClick={() => setActivePersona("tenants")}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePersona === "tenants"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" /> For Tenants
            </button>
            <button
              onClick={() => setActivePersona("landlords")}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePersona === "landlords"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" /> For Landlords & Agents
            </button>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <AnimatePresence mode="wait">
          {activePersona === "tenants" ? (
            <motion.div
              key="tenants"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  title: "Verified Property Listings",
                  desc: "Every house is physically inspected and verified to prevent fake listings or duplicate broker scams.",
                  icon: ShieldCheck,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  title: "Amharic & English Digital Leases",
                  desc: "Sign legally binding rental contracts directly from your mobile device with clear deposit terms.",
                  icon: FileText,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Chapa Rent & Escrow Payments",
                  desc: "Pay monthly rent securely via Telebirr, CBE Birr, or cards with Chapa automatic payment receipts.",
                  icon: Wallet,
                  color: "bg-indigo-50 text-indigo-600",
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 hover:shadow-xl transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center font-bold`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  <a href="/browse-houses" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:underline pt-2">
                    Explore Homes <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="landlords"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  title: "Automatic Chapa Rent Collection",
                  desc: "Receive tenant monthly rent directly into your bank account with automatic monthly reminders.",
                  icon: Wallet,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  title: "Tenant Background Screening",
                  desc: "Verify tenant national IDs, employment proof, and rental history before approving lease agreements.",
                  icon: ShieldCheck,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "On-Demand Maintenance Dashboard",
                  desc: "Manage maintenance requests, deep cleaning, and tenant onboarding with certified technicians.",
                  icon: Zap,
                  color: "bg-purple-50 text-purple-600",
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 hover:shadow-2xl transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center font-bold`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  <a href="/register?role=vendor" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline pt-2">
                    List Your Property <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
