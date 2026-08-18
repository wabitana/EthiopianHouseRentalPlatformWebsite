"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Ban,
  Upload,
  Trash2,
  Edit,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ShieldCheck,
  User,
  History,
  FileText,
  AlertTriangle,
  X,
} from "lucide-react";
import { mockProperties, PropertyItem } from "@/lib/portal-mock-data";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>(mockProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesType = typeFilter === "All" || p.propertyType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateStatus = (propertyId: string, newStatus: PropertyItem["status"]) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
    );
    if (selectedProperty && selectedProperty.id === propertyId) {
      setSelectedProperty({ ...selectedProperty, status: newStatus });
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-emerald-400" /> Property Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Complete management center for reviewing, approving, publishing, suspending, and moderating real estate listings.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, sub-city, landlord..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
              <option value="Rented">Rented</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Condo">Condo</option>
              <option value="Studio">Studio</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Location</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price (ETB)</th>
                <th className="p-4">Listing Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Posted</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="p-4 font-semibold text-white flex items-center gap-3">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="h-10 w-14 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <div className="max-w-xs">
                      <p className="font-bold text-white text-xs line-clamp-1">{prop.title}</p>
                      <p className="text-[10px] text-slate-400">{prop.id}</p>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-200">{prop.providerName}</td>
                  <td className="p-4 text-slate-400">{prop.location}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-semibold text-[10px]">
                      {prop.propertyType}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    ETB {prop.price.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        prop.status === "Published"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : prop.status === "Pending"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : prop.status === "Suspended" || prop.status === "Rejected"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        prop.verificationStatus === "Verified"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {prop.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{prop.datePosted}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedProperty(prop);
                          setActivePhotoIdx(0);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Details Drawer Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title & Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full text-xs">
                  {selectedProperty.status}
                </span>
                <span className="text-xs text-slate-400">• Posted {selectedProperty.datePosted}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{selectedProperty.title}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" /> {selectedProperty.location}
              </p>
            </div>

            {/* Photo Gallery & Specs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-900 relative">
                  <img
                    src={selectedProperty.images[activePhotoIdx] || selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 px-3 py-1 rounded-lg text-xs font-bold text-white">
                    Photo {activePhotoIdx + 1} of {selectedProperty.images.length}
                  </div>
                </div>
                {/* Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto">
                  {selectedProperty.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-14 w-20 rounded-xl overflow-hidden border-2 transition-all ${
                        activePhotoIdx === idx ? "border-emerald-500 scale-95" : "border-slate-700 opacity-60"
                      }`}
                    >
                      <img src={img} alt="thumb" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Overview Panel */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block uppercase">Monthly Rent</span>
                  <p className="text-2xl font-extrabold text-emerald-400">
                    ETB {selectedProperty.price.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-700/60 text-center text-xs">
                  <div>
                    <Bed className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-white">{selectedProperty.bedrooms}</span>
                    <span className="text-[10px] text-slate-400 block">Beds</span>
                  </div>
                  <div>
                    <Bath className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-white">{selectedProperty.bathrooms}</span>
                    <span className="text-[10px] text-slate-400 block">Baths</span>
                  </div>
                  <div>
                    <Maximize className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-white">{selectedProperty.areaSqM}</span>
                    <span className="text-[10px] text-slate-400 block">m²</span>
                  </div>
                </div>

                {/* Landlord Info */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/80 flex items-center gap-3">
                  <img
                    src={selectedProperty.providerAvatar}
                    alt={selectedProperty.providerName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{selectedProperty.providerName}</p>
                    <p className="text-[10px] text-slate-400">{selectedProperty.providerPhone}</p>
                  </div>
                </div>

                {/* Map Preview Mockup */}
                <div className="h-28 bg-slate-950 rounded-xl border border-slate-700/80 relative flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-1">
                    <MapPin className="h-6 w-6 text-emerald-400 mx-auto animate-bounce" />
                    <p className="text-[10px] text-slate-300 font-bold">{selectedProperty.location}</p>
                    <p className="text-[9px] text-slate-500">Interactive Map Preview</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Amenities */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm">Property Description</h3>
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                {selectedProperty.description}
              </p>

              <h4 className="font-bold text-white text-xs pt-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.amenities.map((am, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-900 text-slate-200 rounded-lg border border-slate-700 text-xs font-medium">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Documents */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-700">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Submitted Verification Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedProperty.documents.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white line-clamp-1">{doc.name}</p>
                      <span className="text-[10px] text-slate-400">{doc.date}</span>
                    </div>
                    <FileText className="h-5 w-5 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions Toolbar */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-white">Admin Actions:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedProperty.id, "Published")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProperty.id, "Rejected")}
                  className="px-3.5 py-2 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProperty.id, "Suspended")}
                  className="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Ban className="h-4 w-4" /> Suspend
                </button>
                <button
                  onClick={() => handleDeleteProperty(selectedProperty.id)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-rose-700 text-rose-400 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
