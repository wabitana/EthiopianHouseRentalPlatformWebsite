'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    propertyService.getPropertyById(id)
      .then((res) => { if (res.success && res.data) setProperty(res.data.property); })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex min-h-[60vh] justify-center items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  if (!property) return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4"><p className="text-5xl mb-4">🏚</p><h1 className="text-xl font-bold text-slate-900">Property Not Found</h1><Link href="/properties" className="mt-4 text-emerald-600 hover:underline">Back to Properties</Link></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl h-64 flex items-center justify-center text-7xl mb-8 shadow-sm">🏠</div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900">{property.title}</h1>
            <span className={`text-sm px-3 py-1.5 rounded-full font-bold ${property.listingType === 'RENT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              For {property.listingType}
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mb-6">ETB {property.price?.toLocaleString()}</p>
          <p className="text-slate-600 mb-6">{property.description}</p>
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl mb-8">
            <div className="text-center"><p className="text-2xl font-bold text-slate-900">{property.bedrooms ?? '-'}</p><p className="text-xs text-slate-500">Bedrooms</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-slate-900">{property.bathrooms ?? '-'}</p><p className="text-xs text-slate-500">Bathrooms</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-slate-900">{property.area ?? '-'}</p><p className="text-xs text-slate-500">sqm</p></div>
          </div>
          <Link href="/auth/login" className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-colors">
            Contact Owner
          </Link>
        </div>
      </div>
    </div>
  );
}
