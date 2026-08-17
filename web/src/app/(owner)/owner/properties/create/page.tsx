'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { propertyService } from '@/services/property.service';
import { verificationService } from '@/services/verification.service';
import { apiClient } from '@/services/api';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Form fields
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
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://www.google.com/maps/search/?api=1&query=9.03,38.74'); // default Addis Ababa
  
  // Specific image files requirements
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<FileList | null>(null);

  // House License / Karta Government doc
  const [licenseNumber, setLicenseNumber] = useState('');
  const [kartaDocument, setKartaDocument] = useState<File | null>(null);

  useEffect(() => {
    // Fetch profile to see if user is already verified
    apiClient.get('/users/me', true)
      .then((res) => { if (res.success) setUserProfile(res.data.user || res.data); })
      .catch(console.error);
  }, []);

  const isVerified = userProfile?.isIdentityVerified;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check front and back images are selected
    if (!frontImage || !backImage) {
      setError('Both Front View and Back View house images are required.');
      setLoading(false);
      return;
    }

    // Check additional images are selected (at least 1 required)
    const extraCount = additionalImages ? additionalImages.length : 0;
    if (extraCount < 1) {
      setError('Please upload at least one additional interior/exterior image (minimum 3 images total).');
      setLoading(false);
      return;
    }

    // Check House License document is selected (Only required if NOT already verified/submitted)
    if (!kartaDocument && !isVerified) {
      setError('Government Karta / House License document is required for unverified accounts.');
      setLoading(false);
      return;
    }

    try {
      // 1. Upload House License (Karta) only if selected
      if (kartaDocument) {
        const licenseFormData = new FormData();
        licenseFormData.append('document', kartaDocument);
        licenseFormData.append('licenseNumber', licenseNumber || `KARTA-${Date.now()}`);
        const licenseRes = await verificationService.uploadOwnerLicense(licenseFormData);
        if (!licenseRes.success) {
          setError('House Karta upload failed: ' + licenseRes.message);
          setLoading(false);
          return;
        }
      }

      // 2. Upload Property Images to Cloudinary
      const uploadedUrls: string[] = [];
      const imageFilesToUpload = [frontImage, backImage];
      if (additionalImages) {
        for (let i = 0; i < additionalImages.length; i++) {
          imageFilesToUpload.push(additionalImages[i]);
        }
      }

      for (const file of imageFilesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrls.push(uploadData.data?.url || uploadData.url);
        } else {
          setError('Failed to upload property images.');
          setLoading(false);
          return;
        }
      }

      // 3. Create property payload
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
        addressDetails: googleMapsUrl,
        images: uploadedUrls
      };

      const res = await propertyService.createProperty(payload);
      if (res.success) {
        setSuccess('Property and Karta license submitted successfully! Redirecting...');
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit property details, pin map coordinates, and upload images for admin review.</p>
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

          {/* Integrated Leaflet Map Picker */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Pin Map Location</label>
            <MapPicker value={googleMapsUrl} onChange={setGoogleMapsUrl} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">Description</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of property highlights, facilities, and surroundings..."
              className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none" />
          </div>

          {/* House License / Karta Government doc */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">House License / Karta Document</h3>
              {isVerified && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Your account has verified land licenses. Uploading Karta is optional.</p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Karta License Number</label>
                <input type="text" required={!isVerified} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Karta Reg Number"
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Karta File (PDF/Image)</label>
                <input type="file" required={!isVerified} accept="image/*,application/pdf" onChange={(e) => setKartaDocument(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-xs focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Specific Images Requirements */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">House Images Upload (Min 3 required)</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Front House View *</label>
                <input type="file" required accept="image/*" onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-1.5 border rounded-xl bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Back House View *</label>
                <input type="file" required accept="image/*" onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-1.5 border rounded-xl bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Additional Images *</label>
                <input type="file" required multiple accept="image/*" onChange={(e) => setAdditionalImages(e.target.files)}
                  className="w-full px-3 py-1.5 border rounded-xl bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-xs focus:outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50">
            {loading ? 'Submitting Listing...' : 'Submit Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
