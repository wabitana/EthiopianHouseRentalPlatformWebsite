'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/payments', true)
      .then((res) => { if (res.success) setPayments(res.data.payments || []); })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Transactions Log</h1>
        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 text-center py-20 rounded-2xl border border-slate-150 dark:border-slate-800 text-slate-500">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-lg font-bold">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-mono text-xs">{p.id}</td>
                    <td className="px-6 py-4 font-semibold">{p.user?.name || 'Owner'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400">ETB {p.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        p.status === 'SUCCESS' || p.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-450'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
