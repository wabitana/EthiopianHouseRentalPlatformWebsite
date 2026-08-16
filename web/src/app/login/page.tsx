'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
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
      const res = await authService.login({ emailOrPhone, password });
      if (res.success && res.data) {
        const { user, tokens } = res.data;
        setAuth(user, tokens.accessToken, tokens.refreshToken);

        // Role-Based Dashboard Redirection
        if (user.roles.includes('ADMIN')) {
          router.push('/admin/dashboard');
        } else if (user.roles.includes('OWNER')) {
          router.push('/owner/dashboard');
        } else if (user.roles.includes('RENTER') || user.roles.includes('BUYER')) {
          router.push('/renter/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(res.message || 'Invalid login credentials');
      }
    } catch (err: unknown) {
      const errorObj = err as { error?: { message?: string }; message?: string };
      setError(errorObj?.error?.message || errorObj?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-500">Sign in to manage properties, rental agreements & requests</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email or Phone Number</label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. owner@ethioproperty.et or +251911000002"
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Don`t have an account yet?{' '}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            Create Account
          </Link>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 mb-1">Pre-Seeded Demo Credentials:</p>
          <p>Owner: <span className="font-mono text-slate-900">owner@ethioproperty.et</span> / <span className="font-mono text-slate-900">Owner@123456</span></p>
          <p>Renter: <span className="font-mono text-slate-900">renter@ethioproperty.et</span> / <span className="font-mono text-slate-900">Renter@123456</span></p>
          <p>Admin: <span className="font-mono text-slate-900">admin@ethioproperty.et</span> / <span className="font-mono text-slate-900">Admin@123456</span></p>
        </div>
      </div>
    </div>
  );
}
