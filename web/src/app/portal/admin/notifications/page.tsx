"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Filter, Trash2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface LiveNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  time: string;
}

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<LiveNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await apiFetch("/notifications");
      const mapped = (data || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.type || "System",
        read: n.read || n.isRead || false,
        time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "Recently",
      }));
      setNotifs(mapped);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifs = notifs.filter(
    (n) => categoryFilter === "All" || n.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const toggleRead = async (id: string, currentRead: boolean) => {
    try {
      await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
        body: { read: !currentRead },
      });
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !currentRead } : n))
      );
    } catch (err) {
      console.error("Failed to update notification read status:", err);
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await apiFetch("/notifications/clear-all", { method: "DELETE" });
      setNotifs([]);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-emerald-400" /> Notifications Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            System alerts, property submission notices, and verification updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </button>
          {notifs.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {["All", "Property", "Verification", "User", "System"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              categoryFilter === cat
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => toggleRead(n.id, n.read)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.read
                  ? "bg-slate-800 border-emerald-500/40 shadow-lg"
                  : "bg-slate-800/60 border-slate-700/60 opacity-80"
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">{n.title}</span>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{n.time}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRead(n.id, n.read);
                  }}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 font-semibold px-2 py-1 bg-slate-900/60 border border-slate-700 rounded-lg transition-colors"
                >
                  {n.read ? "Mark Unread" : "Mark Read"}
                </button>
                <button
                  onClick={(e) => deleteNotification(e, n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-lg transition-all"
                  title="Delete Notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-10 text-center space-y-3 shadow-xl">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-base">No Notifications Found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Real-time system notifications and user verification updates will appear here live from the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
