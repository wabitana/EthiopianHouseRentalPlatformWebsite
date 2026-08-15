"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Heart,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  ArrowRight,
  Star,
  Check,
  Lock,
  ChevronRight,
  Info,
  Car,
  Zap,
  ShieldAlert,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

// --- PROPERTY DATA SCHEMA & MOCK LISTINGS ---
export interface Property {
  id: string;
  title: string;
  category: "Luxury Apartment" | "Gated Villa" | "Studio Flat" | "Penthouse" | "Family House";
  city: "Addis Ababa" | "Hawassa" | "Adama" | "Bahir Dar";
  neighborhood: string;
  pricePerMonth: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  images: string[];
  description: string;
  furnished: boolean;
  featured: boolean;
  isVerifiedLandlord: boolean;
  hasVirtualTour: boolean;
  amenities: string[];
  landlord: {
    name: string;
    phone: string;
    avatar: string;
    responseRate: string;
  };
}

const sampleProperties: Property[] = [
  {
    id: "prop-1",
    title: "Bole Medhaniallem Executive Penthouse",
    category: "Penthouse",
    city: "Addis Ababa",
    neighborhood: "Bole Medhaniallem",
    pricePerMonth: 65000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 260,
    images: ["/images/penthouse_duplex.png", "/images/residential_apartments.png", "/images/studio_flat.png"],
    description: "Ultra-luxury penthouse with floor-to-ceiling glass windows offering breathtaking skyline views of Bole. Features European kitchen fittings, private elevator entry, 24/7 backup generator, and dedicated underground parking.",
    furnished: true,
    featured: true,
    isVerifiedLandlord: true,
    hasVirtualTour: true,
    amenities: ["Backup Generator", "Elevator", "24/7 Security", "Underground Parking", "High-Speed Fiber Wifi", "Balcony Skyline View"],
    landlord: {
      name: "Solomon Teklu",
      phone: "+251 911 234 567",
      avatar: "https://ui-avatars.com/api/?name=Solomon+Teklu&background=059669&color=fff",
      responseRate: "Under 15 mins",
    },
  },
  {
    id: "prop-2",
    title: "Old Airport Gated Family Villa",
    category: "Gated Villa",
    city: "Addis Ababa",
    neighborhood: "Old Airport",
    pricePerMonth: 85000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 380,
    images: ["/images/villas_family_homes.png", "/images/residential_apartments.png"],
    description: "Spacious multi-story gated family residence situated in the diplomatic enclave of Old Airport. Includes expansive private lawn garden, security guard booth, servant quarters, and double garage.",
    furnished: false,
    featured: true,
    isVerifiedLandlord: true,
    hasVirtualTour: true,
    amenities: ["Private Garden", "Security Guardhouse", "Servant Quarters", "Double Garage", "Water Tank Reserve", "Pet Friendly"],
    landlord: {
      name: "Tigist Haile",
      phone: "+251 911 987 654",
      avatar: "https://ui-avatars.com/api/?name=Tigist+Haile&background=0284c7&color=fff",
      responseRate: "Under 30 mins",
    },
  },
  {
    id: "prop-3",
    title: "Kazanchis UNECA Modern Apartment",
    category: "Luxury Apartment",
    city: "Addis Ababa",
    neighborhood: "Kazanchis",
    pricePerMonth: 38000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 130,
    images: ["/images/residential_apartments.png", "/images/studio_flat.png"],
    description: "Sleek and contemporary 2-bedroom apartment located within walking distance of UNECA & major diplomatic hubs. Fully furnished with high-end appliances, intercom security, and daily garbage disposal.",
    furnished: true,
    featured: false,
    isVerifiedLandlord: true,
    hasVirtualTour: true,
    amenities: ["Fully Furnished", "Elevator", "Intercom Security", "24/7 Backup Power", "Water Filter System"],
    landlord: {
      name: "Abebe Kassaye",
      phone: "+251 912 345 678",
      avatar: "https://ui-avatars.com/api/?name=Abebe+Kassaye&background=7c3aed&color=fff",
      responseRate: "Under 1 hour",
    },
  },
  {
    id: "prop-4",
    title: "Bole Atlas Cozy Studio Flat",
    category: "Studio Flat",
    city: "Addis Ababa",
    neighborhood: "Bole Atlas",
    pricePerMonth: 22000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 65,
    images: ["/images/studio_flat.png", "/images/residential_apartments.png"],
    description: "Perfect compact studio flat ideal for single professionals or expatriate consultants. High-speed internet included, smart TV, custom kitchenette, and close access to restaurants & cafes.",
    furnished: true,
    featured: false,
    isVerifiedLandlord: true,
    hasVirtualTour: false,
    amenities: ["Fiber Wifi Included", "Smart Key Access", "Kitchenette", "Balcony", "Laundry Room"],
    landlord: {
      name: "Bethlehem Worku",
      phone: "+251 913 456 789",
      avatar: "https://ui-avatars.com/api/?name=Bethlehem+Worku&background=db2777&color=fff",
      responseRate: "Under 10 mins",
    },
  },
  {
    id: "prop-5",
    title: "Hawassa Lakeview Horizon Residence",
    category: "Family House",
    city: "Hawassa",
    neighborhood: "Lakefront District",
    pricePerMonth: 42000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 210,
    images: ["/images/villas_family_homes.png", "/images/residential_apartments.png"],
    description: "Scenic 3-bedroom family residence overlooking Lake Hawassa. Serene neighborhood environment with lush landscaping, private terrace, solar water heater, and 24/7 security patrol.",
    furnished: true,
    featured: true,
    isVerifiedLandlord: true,
    hasVirtualTour: true,
    amenities: ["Lake View Terrace", "Solar Water Heating", "Lawn Garden", "Secure Parking", "Backup Water Tank"],
    landlord: {
      name: "Desta Tadesse",
      phone: "+251 916 543 210",
      avatar: "https://ui-avatars.com/api/?name=Desta+Tadesse&background=059669&color=fff",
      responseRate: "Under 20 mins",
    },
  },
  {
    id: "prop-6",
    title: "CMC Michael Modern Residence",
    category: "Luxury Apartment",
    city: "Addis Ababa",
    neighborhood: "CMC Michael",
    pricePerMonth: 32000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 155,
    images: ["/images/residential_apartments.png", "/images/penthouse_duplex.png"],
    description: "Brand-new 3-bedroom apartment in a newly constructed residential complex in CMC. Features open-plan living room, master bedroom with en-suite bath, and easy access to Light Rail line.",
    furnished: false,
    featured: false,
    isVerifiedLandlord: true,
    hasVirtualTour: false,
    amenities: ["Light Rail Access", "Master En-Suite", "Enclosed Balcony", "Elevator", "24/7 Security"],
    landlord: {
      name: "Ermias Bogale",
      phone: "+251 917 654 321",
      avatar: "https://ui-avatars.com/api/?name=Ermias+Bogale&background=ea580c&color=fff",
      responseRate: "Under 1 hour",
    },
  },
  {
    id: "prop-7",
    title: "Adama Expressway Garden Villa",
    category: "Gated Villa",
    city: "Adama",
    neighborhood: "Expressway Quarter",
    pricePerMonth: 29000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 310,
    images: ["/images/villas_family_homes.png", "/images/studio_flat.png"],
    description: "Peaceful villa compound located near Adama Expressway toll. Offers ample outdoor compound space, citrus garden, perimeter electric fencing, and fresh air micro-climate.",
    furnished: false,
    featured: false,
    isVerifiedLandlord: true,
    hasVirtualTour: false,
    amenities: ["Electric Fence", "Fruit Garden", "Veranda", "Multi-Car Parking", "Water Borehole"],
    landlord: {
      name: "Girma Kebede",
      phone: "+251 920 112 233",
      avatar: "https://ui-avatars.com/api/?name=Girma+Kebede&background=16a34a&color=fff",
      responseRate: "Under 40 mins",
    },
  },
  {
    id: "prop-8",
    title: "Bahir Dar Blue Nile View Flat",
    category: "Luxury Apartment",
    city: "Bahir Dar",
    neighborhood: "Riverfront Promenade",
    pricePerMonth: 27000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 120,
    images: ["/images/residential_apartments.png", "/images/villas_family_homes.png"],
    description: "Charming riverfront apartment in Bahir Dar offering serene views of the Blue Nile inlet. Modern interior layout with tiled floors, wide balcony, and 24/7 security guard.",
    furnished: true,
    featured: true,
    isVerifiedLandlord: true,
    hasVirtualTour: true,
    amenities: ["River View", "Balcony", "Fully Furnished", "24/7 Security", "Solar Backup"],
    landlord: {
      name: "Helena Assefa",
      phone: "+251 922 445 566",
      avatar: "https://ui-avatars.com/api/?name=Helena+Assefa&background=0284c7&color=fff",
      responseRate: "Under 15 mins",
    },
  },
];

