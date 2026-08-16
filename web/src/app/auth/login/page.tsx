'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || data.message || 'Login failed');
        return;
      }
      const { user, tokens } = data.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      if (user.roles?.includes('ADMIN')) router.push('/admin/dashboard');
      else if (user.roles?.includes('OWNER')) router.push('/owner/dashboard');
      else router.push('/renter/dashboard');
    } catch {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-500">Sign in to manage properties, rental agreements and requests</p>
        </div>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email or Phone</label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="owner@ethioproperty.et or +251911..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          No account yet?{' '}
          <Link href="/auth/register" className="font-bold text-emerald-600 hover:underline">Create Account</Link>
        </div>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 mb-1">Demo Credentials:</p>
          <p>Owner: <span className="font-mono">owner@ethioproperty.et</span> / <span className="font-mono">Owner@123456</span></p>
          <p>Renter: <span className="font-mono">renter@ethioproperty.et</span> / <span className="font-mono">Renter@123456</span></p>
          <p>Admin: <span className="font-mono">admin@ethioproperty.et</span> / <span className="font-mono">Admin@123456</span></p>
        </div>
      </div>
    </div>
  );
}
