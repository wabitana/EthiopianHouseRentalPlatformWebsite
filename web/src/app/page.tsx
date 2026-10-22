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
import EcosystemsStack from "@/components/home/EcosystemsStack";
import ContactSection from "@/components/ContactSection";

// Extracted home section components
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import PropertySearchSection from "@/components/home/PropertySearchSection";
import PlatformHighlightsSection from "@/components/home/PlatformHighlightsSection";
import Virtual3DTourSection from "@/components/home/Virtual3DTourSection";
import LandlordSellerCtaSection from "@/components/home/LandlordSellerCtaSection";
import NeighborhoodGuideSection from "@/components/home/NeighborhoodGuideSection";
import RentCalculatorSection from "@/components/home/RentCalculatorSection";
import EcosystemPortalSection from "@/components/home/EcosystemPortalSection";
import SecurityGuaranteeSection from "@/components/home/SecurityGuaranteeSection";
import ScrollHorizontalSection from "@/components/home/ScrollHorizontalSection";
import StatsCounterSection from "@/components/home/StatsCounterSection";
import CtaBannerSection from "@/components/home/CtaBannerSection";
import AboutUsSection from "@/components/home/AboutUsSection";
import ServiceBookingSection from "@/components/home/ServiceBookingSection";
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

  const platformHighlightsRaw: any[] = cmsConfig?.cms_platform_highlights || [
    { category: "Residential Rentals", name: "Addis Luxury Apartments", desc: "Fully furnished & unfurnished 1-4 bedroom apartments in Bole, Kazanchis, and Old Airport." },
    { category: "Villas & Houses", name: "Gated Family Homes", desc: "Spacious multi-bedroom villas with private yards, parking, and 24/7 neighborhood security." },
    { category: "Move-In Services", name: "Tenant Relocation & Cleaning", desc: "Hassle-free move-in cleaning, luggage transport, locksmiths, and utility connection support." },
    { category: "Digital Leases", name: "Instant Chapa Verification", desc: "Generate legal rental contracts in ETB and complete security deposit payments in minutes." },
  ];
  const platformHighlights = platformHighlightsRaw.map((h, i) => ({
    ...h, id: String(i), icon: [Store, Wrench, CreditCard, Smartphone][i % 4],
  }));

  const featuresRaw: any[] = cmsConfig?.cms_features || [
    { icon: "Store", title: "Verified Rental Listings", desc: "Browse verified apartments, luxury villas, and studio flats with 360° virtual tours and zero hidden broker fees." },
    { icon: "Wrench", title: "Move-In & Property Services", desc: "Book pre-rental property inspections, move-in deep cleaning, tenant relocation, and maintenance on-demand." },
    { icon: "CreditCard", title: "Chapa Rent Payments", desc: "Pay monthly rent, security deposits, and booking fees securely via Chapa with automated digital receipts and invoices." },
    { icon: "Smartphone", title: "Tenant & Landlord App", desc: "Track lease agreements, pay rent on the go, chat with verified landlords, and request home repairs 24/7." },
  ];
  const features = featuresRaw.map(f => ({ ...f, icon: iconMap[f.icon] || Store }));

  const counterDataRaw: any[] = cmsConfig?.cms_counters || [
    { value: 2018, label: "Years Experience in Real Estate" },
    { value: 3500, label: "Verified Rental Properties" },
    { value: 12500, label: "Satisfied Tenants & Families" },
    { value: 8500, label: "Completed Lease Bookings" },
  ];
  const counterData = counterDataRaw.map((c, i) => ({ ...c, icon: [Calendar, Wrench, Users, Briefcase][i % 4] }));

  const cta = cmsConfig?.cms_cta || {};
  const about = cmsConfig?.cms_about || {};
  const howItWorks = cmsConfig?.cms_how_it_works || {};
  const appSection = cmsConfig?.cms_app_section || {};
  const vendorCta = cmsConfig?.cms_vendor_cta || {};
  const partners = cmsConfig?.cms_partner_companies || [
    { name: "INSA", logo: "/logos/insa.png" },
    { name: "Ethiopian Airlines", logo: "/logos/ethiopian.png" },
    { name: "Safaricom", logo: "/logos/safaricom.png" },
    { name: "Huawei", logo: "/logos/huawei.png" },
    { name: "CBE", logo: "/logos/cbe.png" },
    { name: "Ethio Telecom", logo: "/logos/ethio.png" },
  ];

  return (
    <div className="bg-slate-50">
      <HeroSection config={hero} />
      <FeaturesSection features={features} />
      <PropertySearchSection
        heroLocation={heroLocation}
        setHeroLocation={setHeroLocation}
        heroPrice={heroPrice}
        setHeroPrice={setHeroPrice}
        heroRooms={heroRooms}
        setHeroRooms={setHeroRooms}
        onSearch={handleHeroSearch}
      />
      <PlatformHighlightsSection highlights={platformHighlights} />
      <EcosystemsStack />
      <LandlordSellerCtaSection />
      <Virtual3DTourSection />
      <NeighborhoodGuideSection />
      <RentCalculatorSection />
      <EcosystemPortalSection />
      <ScrollHorizontalSection />
      <SecurityGuaranteeSection />
      <StatsCounterSection counters={counterData} />
      <CtaBannerSection config={cta} />
      <AboutUsSection config={about} />
      <ServiceBookingSection />
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