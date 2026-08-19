"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, Clock, Filter, Download, Trash2, Eye, X, RefreshCw, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

const mapBackendPayment = (p: any) => ({
  id: p.reference || p.id.substring(0, 8),
  rawId: p.id,
  property: p.subscription
    ? `Subscription: ${p.subscription?.plan?.name || 'Landlord Plan'}`
    : p.order
    ? `Order #${p.order?.orderNumber || 'Vendor Store'}`
    : p.serviceBooking
    ? `Booking #${p.serviceBooking?.bookingNumber || 'Home Service'}`
    : "Platform Rental Booking Payout",
  provider: p.user?.name || "Anonymous Owner",
  providerEmail: p.user?.email || "N/A",
  providerPhone: p.user?.phone || "N/A",
  providerRole: p.user?.role || "User",
  amount: p.amountETB || 0,
  commission: (p.amountETB || 0) * 0.05,
  payoutAmount: (p.amountETB || 0) * 0.95,
  gateway: p.paymentMethod || 'CHAPA',
  date: new Date(p.createdAt).toLocaleDateString(),
  fullTime: new Date(p.createdAt).toLocaleString(),
  status: p.status === 'SUCCESS' ? 'Completed' : p.status === 'PENDING' ? 'Pending Payout' : 'Failed',
  rawStatus: p.status,
  subscriptionDetails: p.subscription,
  orderDetails: p.order,
  bookingDetails: p.serviceBooking,
});

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "plans">("transactions");
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d" | "6m" | "1y">("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);

  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({ name: "", priceETB: 0, durationDays: 30, maxListings: 10 });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  async function loadTransactions(period = timeFilter) {
    try {
      setLoading(true);
      const url = period === "all" ? "/admin/payments" : `/admin/payments?period=${period}`;
      const pmtData = await apiFetch(url).catch(() => []);
      setTransactions((pmtData || []).map(mapBackendPayment));
    } catch (err) {
      console.error("Failed to load payments data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPlans() {
    try {
      const planData = await apiFetch("/admin/subscription-plans").catch(() => []);
      setPlans(planData || []);
    } catch (err) {
      console.error("Failed to load subscription plans:", err);
    }
  }

  useEffect(() => {
    loadTransactions(timeFilter);
    loadPlans();
  }, [timeFilter]);

  const handlePeriodChange = (period: "all" | "7d" | "30d" | "6m" | "1y") => {
    setTimeFilter(period);
  };

  const handleDeleteTransaction = async (e: React.MouseEvent, rawId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this transaction record from database?")) return;
    try {
      await apiFetch(`/admin/payments/${rawId}`, { method: "DELETE" });
      setTransactions((prev) => prev.filter((t) => t.rawId !== rawId));
      if (selectedTxn?.rawId === rawId) setSelectedTxn(null);
    } catch (err) {
      console.error("Failed to delete payment transaction:", err);
    }
  };

  const handleClearAllTransactions = async () => {
    if (!confirm("⚠️ Are you sure you want to clear ALL payment transaction logs from database?")) return;
    try {
      await apiFetch("/admin/payments/clear-all", { method: "DELETE" });
      setTransactions([]);
      setSelectedTxn(null);
    } catch (err) {
      console.error("Failed to clear transaction logs:", err);
    }
  };

  // Plan editing & validation
  const handleEditClick = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      name: String(plan.name || "").trim(),
      priceETB: Math.max(0, Number(plan.priceETB || 0)),
      durationDays: Math.max(1, Number(plan.durationDays || 30)),
      maxListings: Math.max(1, Number(plan.maxListings || 10)),
    });
    setSaveSuccessMsg("");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    // Input sanitization & security bounds
    const sanitizedForm = {
      name: String(planForm.name).trim().slice(0, 50),
      priceETB: Math.max(0, Number(planForm.priceETB) || 0),
      durationDays: Math.max(1, Math.min(365, Number(planForm.durationDays) || 30)),
      maxListings: Math.max(1, Math.min(10000, Number(planForm.maxListings) || 1)),
    };

    try {
      await apiFetch(`/admin/subscription-plans/${editingPlan.id}`, {
        method: "PUT",
        body: sanitizedForm,
      });

      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, ...sanitizedForm } : p))
      );
      setSaveSuccessMsg(`Subscription plan "${sanitizedForm.name}" updated successfully!`);
      setTimeout(() => setEditingPlan(null), 1200);
    } catch (err) {
      console.error("Failed to save subscription plan:", err);
    }
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
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-emerald-400" /> Platform Payments & Subscriptions
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Transaction commissions, Chapa payments, and landlord subscription pricing management.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "transactions"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Transactions Logs
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "plans"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Subscription Plans
          </button>
        </div>
      </div>

      {activeTab === "transactions" ? (
        <>
          {/* Summary KPI Cards */}
          {(() => {
            const totalRent = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
            const totalCommission = transactions.reduce((acc, t) => acc + (t.commission || 0), 0);
            const pendingPayouts = transactions.filter(t => t.status === 'Pending Payout').reduce((acc, t) => acc + (t.amount || 0), 0);
            const pendingCount = transactions.filter(t => t.status === 'Pending Payout').length;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Total Rent Processed</span>
                  <p className="text-2xl font-extrabold text-white mt-1">ETB {totalRent.toLocaleString()}</p>
                  <span className="text-[11px] text-emerald-400 font-bold">Real-time DB Sum ({timeFilter.toUpperCase()})</span>
                </div>
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Platform Commission (5%)</span>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">ETB {totalCommission.toLocaleString()}</p>
                  <span className="text-[11px] text-slate-400">Net Platform Income</span>
                </div>
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-medium">Pending Landlord Payouts</span>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">ETB {pendingPayouts.toLocaleString()}</p>
                  <span className="text-[11px] text-slate-400">{pendingCount} Transaction{pendingCount === 1 ? '' : 's'} Queued</span>
                </div>
              </div>
            );
          })()}

          {/* Time History Filter Bar & Clear Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
                <Filter className="h-3.5 w-3.5 text-emerald-400" /> History Filter:
              </span>
              {[
                { label: "All Time", value: "all" },
                { label: "Past Week", value: "7d" },
                { label: "Past Month", value: "30d" },
                { label: "Past 6 Months", value: "6m" },
                { label: "Past Year", value: "1y" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => handlePeriodChange(item.value as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                    timeFilter === item.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {transactions.length > 0 && (
              <button
                onClick={handleClearAllTransactions}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Transaction Logs
              </button>
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Recent Platform Transactions ({transactions.length})</h3>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white rounded-xl flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4">Txn ID</th>
                    <th className="p-4">Property / Purpose</th>
                    <th className="p-4">Landlord</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Commission</th>
                    <th className="p-4">Gateway</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-300">
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <tr
                        key={t.rawId}
                        onClick={() => setSelectedTxn(t)}
                        className="hover:bg-slate-750/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-mono text-emerald-400 font-bold">{t.id}</td>
                        <td className="p-4 font-semibold text-white max-w-xs truncate">{t.property}</td>
                        <td className="p-4">{t.provider}</td>
                        <td className="p-4 font-bold text-white">ETB {t.amount?.toLocaleString()}</td>
                        <td className="p-4 text-emerald-400 font-semibold">ETB {t.commission?.toLocaleString()}</td>
                        <td className="p-4 uppercase font-bold text-slate-400">{t.gateway}</td>
                        <td className="p-4">{t.date}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              t.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : t.status === "Pending Payout"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTxn(t);
                              }}
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors"
                              title="View Transaction Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTransaction(e, t.rawId)}
                              className="p-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-lg transition-colors"
                              title="Delete Transaction Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CreditCard className="h-7 w-7 text-slate-500" />
                          <p className="font-semibold text-slate-300">No Transaction Logs Found for Selected Period ({timeFilter.toUpperCase()})</p>
                          <p className="text-xs text-slate-500">Platform payments, payouts, and subscriptions will appear here live when recorded.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Detail Modal */}
          {selectedTxn && (
            <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" /> Transaction Detail Verification
                    </h3>
                    <p className="text-xs text-slate-400">Ref: {selectedTxn.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTxn(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Transaction Reference</span>
                    <p className="font-mono font-bold text-emerald-400 text-sm">{selectedTxn.id}</p>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Payment Gateway</span>
                    <p className="font-bold text-white uppercase text-sm">{selectedTxn.gateway}</p>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Payer / Landlord Name</span>
                    <p className="font-bold text-white">{selectedTxn.provider}</p>
                    <p className="text-[10px] text-slate-400">{selectedTxn.providerEmail}</p>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">User Role & Contact</span>
                    <p className="font-semibold text-slate-300 uppercase">{selectedTxn.providerRole}</p>
                    <p className="text-[10px] text-slate-400">{selectedTxn.providerPhone}</p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Gross Transaction Amount:</span>
                    <span className="font-bold text-white">ETB {selectedTxn.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Platform Service Commission (5%):</span>
                    <span className="font-bold text-emerald-400">ETB {selectedTxn.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-bold">Net Landlord Payout (95%):</span>
                    <span className="font-extrabold text-amber-300 text-sm">ETB {selectedTxn.payoutAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
                  <p><strong className="text-slate-300">Purpose / Listing:</strong> {selectedTxn.property}</p>
                  <p><strong className="text-slate-300">Transaction Date:</strong> {selectedTxn.fullTime}</p>
                  <p><strong className="text-slate-300">Status:</strong> <span className="text-emerald-400 font-bold">{selectedTxn.status}</span></p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={(e) => handleDeleteTransaction(e, selectedTxn.rawId)}
                    className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Record
                  </button>
                  <button
                    onClick={() => setSelectedTxn(null)}
                    className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Subscription Plans Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {p.durationDays} Days
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-extrabold text-emerald-400">ETB {p.priceETB?.toLocaleString()}</span>
                    <span className="text-xs text-slate-400"> / renewal</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 font-medium">
                    Max Listings Limit: <strong className="text-white">{p.maxListings} Listings</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleEditClick(p)}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Edit Pricing & Limits
                </button>
              </div>
            ))}
          </div>

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-base">Edit {editingPlan.name} Subscription Plan</h3>
                  <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold">
                    ✓ {saveSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSavePlan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Price (ETB)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={planForm.priceETB}
                      onChange={(e) => setPlanForm({ ...planForm, priceETB: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="365"
                      value={planForm.durationDays}
                      onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Maximum Listings</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10000"
                      value={planForm.maxListings}
                      onChange={(e) => setPlanForm({ ...planForm, maxListings: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="px-4 py-2 bg-slate-700 text-xs text-slate-300 hover:text-white rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded-xl font-bold shadow-lg"
                    >
                      Save to Database
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
