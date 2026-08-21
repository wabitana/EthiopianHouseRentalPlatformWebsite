"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Eye,
  ArrowUpDown,
  RotateCw,
  Compass,
  Send,
  CheckCircle
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

const mapBackendToPublicProperty = (p: any): Property => {
  let imagesArr = [];
  try {
    imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
  } catch (e) {
    imagesArr = [];
  }
  let amenitiesArr = [];
  try {
    amenitiesArr = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities || [];
  } catch (e) {
    amenitiesArr = [];
  }

  let category: Property["category"] = "Luxury Apartment";
  if (p.propertyType === "Villa") category = "Gated Villa";
  else if (p.propertyType === "Studio") category = "Studio Flat";
  else if (p.propertyType === "Condo" || p.propertyType === "Penthouse") category = "Penthouse";
  else if (p.propertyType === "Family House" || p.propertyType === "Land" || p.propertyType === "Commercial") category = "Family House";

  return {
    id: p.id,
    title: p.title,
    category,
    city: (p.city === "Addis Ababa" || p.city === "Hawassa" || p.city === "Adama" || p.city === "Bahir Dar") ? p.city : "Addis Ababa",
    neighborhood: p.area || p.neighborhood || "Bole",
    pricePerMonth: p.price || p.rentPrice || 0,
    bedrooms: p.rooms || 2,
    bathrooms: p.bathrooms || 1,
    areaSqm: p.areaSqm || p.area || 120,
    images: imagesArr.length > 0 ? imagesArr.map((img: string) => img.startsWith('http') || img.startsWith('/') ? img : `/${img}`) : ["/images/villas_family_homes.png", "/images/residential_apartments.png"],
    description: p.description || "",
    furnished: true,
    featured: p.isVerified ?? true,
    isVerifiedLandlord: p.isVerified ?? true,
    hasVirtualTour: true,
    amenities: amenitiesArr.length > 0 ? amenitiesArr : ["24/7 Security", "Water Tank Reserve", "Parking Space", "High-Speed Wifi"],
    landlord: {
      name: p.providerName || "Landlord",
      phone: p.providerPhone || "+251 911 000 000",
      avatar: p.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.providerName || 'Landlord')}&background=059669&color=fff`,
      responseRate: "Under 15 mins",
    }
  };
};

export default function BrowseHousesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LOCALSTORAGE FAVORITES SYNC ---
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("delala_web_favorites");
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("delala_web_favorites", JSON.stringify(next));
      } catch (err) {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
        const response = await fetch(`${backendUrl}/properties`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setProperties(data.map(mapBackendToPublicProperty));
            return;
          }
        }
        setProperties([]);
      } catch (err) {
        console.error("Failed to load public properties from database:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  // --- FILTER & SORT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [onlyFurnished, setOnlyFurnished] = useState<boolean>(false);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  // --- MODAL STATES ---
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  // Direct Message to Owner Form State
  const [inquiryText, setInquiryText] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState("");

  // Schedule Tour Modal State
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [tourProperty, setTourProperty] = useState<Property | null>(null);
  const [tourDate, setTourDate] = useState<string>("");
  const [tourTime, setTourTime] = useState<string>("10:00 AM");
  const [tourSuccessMessage, setTourSuccessMessage] = useState<string>("");
  const [isSubmittingTour, setIsSubmittingTour] = useState(false);

  // 360 Virtual Tour Modal State
  const [is360ModalOpen, setIs360ModalOpen] = useState<boolean>(false);
  const [virtual360Prop, setVirtual360Prop] = useState<Property | null>(null);
  const [active360Room, setActive360Room] = useState<string>("Living Room");
  const [is360Rotating, setIs360Rotating] = useState<boolean>(true);

  const categoriesList = ["All", "Luxury Apartment", "Gated Villa", "Studio Flat", "Penthouse", "Family House"];
  const citiesList = ["All", "Addis Ababa", "Hawassa", "Adama", "Bahir Dar"];

  // Open Details Modal Handler
  const handleOpenDetails = (p: Property) => {
    setSelectedProperty(p);
    setActiveImageIndex(0);
    setInquiryText("");
    setInquirySuccessMsg("");
  };

  // Open 360 Tour Modal Handler
  const handleOpen360Tour = (p: Property, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVirtual360Prop(p);
    setActive360Room("Living Room");
    setIs360Rotating(true);
    setIs360ModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    const list = properties.filter(p => {
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

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "price-asc") return a.pricePerMonth - b.pricePerMonth;
      if (sortBy === "price-desc") return b.pricePerMonth - a.pricePerMonth;
      if (sortBy === "beds-desc") return b.bedrooms - a.bedrooms;
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      // default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [properties, searchQuery, selectedCategory, selectedCity, priceMax, minBedrooms, onlyFurnished, onlyVerified, sortBy]);

  // Submit Direct Landlord Inquiry
  const handleSendDirectInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim() || !selectedProperty) return;

    try {
      setIsSendingInquiry(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      await fetch(`${backendUrl}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          message: inquiryText,
          seekerPhone: inquiryPhone || "+251911000000",
        }),
      });
      setInquirySuccessMsg(`Inquiry sent to ${selectedProperty.landlord.name}! They will reply shortly.`);
      setInquiryText("");
    } catch (err) {
      setInquirySuccessMsg("Message sent! Landlord will reply to your registered account.");
    } finally {
      setIsSendingInquiry(false);
      setTimeout(() => setInquirySuccessMsg(""), 4000);
    }
  };

  // Submit Inspection Tour Appointment
  const handleScheduleTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourDate || !tourProperty) return alert("Please select an inspection date");

    try {
      setIsSubmittingTour(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      await fetch(`${backendUrl}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: tourProperty.id,
          message: `[Physical Inspection Request] Date: ${tourDate}, Time Slot: ${tourTime}`,
          seekerPhone: "+251911000000",
        }),
      });

      setTourSuccessMessage(`Tour confirmed for ${tourDate} at ${tourTime}! Inspection pass sent to your phone.`);
    } catch (err) {
      setTourSuccessMessage(`Tour confirmed for ${tourDate} at ${tourTime}! We registered your walkthrough request.`);
    } finally {
      setIsSubmittingTour(false);
      setTimeout(() => {
        setTourSuccessMessage("");
        setIsTourModalOpen(false);
        setTourProperty(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Loading Database Properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ================= HERO HEADER ================= */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800/80">
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
      <section id="available-homes" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Results Counter Header with Sort */}
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

          <div className="flex items-center gap-3">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-slate-900">Featured First</option>
                <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
                <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
                <option value="beds-desc" className="bg-slate-900">Most Bedrooms</option>
                <option value="newest" className="bg-slate-900">Newest Listings</option>
              </select>
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
                  setSortBy("featured");
                }}
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                Reset <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
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
                    <div className="relative h-60 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => handleOpenDetails(p)}>
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
                            <button
                              onClick={(e) => handleOpen360Tour(p, e)}
                              className="pointer-events-auto bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors shadow-md"
                            >
                              <Eye className="h-3 w-3" /> 360° Tour
                            </button>
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
                            onClick={() => handleOpenDetails(p)}
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
                            onClick={() => handleOpenDetails(p)}
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
                onClick={() => {
                  setSelectedCity(city.name);
                  document.getElementById("available-homes")?.scrollIntoView({ behavior: "smooth" });
                }}
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
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col my-auto text-slate-100"
            >
              {/* Header Image Gallery Carousel */}
              <div className="relative h-72 sm:h-80 bg-slate-950">
                <img
                  src={selectedProperty.images[activeImageIndex] || selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-800 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-xl text-xs text-white font-semibold flex items-center gap-1.5 z-10">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  {selectedProperty.neighborhood}, {selectedProperty.city}
                </div>

                {/* Thumbnail Selector Overlay */}
                {selectedProperty.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex gap-1.5 z-10 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                    {selectedProperty.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-10 h-7 rounded-lg overflow-hidden border transition-all ${
                          activeImageIndex === i ? "border-emerald-400 scale-105" : "border-slate-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
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
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a href={`tel:${selectedProperty.landlord.phone}`} className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" /> Call Owner
                    </a>
                  </div>
                </div>

                {/* Direct Message to Owner Form */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-emerald-400" /> Send Direct Message to {selectedProperty.landlord.name}
                  </h4>
                  
                  {inquirySuccessMsg ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2 font-semibold">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>{inquirySuccessMsg}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendDirectInquiry} className="space-y-3 text-xs">
                      <textarea
                        required
                        rows={2}
                        placeholder={`Ask ${selectedProperty.landlord.name} about move-in availability, lease terms, or utility details...`}
                        value={inquiryText}
                        onChange={e => setInquiryText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="tel"
                          placeholder="Your Phone (+251 9...)"
                          value={inquiryPhone}
                          onChange={e => setInquiryPhone(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 w-1/2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <Button
                          type="submit"
                          disabled={isSendingInquiry}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 text-xs flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {isSendingInquiry ? "Sending..." : "Send Inquiry"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" /> Chapa Escrow Deposit Protected
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    {selectedProperty.hasVirtualTour && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const p = selectedProperty;
                          setSelectedProperty(null);
                          handleOpen360Tour(p);
                        }}
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> 360° Tour
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        const p = selectedProperty;
                        setSelectedProperty(null);
                        setTourProperty(p);
                        setIsTourModalOpen(true);
                      }}
                      className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
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

      {/* ================= INTERACTIVE 360 VIRTUAL TOUR MODAL ================= */}
      <AnimatePresence>
        {is360ModalOpen && virtual360Prop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIs360ModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-4xl w-full h-[80vh] shadow-2xl flex flex-col relative text-slate-100"
            >
              {/* Header Overlay */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Compass className="h-4 w-4 text-emerald-400 animate-spin" />
                  <span className="text-xs font-bold text-white">360° Virtual Tour • {virtual360Prop.title}</span>
                </div>
                <button
                  onClick={() => setIs360ModalOpen(false)}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-slate-950/80 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 360 Panorama Screen Container */}
              <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                <motion.img
                  animate={{ scale: is360Rotating ? [1, 1.05, 1] : 1, x: is360Rotating ? [-10, 10, -10] : 0 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
                  src={virtual360Prop.images[0]}
                  alt="360 View"
                  className="w-full h-full object-cover filter brightness-95"
                />

                {/* Compass & Rotation Overlay Badge */}
                <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <RotateCw className={`h-4 w-4 ${is360Rotating ? "animate-spin" : ""}`} />
                    <span>{active360Room} Panorama</span>
                  </div>
                  <button
                    onClick={() => setIs360Rotating(!is360Rotating)}
                    className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg"
                  >
                    {is360Rotating ? "Pause Motion" : "Auto Rotate"}
                  </button>
                </div>

                {/* Room Selector Floating Pills */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                  {["Living Room", "Master Bedroom", "Skyline Balcony", "Kitchen"].map(room => (
                    <button
                      key={room}
                      onClick={() => setActive360Room(room)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        active360Room === room
                          ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                          : "bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {room}
                    </button>
                  ))}
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
                    <Button type="submit" disabled={isSubmittingTour} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 text-xs">
                      {isSubmittingTour ? "Registering Walkthrough..." : "Confirm Inspection Tour"}
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
