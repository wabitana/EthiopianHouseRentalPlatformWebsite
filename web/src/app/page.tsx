"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Wrench,
  Truck,
  CreditCard,
  Smartphone,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react";

// Shared / existing components
import Testimonials from "@/components/home/Testimonials";
import Chatbot from "@/components/home/Chatbot";
import ContactSection from "@/components/ContactSection";

// Extracted home section components
import HeroSection from "@/components/home/HeroSection";
import PropertySearchSection from "@/components/home/PropertySearchSection";
import PlatformHighlightsSection from "@/components/home/PlatformHighlightsSection";
import NeighborhoodGuideSection from "@/components/home/NeighborhoodGuideSection";
import RentCalculatorSection from "@/components/home/RentCalculatorSection";
import EcosystemPortalSection from "@/components/home/EcosystemPortalSection";
import SecurityGuaranteeSection from "@/components/home/SecurityGuaranteeSection";
import ScrollHorizontalSection from "@/components/home/ScrollHorizontalSection";
import StatsCounterSection from "@/components/home/StatsCounterSection";
import AboutUsSection from "@/components/home/AboutUsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import AppDownloadSection from "@/components/home/AppDownloadSection";
import VendorCtaSection from "@/components/home/VendorCtaSection";
import MeetTheTeamSection from "@/components/home/MeetTheTeamSection";
import PartnerCompaniesSection from "@/components/home/PartnerCompaniesSection";

import { defaultCmsConfig } from "@/lib/cms";

// Icon lookup for CMS-driven feature icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Store, Wrench, CreditCard, Smartphone, Calendar, Users, Briefcase, Truck,
};

export default function HomePage() {
  const router = useRouter();
  const [cmsConfig, setCmsConfig] = useState<any>(defaultCmsConfig);
  const [heroLocation, setHeroLocation] = useState("");
  const [heroPrice, setHeroPrice] = useState("");
  const [heroRooms, setHeroRooms] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroLocation) params.set("q", heroLocation);
    if (heroPrice) params.set("price", heroPrice);
    if (heroRooms) params.set("rooms", heroRooms);
    router.push(`/browse-houses?${params.toString()}`);
  };

  useEffect(() => {
    fetch("/api/cms", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.config) {
          setCmsConfig((prev: any) => ({ ...prev, ...data.config }));
        }
      })
      .catch(console.error);
  }, []);

  // --- Derive section data from CMS config ---

  const hero = cmsConfig?.cms_hero || {};

  const featuresRaw: any[] = cmsConfig?.cms_features || [
    { icon: "Store", title: "Verified Property Listings", desc: "Browse verified apartments, luxury villas, and studio flats with 360° virtual tours and zero hidden broker fees." },
    { icon: "Wrench", title: "Move-In & Property Services", desc: "Book pre-rental property inspections, move-in deep cleaning, tenant relocation, and maintenance on-demand." },
    { icon: "CreditCard", title: "Chapa Subscription Payments", desc: "Owners subscribe seamlessly via Chapa gateway with instant digital receipts and listing activation." },
    { icon: "Smartphone", title: "Tenant & Landlord Mobile App", desc: "Track rental requests, manage properties, chat with verified landlords, and request home repairs 24/7." },
  ];
  const features = featuresRaw.map(f => ({ ...f, icon: iconMap[f.icon] || Store }));

  const counterDataRaw: any[] = cmsConfig?.cms_counters || [
    { value: 2026, label: "Platform Infrastructure Launch" },
    { value: 6, label: "Verified Properties Listed" },
    { value: 6, label: "Satisfied Tenants & Buyers" },
    { value: 8, label: "Completed Inquiries & Requests" },
  ];
  const counterData = counterDataRaw.map((c, i) => ({ ...c, icon: [Calendar, Wrench, Users, Briefcase][i % 4] }));

  const about = cmsConfig?.cms_about || {};
  const howItWorks = cmsConfig?.cms_how_it_works || {};
  const appSection = cmsConfig?.cms_app_section || {};
  const vendorCta = cmsConfig?.cms_vendor_cta || {};
  const partners = cmsConfig?.cms_partner_companies || [
    { name: "INSA", logo: "/logos/insa.png" },

    { name: "Safaricom", logo: "/logos/safaricom.png" },
    { name: "Insa", logo: "/logos/insa.png" },
    { name: "CBE", logo: "/logos/cbe.png" },
    { name: "Ethio Telecom", logo: "/logos/ethio.png" },
  ];

  return (
    <div className="bg-slate-50 overflow-x-clip">
      <HeroSection config={hero} />
      <PlatformHighlightsSection features={features} />
      <NeighborhoodGuideSection />
      <RentCalculatorSection />
      <EcosystemPortalSection />
      <ScrollHorizontalSection />
      <PropertySearchSection
        heroLocation={heroLocation}
        setHeroLocation={setHeroLocation}
        heroPrice={heroPrice}
        setHeroPrice={setHeroPrice}
        heroRooms={heroRooms}
        setHeroRooms={setHeroRooms}
        onSearch={handleHeroSearch}
      />
      <SecurityGuaranteeSection />
      <StatsCounterSection counters={counterData} />
      <AboutUsSection config={about} />
      <HowItWorksSection config={howItWorks} />
      <AppDownloadSection config={appSection} />
      <VendorCtaSection config={vendorCta} />
      <MeetTheTeamSection members={cmsConfig?.cms_meet_the_minds} />
      <PartnerCompaniesSection partners={partners} />
      <Testimonials testimonials={cmsConfig?.cms_testimonials || []} />
      <ContactSection />
      <Chatbot />
    </div>
  );
}




