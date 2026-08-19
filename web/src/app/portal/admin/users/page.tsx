"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  ShieldCheck,
  Ban,
  CheckCircle,
  Trash2,
  Activity,
  UserCheck,
  Building,
  Shield,
  X,
  AlertCircle,
  Check,
  UserPlus,
} from "lucide-react";
import { mockUsers, UserItem } from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";

const mapBackendUser = (u: any): UserItem => ({
  id: u.id,
  name: u.name,
  role: u.role === 'seeker' ? 'House Seeker' : u.role === 'provider' ? 'House Provider' : u.role === 'agent' ? 'Agent' : u.role === 'admin' ? 'Admin' : u.role,
  phone: u.phone,
  email: u.email,
  location: u.assignedArea || u.city || 'Addis Ababa',
  verificationStatus: u.isVerified ? 'Verified' : 'Pending',
  accountStatus: u.active ? 'Active' : 'Suspended',
  registrationDate: new Date(u.createdAt).toLocaleDateString(),
  avatar: u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.id}`,
  activityCount: 0,
});

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Dialog & View modal states
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [modalMode, setModalMode] = useState<
    "none" | "view" | "edit" | "suspend" | "activate" | "verify" | "reject" | "delete" | "activity"
  >("none");
  const [editFormData, setEditFormData] = useState<Partial<UserItem>>({});

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "seeker",
    city: "Addis Ababa",
    autoVerify: false, // Default false to match mobile app business rule (starts Pending / Not Verified)
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccessMsg(null);

    if (createFormData.password !== createFormData.confirmPassword) {
      setCreateError("Password and Confirm Password do not match!");
      return;
    }

    try {
      const newUser = await apiFetch("/admin/users", {
        method: "POST",
        body: {
          name: createFormData.name.trim(),
          email: createFormData.email.trim().toLowerCase(),
          phone: createFormData.phone.trim(),
          password: createFormData.password,
          confirmPassword: createFormData.confirmPassword,
          role: createFormData.role,
          city: createFormData.city.trim(),
          autoVerify: createFormData.autoVerify,
        },
      });

      const mapped = mapBackendUser(newUser);
      setUsers((prev) => [mapped, ...prev]);

      const otpNotice = newUser.emailVerificationCode ? ` • Generated OTP Code: ${newUser.emailVerificationCode}` : "";
      const statusText = newUser.isVerified ? "Verified" : "Pending Verification (Mobile Rule)";
      setCreateSuccessMsg(`User "${mapped.name}" registered! Status: ${statusText}${otpNotice}`);

      setTimeout(() => {
        setCreateModalOpen(false);
        setCreateSuccessMsg(null);
        setCreateFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "seeker",
          city: "Addis Ababa",
          autoVerify: false,
        });
      }, 2500);
    } catch (err: any) {
      console.error("Failed to create user:", err);
      setCreateError(err?.message || "Failed to create user account. Please check input fields.");
    }
  };

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/users");
      setUsers(data.map(mapBackendUser));
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.accountStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAction = (user: UserItem, mode: typeof modalMode) => {
    setSelectedUser(user);
    setModalMode(mode);
    if (mode === "edit") {
      setEditFormData({ ...user });
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (modalMode === "suspend") {
        await apiFetch(`/admin/users/${selectedUser.id}/status`, {
          method: "PATCH",
          body: { active: false }
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, accountStatus: "Suspended" } : u))
        );
      } else if (modalMode === "activate") {
        await apiFetch(`/admin/users/${selectedUser.id}/status`, {
          method: "PATCH",
          body: { active: true }
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, accountStatus: "Active" } : u))
        );
      } else if (modalMode === "verify") {
        await apiFetch(`/admin/users/${selectedUser.id}`, {
          method: "PUT",
          body: { isVerified: true }
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, verificationStatus: "Verified" } : u))
        );
      } else if (modalMode === "reject") {
        await apiFetch(`/admin/users/${selectedUser.id}`, {
          method: "PUT",
          body: { isVerified: false }
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, verificationStatus: "Rejected" } : u))
        );
      } else if (modalMode === "delete") {
        await apiFetch(`/admin/users/${selectedUser.id}`, {
          method: "DELETE"
        });
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      } else if (modalMode === "edit") {
        const backendRole = editFormData.role === 'House Seeker' ? 'seeker' : editFormData.role === 'House Provider' ? 'provider' : editFormData.role === 'Agent' ? 'agent' : 'admin';
        await apiFetch(`/admin/users/${selectedUser.id}`, {
          method: "PUT",
          body: {
            name: editFormData.name,
            email: editFormData.email,
            phone: editFormData.phone,
            role: backendRole,
            assignedArea: editFormData.location,
          }
        });
        await loadUsers();
      }
    } catch (err) {
      console.error("Failed to perform user action:", err);
      alert(err instanceof Error ? err.message : "Action failed");
    }

    setModalMode("none");
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-400" /> User Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage house seekers, house providers, agents, and system administrators across the platform.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" /> Create New User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, phone, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Roles</option>
              <option value="House Seeker">House Seeker</option>
              <option value="House Provider">House Provider</option>
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Email</th>
                <th className="p-4">Location</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="p-4 font-semibold text-white flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        user.role === "Admin"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : user.role === "Agent"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : user.role === "House Provider"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-700/60 text-slate-300 border-slate-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 font-mono text-[11px]">{user.phone}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4 text-slate-400">{user.location}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.verificationStatus === "Verified"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : user.verificationStatus === "Pending"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {user.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.accountStatus === "Active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{user.registrationDate}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleAction(user, "view")}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                        title="View User Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(user, "edit")}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(user, "activity")}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg"
                        title="View Activity Log"
                      >
                        <Activity className="h-4 w-4" />
                      </button>
                      {user.accountStatus === "Active" ? (
                        <button
                          onClick={() => handleAction(user, "suspend")}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg"
                          title="Suspend User"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user, "activate")}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg"
                          title="Activate User"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(user, "delete")}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-700 rounded-lg"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog Modals */}
      {modalMode !== "none" && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setModalMode("none");
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* VIEW USER MODAL */}
            {modalMode === "view" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-4 ring-emerald-500/30"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{selectedUser.role}</p>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Phone</span>
                    <span className="text-white font-mono font-semibold">{selectedUser.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Location</span>
                    <span className="text-white font-semibold">{selectedUser.location}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Verification</span>
                    <span className="text-emerald-400 font-bold">{selectedUser.verificationStatus}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase">Account Status</span>
                    <span className="text-white font-bold">{selectedUser.accountStatus}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleAction(selectedUser, "verify")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Verify User
                  </button>
                  <button
                    onClick={() => handleAction(selectedUser, "reject")}
                    className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded-xl text-xs font-bold"
                  >
                    Reject Verification
                  </button>
                </div>
              </div>
            )}

            {/* EDIT USER MODAL */}
            {modalMode === "edit" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Edit User Information</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phone || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Location / Sub-City</label>
                    <input
                      type="text"
                      value={editFormData.location || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setModalMode("none")}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* SUSPEND / ACTIVATE / VERIFY / REJECT / DELETE CONFIRMATION MODALS */}
            {(modalMode === "suspend" ||
              modalMode === "activate" ||
              modalMode === "verify" ||
              modalMode === "reject" ||
              modalMode === "delete") && (
              <div className="text-center space-y-4 py-2">
                <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
                <h3 className="text-lg font-bold text-white capitalize">
                  Confirm {modalMode} User?
                </h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to {modalMode} <strong className="text-white">{selectedUser.name}</strong>?
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={() => setModalMode("none")}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg ${
                      modalMode === "delete" || modalMode === "suspend" || modalMode === "reject"
                        ? "bg-rose-600 hover:bg-rose-500"
                        : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
                  >
                    Confirm {modalMode}
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVITY LOG MODAL */}
            {modalMode === "activity" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Activity Log - {selectedUser.name}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                    <p className="text-white font-semibold">Updated Profile Details</p>
                    <p className="text-[10px] text-slate-400">2 hours ago • Web Session</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                    <p className="text-white font-semibold">Logged into Portal</p>
                    <p className="text-[10px] text-slate-400">Yesterday at 14:22 • Addis Ababa IP</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                    <p className="text-white font-semibold">Account Registered</p>
                    <p className="text-[10px] text-slate-400">{selectedUser.registrationDate}</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setModalMode("none")}
                      className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" /> Register New Platform User
              </h3>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateError(null);
                  setCreateSuccessMsg(null);
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
                ⚠️ {createError}
              </div>
            )}

            {createSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold">
                ✓ {createSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Bikila"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+251 91 123 4567"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={createFormData.confirmPassword}
                    onChange={(e) => setCreateFormData({ ...createFormData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Account Role</label>
                  <select
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="seeker">House Seeker</option>
                    <option value="provider">House Provider</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">City / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Addis Ababa"
                    value={createFormData.city}
                    onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Initial Verification Status</label>
                <select
                  value={createFormData.autoVerify ? "verified" : "pending"}
                  onChange={(e) => setCreateFormData({ ...createFormData, autoVerify: e.target.value === "verified" })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="pending">Require Mobile OTP & ID Verification (Status: Pending)</option>
                  <option value="verified">Auto-Verify Account (Status: Verified)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mobile App Rule: House seekers and providers initially start as <span className="text-amber-400 font-bold">Pending</span> until OTP email code & ID document verification are completed.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setCreateError(null);
                    setCreateSuccessMsg(null);
                  }}
                  className="px-4 py-2 bg-slate-700 text-xs text-slate-300 hover:text-white rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded-xl font-bold shadow-lg"
                >
                  Save User to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
