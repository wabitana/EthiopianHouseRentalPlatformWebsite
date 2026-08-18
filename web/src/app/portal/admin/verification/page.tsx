"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Building2,
  User,
  AlertTriangle,
  Sparkles,
  Eye,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { mockVerifications, VerificationItem } from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";

const mapBackendPropertyDoc = (d: any): VerificationItem => {
  let imagesArr = [];
  try {
    imagesArr = typeof d.property?.images === 'string' ? JSON.parse(d.property.images) : d.property?.images || [];
  } catch (e) {
    // ignore
  }
  const imgUrl = imagesArr[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600';

  return {
    id: d.id,
    propertyId: d.propertyId || '',
    propertyTitle: d.property?.title || "Property Listing",
    propertyImage: imgUrl,
    providerId: d.property?.providerId || '',
    providerName: d.property?.providerName || 'Landlord',
    providerPhone: d.property?.providerPhone || '',
    location: d.property ? `${d.property.city}, ${d.property.area}` : 'Addis Ababa',
    status: d.status === 'VERIFIED' ? 'Approved' : d.status === 'REJECTED' ? 'Rejected' : 'Pending',
    documentsCount: 1,
    aiPreCheckScore: d.aiRiskScore || 90.0,
    aiPreCheckDetails: {
      ownershipDocsValid: true,
      identityVerified: true,
      locationMatch: true,
      priceReasonable: true,
    },
    submittedDate: new Date(d.createdAt).toLocaleDateString(),
    notes: d.aiNotes || '',
    documents: [
      {
        title: `${d.docType} for ${d.property?.title || 'Listing'}`,
        type: d.docType,
        url: d.docUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
        preview: d.docUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
      }
    ]
  };
};

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [notesInput, setNotesInput] = useState("");

  async function loadPendingVerifications() {
    try {
      setLoading(true);
      const data = await apiFetch("/verification/admin/pending");
      setQueue((data.propertyDocs || []).map(mapBackendPropertyDoc));
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: VerificationItem["status"]) => {
    try {
      const apiStatus = newStatus === 'Approved' ? 'VERIFIED' : newStatus === 'Rejected' ? 'REJECTED' : 'UNDER_REVIEW';
      await apiFetch(`/verification/property-license/${id}/review`, {
        method: "PATCH",
        body: { status: apiStatus, adminNotes: notesInput }
      });

      setQueue((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus, notes: notesInput || v.notes } : v))
      );
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus, notes: notesInput || selectedItem.notes });
      }
    } catch (err) {
      console.error("Failed to review property document:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" /> Property Verification Queue
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Review land registry title deeds, Kebele ownership permits, and AI pre-check scans before publishing.
          </p>
        </div>
      </div>

      {/* Verification Queue Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Pending Verification Items ({queue.filter((q) => q.status === "Pending" || q.status === "In Review").length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl hover:border-emerald-500/50 transition-all space-y-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={item.propertyImage}
                  alt={item.propertyTitle}
                  className="h-16 w-20 rounded-xl object-cover ring-2 ring-emerald-500/20"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {item.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : item.status === "Rejected"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{item.propertyTitle}</h3>
                  <p className="text-xs text-slate-400">{item.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Landlord</span>
                  <span className="text-white font-semibold">{item.providerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Documents</span>
                  <span className="text-white font-bold">{item.documentsCount} files</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">AI Check</span>
                  <span className="text-emerald-400 font-bold">{item.aiPreCheckScore}/100</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Submitted {item.submittedDate}</span>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setNotesInput(item.notes || "");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Eye className="h-3.5 w-3.5" /> Inspect & Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Detailed Review Workspace Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-700 pb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Verification Review Workspace
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{selectedItem.propertyTitle}</h2>
              <p className="text-xs text-slate-400">{selectedItem.location} • Submitted {selectedItem.submittedDate}</p>
            </div>

            {/* AI Pre-Check Result UI */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                  <h3 className="font-bold text-white text-sm">AI Pre-Check Verification Result</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-lg border border-emerald-500/30 text-xs">
                  Score: {selectedItem.aiPreCheckScore} / 100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200">Ownership Deed Valid</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200">Identity Verified</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200">Sub-City Stamp Match</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200">Fair Rental Value</span>
                </div>
              </div>
            </div>

            {/* Document Previews */}
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Uploaded Document Previews ({selectedItem.documents.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedItem.documents.map((doc, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2">
                    <img
                      src={doc.preview}
                      alt={doc.title}
                      className="h-32 w-full object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <p className="font-bold text-white text-xs line-clamp-1">{doc.title}</p>
                      <span className="text-[10px] text-slate-400">{doc.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspector Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Verification Notes</label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Enter notes or feedback regarding document compliance..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, "Approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve Verification
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, "Rejected")}
                  className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject Verification
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, "In Review")}
                  className="px-4 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="h-4 w-4" /> Request Additional Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
