"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ExternalLink,
  Eye,
  Bed,
  Bath,
  Maximize,
  Phone,
  User,
  ShieldCheck,
  Compass,
  Layers,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react";
import { PropertyItem } from "@/lib/portal-mock-data";

interface LocationBreakdownItem {
  location: string;
  count: number;
  percentage: number;
}

interface AdminLocationMapProps {
  locationBreakdown: LocationBreakdownItem[];
  properties: PropertyItem[];
}

// Coordinate bounding boxes for Ethiopian sub-cities & regional hubs
const ETHIOPIAN_REGION_PRESETS = [
  {
    id: "ALL",
    name: "All Addis Ababa & Regional Hubs",
    shortName: "All Regions",
    bbox: "38.68,8.92,38.86,9.08",
    center: { lat: 9.0054, lng: 38.7636 },
  },
  {
    id: "Bole",
    name: "Bole Sub-City, Addis Ababa",
    shortName: "Bole",
    bbox: "38.75,8.96,38.83,9.03",
    center: { lat: 8.9984, lng: 38.7856 },
  },
  {
    id: "Kazanchis",
    name: "Kirkos & Kazanchis, Addis Ababa",
    shortName: "Kazanchis",
    bbox: "38.74,8.99,38.80,9.04",
    center: { lat: 9.0167, lng: 38.7654 },
  },
  {
    id: "CMC",
    name: "CMC & Yeka Sub-City, Addis Ababa",
    shortName: "CMC & Yeka",
    bbox: "38.80,9.01,38.87,9.06",
    center: { lat: 9.0234, lng: 38.8312 },
  },
  {
    id: "Piazza",
    name: "Arada & Piazza, Addis Ababa",
    shortName: "Arada / Piazza",
    bbox: "38.73,9.02,38.77,9.06",
    center: { lat: 9.035, lng: 38.752 },
  },
  {
    id: "Hawassa",
    name: "Hawassa City, Sidama Region",
    shortName: "Hawassa",
    bbox: "38.43,7.02,38.52,7.10",
    center: { lat: 7.0621, lng: 38.4763 },
  },
  {
    id: "Adama",
    name: "Adama (Nazret), Oromia Region",
    shortName: "Adama",
    bbox: "39.22,8.50,39.30,8.58",
    center: { lat: 8.5412, lng: 39.2689 },
  },
  {
    id: "Bahir Dar",
    name: "Bahir Dar, Amhara Region",
    shortName: "Bahir Dar",
    bbox: "37.33,11.54,37.43,11.64",
    center: { lat: 11.5942, lng: 37.3892 },
  },
];

