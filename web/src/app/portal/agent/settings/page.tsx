"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Lock,
  MapPin,
  Bell,
  Globe,
  Save,
  Check,
  Shield,
  Upload,
  Building,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AgentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "territory" | "password" | "preferences">("profile");

  // Profile State
  const [agentUser, setAgentUser] = useState<{
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string;
    assignedArea?: string;
    city?: string;
    region?: string;
    address?: string;
    propertiesManaged?: number;
    performanceScore?: number;
    active?: boolean;
  }>({
    name: "",
    email: "",
    phone: "",
    role: "agent",
    avatarUrl: "",
    assignedArea: "",
    city: "",
    region: "",
    address: "",
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences State
  const [language, setLanguage] = useState("en");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    async function loadAgentProfile() {
      try {
        setLoading(true);
        const data = await apiFetch("/agent/profile");
        if (data) {
          setAgentUser({
            id: data.id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "agent",
            avatarUrl: data.avatarUrl || "",
            assignedArea: data.assignedArea || "Debre Birhan",
            city: data.city || data.assignedArea || "Debre Birhan",
            region: data.region || "Amhara",
            address: data.address || "",
            propertiesManaged: data.propertiesManaged || 0,
            performanceScore: data.performanceScore || 98.0,
            active: data.active ?? true,
          });
        }
      } catch (err: any) {
        setErrorMsg("Failed to load profile details from server.");
      } finally {
        setLoading(false);
      }
    }

    loadAgentProfile();
  }, []);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        const uploadRes = await apiFetch("/upload", {
          method: "POST",
          body: { base64 },
        });

        if (uploadRes?.url) {
          setAgentUser((prev) => ({ ...prev, avatarUrl: uploadRes.url }));
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMsg("Failed to upload avatar image.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      // 1. If password fields filled, update password
      if (newPassword) {
        if (!currentPassword) {
          setErrorMsg("Please enter your current password to set a new password.");
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMsg("New password and confirmation do not match.");
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setErrorMsg("New password must be at least 6 characters long.");
          setSaving(false);
          return;
        }

        await apiFetch("/auth/change-password", {
          method: "POST",
          body: { currentPassword, newPassword },
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      // 2. Save Agent Profile in Database via PATCH /agent/profile
      await apiFetch("/agent/profile", {
        method: "PATCH",
        body: {
          name: agentUser.name,
          phone: agentUser.phone,
          city: agentUser.city,
          region: agentUser.region,
          address: agentUser.address,
          avatarUrl: agentUser.avatarUrl,
        },
      });

      // Dispatch global profile updated event to sync layout header
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdated"));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-blue-400" /> Field Agent Settings
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage your personal profile, assigned operational territory, security credentials, and preferences.
          </p>
        </div>
        {saved && (
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-1.5 shadow-lg">
            <Check className="h-4 w-4" /> Profile Saved!
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: "profile", label: "Profile & Contact", icon: User },
          { id: "territory", label: "Operational Territory", icon: MapPin },
          { id: "password", label: "Password & Security", icon: Lock },
          { id: "preferences", label: "Preferences", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Profile & Contact */}
        {activeTab === "profile" && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" /> Agent Profile & Contact Information
            </h3>

            {/* Avatar Row */}
            <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-600 shrink-0">
                {agentUser.avatarUrl ? (
                  <img src={agentUser.avatarUrl} alt={agentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{agentUser.name.slice(0, 2).toUpperCase() || "AG"}</span>
                )}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{agentUser.name || "Agent User"}</p>
                <p className="text-slate-400 text-xs mb-2">{agentUser.email}</p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-all">
                  <Upload className="h-3.5 w-3.5 text-blue-400" /> Change Avatar
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Agent Full Name</label>
                <input
                  type="text"
                  value={agentUser.name}
                  onChange={(e) => setAgentUser({ ...agentUser, name: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={agentUser.phone}
                  onChange={(e) => setAgentUser({ ...agentUser, phone: e.target.value })}
                  placeholder="+251 9X XXX XXXX"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={agentUser.email}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Email is locked to your authenticated account ID.</span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Assigned Operational Territory</label>
                <div className="w-full bg-slate-950 border border-blue-900/40 rounded-xl px-3 py-2 text-blue-400 font-bold flex items-center justify-between">
                  <span>{agentUser.assignedArea || "Debre Birhan"}</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase">Assigned Town</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Town / City</label>
                <input
                  type="text"
                  value={agentUser.city || ""}
                  onChange={(e) => setAgentUser({ ...agentUser, city: e.target.value })}
                  placeholder="e.g. Debre Birhan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Region</label>
                <input
                  type="text"
                  value={agentUser.region || ""}
                  onChange={(e) => setAgentUser({ ...agentUser, region: e.target.value })}
                  placeholder="e.g. Amhara"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1 font-medium">Field Office / Local Address</label>
                <input
                  type="text"
                  value={agentUser.address || ""}
                  onChange={(e) => setAgentUser({ ...agentUser, address: e.target.value })}
                  placeholder="e.g. Debre Birhan, Kebele 04, near Commercial Bank"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Operational Territory Details */}
        {activeTab === "territory" && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" /> Operational Territory Enforcement
            </h3>

            <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-200 text-sm">Designated Town: {agentUser.assignedArea || "Debre Birhan"}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Active Regional Assignment
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Platform Security Rule: As a certified field agent, your account is strictly constrained to your assigned town (
                <strong className="text-white">{agentUser.assignedArea || "Debre Birhan"}</strong>). You can only access, view, verify, and manage properties, house seekers, and landlords registered within this operational territory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Territory Properties</p>
                <p className="text-2xl font-extrabold text-white mt-1">{agentUser.propertiesManaged || 3}</p>
                <p className="text-[10px] text-blue-400 mt-1">Inside {agentUser.assignedArea || "Debre Birhan"}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Agent Performance Score</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">{agentUser.performanceScore || 98}%</p>
                <p className="text-[10px] text-slate-400 mt-1">Excellent verification track record</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-[11px]">Assignment Authority</p>
                <p className="text-sm font-bold text-white mt-1">Platform Administrator</p>
                <p className="text-[10px] text-slate-400 mt-1">Ministry of Housing & Innovation Policy</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Password & Security */}
        {activeTab === "password" && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-400" /> Change Security Password
            </h3>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Preferences */}
        {activeTab === "preferences" && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-400" /> Platform & Localization Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Preferred Interface Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="en">English (Official)</option>
                  <option value="am">Amharic (አማርኛ)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Receive SMS notifications for new assigned inspections</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Receive email summary for daily territory activity</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Assigned Town: <strong className="text-blue-400">{agentUser.assignedArea || "Debre Birhan"}</strong>
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Agent Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
