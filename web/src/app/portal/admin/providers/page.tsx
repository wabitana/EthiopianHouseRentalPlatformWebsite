"use client";

import { useState } from "react";
import {
  Building,
  Search,
  ShieldCheck,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Eye,
  CheckCircle,
  AlertTriangle,
  X,
  User,
  History,
  ShieldAlert,
} from "lucide-react";
import { mockProviders, ProviderItem, mockProperties } from "@/lib/portal-mock-data";

export default function AdminProvidersPage() {
  const [providers] = useState<ProviderItem[]>(mockProviders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [detailTab, setDetailTab] = useState<"profile" | "personal" | "verification" | "properties" | "activity" | "reports">("profile");

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const providerProperties = selectedProvider
    ? mockProperties.filter((pr) => pr.providerId === selectedProvider.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building className="h-6 w-6 text-emerald-400" /> House Provider Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Dedicated interface for inspecting landlord accounts, property portfolio ownership, and verification documents.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search provider by name, email, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl hover:border-slate-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{provider.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-400" /> {provider.location}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    provider.verificationStatus === "Verified"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : provider.verificationStatus === "Pending"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {provider.verificationStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-700/60 text-xs">
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">Total Properties</span>
                  <span className="text-white font-bold text-sm">{provider.totalProperties}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">Active Listings</span>
                  <span className="text-emerald-400 font-bold text-sm">{provider.activeListings}</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {provider.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {provider.email}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Joined {provider.registrationDate}</span>
              <button
                onClick={() => {
                  setSelectedProvider(provider);
                  setDetailTab("profile");
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" /> Inspect Provider
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Provider Banner */}
            <div className="flex items-center gap-4 border-b border-slate-700 pb-5">
              <img
                src={selectedProvider.avatar}
                alt={selectedProvider.name}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-emerald-500/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedProvider.name}</h2>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                    {selectedProvider.accountStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedProvider.email} • {selectedProvider.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProvider.location}</p>
              </div>
            </div>

            {/* Flow Navigation Tabs: Provider Profile -> Personal Info -> Verification -> Properties -> Activity -> Reports */}
            <div className="flex items-center gap-1 border-b border-slate-700 my-4 overflow-x-auto hide-scrollbar text-xs">
              {[
                { id: "profile", label: "Provider Profile", icon: User },
                { id: "personal", label: "Personal Info", icon: Phone },
                { id: "verification", label: "Verification Info", icon: ShieldCheck },
                { id: "properties", label: `Properties (${providerProperties.length})`, icon: Building2 },
                { id: "activity", label: "Activity Log", icon: History },
                { id: "reports", label: `Reports (${selectedProvider.reportsCount})`, icon: ShieldAlert },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-t-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      detailTab === tab.id
                        ? "bg-slate-700 text-emerald-400 border-b-2 border-emerald-500"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="py-2">
              {detailTab === "profile" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">National ID Number</span>
                      <span className="text-white font-mono font-bold">{selectedProvider.idNumber}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Business License</span>
                      <span className="text-white font-mono font-bold">{selectedProvider.businessLicense || "Individual Landlord"}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Member Since</span>
                      <span className="text-white font-bold">{selectedProvider.registrationDate}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 space-y-2">
                    <h4 className="font-bold text-white">Landlord Overview</h4>
                    <p className="text-slate-300">
                      Primary landlord operating property listings in Bole and Yeka sub-cities. All property title deeds are checked against municipal registry records.
                    </p>
                  </div>
                </div>
              )}

              {detailTab === "personal" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Primary Contact</span>
                    <p className="text-white font-semibold text-sm">{selectedProvider.name}</p>
                    <p className="text-slate-300 mt-1">Phone: {selectedProvider.phone}</p>
                    <p className="text-slate-300">Email: {selectedProvider.email}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Registered Business Address</span>
                    <p className="text-white font-semibold">{selectedProvider.location}</p>
                  </div>
                </div>
              )}

              {detailTab === "verification" && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">Verification Status: {selectedProvider.verificationStatus}</p>
                      <p className="text-slate-400 text-[11px]">Sub-City Land Registry Verification</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/30">
                      Verified Title Holder
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">Uploaded Ownership Documents:</p>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                      <span className="text-white">National ID Card Scan (Kebele Stamp)</span>
                      <span className="text-emerald-400 font-bold">Verified</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                      <span className="text-white">Land Ownership Title Deed #ET-99218</span>
                      <span className="text-emerald-400 font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === "properties" && (
                <div className="space-y-3">
                  {providerProperties.length > 0 ? (
                    providerProperties.map((pr) => (
                      <div key={pr.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={pr.images[0]} alt={pr.title} className="h-10 w-14 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-white">{pr.title}</p>
                            <p className="text-slate-400">{pr.location} • ETB {pr.price.toLocaleString()}/mo</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 rounded-md font-bold">
                          {pr.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs py-4 text-center">No active properties listed under this provider.</p>
                  )}
                </div>
              )}

              {detailTab === "activity" && (
                <div className="space-y-2 text-xs">
                  {selectedProvider.recentActivity.map((act) => (
                    <div key={act.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                      <span className="text-white font-medium">{act.action}</span>
                      <span className="text-slate-400 text-[10px]">{act.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === "reports" && (
                <div className="space-y-2 text-xs">
                  {selectedProvider.reportsCount > 0 ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
                      <p className="font-bold text-rose-200">Warning: Active Report Pending</p>
                      <p className="mt-1">Inquiry raised regarding property pricing agreement on file.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-center font-bold">
                      ✓ No reports or fraud complaints recorded against this provider.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
