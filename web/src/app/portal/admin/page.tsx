"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Filter,
} from "lucide-react";
import { mockAnalyticsData, mockProperties, mockVerifications } from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "6m" | "1y">("6m");
  const [data, setData] = useState(mockAnalyticsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const kpis = await apiFetch("/admin/analytics/kpis");
        setData((prev) => ({
          ...prev,
          ...kpis,
        }));
      } catch (err) {
        console.error("Failed to load admin dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // KPI card array configuration
  const kpiCards = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      subtitle: `${data.houseSeekers.toLocaleString()} Seekers • ${data.houseProviders.toLocaleString()} Providers`,
      icon: Users,
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
      trend: "+12.4% this month",
    },
    {
      title: "Total Properties",
      value: data.totalProperties.toLocaleString(),
      subtitle: `${data.activeProperties.toLocaleString()} Active • ${data.pendingProperties.toLocaleString()} Pending`,
      icon: Building2,
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
      trend: "+8.2% new listings",
    },
    {
      title: "Pending Verifications",
      value: data.pendingVerifications.toString(),
      subtitle: `${data.verifiedProperties.toLocaleString()} Total Verified`,
      icon: ShieldCheck,
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
      trend: "Requires Agent Action",
      urgent: true,
    },
    {
      title: "Active Agents",
      value: `${data.activeAgents} / ${data.totalAgents}`,
      subtitle: "Operating across 10 Sub-Cities",
      icon: UserCheck,
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
      trend: "98% Avg Efficiency",
    },
    {
      title: "Platform Revenue",
      value: `ETB ${(data.revenueETB / 1000000).toFixed(2)}M`,
      subtitle: "Gross Transaction Commission",
      icon: DollarSign,
      color: "from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400",
      trend: "+15.8% vs last quarter",
    },
    {
      title: "Pending Reports",
      value: data.pendingReports.toString(),
      subtitle: "User & Fraud Complaints",
      icon: AlertTriangle,
      color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
      trend: "High Priority Review",
      urgent: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-800 to-slate-850 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Admin Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time status of Ethiopian House Rental platform registrations, property verifications, and agent performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-2" />
            {(["7d", "30d", "6m", "1y"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                  timeFilter === t
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border bg-slate-800/80 backdrop-blur-sm shadow-lg hover:border-slate-500 transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 ${kpi.color.split(" ").pop()}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {kpi.value}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{kpi.subtitle}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <span className={`font-semibold flex items-center gap-1 ${kpi.urgent ? "text-rose-400" : "text-emerald-400"}`}>
                  <TrendingUp className="h-3 w-3" />
                  {kpi.trend}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row 1: Registrations & Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Chart */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                User Registrations Over Time
              </h3>
              <p className="text-xs text-slate-400">House Seekers vs House Providers (Monthly)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Seekers
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Providers
              </span>
            </div>
          </div>

          {/* Custom SVG Bar/Line Chart */}
          <div className="h-64 w-full pt-4 flex items-end justify-between gap-3 border-b border-slate-700 pb-2">
            {data.registrationsChart.map((item, idx) => {
              const maxSeekers = 1500;
              const seekerPct = (item.seekers / maxSeekers) * 100;
              const providerPct = (item.providers / maxSeekers) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {item.seekers}
                  </div>
                  <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-44 bg-slate-900/60 rounded-xl p-1">
                    <div
                      style={{ height: `${seekerPct}%` }}
                      className="w-full bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                      title={`Seekers: ${item.seekers}`}
                    />
                    <div
                      style={{ height: `${providerPct}%` }}
                      className="w-full bg-blue-500 rounded-t-md transition-all group-hover:bg-blue-400 shadow-lg shadow-blue-500/20"
                      title={`Providers: ${item.providers}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Overview Chart */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Platform Revenue Overview (ETB)
              </h3>
              <p className="text-xs text-slate-400">Commission & Service Fees Growth</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ETB 4.85M Total
            </span>
          </div>

          <div className="h-64 w-full pt-4 flex items-end justify-between gap-4 border-b border-slate-700 pb-2">
            {data.revenueChart.map((item, idx) => {
              const maxRev = 5000000;
              const pct = (item.value / maxRev) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {(item.value / 1000000).toFixed(1)}M
                  </span>
                  <div className="w-full bg-slate-900/60 rounded-xl p-1.5 h-44 flex items-end">
                    <div
                      style={{ height: `${pct}%` }}
                      className="w-full bg-gradient-to-t from-teal-600 to-emerald-400 rounded-lg group-hover:from-teal-500 group-hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics Row 2: Location Breakdown & Property Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Active Locations in Addis Ababa & Ethiopian Regions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Most Active Locations (Sub-Cities & Regions)
              </h3>
              <p className="text-xs text-slate-400">Listing distribution across Addis Ababa & regional hubs</p>
            </div>
            <Link
              href="/portal/admin/properties"
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              View Property Map
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {data.locationBreakdown.map((loc, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-white font-semibold">{loc.location}</span>
                  <span className="text-slate-400">
                    <strong className="text-emerald-400">{loc.count.toLocaleString()}</strong> listings ({loc.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    style={{ width: `${loc.percentage}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Property Status Distribution</h3>
          <p className="text-xs text-slate-400">Breakdown of 3,284 listings</p>

          <div className="space-y-3 pt-2">
            {data.propertyStatusDistribution.map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="text-xs font-semibold text-white">{st.status}</span>
                </div>
                <span className="text-xs font-bold text-slate-200">{st.count.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/portal/admin/verification"
              className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Go to Verification Queue ({data.pendingVerifications})
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Tables: Pending Verifications Quick Action Queue */}
      <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Pending Property Verification Queue</h3>
            <p className="text-xs text-slate-400">Listings awaiting document approval and agent sign-off</p>
          </div>
          <Link
            href="/portal/admin/verification"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Manage Queue <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Property</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Location</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">AI Score</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {mockVerifications.map((v) => (
                <tr key={v.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="p-3 font-semibold text-white flex items-center gap-2.5">
                    <img
                      src={v.propertyImage}
                      alt={v.propertyTitle}
                      className="h-9 w-12 rounded-lg object-cover"
                    />
                    <span className="line-clamp-1">{v.propertyTitle}</span>
                  </td>
                  <td className="p-3">{v.providerName}</td>
                  <td className="p-3 text-slate-400">{v.location}</td>
                  <td className="p-3 text-slate-400">{v.submittedDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {v.aiPreCheckScore}/100 Match
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href="/portal/admin/verification"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors inline-block"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
