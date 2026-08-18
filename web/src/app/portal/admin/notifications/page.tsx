"use client";

import { useState } from "react";
import { Bell, CheckCheck, Filter, Trash2 } from "lucide-react";
import { mockNotifications, NotificationItem } from "@/lib/portal-mock-data";

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<NotificationItem[]>(mockNotifications);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredNotifs = notifs.filter(
    (n) => categoryFilter === "All" || n.category === categoryFilter
  );

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-emerald-400" /> Notifications Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            System alerts, property submission notices, and verification updates.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <CheckCheck className="h-4 w-4" /> Mark All as Read
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {["All", "Property", "Verification", "User", "System"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              categoryFilter === cat
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifs.map((n) => (
          <div
            key={n.id}
            onClick={() => toggleRead(n.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
              !n.read
                ? "bg-slate-800 border-emerald-500/40 shadow-lg"
                : "bg-slate-800/60 border-slate-700/60 opacity-80"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{n.title}</span>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {n.category}
                </span>
              </div>
              <p className="text-xs text-slate-300">{n.message}</p>
              <span className="text-[10px] text-slate-400 block pt-1">{n.time}</span>
            </div>
            <button className="text-xs text-slate-400 hover:text-white font-medium">
              {n.read ? "Mark Unread" : "Mark Read"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
