"use client";

import { useState } from "react";
import { Settings, User, Lock, Bell, Globe, DollarSign, Moon, Shield, Save, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "platform" | "security">("profile");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-1">
            <Check className="h-4 w-4" /> Preferences Saved!
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue="Solomon Tesfaye"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  defaultValue="admin@delala.et"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  defaultValue="+251 91 789 0123"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Administrative Role</label>
                <input
                  type="text"
                  disabled
                  defaultValue="Super Administrator"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
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
                <label className="block text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
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
                <label className="block text-slate-300 mb-1">Default Platform Language</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option value="en">English (US)</option>
                  <option value="am">Amharic (አማርኛ)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Default Display Currency</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option value="ETB">Ethiopian Birr (ETB)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Portal Color Theme</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
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
              <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-slate-400 text-[11px]">Require SMS/Authenticator code on login</span>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-emerald-600 rounded bg-slate-800" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Automatic Session Timeout</span>
                  <span className="text-slate-400 text-[11px]">Lock session after 15 minutes of inactivity</span>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-emerald-600 rounded bg-slate-800" />
              </label>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Portal Settings
          </button>
        </div>
      </form>
    </div>
  );
}
