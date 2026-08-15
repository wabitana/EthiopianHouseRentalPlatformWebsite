"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/notifications")
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.json();
      })
      .then((d) => {
        setNotifications(d.notifications || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((n) => {
            const content = (
              <Card
                className={n.read ? "opacity-70" : "border-emerald-200 bg-emerald-50/30"}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{n.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            if (n.link) {
              return (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => markRead(n.id)}
                >
                  {content}
                </Link>
              );
            }

            return <div key={n.id} onClick={() => markRead(n.id)}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