export default function BrowseHousesPage() {
  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [onlyFurnished, setOnlyFurnished] = useState<boolean>(false);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // --- MODAL STATES ---
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [tourProperty, setTourProperty] = useState<Property | null>(null);
  const [tourDate, setTourDate] = useState<string>("");
  const [tourTime, setTourTime] = useState<string>("10:00 AM");
  const [tourSuccessMessage, setTourSuccessMessage] = useState<string>("");

  const categoriesList = ["All", "Luxury Apartment", "Gated Villa", "Studio Flat", "Penthouse", "Family House"];
  const citiesList = ["All", "Addis Ababa", "Hawassa", "Adama", "Bahir Dar"];

  // Toggle Favorites
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter Logic
  const filteredProperties = useMemo(() => {
    return sampleProperties.filter(p => {
      // Search
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

      // City
      const matchesCity = selectedCity === "All" || p.city === selectedCity;

      // Price
      const matchesPrice = p.pricePerMonth <= priceMax;

      // Bedrooms
      const matchesBedrooms = minBedrooms === 0 || p.bedrooms >= minBedrooms;

      // Furnished
      const matchesFurnished = !onlyFurnished || p.furnished;

      // Verified
      const matchesVerified = !onlyVerified || p.isVerifiedLandlord;

      return matchesSearch && matchesCategory && matchesCity && matchesPrice && matchesBedrooms && matchesFurnished && matchesVerified;
    });
  }, [searchQuery, selectedCategory, selectedCity, priceMax, minBedrooms, onlyFurnished, onlyVerified]);

  // Handle Tour Submit
  const handleScheduleTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourDate) return alert("Please select a inspection date");
    setTourSuccessMessage(`Tour confirmed for ${tourDate} at ${tourTime}! We sent details to your phone.`);
    setTimeout(() => {
      setTourSuccessMessage("");
      setIsTourModalOpen(false);
      setTourProperty(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ================= HERO HEADER ================= */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800/80">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-400 tracking-wide uppercase"
            >
              <Sparkles className="h-4 w-4" />
              Verified Ethiopian Real Estate Catalog
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white"
            >
              Browse & Rent Your Next <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Dream Home in Ethiopia
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            >
              Explore verified apartments, luxury villas, studio flats, and family houses in Addis Ababa, Hawassa, Adama & Bahir Dar with transparent ETB pricing and digital lease contracts.
            </motion.p>
          </div>

          {/* ================= SEARCH & MAIN FILTER BAR ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 max-w-5xl mx-auto bg-slate-950/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4"
          >
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by neighborhood (e.g. Bole Medhaniallem, Kazanchis, Old Airport, Hawassa)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Grid Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {/* City Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-400" /> City
                </label>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {citiesList.map(city => (
                    <option key={city} value={city}>{city === "All" ? "All Ethiopian Cities" : city}</option>
                  ))}
                </select>
              </div>

              {/* Price Max Filter */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Max Rent:</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(priceMax)}</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={100000}
                  step={5000}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg mt-2"
                />
              </div>

              {/* Bedrooms Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Bed className="h-3 w-3 text-emerald-400" /> Bedrooms
                </label>
                <select
                  value={minBedrooms}
                  onChange={e => setMinBedrooms(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={0}>Any Bedroom Count</option>
                  <option value={1}>1+ Bedrooms</option>
                  <option value={2}>2+ Bedrooms</option>
                  <option value={3}>3+ Bedrooms</option>
                  <option value={4}>4+ Bedrooms</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-col justify-end gap-2 pt-2 sm:pt-0">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyFurnished}
                    onChange={e => setOnlyFurnished(e.target.checked)}
                    className="rounded accent-emerald-500 h-4 w-4"
                  />
                  <span>Fully Furnished Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={e => setOnlyVerified(e.target.checked)}
                    className="rounded accent-emerald-500 h-4 w-4"
                  />
                  <span className="flex items-center gap-1">
                    Verified Landlords <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CATEGORY TABS ================= */}
      <section className="bg-slate-900 border-b border-slate-800/80 sticky top-16 z-30 backdrop-blur-md bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Type:
            </span>
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROPERTY GRID SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Results Counter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Available Home Rentals
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {filteredProperties.length} Properties
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing verified rental units with transparent monthly ETB breakdowns
            </p>
          </div>

          {(searchQuery || selectedCategory !== "All" || selectedCity !== "All" || priceMax < 100000 || minBedrooms > 0 || onlyFurnished || onlyVerified) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedCity("All");
                setPriceMax(100000);
                setMinBedrooms(0);
                setOnlyFurnished(false);
                setOnlyVerified(false);
              }}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Reset All Filters <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-950/40 rounded-3xl border border-slate-800 p-8"
          >
            <Building2 className="mx-auto h-16 w-16 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Matching Homes Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              We couldn't find properties matching your current filter choices. Try widening your price range or clearing filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedCity("All");
                setPriceMax(100000);
                setMinBedrooms(0);
                setOnlyFurnished(false);
                setOnlyVerified(false);
              }}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
            >
              Clear Filters & Show All
            </Button>
          </motion.div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {filteredProperties.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group"
                >
                  <Card className="bg-slate-950 border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300 h-full flex flex-col justify-between">
                    {/* Image Area */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedProperty(p)}>
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                            {p.category}
                          </span>
                          {p.hasVirtualTour && (
                            <span className="bg-emerald-500/90 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Eye className="h-3 w-3" /> 360° Tour
                            </span>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={e => toggleFavorite(p.id, e)}
                          className="pointer-events-auto w-9 h-9 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-md"
                        >
                          <Heart className={`h-4 w-4 ${favorites[p.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>
                      </div>

                      {/* Bottom Image Overlay Info */}
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.neighborhood}, {p.city}
                      </div>
                    </div>

                    {/* Content Body */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Title & Verified Landlord */}
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => setSelectedProperty(p)}
                            className="font-bold text-white text-base sm:text-lg group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
                          >
                            {p.title}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Specs Pill Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Bed className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{p.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{p.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{p.areaSqm} m²</span>
                        </div>
                      </div>

                      {/* Landlord & Price Footer */}
                      <div className="pt-1 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Monthly Rent</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-emerald-400">{formatCurrency(p.pricePerMonth)}</span>
                            <span className="text-[10px] text-slate-400">/mo</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProperty(p)}
                            className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs"
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setTourProperty(p);
                              setIsTourModalOpen(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                          >
                            Tour
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ================= REGIONAL QUICK EXPLORER ================= */}
      <section className="bg-slate-950 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">Prime Destinations</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Explore Top Ethiopian Rental Hubs</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Addis Ababa", label: "Capital & Diplomatic Hub", count: "2,400+ Units", image: "/images/residential_apartments.png" },
              { name: "Hawassa", label: "Lakeside Resort City", count: "450+ Units", image: "/images/villas_family_homes.png" },
              { name: "Adama", label: "Expressway Business Quarter", count: "320+ Units", image: "/images/studio_flat.png" },
              { name: "Bahir Dar", label: "Blue Nile Promenade", count: "280+ Units", image: "/images/penthouse_duplex.png" },
            ].map(city => (
              <div
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-emerald-500/50 transition-all shadow-lg"
              >
                <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">{city.count}</span>
                  <h3 className="text-lg font-bold text-white">{city.name}</h3>
                  <p className="text-[11px] text-slate-400">{city.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE DETAILED PROPERTY DRAWER MODAL ================= */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col my-auto"
            >
              {/* Header Image Gallery Carousel */}
              <div className="relative h-72 sm:h-80 bg-slate-950">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-xl text-xs text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {selectedProperty.neighborhood}, {selectedProperty.city}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-100">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {selectedProperty.category}
                    </span>
                    <span className="text-2xl font-black text-emerald-400">{formatCurrency(selectedProperty.pricePerMonth)} <span className="text-xs font-normal text-slate-400">/month</span></span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-white mt-3">{selectedProperty.title}</h2>
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Bedrooms</span>
                    <span className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5"><Bed className="h-4 w-4 text-emerald-400" /> {selectedProperty.bedrooms} Beds</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Bathrooms</span>
                    <span className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5"><Bath className="h-4 w-4 text-emerald-400" /> {selectedProperty.bathrooms} Baths</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Property Size</span>
                    <span className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5"><Maximize2 className="h-4 w-4 text-emerald-400" /> {selectedProperty.areaSqm} m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Furnished</span>
                    <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">{selectedProperty.furnished ? "Yes ✓" : "Unfurnished"}</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Included Amenities & Services</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedProperty.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-2 text-xs bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Landlord Information Box */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={selectedProperty.landlord.avatar} alt={selectedProperty.landlord.name} className="w-12 h-12 rounded-full border border-emerald-500/30" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-sm font-bold text-white">{selectedProperty.landlord.name}</h5>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">Verified Owner • Replies {selectedProperty.landlord.responseRate}</p>
                    </div>
                  </div>

                  <a href={`tel:${selectedProperty.landlord.phone}`} className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" /> Call Owner
                  </a>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" /> Chapa Escrow Deposit Protected
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      onClick={() => {
                        const p = selectedProperty;
                        setSelectedProperty(null);
                        setTourProperty(p);
                        setIsTourModalOpen(true);
                      }}
                      className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                    >
                      Book Walkthrough Tour
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= INTERACTIVE TOUR APPOINTMENT MODAL ================= */}
      <AnimatePresence>
        {isTourModalOpen && tourProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsTourModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" /> Schedule Property Tour
                </h3>
                <button onClick={() => setIsTourModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-6">
                Reserve an in-person physical walkthrough for <span className="text-emerald-400 font-bold">{tourProperty.title}</span>.
              </p>

              {tourSuccessMessage ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
                  <p className="font-bold">{tourSuccessMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleScheduleTour} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={tourDate}
                      onChange={e => setTourDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Preferred Time Slot</label>
                    <select
                      value={tourTime}
                      onChange={e => setTourTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="09:00 AM">09:00 AM - Morning Walkthrough</option>
                      <option value="11:00 AM">11:00 AM - Midday Walkthrough</option>
                      <option value="02:30 PM">02:30 PM - Afternoon Walkthrough</option>
                      <option value="05:00 PM">05:00 PM - Evening Walkthrough</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 text-xs">
                      Confirm Inspection Tour
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
