"use client";

import { useState, useEffect } from "react";
import { Settings, User, Lock, Bell, Globe, DollarSign, Moon, Shield, Save, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "platform" | "security">("profile");

  // Profile State fetched from PostgreSQL database
  const [adminUser, setAdminUser] = useState<{ id?: string; name: string; email: string; phone: string; role: string; avatarUrl?: string }>({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatarUrl: "",
  });

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        const uploadRes = await apiFetch("/upload", {
          method: "POST",
          body: { base64 }
        });

        if (uploadRes?.url) {
          setAdminUser((prev) => ({ ...prev, avatarUrl: uploadRes.url }));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Platform Preferences State
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("ETB");
  const [commissionRate, setCommissionRate] = useState(5);
  const [theme, setTheme] = useState("dark");

  // Security State
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch current admin user from database via API
        const meRes = await apiFetch("/users/me");
        if (meRes?.user) {
          setAdminUser({
            id: meRes.user.id,
            name: meRes.user.name || "",
            email: meRes.user.email || "",
            phone: meRes.user.phone || "",
            role: meRes.user.role === "admin" ? "Super Administrator" : meRes.user.role || "Administrator",
            avatarUrl: meRes.user.avatarUrl || "",
          });
        }

        // Fetch CMS platform configs from database via API
        const configs = await apiFetch("/admin/cms/configs");
        const platformConfig = configs?.find((c: any) => c.key === "platform_settings");
        if (platformConfig) {
          const val = typeof platformConfig.value === 'string' ? JSON.parse(platformConfig.value) : platformConfig.value;
          if (val.language) setLanguage(val.language);
          if (val.currency) setCurrency(val.currency);
          if (val.commissionRate !== undefined) setCommissionRate(Number(val.commissionRate));
          if (val.theme) setTheme(val.theme);
          if (val.twoFactorAuth !== undefined) setTwoFactorAuth(Boolean(val.twoFactorAuth));
          if (val.sessionTimeout !== undefined) setSessionTimeout(Boolean(val.sessionTimeout));
        }
      } catch (err) {
        console.error("Failed to load admin settings from database:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. If password tab is active or password fields filled, update password in DB
      if (activeTab === "password" || newPassword) {
        if (!currentPassword) {
          alert("Please enter your current password.");
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          alert("New password and confirm password do not match.");
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          alert("New password must be at least 6 characters long.");
          setSaving(false);
          return;
        }

        await apiFetch("/auth/change-password", {
          method: "POST",
          body: {
            currentPassword,
            newPassword,
          },
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      // 2. Save Platform & Security Settings
      await apiFetch("/admin/cms/configs/platform_settings", {
        method: "PUT",
        body: {
          value: {
            language,
            currency,
            commissionRate,
            theme,
            twoFactorAuth,
            sessionTimeout,
          },
        },
      });

      // 3. Save Profile Info if admin user id exists
      if (adminUser.id) {
        await apiFetch(`/admin/users/${adminUser.id}`, {
          method: "PUT",
          body: {
            name: adminUser.name,
            email: adminUser.email,
            phone: adminUser.phone,
            ...(adminUser.avatarUrl && { avatarUrl: adminUser.avatarUrl }),
          },
        });
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdated"));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      alert(err instanceof Error ? err.message : "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-emerald-400" /> Admin Platform Settings
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            System configuration, administrative security, language, currency, and platform commission options.
          </p>
        </div>
        {saved && (
          <span className="px-3.5 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-1.5 shadow-md animate-bounce">
            <Check className="h-4 w-4" /> Preferences Saved to DB!
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 text-xs overflow-x-auto">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "password", label: "Password & Security", icon: Lock },
          { id: "platform", label: "Platform Preferences", icon: Globe },
          { id: "security", label: "System Security & 2FA", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>


      <form onSubmit={handleSave} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        {activeTab === "profile" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Administrator Profile</h3>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-700">
              {adminUser.avatarUrl ? (
                <img
                  src={adminUser.avatarUrl.startsWith('http') ? adminUser.avatarUrl : `http://localhost:3000${adminUser.avatarUrl.startsWith('/') ? '' : '/'}${adminUser.avatarUrl}`}
                  alt="Admin Avatar"
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-emerald-500/40"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg ring-4 ring-emerald-500/40 shadow-lg">
                  {adminUser.name ? adminUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'EA'}
                </div>
              )}
              <div>
                <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all inline-block">
                  Upload Profile Photo
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">Upload JPEG, PNG or WebP. Saved directly to PostgreSQL database.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={adminUser.name}
                  onChange={(e) => setAdminUser({ ...adminUser, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Work Email</label>
                <input
                  type="email"
                  value={adminUser.email}
                  onChange={(e) => setAdminUser({ ...adminUser, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={adminUser.phone}
                  onChange={(e) => setAdminUser({ ...adminUser, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Administrative Role</label>
                <input
                  type="text"
                  disabled
                  value={adminUser.role}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Change Staff Password</h3>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "platform" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Platform Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Default Platform Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="en">English (US)</option>
                  <option value="am">Amharic (አማርኛ)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Default Display Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="ETB">Ethiopian Birr (ETB)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Commission Rate (%)</label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Portal Color Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="dark">Emerald Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">System Security & 2FA</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-slate-400 text-[11px]">Require SMS/Authenticator code on login</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorAuth}
                  onChange={(e) => setTwoFactorAuth(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded bg-slate-800 accent-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Automatic Session Timeout</span>
                  <span className="text-slate-400 text-[11px]">Lock session after 15 minutes of inactivity</span>
                </div>
                <input
                  type="checkbox"
                  checked={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded bg-slate-800 accent-emerald-500"
                />
              </label>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving Changes..." : "Save Portal Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
