'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Role } from '@/types/user';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Business Rule: Users can only sign up as RENTER or OWNER (NO ADMIN option on public registration)
  const [selectedRole, setSelectedRole] = useState<'RENTER' | 'OWNER'>('RENTER');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.register({
        name,
        email,
        phone,
        password,
        roles: [selectedRole as Role],
      });

      if (res.success && res.data) {
        const { user, tokens } = res.data;
        setAuth(user, tokens.accessToken, tokens.refreshToken);

        // Role-Based Redirection
        if (selectedRole === 'OWNER') {
          router.push('/owner/dashboard');
        } else {
          router.push('/renter/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: unknown) {
      const errorObj = err as { error?: { message?: string }; message?: string };
      setError(errorObj?.error?.message || errorObj?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-sm text-slate-500">Join Ethiopia premier real estate platform for rentals & sales</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Role Selector (Renter vs Owner Only - NO Admin Option) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">I am registering as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('RENTER')}
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  selectedRole === 'RENTER'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xl mb-1">??</span>
                <span className="text-sm">Renter / Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('OWNER')}
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  selectedRole === 'OWNER'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xl mb-1">??</span>
                <span className="text-sm">Property Owner</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * Note: Administrator accounts are created by invitation or backend seed setup only.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abebe Kebede"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251911000000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Register as ${selectedRole === 'OWNER' ? 'Property Owner' : 'Renter'}`}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
