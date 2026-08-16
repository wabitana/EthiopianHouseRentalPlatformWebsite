'use client';

import { useEffect, useState } from 'react';
import { rentalService } from '@/services/rental.service';

export default function RenterRentalRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rentalService.getMyRequests('renter')
      .then((res) => { if (res.success) setRequests(res.data.requests || []); })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Rental Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Track status of rental requests you sent to landlords.</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 text-center py-20 rounded-2xl border border-slate-150 dark:border-slate-800 text-slate-500">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg font-bold">You haven't sent any rental requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-150 text-base">{r.property?.title || 'Unknown Property'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Landlord: <span className="font-semibold">{r.owner?.name || 'Owner'}</span> ({r.owner?.email})</p>
                  <p className="text-xs text-slate-400 mt-1">Submitted on: {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    r.status === 'ACCEPTED' 
                      ? 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : r.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
