'use client';
import Link from 'next/link';
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h1>
        <p className="text-slate-500 mb-6">Enter your email to receive a password reset link.</p>
        <p className="text-sm text-slate-400 bg-amber-50 p-4 rounded-xl border border-amber-100">Coming soon — password reset will be available shortly.</p>
        <Link href="/auth/login" className="mt-6 inline-block text-sm text-emerald-600 font-bold hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
