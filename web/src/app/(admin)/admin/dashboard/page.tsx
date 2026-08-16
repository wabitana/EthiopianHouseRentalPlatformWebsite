'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export default function AdminDashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => analyticsService.getAdminStats(),
  });

  const stats = statsData?.data || {};

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Platform Admin Control Panel</h1>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading platform metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Total Properties</p>
            <p className="text-3xl font-extrabold text-blue-600">{stats.totalProperties || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-slate-500 text-sm mb-1">Pending Approval Reviews</p>
            <p className="text-3xl font-extrabold text-amber-500">{stats.pendingProperties || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}
