'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { verificationService } from '@/services/verification.service';

export default function OwnerVerificationPage() {
  const { user } = useAuthStore();
  const [docType, setDocType] = useState('National ID');
  const [docNum, setDocNum] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  const [licenseNum, setLicenseNum] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const [idLoading, setIdLoading] = useState(false);
  const [licLoading, setLicLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!docFile) return setError('Please select an identity document file to upload.');
    setIdLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('documentType', docType);
      formData.append('documentNumber', docNum);

      const res = await verificationService.uploadIdentityDocument(formData);
      if (res.success) {
        setSuccess('Identity document uploaded successfully! Admin will review it shortly.');
        setDocNum('');
        setDocFile(null);
      } else {
        setError(res.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.error?.message || 'Verification upload failed.');
    } finally {
      setIdLoading(false);
    }
  }

  async function handleLicenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseFile) return setError('Please select a house license (Karta) file to upload.');
    setLicLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('document', licenseFile);
      formData.append('licenseNumber', licenseNum);

      const res = await verificationService.uploadOwnerLicense(formData);
      if (res.success) {
        setSuccess('Government Karta / License document uploaded successfully! Admin will review it shortly.');
        setLicenseNum('');
        setLicenseFile(null);
      } else {
        setError(res.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.error?.message || 'License upload failed.');
    } finally {
      setLicLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Verification & ID Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Submit your verification documents to list properties.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Identity Document Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-150 dark:border-slate-800 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">1. Identity Verification</h2>
              <p className="text-xs text-slate-500 mt-1">Upload your government-issued ID card or Passport.</p>
            </div>
            
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-350">Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                user?.isIdentityVerified 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              }`}>
                {user?.isIdentityVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>

            <form onSubmit={handleIdentitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Document Type</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none"
                >
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Number</label>
                <input 
                  type="text" 
                  required
                  value={docNum} 
                  onChange={(e) => setDocNum(e.target.value)}
                  placeholder="ID / Passport Number"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload ID File (PDF/Image)</label>
                <input 
                  type="file" 
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={idLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {idLoading ? 'Uploading...' : 'Submit Identity ID'}
              </button>
            </form>
          </div>

          {/* Property License / Karta Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-150 dark:border-slate-800 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">2. House License (Karta)</h2>
              <p className="text-xs text-slate-500 mt-1">Upload your house ownership title deed / Karta license document.</p>
            </div>

            <form onSubmit={handleLicenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License / Karta Number</label>
                <input 
                  type="text" 
                  required
                  value={licenseNum} 
                  onChange={(e) => setLicenseNum(e.target.value)}
                  placeholder="Karta Registration Number"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Karta File (PDF/Image)</label>
                <input 
                  type="file" 
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-150 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={licLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {licLoading ? 'Uploading...' : 'Submit Karta Document'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
