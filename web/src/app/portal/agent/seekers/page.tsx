"use client";

import { UserCheck2, Phone, Mail, MapPin } from "lucide-react";
import { mockSeekers } from "@/lib/portal-mock-data";

export default function AgentSeekersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck2 className="h-6 w-6 text-blue-400" /> House Seekers & Tenant Inquiries
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Tenants seeking rental viewings in Bole & Kazanchis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockSeekers.map((s) => (
          <div key={s.id} className="p-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={s.avatar} alt={s.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-500/30" />
              <div>
                <h3 className="font-bold text-white text-sm">{s.name}</h3>
                <p className="text-xs text-slate-400">Looking in: {s.preferredLocation}</p>
                <p className="text-xs text-blue-400 font-semibold mt-0.5">{s.phone}</p>
              </div>
            </div>
            <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md">
              Respond to Inquiries
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
