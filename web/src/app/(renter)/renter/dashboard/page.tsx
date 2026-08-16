'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { rentalService } from '@/services/rental.service';
import { saleService } from '@/services/sale.service';

export default function RenterDashboardPage() {
  const { data: rentalsData } = useQuery({
    queryKey: ['rentals', 'my-requests'],
    queryFn: () => rentalService.getMyRequests(),
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales', 'my-requests'],
    queryFn: () => saleService.getMyRequests(),
  });

  const rentals = rentalsData?.data || [];
  const sales = salesData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Renter & Buyer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Rental Requests ({rentals.length})</h2>
          {rentals.length === 0 ? (
            <p className="text-slate-500 text-sm">No active rental requests sent yet.</p>
          ) : (
            <div className="space-y-4">
              {rentals.map((r: any) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{r.property?.title}</h4>
                    <p className="text-xs text-slate-500">Status: {r.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">ETB {r.property?.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Purchase Offers ({sales.length})</h2>
          {sales.length === 0 ? (
            <p className="text-slate-500 text-sm">No active purchase offers sent yet.</p>
          ) : (
            <div className="space-y-4">
              {sales.map((s: any) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{s.property?.title}</h4>
                    <p className="text-xs text-slate-500">Status: {s.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">ETB {s.offerPrice?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
