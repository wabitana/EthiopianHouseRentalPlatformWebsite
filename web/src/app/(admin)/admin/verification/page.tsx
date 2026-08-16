'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export default function AdminVerificationQueuePage() {
  const [identityDocs, setIdentityDocs] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchPendingDocs(); }, []);

  async function fetchPendingDocs() {
    try {
      const res = await apiClient.get('/verification/pending', true);
      if (res.success) {
        setIdentityDocs(res.data.identityDocuments || []);
        setLicenses(res.data.licenses || []);
      }
    } catch { 
      setIdentityDocs([]);
      setLicenses([]);
    } finally { setLoading(false); }
  }

  async function handleReview(id: string, type: 'identity' | 'license', status: 'VERIFIED' | 'REJECTED') {
    setError('');
    try {
      const endpoint = type === 'identity' 
        ? `/verification/identity/${id}/review` 
        : `/verification/license/${id}/review`;
      
      const res = await apiClient.patch(endpoint, { status }, true);
      if (res.success) {
        alert('Document status updated successfully!');
        fetchPendingDocs();
      }
    } catch (err: any) {
      setError(err.error?.message || 'Failed to update document status.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Verification Document Review Queue</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit submitted passports, National IDs, and land Kartas for authenticity.</p>
        </div>

        {error && <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-semibold text-sm">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Identity Documents Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pending Passports & ID Cards</h2>
              {identityDocs.length === 0 ? (
                <p className="text-slate-500 text-sm">No identity documents waiting review.</p>
              ) : (
                <div className="space-y-4">
                  {identityDocs.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{doc.user?.name || 'Owner'}</p>
                        <p className="text-xs text-slate-450">{doc.documentType} (#{doc.documentNumber})</p>
                      </div>
                      <a href={doc.documentUrl} target="_blank" className="text-xs text-emerald-600 hover:underline block font-bold">
                        View Uploaded ID File
                      </a>
                      <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => handleReview(doc.id, 'identity', 'VERIFIED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
                          Approve
                        </button>
                        <button onClick={() => handleReview(doc.id, 'identity', 'REJECTED')} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Karta Licenses Queue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pending Property Karta Documents</h2>
              {licenses.length === 0 ? (
                <p className="text-slate-500 text-sm">No house licenses/Karta waiting review.</p>
              ) : (
                <div className="space-y-4">
                  {licenses.map((lic) => (
                    <div key={lic.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{lic.owner?.name || 'Landlord'}</p>
                        <p className="text-xs text-slate-450">Karta License Number: {lic.licenseNumber}</p>
                      </div>
                      <a href={lic.documentUrl} target="_blank" className="text-xs text-emerald-600 hover:underline block font-bold">
                        View Uploaded Karta File
                      </a>
                      <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => handleReview(lic.id, 'license', 'VERIFIED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
                          Approve
                        </button>
                        <button onClick={() => handleReview(lic.id, 'license', 'REJECTED')} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
