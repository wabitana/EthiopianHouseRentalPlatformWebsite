"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Store,
  Wrench,
  BarChart3,
  Shield,
  Check,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  icon: any;
  gradientClass: string;
  cardBg: string;
  borderClass: string;
  accentColor: string;
  index: number;
  children: React.ReactNode;
}

const FeatureCard = ({
  title,
  description,
  features,
  icon: Icon,
  gradientClass,
  cardBg,
  borderClass,
  accentColor,
  index,
  children,
}: FeatureCardProps) => {
  return (
    <motion.div
      className={`sticky w-full ${cardBg} ${borderClass} border-t border-l border-r shadow-2xl rounded-t-[48px] md:rounded-t-[64px] rounded-b-none overflow-hidden`}
      style={{
        // STACKING LOGIC: Sticks below navbar (64px) + stacks progressively 24px lower per card
        top: `${64 + index * 24}px`, 
        zIndex: 10 + index * 10,
        minHeight: "calc(100vh - 64px)",
      }}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    >
      {/* Visual background ambient glow */}
      <div className={`absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br ${gradientClass} opacity-15 blur-3xl pointer-events-none`} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 w-full min-h-[calc(100vh-64px)] py-12 md:py-20 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between relative z-10">
        {/* Left Column: Text & Features */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between h-full space-y-6 text-left">
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-slate-900/5 ${accentColor} border border-current/10 mb-4`}>
              <Icon className="h-4 w-4" />
              Ecosystem 0{index + 1}
            </div>

            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-inherit">
              {title}
            </h3>

            <p className="text-base md:text-lg opacity-85 leading-relaxed mb-6">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 group/item transition-transform duration-200 hover:translate-x-1"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold opacity-90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High-Fidelity UI Widget Preview */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-500/10 bg-slate-955/20 backdrop-blur-md p-4 flex items-center justify-center hover:scale-[1.02] transition-transform duration-300">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function EcosystemsStack() {
  return (
    <section className="relative w-full pt-24 pb-32 bg-slate-950 overflow-visible">
      {/* Sticky Header Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-16 md:mb-24">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Connected Digital Infrastructure
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            One Platform. <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-400">Four Connected Ecosystems</span>
          </h2>
          
          <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Delala Home Rentals unifies home rentals, tenant services, landlord management, and Chapa rental contracts into a single intelligent digital infrastructure.
          </p>
        </motion.div>
      </div>

      {/* Stacked Cards Area (Full width container with elements as direct children for native sticky boundary execution) */}
      <div className="relative flex flex-col overflow-visible w-full">
        
        {/* Section 1: Home Rental Marketplace */}
        <FeatureCard
          title="Home Rental Marketplace"
          description="Browse verified apartments, luxury villas, studio flats, townhouses, and commercial rentals across Addis Ababa with direct landlord inquiries."
          features={[
            "Verified Listings",
            "Smart Search & Filters",
            "Virtual & In-Person Tours",
            "Direct Landlord Chat",
          ]}
          icon={Store}
          gradientClass="from-emerald-500 to-teal-500"
          cardBg="bg-gradient-to-br from-emerald-50/95 via-white to-emerald-50/90 text-slate-900"
          borderClass="border-emerald-200/60"
          accentColor="text-emerald-700 bg-emerald-50"
          index={0}
        >
          {/* Rental Marketplace Visual Mockup Widget */}
          <div className="w-full h-full bg-slate-950 text-white p-5 rounded-2xl flex flex-col justify-between shadow-inner border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wide text-slate-300">DELALA RENTALS</span>
              </div>
              <div className="relative">
                <ShoppingCart className="h-4 w-4 text-slate-400" />
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-emerald-500 text-[9px] font-bold flex items-center justify-center text-white">
                  1
                </span>
              </div>
            </div>

            <div className="my-auto py-2">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  APT
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">Modern 2-BDR Apartment</p>
                  <p className="text-[10px] text-slate-400">Bole Medhaniallem • Verified Landlord</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-emerald-400">25,000 ETB</p>
                  <p className="text-[9px] text-slate-500">per month</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 px-3 py-2 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-bold text-emerald-400">Chapa Deposit Ready</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Verified Contract ✓</span>
              </div>
            </div>

            <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-md active:scale-95">
              Book Property Tour
            </button>
          </div>
        </FeatureCard>

        {/* Section 2: Tenant & Move-In Services */}
        <FeatureCard
          title="Tenant & Move-In Services"
          description="On-demand property inspection, move-in deep cleaning, tenant relocation logistics, locksmith, and home repair services."
          features={[
            "Property Inspection",
            "Move-In Deep Cleaning",
            "Tenant Relocation",
            "Verified Handymen",
          ]}
          icon={Wrench}
          gradientClass="from-indigo-500 to-violet-500"
          cardBg="bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-950 text-white"
          borderClass="border-indigo-900/40"
          accentColor="text-indigo-400 bg-indigo-950/50"
          index={1}
        >
          {/* Smart Services Visual Mockup Widget */}
          <div className="w-full h-full bg-white text-slate-900 p-5 rounded-2xl flex flex-col justify-between shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-extrabold tracking-wide text-slate-800">SERVICE SCHEDULER</span>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                On-Demand
              </div>
            </div>

            <div className="my-auto py-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Move-In Cleaning & Inspection</h4>
                  <p className="text-[9px] text-slate-500">Scheduled: Monday, Oct 12 at 10:00 AM</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  4.9
                </div>
              </div>

              {/* Provider assigned mockup */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                  KT
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">Kedir Tadesse</p>
                  <p className="text-[9px] text-indigo-600 font-semibold">Property Specialist • Assigned</p>
                </div>
              </div>

              {/* Booking tracker */}
              <div className="space-y-1.5 pl-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Inspection Scheduled & Verified
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  Inspector En Route
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all">
                Reschedule
              </button>
              <button className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all">
                Track Live
              </button>
            </div>
          </div>
        </FeatureCard>

        {/* Section 3: Landlord & Agent Portal */}
        <FeatureCard
          title="Landlord & Agent Portal"
          description="Comprehensive management dashboard for homeowners, landlords, and real estate agents to list units, vet tenants, collect rent, and manage leases."
          features={[
            "Property Listing Hub",
            "Rental Yield Analytics",
            "Automated Rent Collection",
            "Digital Lease Contracts",
          ]}
          icon={BarChart3}
          gradientClass="from-amber-500 to-orange-500"
          cardBg="bg-gradient-to-br from-amber-50/95 via-white to-amber-50/90 text-slate-900"
          borderClass="border-amber-200/60"
          accentColor="text-amber-700 bg-amber-50"
          index={2}
        >
          {/* Landlord Portal Visual Mockup Widget */}
          <div className="w-full h-full bg-slate-950 text-white p-5 rounded-2xl flex flex-col justify-between shadow-inner border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold tracking-wide text-slate-300">LANDLORD INSIGHTS</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded">
                Verified Owner
              </span>
            </div>

            <div className="my-auto py-2">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 block font-medium">Monthly Rent Revenue</span>
                  <span className="text-sm font-extrabold text-white block mt-0.5">125,000 ETB</span>
                  <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="h-2 w-2" /> +18.2%
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 block font-medium">Occupied Units</span>
                  <span className="text-sm font-extrabold text-white block mt-0.5">14 / 15</span>
                  <span className="text-[9px] font-bold text-amber-400 block mt-0.5">93% Occupancy</span>
                </div>
              </div>

              {/* Mini custom CSS bar chart */}
              <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
                <div className="flex justify-between items-end h-16 px-1">
                  <div className="w-5 bg-amber-500/20 hover:bg-amber-500/40 rounded-t h-[40%] transition-all duration-300 relative group/bar">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white rounded px-1 hidden group-hover/bar:block">M</span>
                  </div>
                  <div className="w-5 bg-amber-500/40 hover:bg-amber-500/60 rounded-t h-[65%] transition-all duration-300 relative group/bar">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white rounded px-1 hidden group-hover/bar:block">T</span>
                  </div>
                  <div className="w-5 bg-amber-500/30 hover:bg-amber-500/50 rounded-t h-[50%] transition-all duration-300 relative group/bar">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white rounded px-1 hidden group-hover/bar:block">W</span>
                  </div>
                  <div className="w-5 bg-amber-500 hover:bg-amber-400 rounded-t h-[90%] transition-all duration-300 relative group/bar">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white rounded px-1 hidden group-hover/bar:block">T</span>
                  </div>
                  <div className="w-5 bg-amber-500/70 hover:bg-amber-500/90 rounded-t h-[75%] transition-all duration-300 relative group/bar">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white rounded px-1 hidden group-hover/bar:block">F</span>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-500 mt-2 px-1">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>Last Sync: Just now</span>
            </div>
          </div>
        </FeatureCard>

        {/* Section 4: Chapa Payment & Lease Hub */}
        <FeatureCard
          title="Chapa Payment & Lease Hub"
          description="Centralized lease contract & payment engine powered by Chapa for instant rent transfers, security deposit escrow, digital receipts, and audit logs."
          features={[
            "Tenant Background Check",
            "Digital Lease Generator",
            "Chapa Rent Gateway",
            "Escrow & Security Deposit",
          ]}
          icon={Shield}
          gradientClass="from-slate-600 to-zinc-800"
          cardBg="bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-950 text-white"
          borderClass="border-slate-800"
          accentColor="text-slate-300 bg-slate-800/80"
          index={3}
        >
          {/* Rental Lease Hub Visual Mockup Widget */}
          <div className="w-full h-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wide text-slate-300">RENTAL LEASE HUB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400">SYS_OK</span>
              </div>
            </div>

            <div className="my-auto py-2 space-y-2.5">
              {/* System details */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-850">
                  <span className="text-[8px] text-slate-500 block">System Load</span>
                  <span className="text-xs font-extrabold text-emerald-400 mt-0.5">34%</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-850">
                  <span className="text-[8px] text-slate-500 block">Active Leases</span>
                  <span className="text-xs font-extrabold text-indigo-400 mt-0.5">3,412</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-850">
                  <span className="text-[8px] text-slate-500 block">Pending</span>
                  <span className="text-xs font-extrabold text-amber-400 mt-0.5">5 Leases</span>
                </div>
              </div>

              {/* Config settings mockup */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Tenant Verification</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Rent Payment Gateway</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-bold">ONLINE (CHAPA)</span>
                </div>
              </div>
            </div>

            {/* Audit trail preview */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 font-mono text-[8px] text-slate-500 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">[07:22:15] LANDLORD @owner_bole registered</span>
                <span className="text-emerald-500">OK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">[07:22:31] CHAPA_RENT_PAYMENT success #881</span>
                <span className="text-emerald-500">OK</span>
              </div>
            </div>
          </div>
        </FeatureCard>

      </div>



    </section>

    
  );
}