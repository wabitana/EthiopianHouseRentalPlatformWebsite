"use client";

import { useState, useEffect } from "react";
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, Clock, Filter, Download } from "lucide-react";
import { apiFetch } from "@/lib/api";

const mapBackendPayment = (p: any) => ({
  id: p.reference || p.id.substring(0, 8),
  property: p.subscription ? "Subscription Plan Renewal" : "Platform Booking Payout",
  provider: p.user?.name || "Anonymous Owner",
  amount: p.amountETB,
  commission: p.amountETB * 0.05,
  gateway: p.paymentMethod,
  date: new Date(p.createdAt).toLocaleDateString(),
  status: p.status === 'SUCCESS' ? 'Completed' : p.status === 'PENDING' ? 'Pending Payout' : 'Failed',
});

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "plans">("transactions");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({ name: "", priceETB: 0, durationDays: 30, maxListings: 10 });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [pmtData, planData] = await Promise.all([
        apiFetch("/admin/payments").catch(() => []),
        apiFetch("/admin/subscription-plans").catch(() => []),
      ]);
      setTransactions((pmtData || []).map(mapBackendPayment));
      setPlans(planData || []);
    } catch (err) {
      console.error("Failed to load payments data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      priceETB: plan.priceETB,
      durationDays: plan.durationDays,
      maxListings: plan.maxListings,
    });
    setSaveSuccessMsg("");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      await apiFetch(`/admin/subscription-plans/${editingPlan.id}`, {
        method: "PUT",
        body: planForm,
      });

      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, ...planForm } : p))
      );
      setSaveSuccessMsg(`Subscription plan "${planForm.name}" saved to database!`);
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
                  <span className="text-[11px] text-emerald-400 font-bold">Real-time DB Sum</span>
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

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Recent Platform Transactions</h3>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white rounded-xl flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4">Txn ID</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Landlord</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Commission</th>
                    <th className="p-4">Gateway</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-300">
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-750/50">
                        <td className="p-4 font-mono text-emerald-400 font-bold">{t.id}</td>
                        <td className="p-4 font-semibold text-white">{t.property}</td>
                        <td className="p-4">{t.provider}</td>
                        <td className="p-4 font-bold text-white">ETB {t.amount?.toLocaleString()}</td>
                        <td className="p-4 text-emerald-400 font-semibold">ETB {t.commission?.toLocaleString()}</td>
                        <td className="p-4 uppercase font-bold text-slate-400">{t.gateway}</td>
                        <td className="p-4">{t.date}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CreditCard className="h-7 w-7 text-slate-500" />
                          <p className="font-semibold text-slate-300">No Transaction Logs Recorded</p>
                          <p className="text-xs text-slate-500">Platform payments, payouts, and subscriptions will appear here when recorded.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
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
