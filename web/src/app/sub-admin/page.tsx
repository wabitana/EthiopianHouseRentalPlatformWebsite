"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Eye,
  MapPin,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface PropertyItem {
  id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  city: string;
  neighborhood: string;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  has3DWalkthrough: boolean;
  status: string;
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  verifiedBySubAdmin?: { name: string; assignedRegion: string } | null;
  createdAt: string;
}

export default function SubAdminDashboardPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sub-Admin Region State
  const assignedRegion = "Addis Ababa - Bole & Kazanchis Region";
  const subAdminName = "Solomon Tadesse (Bole Inspector)";

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sub-admin/listings?status=${filterStatus}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error("Failed to fetch sub-admin listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filterStatus]);

  const handleVerifyProperty = async (propertyId: string, status: "APPROVED" | "REJECTED") => {
    setSubmittingAction(true);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/sub-admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          status,
          notes: inspectionNotes || `Sub-Admin physical site inspection set to ${status}`,
          subAdminName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Property successfully marked as ${status}!`);
        setSelectedProperty(null);
        setInspectionNotes("");
        fetchListings();
      } else {
        alert(data.error || "Action failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const pendingProperties = properties.filter((p) => p.status === "PENDING");
  const approvedProperties = properties.filter((p) => p.status === "APPROVED");
  const rejectedProperties = properties.filter((p) => p.status === "REJECTED");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-800 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Regional Sub-Admin Workspace
              </span>
              <span className="text-xs text-slate-400">{assignedRegion}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Property Verification & Moderation Desk
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Logged in as <strong className="text-emerald-400">{subAdminName}</strong>. Inspect physical property photos, verify title deeds, and approve listings for public rental.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchListings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" /> Refresh Queue
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all"
            >
              View Public Website →
            </a>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between">
          <span>✅ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{pendingProperties.length}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting local physical inspection</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Active</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{approvedProperties.length}</p>
          <p className="text-xs text-slate-400 mt-1">Live on public Ethiopian catalog</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rejected Submissions</span>
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{rejectedProperties.length}</p>
          <p className="text-xs text-slate-400 mt-1">Incomplete documentation or photos</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Landlords</span>
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">14</p>
          <p className="text-xs text-slate-400 mt-1">National ID & Ownership verified</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          {[
            { id: "ALL", label: `All Properties (${properties.length})` },
            { id: "PENDING", label: `Pending Queue (${pendingProperties.length})` },
            { id: "APPROVED", label: `Approved (${approvedProperties.length})` },
            { id: "REJECTED", label: `Rejected (${rejectedProperties.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Region: <span className="text-emerald-400 font-semibold">{assignedRegion}</span>
        </div>
      </div>

      {/* Main Property Verification Table */}
      <div className="max-w-7xl mx-auto bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl mb-12">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" /> Sub-Admin Inspection & Verification Queue
          </h2>
          <span className="text-xs text-slate-400">Click any row to inspect & approve/reject</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading regional property queue...
          </div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No properties found matching filter &quot;{filterStatus}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Property & Location</th>
                  <th className="px-6 py-4">Landlord Info</th>
                  <th className="px-6 py-4">Monthly Rent (ETB)</th>
                  <th className="px-6 py-4">Specs & 3D</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-slate-750/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base mb-1">{property.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {property.neighborhood}, {property.city}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-slate-200">{property.landlordName}</div>
                      <div className="text-slate-400">{property.landlordPhone}</div>
                      <div className="text-slate-500">{property.landlordEmail}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-extrabold text-emerald-400 text-base">
                        {property.price.toLocaleString()} ETB
                      </div>
                      <div className="text-[11px] text-slate-400">Deposit: {property.deposit.toLocaleString()} ETB</div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="text-slate-300">
                        {property.bedrooms} Beds • {property.bathrooms} Baths • {property.areaSqm} m²
                      </div>
                      {property.has3DWalkthrough ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Sparkles className="w-3 h-3 text-amber-400" /> 3D Tour Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Standard Photos</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {property.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Approved
                        </span>
                      )}
                      {property.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Inspection Pending
                        </span>
                      )}
                      {property.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-500/40">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" /> Rejected
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProperty(property);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Property Inspection Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-400">Sub-Admin Property Inspection Desk</span>
                <h3 className="text-xl font-extrabold text-white mt-1">{selectedProperty.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">Location & Specs</span>
                <div className="font-bold text-white text-sm">{selectedProperty.neighborhood}, {selectedProperty.city}</div>
                <div className="text-slate-300 mt-1">
                  {selectedProperty.bedrooms} Bedrooms • {selectedProperty.bathrooms} Baths • {selectedProperty.areaSqm} m²
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-1">Financial Terms (ETB)</span>
                <div className="font-extrabold text-emerald-400 text-base">
                  {selectedProperty.price.toLocaleString()} ETB / Month
                </div>
                <div className="text-slate-300 mt-1">
                  Required Escrow Deposit: {selectedProperty.deposit.toLocaleString()} ETB
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 sm:col-span-2">
                <span className="text-slate-400 block mb-1">Landlord & Ownership Submission</span>
                <div className="font-bold text-white">{selectedProperty.landlordName}</div>
                <div className="text-slate-300">Phone: {selectedProperty.landlordPhone} • Email: {selectedProperty.landlordEmail}</div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Physical Inspection Checklist</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Title Deed & Land Registry document matches address.
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Physical site walkthrough conducted by Sub-Admin inspector.
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Water meter, electricity connection, & security verified.
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Sub-Admin Inspector Verification Notes:
              </label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Enter site verification notes, document check details, or reason for rejection..."
                className="w-full h-24 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                disabled={submittingAction}
                onClick={() => handleVerifyProperty(selectedProperty.id, "REJECTED")}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                Reject Listing
              </button>
              <button
                disabled={submittingAction}
                onClick={() => handleVerifyProperty(selectedProperty.id, "APPROVED")}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
              >
                {submittingAction ? "Verifying..." : "Approve Listing for Public Website"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
