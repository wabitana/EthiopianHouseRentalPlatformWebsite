'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api';
import { ShieldCheck, ShieldAlert, User } from 'lucide-react';

export default function RenterProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/users/me', true)
      .then((res) => { if (res.success) setProfile(res.data.user || res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-[60vh] justify-center items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  );

  const isVerified = profile?.isIdentityVerified;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Account Settings</h1>

        {/* Binance / Bybit style Verification Banner Card */}
        {isVerified ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-lg">Verified Account</h3>
                <span className="bg-emerald-600 text-white text-xxs px-2 py-0.5 rounded font-black tracking-wider uppercase">Level 1</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-0.5">Your passport / National ID identity has been checked and approved.</p>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-rose-800 dark:text-rose-450 text-lg">Identity Unverified</h3>
                <p className="text-xs text-rose-700 dark:text-rose-500 mt-0.5">Please verify your ID (National ID or Passport) to secure your transaction applications.</p>
              </div>
            </div>
            {/* Renters can verify ID via owner verification page as well */}
            <Link 
              href="/owner/verification" 
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm text-center"
            >
              Verify Identity
            </Link>
          </div>
        )}

        {/* Profile Details Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-450" /> Personal Profile
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-450 uppercase mb-1">Full Name</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{profile?.name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-450 uppercase mb-1">Email Address</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{profile?.email || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-450 uppercase mb-1">Phone Number</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{profile?.phone || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-450 uppercase mb-1">Member Since</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
