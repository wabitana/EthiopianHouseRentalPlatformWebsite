'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';
import { MapPin, ShieldCheck, Bed, Bath, Maximize } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

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

  if (loading) return (
    <div className="flex min-h-[60vh] justify-center items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  );
  
  if (!property) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <p className="text-5xl mb-4">🏚</p>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Property Not Found</h1>
      <Link href="/properties" className="mt-4 text-emerald-600 hover:underline">Back to Properties</Link>
    </div>
  );

  const defaultMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.city} ${property.areaName}`)}`;
  const mapUrl = property.addressDetails?.startsWith('http') ? property.addressDetails : defaultMapUrl;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl h-80 flex items-center justify-center text-8xl mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
          🏠
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-150 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  property.listingType === 'RENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  For {property.listingType || property.transactionType}
                </span>

                {property.status === 'APPROVED' && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Karta
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{property.title}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{property.city}, {property.areaName}</p>
            </div>
            <p className="text-3xl font-black text-emerald-600">ETB {property.price?.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5"><Bed className="h-5 w-5 text-slate-450" /> {property.bedrooms ?? '-'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bedrooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5"><Bath className="h-5 w-5 text-slate-450" /> {property.bathrooms ?? '-'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bathrooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5"><Maximize className="h-5 w-5 text-slate-450" /> {property.area ?? '-'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">sqm</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">About this property</h3>
            <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">{property.description}</p>
          </div>

          {/* Integrated Map Location Display */}
          <MapView value={mapUrl} />

          {/* Map Location Link Button */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" /> Google Maps Link</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click to view location map in external window.</p>
            </div>
            <a 
              href={mapUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm inline-block"
            >
              Track Place
            </a>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
            <Link href="/auth/login" className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors">
              Apply & Contact Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
