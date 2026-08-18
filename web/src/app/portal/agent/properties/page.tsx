"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Search, Eye, Edit, ShieldCheck, Phone, CheckCircle2 } from "lucide-react";
import { mockProperties, PropertyItem } from "@/lib/portal-mock-data";

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>(mockProperties);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = properties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-400" /> Assigned Property Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Properties assigned to field agent Dawit Wolde in Bole & Kazanchis.
          </p>
        </div>
        <Link
          href="/portal/agent/add-property"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          + Add New Property
        </Link>
      </div>

      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter assigned properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((prop) => (
          <div key={prop.id} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-start gap-4">
              <img src={prop.images[0]} alt={prop.title} className="h-20 w-24 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-blue-400">{prop.propertyType}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                    {prop.status}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm line-clamp-1">{prop.title}</h3>
                <p className="text-xs text-slate-400">{prop.location}</p>
                <p className="text-emerald-400 font-mono font-bold text-xs mt-1">ETB {prop.price.toLocaleString()}/mo</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400">
                Landlord: <strong className="text-white">{prop.providerName}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/portal/agent/verification"
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold rounded-lg text-xs"
                >
                  Verify
                </Link>
                <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
