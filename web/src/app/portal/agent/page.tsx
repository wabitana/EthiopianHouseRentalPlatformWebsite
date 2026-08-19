"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckSquare,
  Clock,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  AlertCircle,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const resolveImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function AgentDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [profData, verifData, tasksData] = await Promise.all([
          apiFetch("/agent/profile").catch(() => null),
          apiFetch("/verification/admin/pending").catch(() => ({ identityDocs: [], propertyDocs: [] })),
          apiFetch("/agent/tasks").catch(() => []),
        ]);

        setProfile(profData);

        const propItems = (verifData.propertyDocs || []).map((d: any) => ({
          id: d.id,
          title: d.property?.title || 'Property Verification',
          providerName: d.property?.providerName || 'Landlord',
          location: d.property ? `${d.property.city}, ${d.property.area}` : 'Addis Ababa',
          image: resolveImageUrl(d.docUrl),
        }));

        const idItems = (verifData.identityDocs || []).map((d: any) => ({
          id: d.id,
          title: `Identity: ${d.user?.name || 'User Profile'}`,
          providerName: d.user?.name || 'Applicant',
          location: d.idType || 'National ID',
          image: resolveImageUrl(d.documentUrl),
        }));

        setPendingVerifications([...propItems, ...idItems]);
        setActiveTasks(tasksData || []);
      } catch (err) {
        console.error("Failed to load agent dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const kpiCards = [
    {
      title: "Assigned Properties",
      value: profile ? String(profile.propertiesManaged || 0) : "0",
      subtitle: profile?.assignedArea || "Addis Ababa Territory",
      icon: Building2,
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    },
    {
      title: "Pending Verifications",
      value: String(pendingVerifications.length),
      subtitle: "Document Reviews Queued",
      icon: ShieldCheck,
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Verifications Completed",
      value: profile ? String(profile.verificationsCompleted || 0) : "0",
      subtitle: "Total Approved / Reviewed",
      icon: CheckSquare,
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Active Tasks",
      value: String(activeTasks.filter((t) => t.status !== 'Completed').length),
      subtitle: "Inspections Pending",
      icon: Clock,
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-800 to-slate-850 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Selam, {profile?.name || "Agent"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Here is your daily field summary for <span className="text-blue-400 font-semibold">{profile?.assignedArea || "Assigned"}</span> territories.
          </p>
        </div>

        <Link
          href="/portal/agent/add-property"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Add New Property Listing
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border bg-slate-800/80 backdrop-blur-sm shadow-lg flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                <p className="text-xs text-slate-400 mt-1 font-medium">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Queue & Today's Tasks Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue Widget */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                Verification Queue
              </h3>
              <p className="text-xs text-slate-400">Listings assigned to you for inspection</p>
            </div>
            <Link
              href="/portal/agent/verification"
              className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              Workspace <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingVerifications.length === 0 ? (
              <div className="p-4 bg-slate-900/60 rounded-xl text-center text-xs text-slate-400">
                No pending verifications in queue.
              </div>
            ) : (
              pendingVerifications.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between text-xs hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={v.image} alt={v.title} className="h-10 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{v.title}</p>
                      <p className="text-[11px] text-slate-400">{v.providerName} • {v.location}</p>
                    </div>
                  </div>
                  <Link
                    href="/portal/agent/verification"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] shadow-sm"
                  >
                    Verify
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Tasks Widget */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-400" />
                Today's Active Tasks
              </h3>
              <p className="text-xs text-slate-400">Site visits, photoshoot schedules & provider follow-ups</p>
            </div>
            <Link
              href="/portal/agent/tasks"
              className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              All Tasks <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeTasks.length === 0 ? (
              <div className="p-4 bg-slate-900/60 rounded-xl text-center text-xs text-slate-400">
                No active tasks assigned today.
              </div>
            ) : (
              activeTasks.slice(0, 3).map((tsk) => (
                <div
                  key={tsk.id}
                  className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                          tsk.priority === "High" ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {tsk.priority || 'Normal'} Priority
                      </span>
                      <span className="text-[10px] text-slate-400">Due {tsk.dueDate ? new Date(tsk.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p className="font-bold text-white mt-1">{tsk.title}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-md text-[10px]">
                    {tsk.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assisted Rural & Offline Services Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-800 to-emerald-950/80 border border-blue-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-500/30">
              Rural & Non-Smartphone Services
            </span>
            <span className="text-xs text-emerald-400 font-bold">14 Citizens Assisted This Month</span>
          </div>
          <h3 className="text-lg font-bold text-white">Assisted Rural Rental & Direct Matching Hub</h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Help citizens in rural areas without smartphones or internet access find homes, rent directly from verified landlords, collect cash/mobile payments, print lease contracts, and send SMS alerts to feature phones.
          </p>
        </div>

        <Link
          href="/portal/agent/assisted-rentals"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          Open Assisted Rural Hub <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Assigned Territory & Location Summary */}
      <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-400" />
          Assigned Territory Summary (Addis Ababa Sub-Cities)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Primary Sub-City</span>
            <p className="text-white font-bold text-sm">Bole (Medhanialem & Atlas)</p>
            <p className="text-blue-400 text-[11px] font-semibold mt-1">28 Active Properties</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Secondary Sub-City</span>
            <p className="text-white font-bold text-sm">Kirkos (Kazanchis & Guinea Con)</p>
            <p className="text-blue-400 text-[11px] font-semibold mt-1">14 Active Properties</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Active Landlords Assisted</span>
            <p className="text-white font-bold text-sm">18 House Providers</p>
            <p className="text-emerald-400 text-[11px] font-semibold mt-1">100% Response Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
