"use client";

import { useState } from "react";
import { CheckSquare, Clock, Filter, Plus, Calendar, AlertCircle, CheckCircle2, X } from "lucide-react";
import { mockTasks, TaskItem } from "@/lib/portal-mock-data";

export default function AgentTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTasks = tasks.filter(
    (t) => statusFilter === "All" || t.status === statusFilter
  );

  const handleUpdateTaskStatus = (id: string, newStatus: TaskItem["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-purple-400" /> Agent Task Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Site visit appointments, landlord follow-ups, and document review schedules.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 text-xs overflow-x-auto">
        {["All", "Pending", "In Progress", "Completed", "Overdue"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              statusFilter === st
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="p-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-3 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      task.priority === "High"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="text-xs text-blue-400 font-semibold">{task.type}</span>
                </div>
                <h3 className="font-bold text-white text-base mt-1.5">{task.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{task.description}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  task.status === "Completed"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : task.status === "Overdue"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : task.status === "In Progress"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {task.status}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div className="text-slate-400 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Due: <span className="text-white font-semibold">{task.dueDate}</span>
                {task.providerName && (
                  <span className="text-slate-400">| Landlord: <strong className="text-white">{task.providerName}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {task.status !== "Completed" && (
                  <button
                    onClick={() => handleUpdateTaskStatus(task.id, "Completed")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete Task
                  </button>
                )}
                {task.status === "Pending" && (
                  <button
                    onClick={() => handleUpdateTaskStatus(task.id, "In Progress")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Start Task
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
