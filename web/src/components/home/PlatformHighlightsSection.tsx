"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  Wrench,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  QrCode,
  FileText,
  MessageSquare,
  Bell,
  Star,
  Check,
} from "lucide-react";

export interface FeatureItem {
  title: string;
  desc: string;
  image?: string;
  icon: React.ComponentType<any>;
}

interface PlatformHighlightsSectionProps {
  features?: FeatureItem[];
}

export default function PlatformHighlightsSection({ features }: PlatformHighlightsSectionProps) {
  // Detailed card configurations for the 4 core platform highlights
  const highlightCards = [
    {
      id: "verified-listings",
      step: "01",
      category: "PLATFORM CORE",
      badge: "100% Verified by INSA & Agents",
      title: "Verified Property Listings",
      desc: "Browse verified apartments, luxury villas, and studio flats with 360° virtual tours and zero hidden broker fees.",
      icon: Store,
      ctaText: "Browse Verified Houses",
      ctaHref: "/browse-houses",
      cardBg: "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-emerald-500/40 shadow-2xl shadow-emerald-950/50",
      accentBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      pillBg: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
      ambientGlow: "bg-emerald-400/25",
      bulletPoints: [
        "In-person field agent audits & GPS Kebele geofencing",
        "AI-assisted OCR check for Title Deeds & Land Holding certs",
        "Direct communication with authentic property landlords",
        "Transparent pricing with no broker cuts or illegal commissions",
      ],
      previewType: "property",
    },
    {
      id: "property-services",
      step: "02",
      category: "ON-DEMAND UTILITIES",
      badge: "Doorstep Ethiopian Services",
      title: "Move-In & Property Services",
      desc: "Book pre-rental property inspections, move-in deep cleaning, tenant relocation, and maintenance on-demand.",
      icon: Wrench,
      ctaText: "Explore Move-In Packages",
      ctaHref: "/services/packages",
      cardBg: "bg-slate-900 text-white border-slate-700/80 shadow-2xl shadow-blue-950/30",
      accentBg: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
      pillBg: "bg-blue-950 text-blue-300 border-blue-800",
      ambientGlow: "bg-blue-500/15",
      bulletPoints: [
        "Pre-rental physical property inspection & condition report",
        "Move-in deep sanitization & professional cleaning teams",
        "Safe furniture transport cargo trucks on-demand in Addis",
        "Kebele witness lease agreements with verified digital stamps",
      ],
      previewType: "services",
    },
    {
      id: "chapa-payments",
      step: "03",
      category: "SECURE DIGITAL SETTLEMENT",
      badge: "Official National Chapa Gateway",
      title: "Chapa Subscription Payments",
      desc: "Owners subscribe seamlessly via Chapa gateway with instant digital receipts and listing activation.",
      icon: CreditCard,
      ctaText: "View Owner Subscriptions",
      ctaHref: "/services/subscriptions",
      cardBg: "bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-indigo-700/50 shadow-2xl shadow-indigo-950/40",
      accentBg: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30",
      pillBg: "bg-indigo-900/60 text-indigo-300 border-indigo-700",
      ambientGlow: "bg-indigo-500/20",
      bulletPoints: [
        "Instant Telebirr & CBE Birr direct mobile checkout",
        "Direct bank payments via Awash, Dashen, BOA & Hibret",
        "Cryptographically signed digital tax-compliant receipts",
        "Zero broker commissions & instant listing activation",
      ],
      previewType: "payment",
    },
    {
      id: "mobile-app",
      step: "04",
      category: "NATIVE MOBILE SUITE",
      badge: "Android, iOS & Offline SMS Hub",
      title: "Tenant & Landlord Mobile App",
      desc: "Track rental requests, manage properties, chat with verified landlords, and request home repairs 24/7.",
      icon: Smartphone,
      ctaText: "Launch Web & Mobile App",
      ctaHref: "/launch-app",
      cardBg: "bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 text-white border-emerald-600/40 shadow-2xl shadow-emerald-900/40",
      accentBg: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30",
      pillBg: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
      ambientGlow: "bg-emerald-400/20",
      bulletPoints: [
        "End-to-end encrypted tenant-landlord direct chat & calling",
        "Instant push notifications for scheduled viewing slots",
        "Offline SMS bridge for rural seekers without smartphones",
        "Bilingual experience in Amharic (አማርኛ) and English",
      ],
      previewType: "mobile",
    },
  ];

  return (
    <section className="relative z-20 -mt-20 sm:-mt-24 rounded-t-[50px] sm:rounded-t-[80px] bg-slate-50 pt-20 sm:pt-24 pb-16 overflow-visible">
      {/* Centered Section Heading Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-16 text-center">

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Platform Highlights
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Discover the core features of Delala Rentals — scroll down to explore each capability in our full-width stacked feature deck.
        </p>
      </div>

      {/* =========================================================================
          FULL-WIDTH STACKED CARD SCROLL CONTAINER (STICKY SCROLL EFFECT)
          Each card occupies full-width (w-full), has `position: sticky` with staggered
          `top` offsets and increasing `z-index`, with rounded-t-[48px] md:rounded-t-[64px].
          As the user scrolls, each subsequent card overlays the previous one smoothly.
         ========================================================================= */}
      <div className="relative w-full">
        {highlightCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className={`sticky w-full ${card.cardBg} border-t border-l border-r shadow-2xl rounded-t-[48px] md:rounded-t-[64px] rounded-b-none overflow-hidden transition-all duration-300`}
              style={{
                // Stacks progressively 24px lower per card below navbar (64px)
                top: `${64 + index * 24}px`,
                zIndex: 10 + index * 10,
                minHeight: "calc(100vh - 64px)",
              }}
            >
              {/* Visual background ambient glow */}
              <div
                className={`absolute -right-24 -top-24 w-96 h-96 rounded-full ${card.ambientGlow} opacity-20 blur-3xl pointer-events-none`}
              />

              <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 w-full min-h-[calc(100vh-64px)] py-12 md:py-20 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between relative z-10">
                {/* Left Column: Details & Feature Points */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between h-full space-y-6 text-left">
                  <div>
                    {/* Top Deck Tab / Step Identifier */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-current/10 border border-current/15">
                        <Icon className="h-4 w-4" />
                        <span>Feature {card.step} • {card.category}</span>
                      </div>
                      <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${card.pillBg}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-inherit">
                      {card.title}
                    </h3>

                    <p className="text-base md:text-lg opacity-85 leading-relaxed mb-6 font-normal">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bullet Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {card.bulletPoints.map((point, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 group/item transition-transform duration-200 hover:translate-x-1"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium opacity-90">{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA Link */}
                  <div className="pt-4">
                    <Link
                      href={card.ctaHref}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all group"
                    >
                      <span>{card.ctaText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: High-Fidelity UI Widget Preview */}
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                  <div className="w-full max-w-lg aspect-[4/3] sm:aspect-auto sm:min-h-[380px] relative rounded-3xl overflow-hidden shadow-2xl border border-current/10 bg-black/10 backdrop-blur-md p-5 flex items-center justify-center hover:scale-[1.01] transition-transform duration-300">
                    {card.previewType === "property" && (
                      <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-xl space-y-3 text-white">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-800">
                          <img
                            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600"
                            alt="Verified Apartment"
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-emerald-600/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-md flex items-center gap-1 shadow-md">
                            <ShieldCheck className="h-3 w-3" /> DELALA VERIFIED
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-900/80 text-white text-[10px] font-bold rounded-lg backdrop-blur-md">
                            360° VR Available
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-extrabold text-white">
                              Bole Atlas Luxury Penthouse
                            </span>
                            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                              45,000 ETB
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" /> Bole Sub-City, Addis Ababa
                          </p>
                          <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 font-medium">
                            <span>3 Bedrooms</span>
                            <span>•</span>
                            <span>2 Bathrooms</span>
                            <span>•</span>
                            <span>150 m²</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.previewType === "services" && (
                      <div className="w-full rounded-2xl border border-slate-700 bg-slate-800/95 p-5 space-y-3 shadow-xl text-white">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Wrench className="h-3.5 w-3.5 text-blue-400" /> Active Service Dispatch
                          </span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                            Addis Doorstep
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-white">Move-In Deep Cleaning</p>
                              <p className="text-[10px] text-slate-400">Team Assigned • Bole Atlas</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                              In Progress
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-white">Plumbing Pre-Check</p>
                              <p className="text-[10px] text-slate-400">Master Tech Wolde</p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                              Certified 100%
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-white">Furniture Relocation</p>
                              <p className="text-[10px] text-slate-400">Cargo Van ETA 20 min</p>
                            </div>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                              Dispatched
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.previewType === "payment" && (
                      <div className="w-full rounded-2xl border border-indigo-700/60 bg-indigo-950/70 p-5 space-y-3.5 shadow-xl backdrop-blur-md text-white">
                        <div className="flex items-center justify-between border-b border-indigo-800 pb-2.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> Chapa Payment Gateway
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                            Verified Merchant
                          </span>
                        </div>
                        <div className="bg-slate-950/90 p-4 rounded-xl border border-indigo-900/80 space-y-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Subscription Tier:</span>
                            <span className="font-bold text-white">Professional Landlord</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Billed Amount:</span>
                            <span className="font-mono font-bold text-emerald-400">1,500.00 ETB / month</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Payment Gateway:</span>
                            <span className="font-semibold text-blue-300">Telebirr & CBE Birr</span>
                          </div>
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Ref: TX-CHAPA-98214</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="h-3 w-3" /> Paid & Activated
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.previewType === "mobile" && (
                      <div className="w-full rounded-2xl border border-emerald-700/60 bg-slate-950/95 p-5 space-y-3.5 shadow-xl text-white">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-bold text-white">Delala Mobile Live</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">EN / አማርኛ</span>
                        </div>
                        {/* Chat Bubbles Mockup */}
                        <div className="space-y-2.5 text-xs">
                          <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-sm border border-slate-800 max-w-[85%] text-slate-200">
                            <p className="text-[10px] text-emerald-400 font-bold">Ato Abebe (Landlord):</p>
                            <p className="mt-0.5">Hello! The keys are with Agent Serawit. You can view the house at 3:00 PM.</p>
                          </div>
                          <div className="bg-emerald-600 p-3 rounded-2xl rounded-tr-sm text-white max-w-[85%] ml-auto text-right">
                            <p className="text-[10px] text-emerald-100 font-bold">You (Tenant):</p>
                            <p className="mt-0.5">Perfect! I will be at the gate on time. Thank you!</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center gap-2 text-[10px] text-emerald-300">
                          <Bell className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Push Alert: Tour appointment saved to your calendar.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
