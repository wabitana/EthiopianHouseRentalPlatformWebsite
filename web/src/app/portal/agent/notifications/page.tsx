"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { mockNotifications } from "@/lib/portal-mock-data";

export default function AgentNotificationsPage() {
  const [notifs, setNotifs] = useState(mockNotifications);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-blue-400" /> Agent Notifications
          </h1>
          <p className="text-xs text-slate-300 mt-1">Assignments, document reviews, and site visit schedules.</p>
        </div>
        <button
          onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
        >
          <CheckCheck className="h-4 w-4" /> Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {notifs.map((n) => (
          <div key={n.id} className="p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{n.title}</span>
              <span className="text-[10px] text-slate-400">{n.time}</span>
            </div>
            <p className="text-slate-300">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
