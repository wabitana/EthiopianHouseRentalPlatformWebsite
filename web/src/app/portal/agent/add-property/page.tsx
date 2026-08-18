"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  MapPin,
  DollarSign,
  Layers,
  FileText,
  Image as ImageIcon,
  Check,
  Loader2,
  Home,
  ShieldCheck,
} from "lucide-react";

export default function AgentAddPropertyWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    propertyType: "Apartment",
    title: "",
    description: "",
    bedrooms: 2,
    bathrooms: 2,
    areaSqM: 120,
    city: "Addis Ababa",
    subCity: "Bole",
    woreda: "Woreda 03",
    address: "Near Medhanialem Church",
    priceETB: 45000,
    period: "month",
    depositMonths: 3,
    utilitiesIncluded: true,
    amenities: ["Generator", "24/7 Security", "Water Tank", "Balcony"],
    uploadedPhotoCount: 3,
    uploadedDocCount: 2,
    agreedToTerms: true,
  });

  const steps = [
    { num: 1, label: "Property Type" },
    { num: 2, label: "Basic Info" },
    { num: 3, label: "Location" },
    { num: 4, label: "Pricing" },
    { num: 5, label: "Amenities" },
    { num: 6, label: "Photos" },
    { num: 7, label: "Documents" },
    { num: 8, label: "Review & Submit" },
  ];

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto ring-4 ring-emerald-500/30">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Property Submitted Successfully!</h2>
        <p className="text-xs text-slate-300">
          The listing <strong className="text-white">"{formData.title || "New Property"}"</strong> has been queued for document verification in your Agent workspace.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => router.push("/portal/agent/properties")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Go to My Assigned Properties
          </button>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
            }}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl"
          >
            Add Another Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-400" /> Add Property Listing Wizard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            8-Step guided wizard for field agents to register new Ethiopian house rental listings.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                currentStep === s.num
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : currentStep > s.num
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-900 text-slate-400 border border-slate-700"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-slate-900/60 flex items-center justify-center text-[10px]">
                {currentStep > s.num ? "✓" : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Wizard Step Content */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
        {/* STEP 1: PROPERTY TYPE */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 1: Select Property Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Apartment", "Villa", "Condo", "Studio", "Commercial", "Land"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFormData({ ...formData, propertyType: t })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.propertyType === t
                      ? "bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/30"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <Home className="h-6 w-6 text-blue-400 mb-2" />
                  <span className="text-sm block">{t}</span>
                  <span className="text-[10px] text-slate-400">Standard Rental Format</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: BASIC INFO */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 2: Basic Property Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Modern 2 Bedroom Apartment in Bole Medhanialem"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe rooms, natural lighting, water supply, security..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Area (m²)</label>
                  <input
                    type="number"
                    value={formData.areaSqM}
                    onChange={(e) => setFormData({ ...formData, areaSqM: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 3: Property Location Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">City / Region</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Sub-City</label>
                <select
                  value={formData.subCity}
                  onChange={(e) => setFormData({ ...formData, subCity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Bole">Bole</option>
                  <option value="Yeka">Yeka</option>
                  <option value="Kirkos">Kirkos</option>
                  <option value="Arada">Arada</option>
                  <option value="Lideta">Lideta</option>
                  <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                  <option value="Kolfe Keranio">Kolfe Keranio</option>
                  <option value="Akaki Kality">Akaki Kality</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Woreda / Zone</label>
                <input
                  type="text"
                  value={formData.woreda}
                  onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Specific Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Map Preview Mockup */}
            <div className="h-32 bg-slate-950 rounded-xl border border-slate-700 flex items-center justify-center text-center p-4">
              <div>
                <MapPin className="h-6 w-6 text-blue-400 mx-auto animate-bounce mb-1" />
                <p className="font-bold text-white">{formData.subCity}, {formData.address}</p>
                <p className="text-[10px] text-slate-500">Sub-City Location Coordinates Set</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PRICING */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 4: Pricing & Payment Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Monthly Rent Amount (ETB)</label>
                <input
                  type="number"
                  value={formData.priceETB}
                  onChange={(e) => setFormData({ ...formData, priceETB: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Advance Deposit Requirement (Months)</label>
                <input
                  type="number"
                  value={formData.depositMonths}
                  onChange={(e) => setFormData({ ...formData, depositMonths: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.utilitiesIncluded}
                onChange={(e) => setFormData({ ...formData, utilitiesIncluded: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded bg-slate-800"
              />
              <span className="text-slate-200">Utilities (Water, Electricity, WiFi) included in monthly rent</span>
            </label>
          </div>
        )}

        {/* STEP 5: AMENITIES */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 5: Select Property Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Generator",
                "24/7 Security",
                "Water Tank",
                "Balcony",
                "Elevator",
                "WiFi Ready",
                "Furnished",
                "Private Garden",
                "Underground Parking",
              ].map((am) => {
                const selected = formData.amenities.includes(am);
                return (
                  <button
                    type="button"
                    key={am}
                    onClick={() => toggleAmenity(am)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    {selected ? "✓ " : "+ "} {am}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: PHOTOS */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 6: Upload Property Photography</h3>
            <div className="p-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl text-center space-y-2">
              <Upload className="h-8 w-8 text-blue-400 mx-auto" />
              <p className="font-bold text-white">Drag & Drop Property Photos Here</p>
              <p className="text-slate-400 text-[11px]">Supports JPG, PNG, WEBP up to 10MB per file</p>
              <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer mt-2">
                Browse Files (Simulated Upload)
              </span>
            </div>
            <p className="text-emerald-400 font-semibold">✓ {formData.uploadedPhotoCount} sample photos attached for demo</p>
          </div>
        )}

        {/* STEP 7: DOCUMENTS */}
        {currentStep === 7 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 7: Upload Ownership Verification Documents</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Land Ownership Title Deed Certificate</p>
                  <p className="text-slate-400 text-[10px]">PDF / Scan required by municipal code</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded">Attached</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Landlord National ID Copy</p>
                  <p className="text-slate-400 text-[10px]">Kebele ID or Passport</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded">Attached</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW & SUBMIT */}
        {currentStep === 8 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-lg font-bold text-white">Step 8: Final Review & Agent Confirmation</h3>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
              <p className="text-white font-bold text-sm">{formData.title || "Untitled Property"}</p>
              <p className="text-blue-400 font-semibold">{formData.propertyType} • {formData.subCity}, {formData.city}</p>
              <p className="text-emerald-400 font-mono font-bold text-base">ETB {formData.priceETB.toLocaleString()}/month</p>
              <p className="text-slate-300">{formData.bedrooms} Beds • {formData.bathrooms} Baths • {formData.areaSqM} m²</p>
              <p className="text-slate-400 pt-1">Amenities: {formData.amenities.join(", ")}</p>
            </div>

            <label className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded bg-slate-800"
              />
              <span className="text-slate-200">I certify that site inspection and document validation have been completed.</span>
            </label>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Listing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Confirm & Submit Property
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
