"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ShieldCheck, Footprints, GraduationCap, Building2, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  tagline: string;
  avgRentEtb: number;
  safetyScore: number;
  walkScore: number;
  schoolsCount: number;
  description: string;
  image: string;
  keyHighlights: string[];
}

const neighborhoodsData: Neighborhood[] = [
  {
    id: "bole",
    name: "Bole Medhaniallem",
    city: "Addis Ababa",
    tagline: "Premier Commercial & Expatriate Hub",
    avgRentEtb: 55000,
    safetyScore: 98,
    walkScore: 94,
    schoolsCount: 12,
    description: "Heart of Addis Ababa's nightlife, high-end shopping malls, fine dining, and international corporate offices. Minutes from Bole International Airport.",
    image: "/images/residential_apartments.png",
    keyHighlights: ["Bole Airport Access", "International Restaurants", "24/7 Security Patrol", "Modern Shopping Malls"],
  },
  {
    id: "kazanchis",
    name: "Kazanchis Diplomatic Quarter",
    city: "Addis Ababa",
    tagline: "UNECA & Government Center",
    avgRentEtb: 42000,
    safetyScore: 96,
    walkScore: 91,
    schoolsCount: 8,
    description: "Ideal for diplomats, NGO leaders, and civil servants. Walking distance to UN Headquarters, Radisson Blu, and major government ministries.",
    image: "/images/penthouse_duplex.png",
    keyHighlights: ["UNECA Headquarters Walk", "5-Star Hotel District", "High-Speed Fiber Infrastructure", "Executive Apartments"],
  },
  {
    id: "old-airport",
    name: "Old Airport Embassy Enclave",
    city: "Addis Ababa",
    tagline: "Quiet Luxury Gated Villa Neighborhood",
    avgRentEtb: 75000,
    safetyScore: 99,
    walkScore: 86,
    schoolsCount: 14,
    description: "Prestigious leafy green district housing embassies, diplomatic compounds, and spacious private family villas with private gardens.",
    image: "/images/villas_family_homes.png",
    keyHighlights: ["ICS Embassy School Zone", "Gated Security Compounds", "Tree-Lined Streets", "Spacious Family Lawns"],
  },
  {
    id: "hawassa",
    name: "Lakefront Promenade",
    city: "Hawassa",
    tagline: "Serene Lakeview Resort Living",
    avgRentEtb: 35000,
    safetyScore: 95,
    walkScore: 89,
    schoolsCount: 7,
    description: "Resort-style living overlooking Lake Hawassa. Clean air, fresh seafood dining, and modern residential developments.",
    image: "/images/villas_family_homes.png",
    keyHighlights: ["Lake Hawassa Views", "Resort Climate", "Industrial Park Access", "Peaceful Atmosphere"],
  },
  {
    id: "adama",
    name: "Expressway Business Quarter",
    city: "Adama",
    tagline: "Warm Weather & Fast Commute",
    avgRentEtb: 28000,
    safetyScore: 94,
    walkScore: 85,
    schoolsCount: 9,
    description: "Dynamic business corridor right off the Addis-Adama Toll Expressway. Tropical warm climate with spacious multi-bedroom family compounds.",
    image: "/images/studio_flat.png",
    keyHighlights: ["Expressway Toll Gate", "Warm Climate", "Spacious Compounds", "Low Living Costs"],
  },
];

export default function NeighborhoodGuideSection() {
  const [activeId, setActiveId] = useState<string>("bole");

  const activeHood = neighborhoodsData.find(n => n.id === activeId) || neighborhoodsData[0];

  return (
    <section className="bg-white py-24 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-800 uppercase tracking-widest">
            <MapPin className="h-4 w-4 text-emerald-600" /> City Living Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Explore Premier Ethiopian <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Residential Neighborhoods
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Compare average ETB monthly rent, neighborhood security ratings, and amenities across Ethiopia's top residential hubs.
          </p>
        </div>

        {/* Neighborhood Selector Tabs */}
        <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-10">
          {neighborhoodsData.map(hood => (
            <button
              key={hood.id}
              onClick={() => setActiveId(hood.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeId === hood.id
                  ? "bg-slate-900 text-white shadow-xl scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {hood.name}
            </button>
          ))}
        </div>

        {/* Selected Neighborhood Card Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg"
          >
            {/* Image Showcase (6 columns) */}
            <div className="lg:col-span-6 relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl">
              <img src={activeHood.image} alt={activeHood.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{activeHood.city}</span>
                <h3 className="text-2xl sm:text-3xl font-black">{activeHood.name}</h3>
                <p className="text-xs text-slate-300 mt-1">{activeHood.tagline}</p>
              </div>
            </div>

            {/* Neighborhood Stats & Breakdown (6 columns) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h4 className="text-xl font-bold text-slate-900">Neighborhood Overview</h4>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  {activeHood.description}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Monthly Rent</span>
                  <span className="text-base font-black text-emerald-600 mt-1 block">{formatCurrency(activeHood.avgRentEtb)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Safety Rating</span>
                  <span className="text-base font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> {activeHood.safetyScore}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Walkability Index</span>
                  <span className="text-base font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                    <Footprints className="h-4 w-4 text-blue-600" /> {activeHood.walkScore}/100
                  </span>
                </div>
              </div>

              {/* Key Highlights */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Neighborhood Amenities</h5>
                <div className="grid grid-cols-2 gap-2">
                  {activeHood.keyHighlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a href={`/browse-houses?q=${encodeURIComponent(activeHood.name)}`}>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-md">
                    Explore Homes in {activeHood.name} <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
