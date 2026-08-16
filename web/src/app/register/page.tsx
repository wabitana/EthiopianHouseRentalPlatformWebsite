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

  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'RENTER' | 'OWNER'>('RENTER');

  // OTP Verification Field
  const [otpCode, setOtpCode] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Submit Initial Registration (Triggers Email OTP)
  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

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

        // Move to OTP Step
        setStep('OTP');
        setSuccessMsg(`We sent a 6-digit verification OTP to ${email}. Please check your inbox.`);
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

  // Step 2: Verify Email OTP Code
  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.verifyPhone({
        phoneOrEmail: email,
        code: otpCode,
      });

      if (res.success) {
        // Redirection based on role rules
        if (selectedRole === 'OWNER') {
          // Owner requires ID & House License Upload -> Admin Review
          router.push('/owner/dashboard');
        } else {
          // Renter is immediately ACTIVE
          router.push('/renter/dashboard');
        }
      } else {
        setError(res.message || 'Invalid or expired OTP code');
      }
    } catch (err: unknown) {
      const errorObj = err as { error?: { message?: string }; message?: string };
      setError(errorObj?.error?.message || errorObj?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  }

  // Resend Email OTP
  async function handleResendOtp() {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await authService.register({
        name,
        email,
        phone,
        password,
        roles: [selectedRole as Role],
      });
      setSuccessMsg(`A new OTP has been sent to ${email}`);
    } catch {
      setError('Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {step === 'REGISTER' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h1>
              <p className="text-sm text-slate-500">Join Ethiopia`s premier real estate platform for rentals & sales</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
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
                    <span className="block text-xl mb-1">🔑</span>
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
                    <span className="block text-xl mb-1">🏠</span>
                    <span className="text-sm">Property Owner</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  * Note: Renters require email verification only. Owners require identity & document verification.
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
          </>
        ) : (
          /* STEP 2: EMAIL OTP VERIFICATION */
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✉️
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
              <p className="text-sm text-slate-500">
                We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-4 rounded-xl border border-slate-300 text-center text-3xl tracking-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Continue'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 flex justify-between items-center px-2">
              <button
                type="button"
                onClick={() => setStep('REGISTER')}
                className="text-slate-600 hover:text-slate-900 underline text-xs"
              >
                ← Edit Registration Info
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-bold text-emerald-600 hover:underline text-xs"
              >
                Resend Code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
