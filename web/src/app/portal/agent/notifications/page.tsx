"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface LiveNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  time: string;
}

export default function AgentNotificationsPage() {
  const [notifs, setNotifs] = useState<LiveNotification[]>([]);
  const [loading, setLoading] = useState(true);

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

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
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
      console.error("Failed to clear notifications:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-blue-400" /> Agent Notifications
          </h1>
          <p className="text-xs text-slate-300 mt-1">Assignments, document reviews, and site visit schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </button>
          {notifs.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-800 rounded-2xl border border-slate-700">
            No notifications available.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border text-xs space-y-1 transition-colors flex items-start justify-between ${
                n.read ? "bg-slate-800/60 border-slate-700/60 text-slate-400" : "bg-slate-800 border-blue-500/40 text-white"
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{n.title}</span>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-slate-300 mt-1">{n.message}</p>
              </div>
              <button
                onClick={(e) => deleteNotification(e, n.id)}
                title="Delete notification"
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
