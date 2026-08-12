"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  ArrowRight,
  ArrowDown,
  ArrowLeftRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface FeaturedHouse {
  id: string;
  title: string;
  category: string;
  city: string;
  neighborhood: string;
  pricePerMonth: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  image: string;
  description: string;
  badge: string;
}

const scrollHouses: FeaturedHouse[] = [
  {
    id: "h1",
    title: "Bole Medhaniallem Penthouse Duplex",
    category: "Penthouse",
    city: "Addis Ababa",
    neighborhood: "Bole Medhaniallem",
    pricePerMonth: 65000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 260,
    image: "/images/penthouse_duplex.png",
    description: "Floor-to-ceiling glass windows with Bole skyline views, private elevator, 24/7 backup generator & double parking.",
    badge: "360° Virtual Tour",
  },
  {
    id: "h2",
    title: "Old Airport Gated Family Villa",
    category: "Gated Villa",
    city: "Addis Ababa",
    neighborhood: "Old Airport",
    pricePerMonth: 85000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 380,
    image: "/images/villas_family_homes.png",
    description: "Spacious multi-story diplomatic villa featuring private garden, guardhouse, servant quarters & garage.",
    badge: "Diplomatic Zone",
  },
  {
    id: "h3",
    title: "Kazanchis UNECA Modern Apartment",
    category: "Luxury Apartment",
    city: "Addis Ababa",
    neighborhood: "Kazanchis",
    pricePerMonth: 38000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 130,
    image: "/images/residential_apartments.png",
    description: "Walking distance to UN Headquarters. Fully furnished European kitchen, intercom security & power backup.",
    badge: "Verified Landlord",
  },
  {
    id: "h4",
    title: "Bole Atlas Cozy Studio Flat",
    category: "Studio Flat",
    city: "Addis Ababa",
    neighborhood: "Bole Atlas",
    pricePerMonth: 22000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 65,
    image: "/images/studio_flat.png",
    description: "Sleek compact studio flat near business hubs & cafes. Fiber Wi-Fi included, smart TV & custom kitchenette.",
    badge: "Popular Studio",
  },
  {
    id: "h5",
    title: "Hawassa Lakeview Horizon Residence",
    category: "Family House",
    city: "Hawassa",
    neighborhood: "Lakefront District",
    pricePerMonth: 42000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 210,
    image: "/images/villas_family_homes.png",
    description: "Scenic family residence overlooking Lake Hawassa with private terrace, solar water heater & green lawn.",
    badge: "Lakefront View",
  },
  {
    id: "h6",
    title: "Bahir Dar Blue Nile Promenade Flat",
    category: "Luxury Apartment",
    city: "Bahir Dar",
    neighborhood: "Riverfront",
    pricePerMonth: 27000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 120,
    image: "/images/residential_apartments.png",
    description: "Serene riverfront views in Bahir Dar with tile finishings, solar backup, and 24/7 security guard.",
    badge: "Riverfront View",
  },
];

export default function ScrollHorizontalSection() {
  const targetRef = useRef<HTMLDivElement>(null);

  // Hook into page vertical scroll progress
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Transform vertical scroll [0, 1] into horizontal translation [0%, -78%]
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-78%"]);

  return (
    <div ref={targetRef} className="relative h-[300vh] bg-white border-t border-slate-200">
      {/* STICKY WINDOW CONTAINER (Pins to screen during vertical scroll) */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-white">
        {/* Soft Ambient Background Highlights */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Section Overlay Header */}
        <div className="absolute top-8 left-6 sm:left-12 z-30 flex items-center justify-between right-6 sm:right-12 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-md px-4 py-2 rounded-2xl flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Interactive Horizontal Motion
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-md px-4 py-2 rounded-2xl text-xs font-bold text-slate-700">
            <ArrowDown className="h-4 w-4 text-emerald-600 animate-bounce" />
            <span>Scroll vertical page ➔ Cards slide horizontally</span>
          </div>
        </div>

        {/* HORIZONTAL CARDS TRACK (Translates horizontally on vertical scroll) */}
        <motion.div style={{ x }} className="flex gap-8 px-6 sm:px-12 items-center">
          {/* Intro Showcase Card */}
          <div className="w-[320px] sm:w-[400px] shrink-0 bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-2xl flex flex-col justify-between h-[480px]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300 uppercase tracking-widest">
                <ArrowLeftRight className="h-4 w-4" /> Scroll Interactive
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Featured Ethiopian <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Home Rentals
                </span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                As you scroll down the page, this section moves left to present curated residential properties. Scroll up to reverse.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Verified Listings</span>
                <span className="text-emerald-400 font-mono">100% Legal ETB</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Property Cards Track (Clean White Aesthetic) */}
          {scrollHouses.map(house => (
            <div
              key={house.id}
              className="w-[340px] sm:w-[420px] shrink-0 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-[480px] flex flex-col justify-between group"
            >
              {/* Card Image */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                <img
                  src={house.image}
                  alt={house.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {house.badge}
                </div>
                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 font-semibold shadow-md">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" /> {house.neighborhood}, {house.city}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{house.category}</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">{formatCurrency(house.pricePerMonth)} <span className="text-[10px] font-normal text-slate-500">/mo</span></span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {house.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {house.description}
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-b border-slate-200 text-xs text-slate-700 font-medium">
                  <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-emerald-600" /> {house.bedrooms} Beds</span>
                  <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-emerald-600" /> {house.bathrooms} Baths</span>
                  <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4 text-emerald-600" /> {house.areaSqm} m²</span>
                </div>

                <a href="/browse-houses" className="block pt-1">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs flex items-center justify-center gap-2 shadow-md">
                    View Details & Schedule Tour <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
