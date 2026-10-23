"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
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

const mapBackendToFeaturedHouse = (p: any): FeaturedHouse => {
  let imagesArr: string[] = [];
  try {
    imagesArr = typeof p.images === "string" ? JSON.parse(p.images) : p.images || [];
  } catch {
    imagesArr = [];
  }

  let badge = "Verified Listing";
  if (p.propertyType === "Villa") badge = "Luxury Villa";
  else if (p.propertyType === "Apartment") badge = "Modern Apartment";
  else if (p.propertyType === "Studio") badge = "Popular Studio";
  else if (p.isVerified) badge = "360° Virtual Tour";

  const mainImage =
    imagesArr.length > 0
      ? imagesArr[0].startsWith("http") || imagesArr[0].startsWith("/")
        ? imagesArr[0]
        : `/${imagesArr[0]}`
      : "/images/villas_family_homes.png";

  return {
    id: p.id,
    title: p.title,
    category: p.propertyType || "Luxury Property",
    city: p.city || "Addis Ababa",
    neighborhood: p.area || p.neighborhood || "Bole",
    pricePerMonth: p.price || p.rentPrice || 0,
    bedrooms: p.rooms || 2,
    bathrooms: p.bathrooms || 1,
    areaSqm: p.areaSqm || 150,
    image: mainImage,
    description:
      p.description || "Verified residential house rental in prime Ethiopian neighborhood with modern amenities.",
    badge,
  };
};

export default function ScrollHorizontalSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [houses, setHouses] = useState<FeaturedHouse[]>(scrollHouses);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    async function loadDbProperties() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
        const res = await fetch(`${backendUrl}/properties`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHouses(data.map(mapBackendToFeaturedHouse));
          }
        }
      } catch (err) {
        console.warn("Could not fetch DB properties for home horizontal scroll, falling back to defaults:", err);
      }
    }
    loadDbProperties();
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [houses]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 420;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-14 sm:py-18 bg-white border-t border-slate-200 overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Featured Property Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Curated Ethiopian{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Home Rentals
              </span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Explore verified furnished apartments, residential villas, and modern condos in prime neighborhoods.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <a
              href="/browse-houses"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 mr-2 transition-colors"
            >
              <Compass className="h-4 w-4" /> View All Listings
            </a>
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center justify-center text-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center justify-center text-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Slider Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-6 sm:px-10 lg:px-14 xl:px-16 py-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Intro Highlight Banner Card */}
        <div className="w-[300px] sm:w-[340px] shrink-0 snap-start bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-7 space-y-6 shadow-xl flex flex-col justify-between h-[460px] border border-slate-800">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Prime Properties
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Direct Landlord <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Zero Hidden Fees
              </span>
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every home is physically inspected and backed by legal bilingual rental agreements and escrow deposit security.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Verified Listings</span>
                <span className="text-emerald-400 font-mono">100% Legal ETB</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-full animate-pulse" />
              </div>
            </div>

            <a href="/browse-houses" className="block">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                Explore All Houses <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Property Cards */}
        {houses.map((house) => (
          <div
            key={house.id}
            className="w-[320px] sm:w-[380px] shrink-0 snap-start bg-white border border-slate-200 hover:border-emerald-500 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-[460px] flex flex-col justify-between group"
          >
            {/* Card Image */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              <img
                src={house.image}
                alt={house.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {house.badge}
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1.5 font-semibold shadow-md">
                <MapPin className="h-3 w-3 text-emerald-400" /> {house.neighborhood}, {house.city}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    {house.category}
                  </span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {formatCurrency(house.pricePerMonth)}{" "}
                    <span className="text-[10px] font-normal text-slate-500">/mo</span>
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mt-1.5 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {house.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {house.description}
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 text-[11px] text-slate-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <Bed className="h-3.5 w-3.5 text-emerald-600" /> {house.bedrooms} Beds
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5 text-emerald-600" /> {house.bathrooms} Baths
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5 text-emerald-600" /> {house.areaSqm} m²
                </span>
              </div>

              <a href={`/properties/${house.id}`} className="block pt-0.5">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
                  View Details & Schedule Tour <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
