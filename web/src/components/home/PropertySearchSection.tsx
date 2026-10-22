"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertySearchSectionProps {
  heroLocation: string;
  setHeroLocation: (val: string) => void;
  heroPrice: string;
  setHeroPrice: (val: string) => void;
  heroRooms: string;
  setHeroRooms: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export default function PropertySearchSection({
  heroLocation,
  setHeroLocation,
  heroPrice,
  setHeroPrice,
  heroRooms,
  setHeroRooms,
  onSearch,
}: PropertySearchSectionProps) {
  return (
    <section className="relative z-10 bg-slate-950 border-y border-slate-800 py-16 overflow-hidden">
      {/* Ambient Glow & Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Fast Rental Lookup
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Where Would You Like to Live Next?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Search verified apartments, villas, and studio flats across Addis Ababa, Hawassa, Adama & Bahir Dar
          </p>
        </div>

        {/* SLEEK GLASS SEARCH WIDGET BAR */}
        <form
          onSubmit={onSearch}
          className="max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-slate-950 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
            {/* Location Input */}
            <div className="relative flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="text-lg mr-3 select-none">📍</span>
              <input
                type="text"
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
                placeholder="Where do you want to live?"
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
              />
            </div>

            {/* Price Filter Select */}
            <div className="relative flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="text-lg mr-3 select-none">💰</span>
              <select
                value={heroPrice}
                onChange={(e) => setHeroPrice(e.target.value)}
                className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="">Any Price</option>
                <option value="25000">Under 25,000 ETB</option>
                <option value="50000">25,000 - 50,000 ETB</option>
                <option value="100000">50,000+ ETB</option>
              </select>
            </div>

            {/* Rooms Select */}
            <div className="relative flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
              <span className="text-lg mr-3 select-none">🛏️</span>
              <select
                value={heroRooms}
                onChange={(e) => setHeroRooms(e.target.value)}
                className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="">Rooms</option>
                <option value="1">1 Bed / Studio</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            {/* Search Action Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
