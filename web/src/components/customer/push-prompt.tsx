"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("push-dismissed")) return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    setShow(true);
  }, []);

  async function enablePush() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Delala Rentals", {
        body: "You'll receive order and service updates here.",
        icon: "/icon-192.png",
      });
    }
    setShow(false);
    localStorage.setItem("push-dismissed", "1");
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("push-dismissed", "1");
  }

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Enable notifications</p>
          <p className="mt-0.5 text-sm text-slate-600">
            Get real-time updates on orders and service bookings.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={enablePush}>Enable</Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>Later</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
