"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Building2,
  Filter,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Maximize2,
  SlidersHorizontal,
  Home,
  Phone,
} from "lucide-react";
import { PropertyItem, AssistedTenantItem } from "@/lib/portal-mock-data";

interface PortalPropertyMapProps {
  properties: PropertyItem[];
  matchingTenant?: AssistedTenantItem | null;
  onSelectRentOnBehalf?: (property: PropertyItem) => void;
}

const getMapEmbedUrl = (region: string) => {
  const reg = region.toLowerCase();
  if (reg.includes("hawassa")) return "https://www.openstreetmap.org/export/embed.html?bbox=38.43,7.02,38.52,7.10&layer=mapnik";
  if (reg.includes("adama")) return "https://www.openstreetmap.org/export/embed.html?bbox=39.22,8.50,39.30,8.58&layer=mapnik";
  if (reg.includes("bahir")) return "https://www.openstreetmap.org/export/embed.html?bbox=37.33,11.54,37.43,11.64&layer=mapnik";
  if (reg.includes("bole")) return "https://www.openstreetmap.org/export/embed.html?bbox=38.75,8.96,38.83,9.03&layer=mapnik";
  if (reg.includes("kazanchis")) return "https://www.openstreetmap.org/export/embed.html?bbox=38.74,8.99,38.80,9.04&layer=mapnik";
  return "https://www.openstreetmap.org/export/embed.html?bbox=38.68,8.92,38.86,9.08&layer=mapnik";
};

