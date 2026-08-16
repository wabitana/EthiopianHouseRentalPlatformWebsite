'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService.getPublicProperties({ page: 1, limit: 12 })
      .then((res) => { if (res.success && res.data) setProperties(res.data.properties || []); })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Browse Properties</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-xl font-semibold">No properties available yet.</p>
            <p className="mt-2">Check back soon as owners list new properties.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p: any) => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-shadow">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 h-48 flex items-center justify-center text-5xl">
                  🏠
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{p.title}</h2>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-bold">ETB {p.price?.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.listingType === 'RENT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.listingType}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