export function AdminLocationMap({
  locationBreakdown,
  properties,
}: AdminLocationMapProps) {
  const [activeRegion, setActiveRegion] = useState("ALL");
  const [viewMode, setViewMode] = useState<"dual" | "map" | "stats">("dual");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);

  // Current preset based on activeRegion
  const currentPreset = useMemo(() => {
    return (
      ETHIOPIAN_REGION_PRESETS.find((p) =>
        p.id.toLowerCase() === activeRegion.toLowerCase() ||
        p.name.toLowerCase().includes(activeRegion.toLowerCase()) ||
        activeRegion.toLowerCase().includes(p.id.toLowerCase())
      ) || ETHIOPIAN_REGION_PRESETS[0]
    );
  }, [activeRegion]);

  // Properties relevant to current active region
  const regionProperties = useMemo(() => {
    if (activeRegion === "ALL") return properties;
    return properties.filter((p) =>
      p.location.toLowerCase().includes(activeRegion.toLowerCase()) ||
      (p.woreda && p.woreda.toLowerCase().includes(activeRegion.toLowerCase()))
    );
  }, [properties, activeRegion]);

  // Map embed URL
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentPreset.bbox}&layer=mapnik`;

  return (
    <div className="rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl overflow-hidden space-y-4 p-5 lg:p-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Most Active Locations (Sub-Cities & Regions)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time listing distribution & interactive property location map across Ethiopia
          </p>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode("dual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "dual"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Split Map
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "map"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Full Map
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "stats"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📊 Stats
            </button>
          </div>

          <Link
            href="/portal/admin/properties"
            className="px-3 py-1.5 bg-slate-750 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <span>All Properties</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Region Fast Selection Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] mr-1 shrink-0 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-emerald-400" /> Focus:
        </span>
        {ETHIOPIAN_REGION_PRESETS.map((preset) => {
          const isSelected =
            activeRegion.toLowerCase() === preset.id.toLowerCase() ||
            (preset.id === "ALL" && activeRegion === "ALL");
          return (
            <button
              key={preset.id}
              onClick={() => {
                setActiveRegion(preset.id);
                setSelectedProperty(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 border ${
                isSelected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20 font-bold"
                  : "bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{preset.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout (Dual / Map / Stats) */}
      <div
        className={`grid gap-5 pt-1 ${
          viewMode === "dual"
            ? "grid-cols-1 lg:grid-cols-12"
            : "grid-cols-1"
        }`}
      >
        {/* STATS & DISTRIBUTION LIST COLUMN */}
        {(viewMode === "dual" || viewMode === "stats") && (
          <div
            className={`space-y-4 ${
              viewMode === "dual" ? "lg:col-span-5" : "w-full"
            }`}
          >
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Location Breakdown
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {properties.length} Total Verified Listings
                </span>
              </div>

              {locationBreakdown && locationBreakdown.length > 0 ? (
                <div className="space-y-2.5">
                  {locationBreakdown.map((loc, idx) => {
                    const isFocus =
                      activeRegion.toLowerCase() !== "all" &&
                      loc.location.toLowerCase().includes(activeRegion.toLowerCase());
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          // Extract sub-city name (e.g. Bole from 'Bole, Addis Ababa')
                          const matchPreset = ETHIOPIAN_REGION_PRESETS.find((p) =>
                            loc.location.toLowerCase().includes(p.id.toLowerCase())
                          );
                          setActiveRegion(matchPreset ? matchPreset.id : loc.location);
                          setSelectedProperty(null);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                          isFocus
                            ? "bg-emerald-950/40 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30"
                            : "bg-slate-800/80 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-bold flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            {loc.location}
                          </span>
                          <span className="text-slate-400">
                            <strong className="text-emerald-400 font-mono">
                              {loc.count.toLocaleString()}
                            </strong>{" "}
                            listings ({loc.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                          <div
                            style={{ width: `${Math.max(loc.percentage, 5)}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400">
                  <MapPin className="h-6 w-6 text-slate-500 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-300 text-xs">
                    No active property locations yet
                  </p>
                </div>
              )}
            </div>

            {/* Quick Properties in Selected Hub */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Listings in {currentPreset.shortName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {regionProperties.length} available
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {regionProperties.slice(0, 4).map((prop) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProperty(prop)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? "bg-emerald-900/40 border-emerald-500 text-white"
                          : "bg-slate-800/80 border-slate-700/60 hover:border-slate-600 text-slate-300"
                      }`}
                    >
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="h-10 w-12 rounded-lg object-cover shrink-0 ring-1 ring-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-xs line-clamp-1">
                          {prop.title}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-emerald-400" />
                          <span className="truncate">{prop.location}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                        ETB {(prop.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MAP COLUMN */}
        {(viewMode === "dual" || viewMode === "map") && (
          <div
            className={`relative rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col ${
              viewMode === "dual" ? "lg:col-span-7 min-h-[380px]" : "w-full min-h-[500px]"
            }`}
          >
            {/* Map Header Status Overlay */}
            <div className="p-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-xs">
                  {currentPreset.name}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {regionProperties.length} active house pins
              </span>
            </div>

            {/* Map Canvas Frame */}
            <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center overflow-hidden min-h-[320px]">
              {/* Interactive OpenStreetMap Embed */}
              <iframe
                title="Ethiopian Property Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={mapEmbedUrl}
                className="absolute inset-0 w-full h-full border-0 pointer-events-auto opacity-75 contrast-125 saturate-150"
              />

              {/* Coordinates Badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 z-10 flex items-center gap-1.5 shadow-lg">
                <MapPin className="h-3 w-3 text-emerald-400" />
                <span>
                  Map Region: <strong className="text-white">{currentPreset.shortName}</strong>
                </span>
              </div>

              {/* Property Interactive Pins Overlay */}
              <div className="w-full h-full absolute inset-0 pointer-events-none">
                {regionProperties.map((prop, idx) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  // Calculate spread positions across the map
                  const topPos = `${25 + ((idx * 23) % 55)}%`;
                  const leftPos = `${18 + ((idx * 31) % 65)}%`;

                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProperty(prop)}
                      style={{ top: topPos, left: leftPos }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto transition-all z-20 hover:scale-115 ${
                        isSelected ? "scale-115 z-30" : ""
                      }`}
                    >
                      <div
                        className={`px-2.5 py-1 rounded-full font-mono font-extrabold text-[11px] shadow-2xl flex items-center gap-1 border transition-all ${
                          isSelected
                            ? "bg-emerald-400 text-slate-950 border-white ring-4 ring-emerald-500/40 font-bold"
                            : "bg-slate-900/95 text-emerald-300 border-emerald-500/60 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <MapPin className="h-3 w-3 text-rose-400" />
                        <span>ETB {(prop.price / 1000).toFixed(0)}k/mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Property Popup Card Drawer */}
              {selectedProperty && (
                <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 p-3.5 rounded-xl shadow-2xl space-y-2.5 max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <img
                      src={selectedProperty.images[0]}
                      alt={selectedProperty.title}
                      className="h-16 w-20 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded uppercase">
                          {selectedProperty.propertyType}
                        </span>
                        <button
                          onClick={() => setSelectedProperty(null)}
                          className="text-slate-400 hover:text-white text-xs font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-xs line-clamp-1 mt-0.5">
                        {selectedProperty.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                        <span className="truncate">{selectedProperty.location}</span>
                      </p>
                      <p className="text-emerald-400 font-mono font-extrabold text-xs mt-0.5">
                        ETB {selectedProperty.price.toLocaleString()}/month
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Landlord: <strong className="text-white">{selectedProperty.providerName}</strong>
                    </span>
                    <Link
                      href="/portal/admin/properties"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Manage Property
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
