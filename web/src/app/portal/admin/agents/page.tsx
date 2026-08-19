"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Search,
  MapPin,
  CheckCircle,
  Ban,
  X,
  Plus,
  Calendar,
  CheckSquare,
  Building2,
  Trash2,
  Eye,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface BackendAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedArea?: string;
  propertiesManaged?: number;
  verificationsCompleted?: number;
  activeTasks?: number;
  performanceScore?: number;
  agentStatus?: "Active" | "On Leave" | "Suspended";
  avatarUrl?: string;
  joinedDate?: string;
}

const resolveImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<BackendAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals state
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [assignAreaOpen, setAssignAreaOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<BackendAgent | null>(null);
  const [agentDetails, setAgentDetails] = useState<any>(null);

  // Form states
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "AgentPassword123!",
    assignedArea: "Bole & Kazanchis",
    city: "Addis Ababa",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    type: "Property Inspection",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    description: "",
  });

  const [newAreaInput, setNewAreaInput] = useState("");

  async function loadAgents() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/agents");
      setAgents(data || []);
    } catch (err) {
      console.error("Failed to load field agents list:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedArea && a.assignedArea.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create Field Agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await apiFetch("/admin/agents", {
        method: "POST",
        body: newAgent,
      });

      setAgents((prev) => [created, ...prev]);
      setAddAgentOpen(false);
      setNewAgent({
        name: "",
        email: "",
        phone: "",
        password: "AgentPassword123!",
        assignedArea: "Bole & Kazanchis",
        city: "Addis Ababa",
      });
      setFeedback("New Field Agent registered successfully!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message || "Failed to create agent"}`);
    }
  };

  // Reassign Territory
  const handleSaveArea = async () => {
    if (!selectedAgent || !newAreaInput) return;
    try {
      await apiFetch(`/admin/agents/${selectedAgent.id}`, {
        method: "PUT",
        body: { assignedArea: newAreaInput }
      });
      setAgents((prev) =>
        prev.map((a) => (a.id === selectedAgent.id ? { ...a, assignedArea: newAreaInput } : a))
      );
      setAssignAreaOpen(false);
      setSelectedAgent(null);
      setNewAreaInput("");
      setFeedback("Operational territory re-assigned successfully!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message || "Failed to update agent area"}`);
    }
  };

  // Assign Task to Agent
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      await apiFetch(`/admin/agents/${selectedAgent.id}/tasks`, {
        method: "POST",
        body: newTask,
      });

      setAgents((prev) =>
        prev.map((a) =>
          a.id === selectedAgent.id
            ? { ...a, activeTasks: (a.activeTasks || 0) + 1 }
            : a
        )
      );

      setAssignTaskOpen(false);
      setNewTask({
        title: "",
        type: "Property Inspection",
        priority: "Medium",
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        description: "",
      });
      setFeedback(`📋 New task assigned to ${selectedAgent.name}!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message || "Failed to assign task"}`);
    }
  };

  // Toggle Active / Suspended
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await apiFetch(`/admin/agents/${id}`, {
        method: "PUT",
        body: { agentStatus: nextStatus }
      });
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, agentStatus: nextStatus } : a))
      );
      setFeedback(`Status updated to ${nextStatus}!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message}`);
    }
  };

  // Delete Agent
  const handleDeleteAgent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove agent "${name}"?`)) return;
    try {
      await apiFetch(`/admin/agents/${id}`, { method: "DELETE" });
      setAgents((prev) => prev.filter((a) => a.id !== id));
      setFeedback(`Agent ${name} deleted successfully.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message}`);
    }
  };

  // View Detailed Performance & Linked Items
  const handleViewDetails = async (agent: BackendAgent) => {
    setSelectedAgent(agent);
    try {
      const details = await apiFetch(`/admin/agents/${agent.id}/details`);
      setAgentDetails(details);
    } catch (err) {
      console.error("Failed to load agent details:", err);
      setAgentDetails(null);
    }
    setDetailsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-bold shadow-lg ${feedback.startsWith('❌') ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'}`}>
          {feedback}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-emerald-400" /> Platform Agent Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Register field agents, assign sub-city operational territories, dispatch tasks, and track real-time performance scores.
          </p>
        </div>

        <button
          onClick={() => setAddAgentOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Add New Field Agent
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search agent name, sub-city area, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
                <th className="p-4">Performance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No field agents registered yet. Click <strong>"Add New Field Agent"</strong> to add an agent.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-3">
                      <img
                        src={resolveImageUrl(agent.avatarUrl)}
                        alt={agent.name}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{agent.name}</p>
                        <p className="text-[10px] text-slate-400">{agent.email}</p>
                        <p className="text-[10px] text-slate-400">{agent.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-emerald-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {agent.assignedArea || 'Addis Ababa'}
                    </td>
                    <td className="p-4 font-bold text-white">{agent.propertiesManaged || 0}</td>
                    <td className="p-4 text-slate-300">{agent.verificationsCompleted || 0}</td>
                    <td className="p-4 font-bold text-amber-400">{agent.activeTasks || 0}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {agent.performanceScore || 100}% Score
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          agent.agentStatus === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {agent.agentStatus || "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setAssignTaskOpen(true);
                          }}
                          title="Assign Field Task"
                          className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
                        >
                          <PlusCircle className="h-3 w-3" /> Task
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setNewAreaInput(agent.assignedArea || "");
                            setAssignAreaOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          Area
                        </button>
                        <button
                          onClick={() => handleViewDetails(agent)}
                          title="View Agent Performance & Linked Items"
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(agent.id, agent.agentStatus || 'Active')}
                          title={agent.agentStatus === "Active" ? "Suspend Agent" : "Activate Agent"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            agent.agentStatus === "Active"
                              ? "text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                              : "text-slate-400 hover:text-emerald-400 hover:bg-slate-700"
                          }`}
                        >
                          {agent.agentStatus === "Active" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id, agent.name)}
                          title="Delete Agent Account"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. ADD NEW FIELD AGENT MODAL */}
      {addAgentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAddAgentOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-400" /> Register New Field Agent
            </h3>
            <p className="text-xs text-slate-300">
              Create an official platform agent account to manage field property inspections and assisted rental onboarding.
            </p>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g. Samuel Tadesse"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="agent@delala.et"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    placeholder="+251 91 123 4567"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Assigned Sub-City Territory</label>
                  <input
                    type="text"
                    required
                    value={newAgent.assignedArea}
                    onChange={(e) => setNewAgent({ ...newAgent, assignedArea: e.target.value })}
                    placeholder="e.g. Bole & Kazanchis"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Password</label>
                  <input
                    type="text"
                    required
                    value={newAgent.password}
                    onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setAddAgentOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30"
                >
                  Create Field Agent Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ASSIGN TASK TO AGENT MODAL */}
      {assignTaskOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAssignTaskOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-purple-400" /> Assign Field Inspection Task
            </h3>
            <p className="text-xs text-slate-300">
              Assign task to agent <strong className="text-white">{selectedAgent.name}</strong> ({selectedAgent.assignedArea}).
            </p>

            <form onSubmit={handleAssignTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. On-site Title Deed & Photoshoot Inspection"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Task Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="Property Inspection">Property Inspection</option>
                    <option value="Landlord Verification">Landlord Verification</option>
                    <option value="Photoshoot Schedule">Photoshoot Schedule</option>
                    <option value="Offline Tenant Onboarding">Offline Tenant Onboarding</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Provide instructions for field visit..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setAssignTaskOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md shadow-purple-600/30"
                >
                  Dispatch Task to Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. REASSIGN TERRITORY MODAL */}
      {assignAreaOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAssignAreaOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" /> Assign Sub-City Territory
            </h3>
            <p className="text-xs text-slate-300">
              Reassign operational territory for agent <strong className="text-white">{selectedAgent.name}</strong>.
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Sub-City Location / Territory</label>
              <input
                type="text"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                placeholder="e.g. Bole & Kazanchis"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
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

      {/* 4. AGENT DETAILS & PERFORMANCE DRAWER */}
      {detailsDrawerOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailsDrawerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
              <img
                src={resolveImageUrl(selectedAgent.avatarUrl)}
                alt={selectedAgent.name}
                className="h-14 w-14 rounded-full object-cover ring-4 ring-emerald-500/40"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold">{selectedAgent.assignedArea || 'Addis Ababa Field Territory'}</p>
                <p className="text-[11px] text-slate-400">{selectedAgent.email} • {selectedAgent.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Managed Properties</span>
                <span className="text-white font-extrabold text-lg">{selectedAgent.propertiesManaged || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Verifications Completed</span>
                <span className="text-emerald-400 font-extrabold text-lg">{selectedAgent.verificationsCompleted || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Performance Score</span>
                <span className="text-purple-400 font-extrabold text-lg">{selectedAgent.performanceScore || 100}%</span>
              </div>
            </div>

            {/* Linked Tasks List */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-purple-400" /> Active Assigned Tasks ({agentDetails?.tasks?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {agentDetails?.tasks?.length === 0 || !agentDetails?.tasks ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-900 rounded-xl">No active tasks assigned.</p>
                ) : (
                  agentDetails.tasks.map((tsk: any) => (
                    <div key={tsk.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{tsk.title}</p>
                        <p className="text-[10px] text-slate-400">{tsk.type} • Priority: {tsk.priority}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {tsk.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700/80">
              <button
                onClick={() => setDetailsDrawerOpen(false)}
                className="px-5 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
