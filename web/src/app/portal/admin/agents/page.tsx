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
  AlertTriangle,
  Users,
  Home,
  FileText,
  Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface BackendAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedArea?: string;
  city?: string;
  region?: string;
  propertiesManaged?: number;
  usersManaged?: number;
  verificationsCompleted?: number;
  activeTasks?: number;
  performanceScore?: number;
  agentStatus?: "Active" | "On Leave" | "Suspended";
  avatarUrl?: string;
}

const resolveImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};

const ETHIOPIAN_LOCATIONS: Record<string, string[]> = {
  "Addis Ababa": ["Bole", "Kazanchis", "Yeka", "CMC", "Kirkos", "Arada", "Lideta", "Kolfe Keranio", "Akaki Kality", "Nifas Silk"],
  "Amhara": ["Debre Birhan", "Bahir Dar", "Gondar", "Dessie", "Debre Markos", "Kombolcha", "Woldiya"],
  "Oromia": ["Adama (Nazret)", "Jimma", "Bishoftu", "Shashamane", "Ambo", "Nekemte", "Asella", "Bale Robe"],
  "Sidama": ["Hawassa", "Yirgalem", "Aleta Wendo"],
  "Tigray": ["Mekelle", "Shire", "Aksum", "Adigrat", "Alamata"],
  "Somali": ["Jijiga", "Gode", "Degehabur", "Kebri Dahar"],
  "Dire Dawa": ["Dire Dawa City", "Melka Jebdu"],
  "Harari": ["Harar City"],
  "South Ethiopia": ["Arba Minch", "Sodo (Wolaita)", "Dilla", "Jinka"],
  "Central Ethiopia": ["Hosaena", "Butajira", "Gurage Zone", "Worabe"],
  "Afar": ["Semera", "Logia", "Asaita"],
  "Gambela": ["Gambela City"],
  "Benishangul-Gumuz": ["Asosa", "Metekel"],
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
  const [activeDrawerTab, setActiveDrawerTab] = useState<"tasks" | "properties" | "users">("tasks");

  // Form states
  const [selectedRegion, setSelectedRegion] = useState("Addis Ababa");
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "AgentPassword123!",
    assignedArea: "Bole",
    city: "Addis Ababa",
    region: "Addis Ababa",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    type: "Property Inspection",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    description: "",
    propertyTitle: "",
  });

  const [newAreaInput, setNewAreaInput] = useState("");
  const [reassignRegion, setReassignRegion] = useState("Addis Ababa");

  async function loadAgents() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/agents");
      setAgents(data || []);
    } catch {
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
        body: {
          ...newAgent,
          region: selectedRegion,
          city: newAgent.city || newAgent.assignedArea,
        },
      });

      setAgents((prev) => [created, ...prev]);
      setAddAgentOpen(false);
      setNewAgent({
        name: "",
        email: "",
        phone: "",
        password: "AgentPassword123!",
        assignedArea: "Bole",
        city: "Addis Ababa",
        region: "Addis Ababa",
      });
      setFeedback(`✅ New Field Agent "${created.name}" registered for territory "${created.assignedArea}"!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message || "Failed to create agent"}`);
    }
  };

  // Reassign Territory
  const handleSaveArea = async () => {
    if (!selectedAgent || !newAreaInput.trim()) return;
    try {
      await apiFetch(`/admin/agents/${selectedAgent.id}`, {
        method: "PUT",
        body: {
          assignedArea: newAreaInput.trim(),
          region: reassignRegion,
          city: newAreaInput.trim(),
        }
      });
      setAgents((prev) =>
        prev.map((a) => (a.id === selectedAgent.id ? { ...a, assignedArea: newAreaInput.trim(), city: newAreaInput.trim() } : a))
      );
      setAssignAreaOpen(false);
      setSelectedAgent(null);
      setNewAreaInput("");
      setFeedback(`✅ Operational territory successfully updated to "${newAreaInput.trim()}"!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message || "Failed to update agent territory"}`);
    }
  };

  // Assign Task to Agent
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      await apiFetch(`/admin/agents/${selectedAgent.id}/tasks`, {
        method: "POST",
        body: {
          ...newTask,
          propertyTitle: newTask.propertyTitle || undefined,
        },
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
        propertyTitle: "",
      });
      setFeedback(`📋 New field task dispatched to ${selectedAgent.name} (${selectedAgent.assignedArea})!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`❌ Error: ${err.message || "Failed to dispatch field task"}`);
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
    setActiveDrawerTab("tasks");
    try {
      const details = await apiFetch(`/admin/agents/${agent.id}/details`);
      setAgentDetails(details);
    } catch {
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
        <div className={`p-4 rounded-xl border text-xs font-bold shadow-lg transition-all ${feedback.startsWith('❌') ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'}`}>
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

      {/* Agent Table - Structured with strict table-cell classes to prevent layout shifts */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4 min-w-[220px]">AGENT</th>
                <th className="p-4 min-w-[170px]">ASSIGNED AREA</th>
                <th className="p-4 text-center min-w-[130px]">MANAGED PROPERTIES</th>
                <th className="p-4 text-center min-w-[130px]">VERIFICATIONS DONE</th>
                <th className="p-4 text-center min-w-[110px]">ACTIVE TASKS</th>
                <th className="p-4 text-center min-w-[110px]">PERFORMANCE</th>
                <th className="p-4 text-center min-w-[100px]">STATUS</th>
                <th className="p-4 text-center min-w-[180px]">ACTIONS</th>
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
                    {/* 1. AGENT INFO */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageUrl(agent.avatarUrl)}
                          alt={agent.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate">{agent.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{agent.email}</p>
                          <p className="text-[10px] text-slate-400 truncate">{agent.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. ASSIGNED AREA */}
                    <td className="p-4 align-middle">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{agent.assignedArea || 'Addis Ababa'}</span>
                      </div>
                    </td>

                    {/* 3. MANAGED PROPERTIES */}
                    <td className="p-4 align-middle text-center">
                      <span className="font-extrabold text-white text-sm">{agent.propertiesManaged || 0}</span>
                    </td>

                    {/* 4. VERIFICATIONS DONE */}
                    <td className="p-4 align-middle text-center">
                      <span className="font-semibold text-amber-300 text-xs">{agent.verificationsCompleted || 0}</span>
                    </td>

                    {/* 5. ACTIVE TASKS */}
                    <td className="p-4 align-middle text-center">
                      <span className="font-extrabold text-purple-300 text-sm">{agent.activeTasks || 0}</span>
                    </td>

                    {/* 6. PERFORMANCE */}
                    <td className="p-4 align-middle text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                        {agent.performanceScore || 98}% Score
                      </span>
                    </td>

                    {/* 7. STATUS */}
                    <td className="p-4 align-middle text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          agent.agentStatus === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {agent.agentStatus || "Active"}
                      </span>
                    </td>

                    {/* 8. ACTIONS */}
                    <td className="p-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setAssignTaskOpen(true);
                          }}
                          title="Assign Field Task"
                          className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1"
                        >
                          <PlusCircle className="h-3 w-3" /> Task
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setNewAreaInput(agent.assignedArea || "");
                            setAssignAreaOpen(true);
                          }}
                          title="Reassign Territory"
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          Area
                        </button>
                        <button
                          onClick={() => handleViewDetails(agent)}
                          title="View Agent Performance & Houses"
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
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
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
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
              Create an official field agent account. The agent will have access strictly limited to properties and users within their designated city or region.
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
                  <label className="text-slate-400 block mb-1 font-semibold">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      const reg = e.target.value;
                      setSelectedRegion(reg);
                      const defaultCity = (ETHIOPIAN_LOCATIONS[reg] || [])[0] || reg;
                      setNewAgent({ ...newAgent, region: reg, assignedArea: defaultCity, city: defaultCity });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    {Object.keys(ETHIOPIAN_LOCATIONS).map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Assigned City / Sub-City</label>
                  <input
                    type="text"
                    required
                    list="new-agent-territory-list"
                    value={newAgent.assignedArea}
                    onChange={(e) => setNewAgent({ ...newAgent, assignedArea: e.target.value, city: e.target.value })}
                    placeholder="e.g. Debre Birhan, Adama, Bole"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                  <datalist id="new-agent-territory-list">
                    {(ETHIOPIAN_LOCATIONS[selectedRegion] || []).map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Initial Password</label>
                <input
                  type="text"
                  required
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setAddAgentOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-650"
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
              <CheckSquare className="h-5 w-5 text-purple-400" /> Dispatch Field Task to Agent
            </h3>
            <p className="text-xs text-slate-300">
              Assign an on-site field task directly to <strong className="text-white">{selectedAgent.name}</strong>.
            </p>

            <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-purple-200">
              <MapPin className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <p>
                Agent operating territory: <strong className="text-emerald-400">{selectedAgent.assignedArea || 'Addis Ababa'}</strong>. The agent will view this task in their portal task list and get immediate notification.
              </p>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. On-site Inspection & Title Deed Verification"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Task Category / Type</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="Property Inspection">Property Inspection</option>
                    <option value="Landlord Verification">Landlord Verification</option>
                    <option value="Photoshoot Schedule">Photoshoot Schedule</option>
                    <option value="Key Handover & Check-in">Key Handover & Check-in</option>
                    <option value="Dispute Resolution">Dispute Resolution</option>
                    <option value="Offline Tenant Onboarding">Offline Tenant Onboarding</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Property / House (Optional)</label>
                  <input
                    type="text"
                    value={newTask.propertyTitle}
                    onChange={(e) => setNewTask({ ...newTask, propertyTitle: e.target.value })}
                    placeholder="e.g. 2-Bedroom Villa in Debre Birhan"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Instructions & Notes for Agent</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Provide precise field instructions (e.g., verify kebele ownership docs, capture 5 photos of compound, confirm rental readiness)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setAssignTaskOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-650"
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
              <MapPin className="h-5 w-5 text-emerald-400" /> Assign Operational Territory
            </h3>
            <p className="text-xs text-slate-300">
              Assign or update the authorized operational area for agent <strong className="text-white">{selectedAgent.name}</strong>. All house listings and user queries will be restricted to this town.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Region</label>
                <select
                  value={reassignRegion}
                  onChange={(e) => {
                    const reg = e.target.value;
                    setReassignRegion(reg);
                    const defaultCity = (ETHIOPIAN_LOCATIONS[reg] || [])[0] || reg;
                    setNewAreaInput(defaultCity);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.keys(ETHIOPIAN_LOCATIONS).map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">City / Sub-City Operational Territory</label>
                <input
                  type="text"
                  required
                  list="reassign-locations-list"
                  value={newAreaInput}
                  onChange={(e) => setNewAreaInput(e.target.value)}
                  placeholder="e.g. Debre Birhan, Adama, Hawassa, Bole"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <datalist id="reassign-locations-list">
                  {(ETHIOPIAN_LOCATIONS[reassignRegion] || []).map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/80">
              <button
                onClick={() => setAssignAreaOpen(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-650"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArea}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
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
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <MapPin className="h-3 w-3" /> {selectedAgent.assignedArea || 'Addis Ababa'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Status: <strong className={selectedAgent.agentStatus === 'Active' ? 'text-emerald-400' : 'text-rose-400'}>{selectedAgent.agentStatus || 'Active'}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{selectedAgent.email} • {selectedAgent.phone || 'No phone'}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Houses in Area</span>
                <span className="text-white font-extrabold text-base">{selectedAgent.propertiesManaged || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Users in Area</span>
                <span className="text-emerald-400 font-extrabold text-base">{selectedAgent.usersManaged || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Active Tasks</span>
                <span className="text-purple-400 font-extrabold text-base">{selectedAgent.activeTasks || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Performance</span>
                <span className="text-amber-400 font-extrabold text-base">{selectedAgent.performanceScore || 98}%</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700 gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveDrawerTab("tasks")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeDrawerTab === "tasks"
                    ? "border-purple-500 text-purple-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Assigned Tasks ({agentDetails?.tasks?.length || 0})
              </button>
              <button
                onClick={() => setActiveDrawerTab("properties")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeDrawerTab === "properties"
                    ? "border-emerald-500 text-emerald-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Houses in Area ({agentDetails?.propertiesInArea?.length || 0})
              </button>
              <button
                onClick={() => setActiveDrawerTab("users")}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeDrawerTab === "users"
                    ? "border-blue-500 text-blue-300 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Users in Area ({agentDetails?.usersInArea?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            {activeDrawerTab === "tasks" && (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {agentDetails?.tasks?.length === 0 || !agentDetails?.tasks ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-900/60 rounded-xl text-center">
                    No active tasks assigned. Click <strong>"+ Task"</strong> in the table to dispatch a task.
                  </p>
                ) : (
                  agentDetails.tasks.map((tsk: any) => (
                    <div key={tsk.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{tsk.title}</p>
                        <p className="text-[10px] text-slate-400">{tsk.type} • Priority: <span className="text-purple-300 font-semibold">{tsk.priority}</span> • Due: {new Date(tsk.dueDate).toLocaleDateString()}</p>
                        {tsk.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tsk.description}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tsk.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-amber-300'}`}>
                        {tsk.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeDrawerTab === "properties" && (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {agentDetails?.propertiesInArea?.length === 0 || !agentDetails?.propertiesInArea ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-900/60 rounded-xl text-center">
                    No houses currently registered in {selectedAgent.assignedArea}.
                  </p>
                ) : (
                  agentDetails.propertiesInArea.map((prop: any) => (
                    <div key={prop.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{prop.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {prop.city} • {prop.area} • {prop.price?.toLocaleString()} ETB / {prop.rentalPeriod}
                        </p>
                        <p className="text-[10px] text-emerald-400">Landlord: {prop.providerName} ({prop.providerPhone})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prop.isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {prop.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeDrawerTab === "users" && (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {agentDetails?.usersInArea?.length === 0 || !agentDetails?.usersInArea ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-900/60 rounded-xl text-center">
                    No seekers or providers located in {selectedAgent.assignedArea}.
                  </p>
                ) : (
                  agentDetails.usersInArea.map((usr: any) => (
                    <div key={usr.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{usr.name}</p>
                        <p className="text-[10px] text-slate-400">{usr.email} • {usr.phone}</p>
                        <p className="text-[10px] text-slate-400">Location: {usr.city || usr.address || selectedAgent.assignedArea}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-bold text-[10px]">
                        {usr.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-700/80">
              <button
                onClick={() => setDetailsDrawerOpen(false)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-xl text-xs font-semibold"
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
