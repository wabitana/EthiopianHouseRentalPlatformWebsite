"use client";

import { useState } from "react";
import { Settings, User, Lock, MapPin, Bell, Globe, Save, Check } from "lucide-react";

export default function AgentSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-blue-400" /> Field Agent Settings
          </h1>
          <p className="text-xs text-slate-300 mt-1">Profile, contact info, assigned territory, language and theme preferences.</p>
        </div>
        {saved && (
          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-1">
            <Check className="h-4 w-4" /> Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5 text-xs">
        <h3 className="text-base font-bold text-white">Agent Profile & Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1">Agent Full Name</label>
            <input type="text" defaultValue="Dawit Wolde" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Phone Number</label>
            <input type="text" defaultValue="+251 91 345 6789" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Assigned Operational Territory</label>
            <input type="text" defaultValue="Bole & Kazanchis Sub-City" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-bold" />
          </div>
          <div>
            <label className="block text-slate-300 mb-1">Language Preference</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
              <option value="en">English</option>
              <option value="am">Amharic (አማርኛ)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700 flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md">
            Save Agent Profile
          </button>
        </div>
      </form>
    </div>
  );
}
