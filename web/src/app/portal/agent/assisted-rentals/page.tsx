"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PhoneOff,
  UserPlus,
  Building2,
  Receipt,
  FileCheck,
  Send,
  Search,
  CheckCircle2,
  Phone,
  MapPin,
  DollarSign,
  Plus,
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { PortalPropertyMap } from "@/components/portal/portal-property-map";
import {
  mockAssistedTenants,
  mockAssistedBookings,
  mockLeaseAgreements,
  mockSmsNotifications,
  mockProperties,
  AssistedTenantItem,
  AssistedBookingItem,
  LeaseAgreementItem,
  FeaturePhoneSmsItem,
  PropertyItem,
} from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";

const mapBackendTenant = (t: any): AssistedTenantItem => ({
  id: t.id,
  fullName: t.fullName,
  featurePhone: t.featurePhone,
  kebeleIdNumber: t.kebeleIdNumber,
  region: t.region,
  woreda: t.woreda,
  preferredHouseType: t.preferredHouseType as any,
  maxBudgetETB: t.maxBudgetETB,
  familySize: t.familySize,
  hasSmartphone: false,
  registeredDate: new Date(t.createdAt || t.registeredDate).toISOString().split('T')[0],
  status: t.status as any,
});

const mapBackendBooking = (b: any): AssistedBookingItem => ({
  id: b.id,
  tenantId: b.tenantId,
  tenantName: b.tenant?.fullName || 'Tenant',
  tenantPhone: b.tenant?.featurePhone || '',
  propertyId: b.propertyId,
  propertyTitle: b.property?.title || 'Property',
  providerName: b.property?.providerName || 'Landlord',
  providerPhone: b.property?.providerPhone || '',
  monthlyRentETB: b.monthlyRentETB,
  depositETB: b.depositETB,
  paymentMethod: b.paymentMethod as any,
  receiptNumber: b.receiptNumber,
  bookingDate: new Date(b.createdAt).toISOString().split('T')[0],
  status: b.status as any,
});

const mapBackendLease = (l: any): LeaseAgreementItem => ({
  id: l.id,
  bookingId: l.bookingId || '',
  tenantName: l.tenantName,
  tenantKebeleId: l.tenantKebeleId,
  providerName: l.providerName,
  providerIdNumber: l.providerIdNumber,
  propertyTitle: l.propertyTitle,
  location: l.location,
  monthlyRentETB: l.monthlyRentETB,
  startDate: new Date(l.startDate).toISOString().split('T')[0],
  endDate: new Date(l.endDate).toISOString().split('T')[0],
  kebeleWitnessName: l.kebeleWitnessName,
  kebeleWitnessStamp: l.kebeleWitnessStamp,
  status: l.status as any,
});

const mapBackendSms = (s: any): FeaturePhoneSmsItem => ({
  id: s.id,
  recipientPhone: s.recipientPhone,
  recipientName: s.recipientName,
  messageAmharic: s.messageAmharic,
  messageEnglish: s.messageEnglish,
  sentTime: new Date(s.createdAt).toLocaleTimeString(),
  status: s.status as any,
});

