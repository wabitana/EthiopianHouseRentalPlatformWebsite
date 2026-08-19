"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Building2,
  PlusCircle,
  CheckSquare,
  ShieldCheck,
  Building,
  UserCheck2,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  UserCheck,
  ExternalLink,
  PhoneOff,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const resolveImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function AgentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [agentUser, setAgentUser] = useState<any>(null);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [verificationsCount, setVerificationsCount] = useState<number>(0);

  useEffect(() => {
    async function loadLayoutData() {
      try {
        const [userData, verifData, tasksData] = await Promise.all([
          apiFetch("/agent/profile").catch(() => null),
          apiFetch("/verification/admin/pending").catch(() => ({ identityDocs: [], propertyDocs: [] })),
          apiFetch("/agent/tasks").catch(() => []),
        ]);

        setAgentUser(userData);

        const totalPendingVerif = (verifData.identityDocs || []).length + (verifData.propertyDocs || []).length;
        setVerificationsCount(totalPendingVerif);

        const totalActiveTasks = (tasksData || []).filter((t: any) => t.status !== 'Completed').length;
        setTasksCount(totalActiveTasks);
      } catch (err) {
        console.error("Failed to load agent layout metadata:", err);
      }
    }

    loadLayoutData();
  }, []);

  const agentNavItems = [
    { href: "/portal/agent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/agent/assisted-rentals", label: "Assisted Rural Hub", icon: PhoneOff, badge: "Offline Hub", highlight: true },
    { href: "/portal/agent/properties", label: "Properties", icon: Building2 },
    { href: "/portal/agent/add-property", label: "Add Property", icon: PlusCircle },
    { href: "/portal/agent/tasks", label: "My Tasks", icon: CheckSquare, badge: tasksCount > 0 ? String(tasksCount) : undefined },
    { href: "/portal/agent/verification", label: "Verification", icon: ShieldCheck, badge: verificationsCount > 0 ? String(verificationsCount) : undefined },
    { href: "/portal/agent/providers", label: "House Providers", icon: Building },
    { href: "/portal/agent/seekers", label: "House Seekers", icon: UserCheck2 },
    { href: "/portal/agent/messages", label: "Messages", icon: MessageSquare },
    { href: "/portal/agent/notifications", label: "Notifications", icon: Bell },
    { href: "/portal/agent/settings", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-800/95 border-b border-slate-700/80 backdrop-blur-md h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/portal/agent" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Ethiopian House Rental
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
                  Agent Portal
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">Field Agent Verification & Property Workspace</p>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assigned properties, tasks, providers..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-700/60 transition-colors"
            >
              <img
                src={resolveImageUrl(agentUser?.avatarUrl)}
                alt="Agent Avatar"
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-blue-500/50"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white leading-none">{agentUser?.name || 'Agent User'}</p>
                <p className="text-[10px] text-blue-400 font-medium">{agentUser?.assignedArea || 'Addis Ababa Field Agent'}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                <div className="p-3 border-b border-slate-700 mb-1">
                  <p className="font-bold text-white">{agentUser?.name || 'Agent User'}</p>
                  <p className="text-slate-400 text-[11px]">{agentUser?.email || 'agent@delala.com'}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    router.push("/portal/admin");
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  Switch to Admin Portal
                </button>
                <Link
                  href="/portal/agent/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <Settings className="h-4 w-4 text-blue-400" />
                  Agent Settings
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

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800/90 border-r border-slate-700/80 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col justify-between pt-16 lg:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto flex-1 hide-scrollbar">
            <p className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-2 tracking-wider">
              Agent Menu
            </p>
            {agentNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : item.highlight
                      ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : item.highlight ? "text-blue-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isActive
                          ? "bg-white text-blue-700"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-700/80 bg-slate-850">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Territory: {agentUser?.assignedArea || 'Addis Ababa'}</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">Active</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Delala Field Agent Portal</p>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
