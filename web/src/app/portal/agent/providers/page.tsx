"use client";

import { useState, useEffect } from "react";
import { Building, Phone, Mail, MapPin, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";

const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function AgentProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadProviders() {
      try {
        setLoading(true);
        const data = await apiFetch("/agent/providers");
        setProviders(data || []);
      } catch (err) {
        console.error("Failed to load providers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, []);

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Building className="h-6 w-6 text-blue-400" /> House Providers (Landlords)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Registered landlords and property owners operating across assigned territories.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search landlord name, email, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProviders.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-slate-800/80 rounded-2xl border border-slate-700 text-slate-400 text-xs">
            No house providers registered in database yet.
          </div>
        ) : (
          filteredProviders.map((p) => (
            <div key={p.id} className="p-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {p.avatarUrl ? (
                  <img src={resolveImageUrl(p.avatarUrl)} alt={p.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-500/30" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-blue-600 font-extrabold text-white flex items-center justify-center text-sm ring-2 ring-blue-500/30 shadow-md">
                    {p.name ? p.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'LP'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.city || 'Addis Ababa'}</p>
                  <p className="text-xs text-blue-400 font-semibold mt-0.5">{p.phone || p.email}</p>
                  {p.properties && p.properties.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">{p.properties.length} Properties Listed</span>
                  )}
                </div>
              </div>
              <a
                href={`tel:${p.phone || ''}`}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Contact Landlord
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
