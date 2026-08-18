"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, PlusCircle } from "lucide-react";
import { mockProperties, PropertyItem } from "@/lib/portal-mock-data";
import { PortalPropertyMap } from "@/components/portal/portal-property-map";

export default function AgentPropertiesPage() {
  const [properties] = useState<PropertyItem[]>(mockProperties);

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

      {/* Interactive List & Google Map Engine */}
      <PortalPropertyMap properties={properties} />
    </div>
  );
}
