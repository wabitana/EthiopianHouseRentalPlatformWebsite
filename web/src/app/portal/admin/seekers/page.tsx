"use client";

import { useState } from "react";
import {
  UserCheck2,
  Search,
  Bookmark,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Eye,
  Calendar,
  X,
  Clock,
  Building2,
} from "lucide-react";
import { mockSeekers, SeekerItem } from "@/lib/portal-mock-data";

export default function AdminSeekersPage() {
  const [seekers] = useState<SeekerItem[]>(mockSeekers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeeker, setSelectedSeeker] = useState<SeekerItem | null>(null);

  const filteredSeekers = seekers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.preferredLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck2 className="h-6 w-6 text-emerald-400" /> House Seeker Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Inspect tenant search preferences, saved property bookmarks, inquiry histories, and activity logs.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search seeker by name, email, preferred location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Seeker List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSeekers.map((seeker) => (
          <div
            key={seeker.id}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl hover:border-slate-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={seeker.avatar}
                    alt={seeker.name}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{seeker.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{seeker.accountStatus}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSeeker(seeker)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" /> Inspect Activity
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Saved Houses</span>
                    <span className="text-white font-bold">{seeker.savedPropertiesCount}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Inquiries Sent</span>
                    <span className="text-white font-bold">{seeker.inquiriesCount}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  Preferred: <span className="font-semibold text-white">{seeker.preferredLocation}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {seeker.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {seeker.email}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Member since {seeker.registrationDate}</span>
              <span className="text-emerald-400 font-bold">Verified Tenant Profile</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Inspection Drawer / Modal */}
      {selectedSeeker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedSeeker(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
              <img
                src={selectedSeeker.avatar}
                alt={selectedSeeker.name}
                className="h-14 w-14 rounded-2xl object-cover ring-4 ring-emerald-500/30"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSeeker.name}</h3>
                <p className="text-xs text-slate-400">{selectedSeeker.email} • {selectedSeeker.phone}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  Looking in: {selectedSeeker.preferredLocation}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
                Recent Seeker Inquiries & Viewings
              </h4>
              <div className="space-y-2">
                {selectedSeeker.recentInquiries.map((inq) => (
                  <div key={inq.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">{inq.propertyTitle}</p>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px]">Inquiry Sent: {inq.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSeeker(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
