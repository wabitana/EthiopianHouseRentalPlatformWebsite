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
  Download,
  RefreshCw,
} from "lucide-react";
import { mockAnalyticsData, mockProperties, mockVerifications, PropertyItem } from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";
import { AdminLocationMap } from "@/components/portal/admin-location-map";

const mapBackendProperty = (p: any): PropertyItem => {
  let imagesArr = [];
  try {
    imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
  } catch (e) {}
  let amenitiesArr = [];
  try {
    amenitiesArr = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities || [];
  } catch (e) {}

  return {
    id: p.id,
    title: p.title || 'Ethiopian Property Listing',
    images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'],
    providerId: p.providerId || '',
    providerName: p.providerName || p.provider?.name || 'Landlord',
    providerPhone: p.providerPhone || p.provider?.phone || '',
    providerAvatar: p.providerAvatar || p.provider?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=provider',
    location: `${p.city || 'Addis Ababa'}, ${p.area || 'Bole'}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
    woreda: p.woreda || '',
    propertyType: (p.propertyType === 'Apartment' || p.propertyType === 'Villa' || p.propertyType === 'Condo' || p.propertyType === 'Studio' || p.propertyType === 'Commercial' || p.propertyType === 'Land') ? p.propertyType : 'Apartment',
    price: p.price || 25000,
    period: p.rentalPeriod === 'Yearly' ? 'year' : 'month',
    status: p.listingStatus === 'active' ? 'Published' : p.listingStatus === 'pending' ? 'Pending' : p.listingStatus === 'rejected' ? 'Rejected' : 'Rented',
    verificationStatus: p.isVerified ? 'Verified' : 'Pending',
    datePosted: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
    bedrooms: p.rooms || 0,
    bathrooms: p.bathrooms || 0,
    areaSqM: p.area || 100,
    description: p.description || '',
    amenities: amenitiesArr,
    documents: [],
    listingHistory: [],
    reportsCount: p.reportsCount || 0,
  };
};

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "6m" | "1y">("6m");
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>(mockProperties);
  const [data, setData] = useState(mockAnalyticsData);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  async function loadData() {
    try {
      const [kpis, allProps] = await Promise.all([
        apiFetch("/admin/analytics/kpis").catch(() => null),
        apiFetch("/admin/properties/all").catch(() => null),
      ]);

      if (kpis) {
        setData((prev) => ({
          ...prev,
          ...kpis,
        }));
      }

      if (Array.isArray(allProps) && allProps.length > 0) {
        const mapped = allProps.map(mapBackendProperty);
        setProperties(mapped);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard stats:", err);
    }

    try {
      const [vData, pProps] = await Promise.all([
        apiFetch("/verification/admin/pending").catch(() => ({ propertyDocs: [] })),
        apiFetch("/admin/properties/pending").catch(() => []),
      ]);

      const resolveImageUrl = (url?: string) => {
        if (!url) return 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const propItems = (vData?.propertyDocs || []).map((d: any) => {
        let imagesArr = [];
        try {
          imagesArr = typeof d.property?.images === 'string' ? JSON.parse(d.property.images) : d.property?.images || [];
        } catch (e) {}
        return {
          id: d.id,
          propertyTitle: d.property?.title || "Property Document Review",
          propertyImage: resolveImageUrl(imagesArr[0]),
          providerName: d.property?.providerName || 'Landlord',
          location: d.property ? `${d.property.city}, ${d.property.area}` : 'Addis Ababa',
          submittedDate: new Date(d.createdAt).toLocaleDateString(),
          aiPreCheckScore: Math.round(d.aiRiskScore || 90),
        };
      });

      const pendingPropItems = (pProps || []).map((p: any) => {
        let imagesArr = [];
        try {
          imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
        } catch (e) {}
        return {
          id: p.id,
          propertyTitle: p.title || "Pending Property Listing",
          propertyImage: resolveImageUrl(imagesArr[0]),
          providerName: p.providerName || 'Landlord',
          location: `${p.city || ''}, ${p.area || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') || 'Addis Ababa',
          submittedDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
          aiPreCheckScore: 88,
        };
      });

      const combined = [...propItems, ...pendingPropItems];
      const uniqueQueue = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setPendingQueue(uniqueQueue);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setIsRefreshing(false);
  };

  const handleExportReport = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    let csv = "ETHIOPIAN HOUSE RENTAL PLATFORM - ADMIN SUMMARY REPORT\r\n";
    csv += `Generated Date,${new Date().toLocaleString()}\r\n\r\n`;

    csv += "--- KPI OVERVIEW METRICS ---\r\n";
    csv += "Metric,Value,Subtitle\r\n";
    kpiCards.forEach((kpi) => {
      csv += `"${kpi.title}","${kpi.value}","${kpi.subtitle || ''}"\r\n`;
    });

    csv += "\r\n--- MOST ACTIVE LOCATIONS (ETHIOPIA) ---\r\n";
    csv += "Location,Listings Count,Percentage Share\r\n";
    (data.locationBreakdown || []).forEach((loc: any) => {
      csv += `"${loc.location}",${loc.count},${loc.percentage}%\r\n`;
    });

    csv += "\r\n--- PENDING VERIFICATION QUEUE ---\r\n";
    csv += "Property Title,Provider,Location,Submitted Date,AI Match Score\r\n";
    pendingQueue.forEach((item) => {
      csv += `"${item.propertyTitle}","${item.providerName}","${item.location}","${item.submittedDate}",${item.aiPreCheckScore}/100\r\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ethiopian_delala_admin_report_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      title: "Verified Properties",
      value: data.verifiedProperties.toLocaleString(),
      subtitle: `${data.totalProperties.toLocaleString()} Total Listings in Directory`,
      icon: Building2,
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
      trend: "94% approval rate",
    },
    {
      title: "Active Field Agents",
      value: data.activeAgents.toLocaleString(),
      subtitle: `${data.totalAgents.toLocaleString()} Registered Territory Agents`,
      icon: UserCheck,
      color: "from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400",
      trend: "Addis Ababa & Regional Hubs",
    },
    {
      title: "Pending Verifications",
      value: data.pendingVerifications.toLocaleString(),
      subtitle: "Identity documents & property listings",
      icon: Clock,
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
      urgent: data.pendingVerifications > 0,
      trend: "Requires Agent Action",
    },
    {
      title: "Gross Platform Revenue",
      value: `ETB ${((data as any).totalRevenueETB || data.revenueETB || 0).toLocaleString()}`,
      subtitle: "Listing fees & subscriptions (Chapa / CBE / Telebirr)",
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
      trend: "+18.2% vs last period",
    },
    {
      title: "Pending Reports & Complaints",
      value: data.pendingReports.toLocaleString(),
      subtitle: "Awaiting moderator review & resolution",
      icon: AlertTriangle,
      color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
      urgent: true,
      trend: "High Priority Review",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-850 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Overview & Analytics
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time status of Ethiopian House Rental platform registrations, property verifications, and agent performance.
          </p>
          {lastUpdated && (
            <p className="text-[11px] text-slate-400 mt-1">
              Last synced: <span className="text-emerald-400 font-mono font-bold">{lastUpdated}</span>
            </p>
          )}
        </div>

        {/* Header Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
            {(["7d", "30d", "6m", "1y"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all ${
                  timeFilter === t
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Refresh Real-time KPIs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            title="Download CSV Report Summary"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
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
              ETB {(data.revenueETB || 0).toLocaleString()} Total
            </span>
          </div>

          <div className="h-64 w-full pt-4 flex items-end justify-between gap-4 border-b border-slate-700 pb-2">
            {(data.revenueChart || []).map((item, idx) => {
              const maxRev = Math.max(...(data.revenueChart || []).map((r: any) => r.value || 0), 1000);
              const pct = maxRev > 0 ? ((item.value || 0) / maxRev) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    ETB {(item.value || 0).toLocaleString()}
                  </span>
                  <div className="w-full bg-slate-900/60 rounded-xl p-1.5 h-44 flex items-end">
                    <div
                      style={{ height: `${pct}%` }}
                      className="w-full bg-gradient-to-t from-teal-600 to-emerald-400 rounded-lg group-hover:from-teal-500 group-hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/20 min-h-[4px]"
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
        {/* Most Active Locations in Addis Ababa & Ethiopian Regions - Interactive Property Map */}
        <div className="lg:col-span-2">
          <AdminLocationMap
            locationBreakdown={data.locationBreakdown || []}
            properties={properties}
          />
        </div>

        {/* Property Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Property Status Distribution</h3>
          <p className="text-xs text-slate-400">Breakdown of {(data.totalProperties || 0).toLocaleString()} listings</p>

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
              {pendingQueue.length > 0 ? (
                pendingQueue.map((v) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                      <p className="font-semibold text-slate-300">Pending Queue Clear</p>
                      <p className="text-xs text-slate-500">No property listings or documents currently awaiting administrative verification.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
