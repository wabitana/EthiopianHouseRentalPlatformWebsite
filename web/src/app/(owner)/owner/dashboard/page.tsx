'use client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Owner Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'My Properties', value: '0', icon: '🏠', href: '/owner/properties' },
            { label: 'Rental Requests', value: '0', icon: '📋', href: '/owner/rental-requests' },
            { label: 'Sale Requests', value: '0', icon: '💰', href: '/owner/sale-requests' },
            { label: 'Messages', value: '0', icon: '💬', href: '/owner/messages' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <p className="text-3xl mb-3">{item.icon}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-500 mt-1">{item.label}</p>
            </Link>
          ))}
        </div>
        <div className="flex gap-4">
          <Link href="/owner/properties/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            + Post New Property
          </Link>
          <Link href="/owner/subscription"
            className="border border-emerald-600 text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors">
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
