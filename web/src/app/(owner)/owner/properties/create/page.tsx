'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { propertyService } from '@/services/property.service';

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [transactionType, setTransactionType] = useState('RENT');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [city, setCity] = useState('Addis Ababa');
  const [areaName, setAreaName] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  
  // Image files list
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Upload Images to local frontend uploads path if selected
      const uploadedUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedUrls.push(uploadData.data?.url || uploadData.url);
          }
        }
      }

      // 2. Submit property payload to backend
      const payload = {
        title,
        description,
        propertyType,
        transactionType,
        price: parseFloat(price),
        area: parseFloat(area),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        city,
        areaName,
        // We pack the Google maps URL inside the addressDetails field for easy rendering later
        addressDetails: googleMapsUrl,
        images: uploadedUrls
      };

      const res = await propertyService.createProperty(payload);
      if (res.success) {
        setSuccess('Property submitted for admin review successfully!');
        setTimeout(() => {
          router.push('/owner/properties');
        }, 1500);
      } else {
        setError(res.message || 'Creation failed');
      }
    } catch (err: any) {
      setError(err.error?.message || err.message || 'Failed to submit property. Check subscription status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Post New Property Listing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit property details for admin review. Active subscription is required.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Modern Bole 2-Bedroom Apartment"
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Listing Type</label>
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none">
                <option value="RENT">For Rent</option>
                <option value="SALE">For Sale</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none">
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="STUDIO">Studio</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="LAND">Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Price (ETB)</label>
              <input type="number" required min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price in ETB"
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Area (sqm)</label>
              <input type="number" required min={0} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Property size"
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Bedrooms</label>
              <input type="number" required min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Bathrooms</label>
              <input type="number" required min={0} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">City</label>
              <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Addis Ababa"
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Sub-city / Area</label>
              <input type="text" required value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="e.g. Bole"
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Google Maps / Location link</label>
            <input type="url" value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..."
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Description</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of property highlights, facilities, and surroundings..."
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Property Images (Multiple)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files)}
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50">
            {loading ? 'Submitting Property...' : 'Submit Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
