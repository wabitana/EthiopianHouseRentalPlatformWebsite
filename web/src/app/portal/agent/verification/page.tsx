"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Save,
  Check,
  FileText,
  MapPin,
  Building2,
  User,
  Image as ImageIcon,
  Sparkles,
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
    status: d.status === 'VERIFIED' ? 'Approved' : d.status === 'REJECTED' ? 'Rejected' : d.status === 'UNDER_REVIEW' ? 'In Review' : 'Pending',
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

export default function AgentVerificationWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"Pending" | "In Review" | "Approved" | "Rejected">("Pending");
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({
    idMatch: true,
    titleDeedValid: true,
    siteVisitCompleted: true,
    priceValidated: true,
  });
  const [agentNotes, setAgentNotes] = useState("");
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  async function loadPendingVerifications() {
    try {
      setLoading(true);
      const data = await apiFetch("/verification/admin/pending");
      const list = (data.propertyDocs || []).map(mapBackendPropertyDoc);
      setVerifications(list);
      if (list.length > 0) {
        setSelectedItem(list[0]);
        setAgentNotes(list[0].notes || "");
      }
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const filteredItems = verifications.filter((v) => v.status === activeTab);

  const handleUpdateStatus = async (newStatus: VerificationItem["status"]) => {
    if (!selectedItem) return;
    try {
      const apiStatus = newStatus === 'Approved' ? 'VERIFIED' : newStatus === 'Rejected' ? 'REJECTED' : 'UNDER_REVIEW';
      await apiFetch(`/verification/property-license/${selectedItem.id}/review`, {
        method: "PATCH",
        body: { status: apiStatus, adminNotes: agentNotes }
      });

      setVerifications((prev) =>
        prev.map((v) => (v.id === selectedItem.id ? { ...v, status: newStatus, notes: agentNotes } : v))
      );
      setSelectedItem((prev) => (prev ? { ...prev, status: newStatus, notes: agentNotes } : null));
      setStatusBanner(`Verification updated to: ${newStatus}`);
      setTimeout(() => setStatusBanner(null), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-blue-400" /> Agent Verification Workspace
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Perform field inspections, review document authenticity, and execute verification approvals.
          </p>
        </div>

        {statusBanner && (
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/40 animate-bounce">
            ✓ {statusBanner}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 text-xs">
        {(["Pending", "In Review", "Approved", "Rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              const firstMatch = verifications.find((v) => v.status === tab);
              if (firstMatch) setSelectedItem(firstMatch);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Split Workspace View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {activeTab} Queue ({filteredItems.length})
          </h3>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setAgentNotes(item.notes || "");
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                  selectedItem?.id === item.id
                    ? "bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/30"
                    : "bg-slate-800/90 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={item.propertyImage} alt={item.propertyTitle} className="h-12 w-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-xs truncate">{item.propertyTitle}</p>
                    <p className="text-[10px] text-slate-400">{item.location}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">{item.providerName}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-400 p-4 bg-slate-800/60 rounded-xl border border-slate-700 text-center">
              No verification items currently in {activeTab} stage.
            </p>
          )}
        </div>

        {/* Right Side: Detailed Inspection Workspace */}
        {selectedItem ? (
          <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-700 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  Inspection Workspace • #{selectedItem.id}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedItem.propertyTitle}</h2>
                <p className="text-xs text-slate-400">{selectedItem.location} • Submitted {selectedItem.submittedDate}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-lg border border-emerald-500/30">
                AI Score: {selectedItem.aiPreCheckScore}/100
              </span>
            </div>

            {/* Landlord & Property Quick Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center gap-3">
                <User className="h-5 w-5 text-blue-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Landlord Info</span>
                  <p className="font-bold text-white">{selectedItem.providerName}</p>
                  <p className="text-slate-400">{selectedItem.providerPhone}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Sub-City Location</span>
                  <p className="font-bold text-white">{selectedItem.location}</p>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Field Verification Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.idMatch}
                    onChange={(e) => setChecklist({ ...checklist, idMatch: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded bg-slate-900"
                  />
                  <span className="text-slate-200">Kebele ID & Name Match</span>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.titleDeedValid}
                    onChange={(e) => setChecklist({ ...checklist, titleDeedValid: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded bg-slate-900"
                  />
                  <span className="text-slate-200">Land Title Deed Stamp Valid</span>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.siteVisitCompleted}
                    onChange={(e) => setChecklist({ ...checklist, siteVisitCompleted: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded bg-slate-900"
                  />
                  <span className="text-slate-200">Physical Site Visit Completed</span>
                </label>
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.priceValidated}
                    onChange={(e) => setChecklist({ ...checklist, priceValidated: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded bg-slate-900"
                  />
                  <span className="text-slate-200">Rental Price Validated</span>
                </label>
              </div>
            </div>

            {/* Document Previews */}
            <div className="space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Submitted Document Scans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedItem.documents.map((doc, idx) => (
                  <div key={idx} className="bg-slate-900 rounded-xl border border-slate-700 p-2.5 space-y-1.5">
                    <img src={doc.preview} alt={doc.title} className="h-28 w-full object-cover rounded-lg" />
                    <p className="font-bold text-white text-[11px] line-clamp-1">{doc.title}</p>
                    <span className="text-[9px] text-slate-400 uppercase">{doc.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Agent Field Inspection Notes</label>
              <textarea
                rows={3}
                value={agentNotes}
                onChange={(e) => setAgentNotes(e.target.value)}
                placeholder="Enter field notes, site inspection remarks..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons: Approve, Reject, Request Information, Save Draft */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setStatusBanner("Draft notes saved locally");
                  setTimeout(() => setStatusBanner(null), 3000);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
              >
                <Save className="h-4 w-4" /> Save Draft
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus("Approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus("Rejected")}
                  className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus("In Review")}
                  className="px-4 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="h-4 w-4" /> Request Info
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-12 text-center text-slate-400">
            Select a property verification item to start inspection.
          </div>
        )}
      </div>
    </div>
  );
}
