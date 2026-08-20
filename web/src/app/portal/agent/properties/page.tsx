"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, PlusCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PortalPropertyMap } from "@/components/portal/portal-property-map";

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const data = await apiFetch("/properties");
        setProperties(data || []);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-400" /> Territory Property Directory & Google Map Search
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Search verified properties across Addis Ababa sub-cities, Hawassa, Adama, Bahir Dar, and regional Ethiopian hubs.
          </p>
        </div>
        <Link
          href="/portal/agent/add-property"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Add New Property Listing
        </Link>
      </div>

      {/* Interactive List & Map Engine */}
      <PortalPropertyMap properties={properties} />
    </div>
  );
}
