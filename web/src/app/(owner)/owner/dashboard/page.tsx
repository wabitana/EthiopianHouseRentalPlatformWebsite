'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscription.service';

export default function OwnerDashboardPage() {
  const { data: subData } = useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  const activeSub = subData?.data;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Owner Property Control Panel</h1>
        <a href="/owner/create-property" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
          + Add New Property
        </a>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Subscription Status</h2>
        {activeSub ? (
          <div className="flex items-center gap-4 text-emerald-600 font-semibold">
            <span className="bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>
            <span>Plan: {activeSub.plan?.name} ({activeSub.plan?.maxListings} max listings)</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-amber-600 font-semibold">
            <span className="bg-amber-100 px-3 py-1 rounded-full text-xs font-bold">NO ACTIVE SUBSCRIPTION</span>
            <span>Subscribe to a plan to post properties on the platform.</span>
            <a href="/owner/subscription" className="underline text-blue-600 font-bold ml-auto">Choose Plan &rarr;</a>
          </div>
        )}
      </div>
    </div>
  );
}
