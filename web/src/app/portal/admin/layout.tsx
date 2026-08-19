"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Users,
  Building,
  UserCheck,
  Building2,
  ShieldCheck,
  FileText,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  UserCheck2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const baseNavItems = [
  { id: "dashboard", href: "/portal/admin", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", href: "/portal/admin/users", label: "Users", icon: Users },
  { id: "providers", href: "/portal/admin/providers", label: "Providers", icon: Building },
  { id: "seekers", href: "/portal/admin/seekers", label: "Seekers", icon: UserCheck2 },
  { id: "properties", href: "/portal/admin/properties", label: "Properties", icon: Building2 },
  { id: "verification", href: "/portal/admin/verification", label: "Verification", icon: ShieldCheck },
  { id: "agents", href: "/portal/admin/agents", label: "Agents", icon: UserCheck },
  { id: "reports", href: "/portal/admin/reports", label: "Reports", icon: FileText },
  { id: "payments", href: "/portal/admin/payments", label: "Payments", icon: CreditCard },
  { id: "notifications", href: "/portal/admin/notifications", label: "Notifications", icon: Bell },
  { id: "messages", href: "/portal/admin/messages", label: "Messages", icon: MessageSquare },
  { id: "settings", href: "/portal/admin/settings", label: "Settings", icon: Settings },
];
export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [badges, setBadges] = useState<{ verification?: number; reports?: number }>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatarUrl?: string }>({
    name: "",
    email: "",
  });

  useEffect(() => {
    async function checkAdminAuthAndLoadStats() {
      try {
        const res = await apiFetch("/users/me");
        if (res?.user?.role !== "admin") {
          setAccessDenied(true);
          return;
        }

        if (res?.user) {
          setCurrentUser({
            name: res.user.name || "",
            email: res.user.email || "",
            avatarUrl: res.user.avatarUrl,
          });
        }

        // Fetch dynamic KPI badges from database
        const kpis = await apiFetch("/admin/analytics/kpis").catch(() => null);
        if (kpis) {
          setBadges({
            verification: kpis.pendingVerifications ?? 0,
            reports: kpis.pendingReports ?? 0,
          });
        }

        // Fetch real database notifications
        const notifData = await apiFetch("/notifications").catch(() => []);
        setNotifications(notifData || []);
      } catch (err) {
        setAccessDenied(true);
      }
    }
    checkAdminAuthAndLoadStats();
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read && !n.isRead);

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-300">
            Administrator privileges are required to access the Admin Dashboard. Your account does not have access.
          </p>
          <Link
            href="/portal/login"
            className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
          >
            Back to Portal Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-800/95 border-b border-slate-700/80 backdrop-blur-md h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Left branding & mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/portal/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Ethiopian House Rental
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                  Admin Portal
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">Central Platform Command & Management</p>
            </div>
          </Link>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, properties, providers, agents..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Link to public website */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/40 transition-colors"
            title="Open Public Website"
          >
            <span>Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-700/60 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3.5 border-b border-slate-700 flex items-center justify-between bg-slate-850">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">System Notifications</h4>
                  <Link
                    href="/portal/admin/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications found.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-slate-750 transition-colors ${!n.read && !n.isRead ? "bg-slate-750/50" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-700/60 transition-colors"
            >
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"}
                alt="Admin Avatar"
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-emerald-500/50"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Super Administrator</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                <div className="p-3 border-b border-slate-700 mb-1">
                  <p className="font-bold text-white">{currentUser.name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    router.push("/portal/agent");
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-blue-400" />
                  Switch to Agent Portal
                </button>
                <Link
                  href="/portal/admin/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <Settings className="h-4 w-4 text-emerald-400" />
                  Admin Settings
                </Link>
                <div className="my-1 border-t border-slate-700" />
                <button
                  onClick={() => router.push("/portal/login")}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800/90 border-r border-slate-700/80 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col justify-between pt-16 lg:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Navigation Links */}
          <div className="p-4 space-y-1 overflow-y-auto flex-1 hide-scrollbar">
            <p className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-2 tracking-wider">
              Management Menu
            </p>
            {baseNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              let badgeVal: string | undefined = undefined;
              if (item.id === "verification" && (badges.verification ?? 0) > 0) {
                badgeVal = String(badges.verification);
              } else if (item.id === "reports" && (badges.reports ?? 0) > 0) {
                badgeVal = String(badges.reports);
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {badgeVal && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isActive
                          ? "bg-white text-emerald-700"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {badgeVal}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-slate-700/80 bg-slate-850">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Delala Admin v2.4</span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-emerald-400">Online</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Ethiopian House Rental Platform</p>
          </div>
        </aside>

        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
