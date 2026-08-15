"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  status: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface TrackingEvent {
  status: string;
  message: string;
  createdAt: string;
}

export function TrackingTimeline({
  steps,
  events,
}: {
  steps: TimelineStep[];
  events?: TrackingEvent[];
}) {
  return (
    <div className="space-y-6">
      <div className="relative">
        {steps.map((step, i) => (
          <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  step.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : step.current
                      ? "border-emerald-500 bg-white text-emerald-600"
                      : "border-slate-200 bg-white text-slate-300"
                )}
              >
                {step.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mt-1 w-0.5 flex-1 min-h-[2rem]",
                    step.completed ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "font-semibold",
                  step.completed || step.current ? "text-slate-900" : "text-slate-400"
                )}
              >
                {step.label}
              </p>
              {step.current && (
                <p className="text-sm text-emerald-600">Current status</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {events && events.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Activity log</h4>
          <div className="space-y-3">
            {events.map((e, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
                <span className="text-slate-600">{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
