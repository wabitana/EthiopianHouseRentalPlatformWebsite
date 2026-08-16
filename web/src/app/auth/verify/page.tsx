'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = searchParams.get('target') || '';
  const setAuth = useAuthStore((state) => state.setAuth);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: target, code }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || data.message || 'OTP verification failed');
        setLoading(false);
        return;
      }

      setSuccess('Verification successful! Logging you in...');
      
      // Verification was successful, redirect user to dashboard
      // Note: The user was already logged in upon registration, but we want to make sure they get the correct dashboard now
      setTimeout(() => {
        router.push('/auth/login'); // simple fallback to login to establish clean session
      }, 2000);
    } catch {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Verify Account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-800 dark:text-slate-200">{target}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Enter Verification Code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="123456"
            className="w-full text-center tracking-[1em] text-2xl font-black px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={<div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
