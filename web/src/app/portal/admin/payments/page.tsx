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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/payments");
      setTransactions(data.map(mapBackendPayment));
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-emerald-400" /> Platform Payments & Revenue
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Transaction commissions, payment gateway logs (Chapa, Telebirr, CBE Birr), and landlord payouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-400 font-medium">Total Rent Processed</span>
          <p className="text-2xl font-extrabold text-white mt-1">ETB 4,850,000</p>
          <span className="text-[11px] text-emerald-400 font-bold">+15.8% this month</span>
        </div>
        <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-400 font-medium">Platform Commission (5%)</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">ETB 242,500</p>
          <span className="text-[11px] text-slate-400">Net Platform Income</span>
        </div>
        <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-400 font-medium">Pending Landlord Payouts</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">ETB 30,400</p>
          <span className="text-[11px] text-slate-400">1 Transaction Queued</span>
        </div>
      </div>

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
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-750/50">
                  <td className="p-4 font-mono font-bold text-white">{t.id}</td>
                  <td className="p-4 font-semibold text-white">{t.property}</td>
                  <td className="p-4">{t.provider}</td>
                  <td className="p-4 font-mono font-bold text-white">ETB {t.amount.toLocaleString()}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">ETB {t.commission.toLocaleString()}</td>
                  <td className="p-4">{t.gateway}</td>
                  <td className="p-4 text-slate-400">{t.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
