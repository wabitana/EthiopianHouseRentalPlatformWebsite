"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    function fetchCount() {
      fetch("/api/notifications")
        .then((r) => {
          const ct = r.headers.get("content-type") || "";
          if (r.ok && ct.includes("application/json")) {
            return r.json();
          }
          return null;
        })
        .then((d) => d && setUnread(d.unreadCount))
        .catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
