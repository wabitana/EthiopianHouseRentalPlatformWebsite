"use client";

import { useState } from "react";
import {
  UserCheck,
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  CheckCircle,
  Ban,
  Edit,
  Eye,
  Activity,
  Plus,
  X,
  Award,
} from "lucide-react";
import { mockAgents, AgentItem } from "@/lib/portal-mock-data";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentItem[]>(mockAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [assignAreaOpen, setAssignAreaOpen] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState("");

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveArea = () => {
    if (!selectedAgent || !newAreaInput) return;
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedAgent.id ? { ...a, assignedArea: newAreaInput } : a))
    );
    setAssignAreaOpen(false);
    setSelectedAgent(null);
    setNewAreaInput("");
  };

  const handleToggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "Active" ? "Suspended" : "Active" } : a
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-emerald-400" /> Platform Agent Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitor and assign platform field agents across sub-cities in Addis Ababa and regional territories.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search agent name, sub-city area, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Agent Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">Agent</th>
                <th className="p-4">Assigned Area</th>
                <th className="p-4">Managed Properties</th>
                <th className="p-4">Verifications Done</th>
                <th className="p-4">Active Tasks</th>
                <th className="p-4">Performance Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="p-4 font-semibold text-white flex items-center gap-3">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{agent.name}</p>
                      <p className="text-[10px] text-slate-400">{agent.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-emerald-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {agent.assignedArea}
                  </td>
                  <td className="p-4 font-bold text-white">{agent.propertiesManaged}</td>
                  <td className="p-4 text-slate-300">{agent.verificationsCompleted}</td>
                  <td className="p-4 font-bold text-amber-400">{agent.activeTasks}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {agent.performanceScore}% Score
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        agent.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setNewAreaInput(agent.assignedArea);
                          setAssignAreaOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold rounded-lg text-xs transition-colors"
                      >
                        Assign Area
                      </button>
                      <button
                        onClick={() => handleToggleStatus(agent.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          agent.status === "Active"
                            ? "text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                            : "text-slate-400 hover:text-emerald-400 hover:bg-slate-700"
                        }`}
                      >
                        {agent.status === "Active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Area Modal */}
      {assignAreaOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAssignAreaOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Assign Sub-City Territory</h3>
            <p className="text-xs text-slate-300">Reassign operational area for agent <strong className="text-white">{selectedAgent.name}</strong>.</p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Sub-City Location / Woreda</label>
              <input
                type="text"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                placeholder="e.g. Bole & Yeka"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignAreaOpen(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArea}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Assigned Territory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
