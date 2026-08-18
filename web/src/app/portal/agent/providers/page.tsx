"use client";

import { Building, Phone, Mail, MapPin, Search } from "lucide-react";
import { mockProviders } from "@/lib/portal-mock-data";

export default function AgentProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building className="h-6 w-6 text-blue-400" /> Assigned House Providers
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Landlords operating within Bole and Kazanchis territories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockProviders.map((p) => (
          <div key={p.id} className="p-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={p.avatar} alt={p.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-500/30" />
              <div>
                <h3 className="font-bold text-white text-sm">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.location}</p>
                <p className="text-xs text-blue-400 font-semibold mt-0.5">{p.phone}</p>
              </div>
            </div>
            <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md">
              Contact Landlord
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
