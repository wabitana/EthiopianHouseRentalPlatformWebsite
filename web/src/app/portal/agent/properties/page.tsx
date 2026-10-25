"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, PlusCircle, MapPin, ShieldCheck, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PortalPropertyMap } from "@/components/portal/portal-property-map";

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [assignedArea, setAssignedArea] = useState<string>("Debre Birhan");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const [data, profile] = await Promise.all([
          apiFetch("/agent/properties").catch(() => []),
          apiFetch("/agent/profile").catch(() => null),
        ]);

        if (profile?.assignedArea) {
          setAssignedArea(profile.assignedArea);
        } else if (profile?.city) {
          setAssignedArea(profile.city);
        }

        setProperties(data || []);
      } catch (_) {
        // silent fallback
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Town Assignment: {assignedArea}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Territorial Scope
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-400" /> {assignedArea} Property Directory & Map Search
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Properties strictly filtered to your operational town ({assignedArea}). Properties located outside this jurisdiction are restricted from view.
          </p>
        </div>
        <Link
          href="/portal/agent/add-property"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Add New Property Listing
        </Link>
      </div>

      {/* Interactive List & Map Engine */}
      <PortalPropertyMap properties={properties} />
    </div>
  );
}