export default function AssistedRuralRentalsPage() {
  const [activeTab, setActiveTab] = useState<
    "onboarding" | "matching" | "payments" | "contracts" | "sms"
  >("matching");

  // State Collections
  const [tenants, setTenants] = useState<AssistedTenantItem[]>([]);
  const [bookings, setBookings] = useState<AssistedBookingItem[]>([]);
  const [leases, setLeases] = useState<LeaseAgreementItem[]>([]);
  const [smsLogs, setSmsLogs] = useState<FeaturePhoneSmsItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAllData() {
    try {
      setLoading(true);
      const [tenantsData, bookingsData, leasesData, smsData, propertiesData] = await Promise.all([
        apiFetch("/agent/assisted-tenants"),
        apiFetch("/agent/assisted-bookings"),
        apiFetch("/agent/lease-agreements"),
        apiFetch("/agent/sms-logs"),
        apiFetch("/properties")
      ]);

      setTenants(tenantsData.map(mapBackendTenant));
      setBookings(bookingsData.map(mapBackendBooking));
      setLeases(leasesData.map(mapBackendLease));
      setSmsLogs(smsData.map(mapBackendSms));
      
      const mapBackendProperty = (p: any): PropertyItem => {
        let imagesArr = [];
        try {
          imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
        } catch (e) {
          // ignore
        }
        let amenitiesArr = [];
        try {
          amenitiesArr = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities || [];
        } catch (e) {
          // ignore
        }
        return {
          id: p.id,
          title: p.title,
          images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'],
          providerId: p.providerId || '',
          providerName: p.providerName || p.provider?.name || 'Landlord',
          providerPhone: p.providerPhone || p.provider?.phone || '',
          providerAvatar: p.providerAvatar || p.provider?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=provider',
          location: `${p.city}, ${p.area}`,
          woreda: p.woreda || '',
          propertyType: (p.propertyType === 'Apartment' || p.propertyType === 'Villa' || p.propertyType === 'Condo' || p.propertyType === 'Studio' || p.propertyType === 'Commercial' || p.propertyType === 'Land') ? p.propertyType : 'Apartment',
          price: p.price,
          period: p.rentalPeriod === 'Yearly' ? 'year' : 'month',
          status: p.listingStatus === 'active' ? 'Published' : p.listingStatus === 'pending' ? 'Pending' : p.listingStatus === 'rejected' ? 'Rejected' : 'Rented',
          verificationStatus: p.isVerified ? 'Verified' : 'Pending',
          datePosted: new Date(p.createdAt).toLocaleDateString(),
          bedrooms: p.rooms || 0,
          bathrooms: p.bathrooms || 0,
          areaSqM: p.area || p.areaSqM || 100,
          description: p.description || '',
          amenities: amenitiesArr,
          documents: [],
          listingHistory: [],
          reportsCount: p.reportsCount || 0,
        };
      };
      setProperties(propertiesData.map(mapBackendProperty));
    } catch (err) {
      console.error("Failed to load assisted rural hub data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Onboarding Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    fullName: "",
    featurePhone: "+251 9",
    kebeleIdNumber: "AMH-KBL-",
    region: "Amhara (Debre Berhan)",
    woreda: "Woreda 01",
    preferredHouseType: "Apartment" as const,
    maxBudgetETB: 20000,
    familySize: 3,
  });

  // Direct Rent Modal State
  const [matchingTenant, setMatchingTenant] = useState<AssistedTenantItem | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<AssistedBookingItem["paymentMethod"]>(
    "Cash collected by Agent"
  );
  const [bookingSuccessModal, setBookingSuccessModal] = useState<AssistedBookingItem | null>(null);

  // Receipt Modal State
  const [viewReceipt, setViewReceipt] = useState<AssistedBookingItem | null>(null);

  // Custom SMS Dispatcher State
  const [smsPhoneInput, setSmsPhoneInput] = useState("+251 9");
  const [smsNameInput, setSmsNameInput] = useState("");
  const [smsAmharicInput, setSmsAmharicInput] = useState("");
  const [smsEnglishInput, setSmsEnglishInput] = useState("");
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);

  // Handle Register Tenant Submit
  const handleRegisterTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiFetch("/agent/assisted-tenants", {
        method: "POST",
        body: newTenantData
      });
      const created = mapBackendTenant(data);
      setTenants((prev) => [created, ...prev]);
      setShowRegisterModal(false);
      setMatchingTenant(created);
      setActiveTab("matching");
    } catch (err) {
      console.error("Failed to register tenant:", err);
    }
  };

  // Handle Execute Direct Rent on Behalf
  const handleConfirmDirectRent = async () => {
    if (!matchingTenant || !selectedProperty) return;
    try {
      const result = await apiFetch("/agent/assisted-bookings", {
        method: "POST",
        body: {
          tenantId: matchingTenant.id,
          propertyId: selectedProperty.id,
          monthlyRentETB: selectedProperty.price,
          depositETB: selectedProperty.price * 3,
          paymentMethod: paymentMethod,
        }
      });

      const newBooking = mapBackendBooking(result.booking);
      const newLease = mapBackendLease(result.lease);
      const newSms = mapBackendSms(result.sms);

      setBookings((prev) => [newBooking, ...prev]);
      setLeases((prev) => [newLease, ...prev]);
      setSmsLogs((prev) => [newSms, ...prev]);
      setTenants((prev) =>
        prev.map((t) => (t.id === matchingTenant.id ? { ...t, status: "Lease Signed" } : t))
      );

      setBookingSuccessModal(newBooking);
      setSelectedProperty(null);
      setMatchingTenant(null);
    } catch (err) {
      console.error("Failed to execute direct rent:", err);
    }
  };

  // Handle Send Custom Feature Phone SMS
  const handleSendCustomSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsPhoneInput || !smsAmharicInput) return;

    try {
      const result = await apiFetch("/agent/sms-logs", {
        method: "POST",
        body: {
          recipientPhone: smsPhoneInput,
          recipientName: smsNameInput || "Rural Tenant",
          messageAmharic: smsAmharicInput,
          messageEnglish: smsEnglishInput || smsAmharicInput,
        }
      });
      const newSms = mapBackendSms(result);
      setSmsLogs((prev) => [newSms, ...prev]);
      setSmsSentSuccess(true);
      setTimeout(() => setSmsSentSuccess(false), 3000);
      setSmsPhoneInput("+251 9");
      setSmsNameInput("");
      setSmsAmharicInput("");
      setSmsEnglishInput("");
    } catch (err) {
      console.error("Failed to send custom SMS:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-blue-500/40 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-500/30">
              Rural & Non-Smartphone Services
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Agent Field Proxy Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <PhoneOff className="h-7 w-7 text-blue-400" /> Assisted Rural Rental Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Empower citizens in rural areas, regional towns, and feature-phone users without smartphone access to find verified homes, sign contracts, and pay rent directly through platform agents.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" /> Onboard Rural Tenant
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Registered Offline Tenants</span>
          <p className="text-2xl font-extrabold text-white">{tenants.length}</p>
          <span className="text-emerald-400 text-[11px] font-medium">Feature Phone Verification Active</span>
        </div>
        <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Direct On-Behalf Bookings</span>
          <p className="text-2xl font-extrabold text-blue-400">{bookings.length}</p>
          <span className="text-slate-400 text-[11px]">Matched with Verified Landlords</span>
        </div>
        <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Offline Cash/CBE Collected</span>
          <p className="text-2xl font-extrabold text-emerald-400">
            ETB {bookings.reduce((sum, b) => sum + b.monthlyRentETB, 0).toLocaleString()}
          </p>
          <span className="text-slate-400 text-[11px]">Official Platform Receipts Issued</span>
        </div>
        <div className="p-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Feature Phone SMS Dispatched</span>
          <p className="text-2xl font-extrabold text-purple-400">{smsLogs.length}</p>
          <span className="text-slate-400 text-[11px]">Amharic & English Alerts</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 text-xs overflow-x-auto">
        {[
          { id: "matching", label: "Match & Rent On Behalf", icon: Building2 },
          { id: "onboarding", label: `Offline Tenants (${tenants.length})`, icon: UserPlus },
          { id: "payments", label: `Offline Payments (${bookings.length})`, icon: Receipt },
          { id: "contracts", label: `Lease Agreements (${leases.length})`, icon: FileCheck },
          { id: "sms", label: `Feature Phone SMS (${smsLogs.length})`, icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MATCH & RENT ON BEHALF */}
      {activeTab === "matching" && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" /> On-Behalf Direct House Matchmaker
                </h3>
                <p className="text-xs text-slate-300">
                  Select an offline rural tenant and match them with verified available property listings directly.
                </p>
              </div>

              {/* Select Tenant Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Select Offline Tenant:</span>
                <select
                  value={matchingTenant?.id || ""}
                  onChange={(e) => {
                    const found = tenants.find((t) => t.id === e.target.value);
                    setMatchingTenant(found || null);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.featurePhone}) - Budget: ETB {t.maxBudgetETB.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {matchingTenant && (
              <div className="p-4 bg-slate-900/90 rounded-xl border border-blue-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-blue-400 font-bold block text-[10px] uppercase">Selected Seeker Profile</span>
                  <p className="text-white font-bold text-sm">{matchingTenant.fullName}</p>
                  <p className="text-slate-300">
                    Phone: <span className="font-mono text-emerald-400 font-semibold">{matchingTenant.featurePhone}</span> | Kebele ID: <span className="font-mono">{matchingTenant.kebeleIdNumber}</span>
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Region: {matchingTenant.region} • Max Budget: ETB {matchingTenant.maxBudgetETB.toLocaleString()}/mo</p>
                </div>
                <button
                  onClick={() => setMatchingTenant(null)}
                  className="px-3 py-1 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Change Tenant
                </button>
              </div>
            )}
          </div>

          {/* Property Search & Google Map View Engine */}
          <PortalPropertyMap
            properties={properties}
            matchingTenant={matchingTenant}
            onSelectRentOnBehalf={(prop) => {
              if (!matchingTenant) {
                alert("Please select or register an offline tenant first at the top!");
                return;
              }
              setSelectedProperty(prop);
            }}
          />
        </div>
      )}

      {/* TAB 2: OFFLINE TENANTS ONBOARDING */}
      {activeTab === "onboarding" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-white text-sm">Registered Rural Citizens & Feature-Phone Seekers</h3>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" /> Register New Citizen
            </button>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4">Citizen Name</th>
                    <th className="p-4">Feature Phone</th>
                    <th className="p-4">Kebele ID</th>
                    <th className="p-4">Region / Woreda</th>
                    <th className="p-4">Max Budget</th>
                    <th className="p-4">Search Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-300">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-750/50">
                      <td className="p-4 font-bold text-white">{t.fullName}</td>
                      <td className="p-4 font-mono font-semibold text-emerald-400">{t.featurePhone}</td>
                      <td className="p-4 font-mono text-slate-300">{t.kebeleIdNumber}</td>
                      <td className="p-4 text-slate-300">{t.region}</td>
                      <td className="p-4 font-mono font-bold text-white">ETB {t.maxBudgetETB.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === "Lease Signed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setMatchingTenant(t);
                            setActiveTab("matching");
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                        >
                          Match House
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE PAYMENTS & PRINTABLE RECEIPTS */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm">Offline Payment Ledger & Official Receipts</h3>
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4">Receipt #</th>
                    <th className="p-4">Tenant Name</th>
                    <th className="p-4">Property Booked</th>
                    <th className="p-4">Monthly Rent</th>
                    <th className="p-4">Deposit</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-slate-300">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-750/50">
                      <td className="p-4 font-mono font-bold text-emerald-400">{b.receiptNumber}</td>
                      <td className="p-4 font-bold text-white">{b.tenantName}</td>
                      <td className="p-4 font-semibold text-slate-200">{b.propertyTitle}</td>
                      <td className="p-4 font-mono font-bold text-white">ETB {b.monthlyRentETB.toLocaleString()}</td>
                      <td className="p-4 font-mono text-slate-400">ETB {b.depositETB.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-blue-300">{b.paymentMethod}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setViewReceipt(b)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 mx-auto"
                        >
                          <Printer className="h-3.5 w-3.5" /> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEASE AGREEMENTS */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm">Official Ethiopian Tenancy Contracts (With Kebele Witness)</h3>
          <div className="space-y-3">
            {leases.map((lease) => (
              <div key={lease.id} className="p-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Contract #{lease.id}</span>
                    <h4 className="text-base font-bold text-white">{lease.propertyTitle}</h4>
                    <p className="text-slate-400">{lease.location}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-lg border border-emerald-500/30">
                    {lease.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Tenant Details</span>
                    <p className="font-bold text-white">{lease.tenantName}</p>
                    <p className="text-slate-300 font-mono text-[11px]">ID: {lease.tenantKebeleId}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Landlord Details</span>
                    <p className="font-bold text-white">{lease.providerName}</p>
                    <p className="text-slate-300 font-mono text-[11px]">ID: {lease.providerIdNumber}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Kebele Witness & Stamp</span>
                    <p className="font-bold text-emerald-400">{lease.kebeleWitnessName}</p>
                    <p className="text-slate-400 text-[10px]">{lease.kebeleWitnessStamp}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                  <button
                    onClick={() => alert(`Printing Official Lease Agreement for ${lease.tenantName}...`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" /> Print / Download Tenancy Agreement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FEATURE PHONE SMS DISPATCHER */}
      {activeTab === "sms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatcher Form */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Send className="h-4 w-4 text-purple-400" /> Dispatch Feature Phone SMS
            </h3>
            <p className="text-slate-300">
              Send instant SMS booking confirmations, landlord phone numbers, or rent reminders to rural feature phones in Amharic & English.
            </p>

            {smsSentSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-center">
                ✓ SMS Notification Dispatched to Feature Phone!
              </div>
            )}

            <form onSubmit={handleSendCustomSms} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Recipient Phone Number</label>
                <input
                  type="text"
                  required
                  value={smsPhoneInput}
                  onChange={(e) => setSmsPhoneInput(e.target.value)}
                  placeholder="+251 91 000 0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Recipient Name</label>
                <input
                  type="text"
                  value={smsNameInput}
                  onChange={(e) => setSmsNameInput(e.target.value)}
                  placeholder="e.g. Getachew Zewde"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Message Text (Amharic - አማርኛ)</label>
                <textarea
                  rows={3}
                  required
                  value={smsAmharicInput}
                  onChange={(e) => setSmsAmharicInput(e.target.value)}
                  placeholder="ሰላም! በደላላ መድረክ..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Message Text (English Translation)</label>
                <textarea
                  rows={2}
                  value={smsEnglishInput}
                  onChange={(e) => setSmsEnglishInput(e.target.value)}
                  placeholder="Selam! Your house rental contract has been updated..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="h-4 w-4" /> Send Feature Phone SMS
              </button>
            </form>
          </div>

          {/* SMS Dispatch History */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-white text-sm">Dispatched Feature Phone SMS Log</h3>
            <div className="space-y-3">
              {smsLogs.map((sms) => (
                <div key={sms.id} className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bold text-white">{sms.recipientName} ({sms.recipientPhone})</span>
                    <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold text-[10px]">
                      {sms.status}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl text-emerald-300 font-semibold">
                    Amharic: {sms.messageAmharic}
                  </div>
                  <p className="text-slate-300">English: {sms.messageEnglish}</p>
                  <span className="text-[10px] text-slate-400 block text-right">{sms.sentTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER RURAL CITIZEN */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs">
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" /> Onboard Rural / Offline Citizen
            </h3>
            <p className="text-slate-300">Register a citizen without smartphone access using their basic feature phone and Kebele ID.</p>

            <form onSubmit={handleRegisterTenant} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Citizen Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz Tadesse"
                  value={newTenantData.fullName}
                  onChange={(e) => setNewTenantData({ ...newTenantData, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Feature Phone</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.featurePhone}
                    onChange={(e) => setNewTenantData({ ...newTenantData, featurePhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Kebele ID Number</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.kebeleIdNumber}
                    onChange={(e) => setNewTenantData({ ...newTenantData, kebeleIdNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Region / Town</label>
                  <input
                    type="text"
                    value={newTenantData.region}
                    onChange={(e) => setNewTenantData({ ...newTenantData, region: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Max Budget (ETB)</label>
                  <input
                    type="number"
                    value={newTenantData.maxBudgetETB}
                    onChange={(e) => setNewTenantData({ ...newTenantData, maxBudgetETB: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Register Citizen Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT RENT CONFIRMATION */}
      {selectedProperty && matchingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-xs">
            <button onClick={() => setSelectedProperty(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Execute Direct Rental On Behalf of Citizen
            </h3>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Offline Tenant</p>
              <p className="text-white font-bold text-sm">{matchingTenant.fullName} ({matchingTenant.featurePhone})</p>

              <div className="my-2 border-t border-slate-800" />

              <p className="text-slate-400 text-[10px] uppercase font-bold">Matched Property & Landlord</p>
              <p className="text-white font-bold">{selectedProperty.title}</p>
              <p className="text-blue-400">Landlord: {selectedProperty.providerName} ({selectedProperty.providerPhone})</p>

              <div className="my-2 border-t border-slate-800" />

              <p className="text-emerald-400 font-mono font-bold text-sm">
                Monthly Rent: ETB {selectedProperty.price.toLocaleString()} | Deposit (3 mos): ETB {(selectedProperty.price * 3).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Payment Collection Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="Cash collected by Agent">Cash collected by Agent on site</option>
                <option value="CBE Birr Agent Transfer">CBE Birr Agent Deposit</option>
                <option value="Telebirr Agent Voucher">Telebirr Agent Voucher</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDirectRent}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
              >
                Confirm Booking & Generate Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOOKING SUCCESSFUL SUMMARY */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 text-xs">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Rental Successfully Booked!</h3>
            <p className="text-slate-300">
              Direct booking completed for <strong className="text-white">{bookingSuccessModal.tenantName}</strong>. Official platform receipt <span className="font-mono text-emerald-400 font-bold">{bookingSuccessModal.receiptNumber}</span> has been created.
            </p>
            <p className="text-purple-300 bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/30 font-semibold">
              ✓ Automated Feature Phone SMS notification dispatched in Amharic & English to {bookingSuccessModal.tenantPhone}.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setViewReceipt(bookingSuccessModal);
                  setBookingSuccessModal(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
              >
                Print Platform Receipt
              </button>
              <button
                onClick={() => setBookingSuccessModal(null)}
                className="px-4 py-2 bg-slate-700 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE RECEIPT VIEWER */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-xs text-slate-100">
            <button onClick={() => setViewReceipt(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <div className="text-center border-b border-slate-700 pb-4 space-y-1">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-extrabold rounded-lg text-xs">
                OFFICIAL PLATFORM RECEIPT
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">Ethiopian House Rental PLC</h3>
              <p className="text-[10px] text-slate-400">Receipt Ref: {viewReceipt.receiptNumber} • Date: {viewReceipt.bookingDate}</p>
            </div>

            <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Rural Tenant:</span>
                <span className="font-bold text-white">{viewReceipt.tenantName} ({viewReceipt.tenantPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Property:</span>
                <span className="font-semibold text-white">{viewReceipt.propertyTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Landlord:</span>
                <span className="text-white">{viewReceipt.providerName}</span>
              </div>
              <div className="my-1 border-t border-slate-800" />
              <div className="flex justify-between text-sm">
                <span className="font-bold text-white">Monthly Rent Paid:</span>
                <span className="font-mono font-bold text-emerald-400">ETB {viewReceipt.monthlyRentETB.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Collection Method:</span>
                <span className="font-semibold text-blue-400">{viewReceipt.paymentMethod}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-2">
              Agent Stamp: Authorized Field Agent Dawit Wolde (Bole Zone)
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert("Sending print signal to local connected receipt printer...");
                  setViewReceipt(null);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Customer Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