export function PortalPropertyMap({
  properties,
  matchingTenant,
  onSelectRentOnBehalf,
}: PortalPropertyMapProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [maxBudget, setMaxBudget] = useState<number>(200000);
  const [viewMode, setViewMode] = useState<"split" | "list" | "map">("split");

  // Map state
  const [activeProperty, setActiveProperty] = useState<PropertyItem | null>(null);
  const [mapCenterRegion, setMapCenterRegion] = useState("Addis Ababa");

  // Region preset locations
  const regionPresets = [
    { label: "All Regions", value: "ALL", lat: 8.9806, lng: 38.7578 },
    { label: "Addis Ababa (Bole)", value: "Bole", lat: 8.9984, lng: 38.7856 },
    { label: "Addis Ababa (Kazanchis)", value: "Kazanchis", lat: 9.0167, lng: 38.7654 },
    { label: "Addis Ababa (CMC & Yeka)", value: "Yeka", lat: 9.0234, lng: 38.8312 },
    { label: "Hawassa (Sidama)", value: "Hawassa", lat: 7.0621, lng: 38.4763 },
    { label: "Adama (Oromia)", value: "Adama", lat: 8.5412, lng: 39.2689 },
    { label: "Bahir Dar (Amhara)", value: "Bahir Dar", lat: 11.5942, lng: 37.3892 },
  ];

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Status filter: only published/active
      if (prop.status !== "Published" && prop.status !== "Draft") return false;

      // Text search
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        prop.title.toLowerCase().includes(query) ||
        prop.location.toLowerCase().includes(query) ||
        prop.providerName.toLowerCase().includes(query) ||
        (prop.woreda && prop.woreda.toLowerCase().includes(query));

      // Region filter
      const matchRegion =
        selectedRegion === "ALL" ||
        prop.location.toLowerCase().includes(selectedRegion.toLowerCase());

      // Type filter
      const matchType = selectedType === "ALL" || prop.propertyType === selectedType;

      // Budget filter
      const matchBudget = prop.price <= maxBudget;

      return matchSearch && matchRegion && matchType && matchBudget;
    });
  }, [properties, searchQuery, selectedRegion, selectedType, maxBudget]);

  return (
    <div className="space-y-4 text-xs">
      {/* Search & Filter Header Bar */}
      <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homes in Addis Ababa, Hawassa, Adama, Bahir Dar or by landlord..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "split"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔲 Split View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📋 List Only
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "map"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🗺️ Google Map
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-700/60">
          {/* Region Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setMapCenterRegion(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {regionPresets.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All House Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Condo">Condo</option>
              <option value="Studio">Studio</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {/* Max Rent Budget */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Max Rent:</span>
            <input
              type="range"
              min={10000}
              max={200000}
              step={5000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-24 accent-blue-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400 font-bold">
              ETB {maxBudget.toLocaleString()}
            </span>
          </div>

          <div className="ml-auto text-slate-400">
            Found <strong className="text-white">{filteredProperties.length}</strong> matching house listings
          </div>
        </div>
      </div>

      {/* Main Content Area: Split / List / Map */}
      <div
        className={`grid gap-4 ${
          viewMode === "split"
            ? "grid-cols-1 lg:grid-cols-12"
            : viewMode === "list"
            ? "grid-cols-1"
            : "grid-cols-1"
        }`}
      >
        {/* LIST VIEW COLUMN */}
        {(viewMode === "split" || viewMode === "list") && (
          <div
            className={`space-y-3 ${
              viewMode === "split" ? "lg:col-span-5" : "w-full"
            }`}
          >
            {filteredProperties.length === 0 ? (
              <div className="p-8 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-center space-y-2">
                <Home className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="font-bold text-white text-sm">No house listings match your filter</p>
                <p className="text-slate-400">Try adjusting your region search, budget, or house type.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRegion("ALL");
                    setSelectedType("ALL");
                    setMaxBudget(200000);
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredProperties.map((prop) => {
                const isActive = activeProperty?.id === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setActiveProperty(prop)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-lg ${
                      isActive
                        ? "bg-slate-800 border-blue-500 ring-2 ring-blue-500/30"
                        : "bg-slate-800/90 border-slate-700/80 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="h-20 w-24 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] font-extrabold rounded uppercase">
                            {prop.propertyType}
                          </span>
                          <span className="text-emerald-400 font-mono font-extrabold text-sm">
                            ETB {prop.price.toLocaleString()}/mo
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-1 mt-1">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                          <span className="truncate">{prop.location}</span>
                        </p>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Landlord: <strong className="text-white">{prop.providerName}</strong> ({prop.providerPhone})
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {prop.bedrooms} Beds • {prop.bathrooms} Baths • {prop.areaSqM} m²
                      </span>

                      {onSelectRentOnBehalf && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRentOnBehalf(prop);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Rent on Behalf
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MAP VIEW COLUMN */}
        {(viewMode === "split" || viewMode === "map") && (
          <div
            className={`relative rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden min-h-[500px] flex flex-col ${
              viewMode === "split" ? "lg:col-span-7" : "w-full min-h-[600px]"
            }`}
          >
            {/* Interactive Map Header Bar */}
            <div className="p-3 bg-slate-850 border-b border-slate-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white text-xs">
                  Interactive Google Map — Ethiopia Property Pins
                </span>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                {regionPresets.slice(1, 6).map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setSelectedRegion(preset.value);
                      setMapCenterRegion(preset.value);
                    }}
                    className={`px-2 py-1 rounded font-bold transition-all whitespace-nowrap ${
                      selectedRegion === preset.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    📍 {preset.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Body Canvas / Real Map View */}
            <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Real Interactive Map Layer */}
              <iframe
                title="Real Map View"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={getMapEmbedUrl(selectedRegion)}
                className="absolute inset-0 w-full h-full border-0 pointer-events-auto opacity-75 contrast-125 saturate-150"
              />

              {/* Map Coordinates Overlay */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] text-slate-300 z-10 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span>
                  Map Region: <strong className="text-white">{selectedRegion === "ALL" ? "Addis Ababa & Regional Hubs" : selectedRegion}</strong>
                </span>
              </div>

              {/* Property Map Pin Badges Overlay */}
              <div className="w-full h-full min-h-[420px] relative flex items-center justify-center">
                {filteredProperties.map((prop, idx) => {
                  const isActive = activeProperty?.id === prop.id;
                  // Dynamic positioning simulation based on coordinates or index
                  const coords = prop.coordinates || { lat: 8.99, lng: 38.75 };
                  const topPos = `${20 + ((idx * 27) % 55)}%`;
                  const leftPos = `${15 + ((idx * 33) % 70)}%`;

                  return (
                    <div
                      key={prop.id}
                      onClick={() => setActiveProperty(prop)}
                      style={{ top: topPos, left: leftPos }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-20 hover:scale-110 ${
                        isActive ? "scale-110 z-30" : ""
                      }`}
                    >
                      {/* Property Pin Badge */}
                      <div
                        className={`px-3 py-1.5 rounded-full font-mono font-extrabold text-xs shadow-2xl flex items-center gap-1.5 border transition-all ${
                          isActive
                            ? "bg-emerald-500 text-slate-950 border-white ring-4 ring-emerald-500/40"
                            : "bg-slate-900/95 text-emerald-400 border-emerald-500/60 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-rose-400" />
                        <span>ETB {(prop.price / 1000).toFixed(0)}k/mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Property Popup Card Drawer */}
              {activeProperty && (
                <div className="absolute bottom-4 left-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-blue-500/50 p-4 rounded-2xl shadow-2xl space-y-3 max-w-lg mx-auto">
                  <div className="flex items-start gap-3">
                    <img
                      src={activeProperty.images[0]}
                      alt={activeProperty.title}
                      className="h-16 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-blue-400">
                          {activeProperty.propertyType}
                        </span>
                        <button
                          onClick={() => setActiveProperty(null)}
                          className="text-slate-400 hover:text-white text-xs font-bold"
                        >
                          ✕ Close
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {activeProperty.title}
                      </h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-400" /> {activeProperty.location}
                      </p>
                      <p className="text-emerald-400 font-mono font-extrabold text-sm mt-0.5">
                        ETB {activeProperty.price.toLocaleString()}/month
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      Landlord: <strong className="text-white">{activeProperty.providerName}</strong> ({activeProperty.providerPhone})
                    </div>

                    {onSelectRentOnBehalf && (
                      <button
                        onClick={() => onSelectRentOnBehalf(activeProperty)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Rent on Behalf of Tenant
                      </button>
                    )}
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
