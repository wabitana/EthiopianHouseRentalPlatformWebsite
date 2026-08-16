'use client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('ADMIN')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform Control Panel — Logged in as {user.name}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Users', icon: '👥', href: '/admin/users' },
            { label: 'Properties', icon: '🏠', href: '/admin/properties' },
            { label: 'Verification Queue', icon: '🔍', href: '/admin/verification' },
            { label: 'Subscriptions', icon: '📦', href: '/admin/subscriptions' },
            { label: 'Payments', icon: '💳', href: '/admin/payments' },
            { label: 'Rental Requests', icon: '📋', href: '/admin/rental-requests' },
            { label: 'Sale Requests', icon: '💰', href: '/admin/sale-requests' },
            { label: 'Analytics', icon: '📊', href: '/admin/analytics' },
            { label: 'Reports', icon: '🚩', href: '/admin/reports' },
            { label: 'Audit Logs', icon: '📝', href: '/admin/audit-logs' },
            { label: 'AI Assistant', icon: '🤖', href: '/admin/ai' },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <p className="text-3xl mb-3">{item.icon}</p>
              <p className="font-bold text-slate-900">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
