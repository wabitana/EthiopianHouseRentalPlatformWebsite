"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import { mockReports, ReportItem } from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";

const mapBackendReport = (r: any): ReportItem => ({
  id: r.id,
  reporterName: r.reporter?.name || "Anonymous Seeker",
  reporterEmail: r.reporter?.email || "",
  reportedEntityId: r.propertyId || "",
  reportedEntityName: r.property?.title || "Property Listing",
  reportedEntityType: "Property",
  reason: r.reason,
  dateSubmitted: new Date(r.createdAt).toLocaleDateString(),
  status: "Pending",
  description: r.details || "No details provided.",
  evidenceUrls: [],
});

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/reports");
      setReports(data.map(mapBackendReport));
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ReportItem["status"]) => {
    try {
      const action = newStatus === "Dismissed" ? "dismiss" : "delete_property";
      await apiFetch(`/admin/reports/${id}/resolve`, {
        method: "PATCH",
        body: { action }
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      setSelectedReport(null);
    } catch (err) {
      console.error("Failed to resolve report:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-rose-400" /> Platform Reports & Moderation
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Review user-flagged fraud complaints, inaccurate property specs, and terms violations.
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">Report ID</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Reported Entity</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-white">{report.id}</td>
                  <td className="p-4 font-medium text-white">{report.reporterName}</td>
                  <td className="p-4 text-slate-300">
                    <span className="font-semibold text-white">{report.reportedEntityName}</span>
                    <span className="text-[10px] text-slate-400 block">({report.reportedEntityType})</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {report.reason}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{report.dateSubmitted}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        report.status === "Action Taken"
                          ? "bg-rose-500/20 text-rose-400"
                          : report.status === "Dismissed"
                          ? "bg-slate-700 text-slate-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-700 pb-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Report #{selectedReport.id}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{selectedReport.reason}</h3>
              <p className="text-xs text-slate-400">Date: {selectedReport.dateSubmitted}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Reporter Details</span>
                <p className="text-white font-semibold">{selectedReport.reporterName} ({selectedReport.reporterEmail})</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Reported Entity</span>
                <p className="text-white font-semibold">{selectedReport.reportedEntityName} [{selectedReport.reportedEntityType}]</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-400 block text-[10px]">Description & Evidence</span>
                <p className="text-slate-200">{selectedReport.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-700">
              <button
                onClick={() => handleUpdateStatus(selectedReport.id, "Dismissed")}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Dismiss Report
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReport.id, "Action Taken")}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Take Action / Suspend Entity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
