"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, ShieldCheck, ArrowRight, Zap, FileText, Wallet } from "lucide-react";

interface PersonaFeature {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  linkText: string;
  linkHref: string;
}

const PERSONA_DATA: Record<"tenants" | "landlords", PersonaFeature[]> = {
  tenants: [
    {
      title: "Verified Property Listings",
      desc: "Every house is physically inspected and verified to prevent fake listings or duplicate broker scams.",
      icon: ShieldCheck,
      iconColor: "bg-emerald-50 text-emerald-600",
      linkText: "Explore Homes",
      linkHref: "/browse-houses",
    },
    {
      title: "Amharic & English Digital Leases",
      desc: "Sign legally binding rental contracts directly from your mobile device with clear deposit terms.",
      icon: FileText,
      iconColor: "bg-blue-50 text-blue-600",
      linkText: "Explore Homes",
      linkHref: "/browse-houses",
    },
    {
      title: "Chapa Rent & Escrow Payments",
      desc: "Pay monthly rent securely via Telebirr, CBE Birr, or cards with Chapa automatic payment receipts.",
      icon: Wallet,
      iconColor: "bg-indigo-50 text-indigo-600",
      linkText: "Explore Homes",
      linkHref: "/browse-houses",
    },
  ],
  landlords: [
    {
      title: "Automatic Chapa Rent Collection",
      desc: "Receive tenant monthly rent directly into your bank account with automatic monthly reminders.",
      icon: Wallet,
      iconColor: "bg-emerald-50 text-emerald-600",
      linkText: "List Your Property",
      linkHref: "/register?role=vendor",
    },
    {
      title: "Tenant Background Screening",
      desc: "Verify tenant national IDs, employment proof, and rental history before approving lease agreements.",
      icon: ShieldCheck,
      iconColor: "bg-blue-50 text-blue-600",
      linkText: "List Your Property",
      linkHref: "/register?role=vendor",
    },
    {
      title: "On-Demand Maintenance Dashboard",
      desc: "Manage maintenance requests, deep cleaning, and tenant onboarding with certified technicians.",
      icon: Zap,
      iconColor: "bg-purple-50 text-purple-600",
      linkText: "List Your Property",
      linkHref: "/register?role=vendor",
    },
  ],
};

export default function EcosystemPortalSection() {
  const [activePersona, setActivePersona] = useState<"tenants" | "landlords">("tenants");
  const currentFeatures = PERSONA_DATA[activePersona];

  return (
    <section className="bg-white py-24 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
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

        {/* Persona Switcher Buttons with Consistent Active Styling */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex gap-2 max-w-md w-full shadow-inner">
            <button
              type="button"
              onClick={() => setActivePersona("tenants")}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePersona === "tenants"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" /> For Tenants
            </button>
            <button
              type="button"
              onClick={() => setActivePersona("landlords")}
              className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePersona === "landlords"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-4 w-4" /> For Landlords & Agents
            </button>
          </div>
        </div>

        {/* Dynamic Display Area - Single Reusable Card Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePersona}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {currentFeatures.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.iconColor} flex items-center justify-center font-bold`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </div>
                <a
                  href={item.linkHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-2 w-fit transition-colors"
                >
                  {item.linkText} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
