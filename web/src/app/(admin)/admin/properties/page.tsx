'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProperties(); }, []);

  async function fetchProperties() {
    try {
      const res = await apiClient.get('/admin/properties', true);
      if (res.success) setProperties(res.data.properties || []);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  }

  async function handleApprove(id: string) {
    try {
      const res = await apiClient.patch(`/properties/${id}/status`, { status: 'APPROVED' }, true);
      if (res.success) {
        alert('Property approved successfully!');
        fetchProperties();
      }
    } catch (err: any) {
      alert(err.error?.message || 'Failed to update property status.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Properties Auditor</h1>
        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-150">{p.title}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{p.propertyType} ({p.listingType || p.transactionType})</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700 dark:text-emerald-400">ETB {p.price?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        p.status === 'APPROVED' || p.status === 'PUBLISHED' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : p.status === 'PENDING_REVIEW'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-450'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'PENDING_REVIEW' && (
                        <button onClick={() => handleApprove(p.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs">
                          Approve Listing
                        </button>
                      )}
                    </td>
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
