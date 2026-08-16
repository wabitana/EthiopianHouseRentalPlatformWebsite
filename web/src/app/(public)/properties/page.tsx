'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/services/property.service';

export default function PropertiesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', 'published'],
    queryFn: () => propertyService.getPublished(),
  });

  const properties = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Browse Properties for Rent & Sale</h1>
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading verified property listings...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-500">Failed to connect to REST API backend.</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No properties published yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.map((prop: any) => (
            <div key={prop.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-200 relative">
                {prop.images?.[0]?.url && (
                  <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />
                )}
                <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                  {prop.transactionType}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{prop.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{prop.city}, {prop.areaName}</p>
                <div className="flex justify-between items-center text-slate-700 text-sm font-semibold">
                  <span>ETB {prop.price.toLocaleString()}</span>
                  <span>{prop.bedrooms} Bed | {prop.bathrooms} Bath</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
