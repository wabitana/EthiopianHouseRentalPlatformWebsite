'use client';

import { useEffect, useState } from 'react';
import { rentalService } from '@/services/rental.service';

export default function OwnerRentalRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    try {
      const res = await rentalService.getMyRequests('owner');
      if (res.success) setRequests(res.data.requests || []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  }

  async function handleAction(id: string, action: 'accept' | 'reject') {
    setError('');
    try {
      const res = action === 'accept' 
        ? await rentalService.acceptRequest(id) 
        : await rentalService.rejectRequest(id);
      if (res.success) {
        alert(`Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
        fetchRequests();
      }
    } catch (err: any) {
      setError(err.error?.message || 'Failed to update request.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Rental Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Manage requests sent by potential tenants for your rental properties.</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 text-center py-20 rounded-2xl border border-slate-150 dark:border-slate-800 text-slate-500">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg font-bold">No rental requests received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-150 text-lg">{r.property?.title || 'Unknown Property'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tenant Name: <span className="font-semibold text-slate-700 dark:text-slate-300">{r.renter?.name}</span> ({r.renter?.email})</p>
                  {r.message && <p className="text-xs text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">"{r.message}"</p>}
                </div>
                <div className="flex items-center gap-3.5">
                  {r.status === 'PENDING' ? (
                    <>
                      <button onClick={() => handleAction(r.id, 'accept')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                        Accept
                      </button>
                      <button onClick={() => handleAction(r.id, 'reject')} className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                      {r.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
