"use client"; // Turned into a client component to cleanly handle scroll tracking

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";
import {
  Store,
  Wrench,
  Truck,
  Shield,
  Smartphone,
  CreditCard,
  ArrowRight,
  Sparkles,
  Play,
  Calendar,
  Users,
  Briefcase,
  Download,
  CheckCircle2,
  Mail,
  Users2


} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Testimonials from "@/components/Testimonials";
import HeroAnimationWrapper from "@/components/HeroAnimationWrapper";
import Chatbot from "@/components/Chatbot";
import EcosystemsStack from "@/components/EcosystemsStack";
import ContactSection from "@/components/ContactSection";
import Virtual3DTourSection from "@/components/home/Virtual3DTourSection";
import LandlordSellerCtaSection from "@/components/home/LandlordSellerCtaSection";
import NeighborhoodGuideSection from "@/components/home/NeighborhoodGuideSection";
import RentCalculatorSection from "@/components/home/RentCalculatorSection";
import EcosystemPortalSection from "@/components/home/EcosystemPortalSection";
import SecurityGuaranteeSection from "@/components/home/SecurityGuaranteeSection";
import ScrollHorizontalSection from "@/components/home/ScrollHorizontalSection";

import { defaultCmsConfig } from "@/lib/cms";

// --- INNER ANIMATED COUNTER COMPONENTS ---

interface CounterItemProps {
  value: number;
  label: string;
  icon: React.ComponentType<any>;
}

const CounterNumber = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 60,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return (
    <span ref={ref} className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
      0
    </span>
  );
};

const CounterItem = ({ value, label, icon: Icon }: CounterItemProps) => {
  return (
    <div className="flex flex-col items-center text-center p-4 relative group">
      <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-7 w-7 stroke-[2]" />
      </div>
      <CounterNumber value={value} />
      <p className="mt-3 text-xs sm:text-sm font-medium tracking-wide text-emerald-100/70 max-w-[180px]">
        {label}
      </p>
    </div>
  );
};

// --- MAIN HOMEPAGE COMPONENT ---

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
    fetch("/api/cms").then(res => res.json()).then(data => setCmsConfig(data.config)).catch(console.error);
  }, []);

  // Set up scroll tracking state for the About Us Section
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const aboutSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAboutVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.02,
      }
    );

    if (aboutSectionRef.current) {
      observer.observe(aboutSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Map of icon name strings -> React components for CMS-driven icons
  const iconMap: Record<string, React.ComponentType<any>> = { Store, Wrench, CreditCard, Smartphone, Calendar, Users, Briefcase, Truck };

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
      {/* HERO */}
      <section 
        className={`relative overflow-hidden px-4 pt-24 pb-52 text-white sm:px-6 lg:pt-32 lg:pb-64 ${(!hero.backgroundType || hero.backgroundType === 'animation') ? 'gradient-hero' : ''}`}
        style={hero.backgroundType === 'color' ? { backgroundColor: hero.backgroundColor || '#059669' } : {}}
      >
        {(!hero.backgroundType || hero.backgroundType === 'animation') && <HeroAnimationWrapper />}
        {hero.backgroundType === 'image' && hero.backgroundImage && (
          <div className="absolute inset-0 z-0">
             <img src={hero.backgroundImage} alt="Hero Background" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        {hero.backgroundType === 'video' && hero.backgroundVideo && (
          <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline src={hero.backgroundVideo} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {hero.badge || "Ethiopia's Premier Home Rental Platform"}
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {hero.title || "Find & Rent Your Next Dream Home in Ethiopia"}
            </h1>

            <p className="mt-6 text-lg text-emerald-50/90 sm:text-xl">
              {hero.subtitle || "Explore verified apartments, luxury villas, studio flats, and family houses in Addis Ababa, Hawassa, Adama & Bahir Dar with transparent ETB pricing and digital lease agreements."}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={hero.primaryButtonLink || "/browse-houses"}>
                <Button
                  size="lg"
                  className="bg-white text-emerald-800 hover:bg-emerald-50"
                >
                  {hero.primaryButtonText || "Explore Home Rentals"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href={hero.secondaryButtonLink || "/services"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {hero.secondaryButtonText || "Book Rental Inspection"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-20 -mt-23 rounded-t-[80px] bg-white pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="card-hover overflow-hidden">
                <CardContent className="p-6">
                  {f.image ? (
                    <div className="mb-4 h-16 w-16">
                       <img src={f.image} alt={f.title} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <f.icon className="h-6 w-6" />
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900">{f.title}</h3>

                  <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* IMPRESSIVE & MODERN FAST PROPERTY SEARCH WIDGET (BEFORE PLATFORM HIGHLIGHTS) */}
      <section className="relative z-10 bg-slate-950 border-y border-slate-800 py-16 overflow-hidden">
        {/* Ambient Glow & Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Fast Rental Lookup
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Where Would You Like to Live Next?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Search verified apartments, villas, and studio flats across Addis Ababa, Hawassa, Adama & Bahir Dar
            </p>
          </div>

          {/* SLEEK GLASS SEARCH WIDGET BAR MATCHING USER IMAGE */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-slate-950 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
              {/* Location Input */}
              <div className="relative flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="text-lg mr-3 select-none">📍</span>
                <input
                  type="text"
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  placeholder="Where do you want to live?"
                  className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
                />
              </div>

              {/* Price Filter Select */}
              <div className="relative flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="text-lg mr-3 select-none">💰</span>
                <select
                  value={heroPrice}
                  onChange={(e) => setHeroPrice(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="">Any Price</option>
                  <option value="25000">Under 25,000 ETB</option>
                  <option value="50000">25,000 - 50,000 ETB</option>
                  <option value="100000">50,000+ ETB</option>
                </select>
              </div>

              {/* Rooms Select */}
              <div className="relative flex items-center bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="text-lg mr-3 select-none">🛏️</span>
                <select
                  value={heroRooms}
                  onChange={(e) => setHeroRooms(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="">Rooms</option>
                  <option value="1">1 Bed / Studio</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              {/* Search Action Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* PLATFORM HIGHLIGHTS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Platform Highlights
              </h2>
              <p className="mt-1 text-slate-600">
                Discover the core features of Delala Rentals
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformHighlights.map((highlight) => (
              <div
                key={highlight.id}
                className="cursor-default"
              >
                <Card className="card-hover overflow-hidden h-full flex flex-col">
                  {highlight.image ? (
                    <div className="h-40 w-full bg-slate-50">
                       <img src={highlight.image} alt={highlight.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100">
                      <highlight.icon className="h-12 w-12 text-emerald-300" />
                    </div>
                  )}

                  <CardContent className="p-4 flex-1">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                      {highlight.category}
                    </p>

                    <h3 className="mt-2 font-bold text-slate-900 text-lg">
                      {highlight.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      {highlight.desc}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ONE PLATFORM. FOUR CONNECTED ECOSYSTEMS */}
      <EcosystemsStack />

      {/* LANDLORD SELLER CTA SECTION (WHITE BACKGROUND WITH GRAPHICS) */}
      <LandlordSellerCtaSection />

      {/* 1. INTERACTIVE 3D VIRTUAL TOUR & FLOORPLAN VISUALIZER */}
      <Virtual3DTourSection />

      {/* 2. ETHIOPIAN NEIGHBORHOODS & CITY LIVING GUIDE */}
      <NeighborhoodGuideSection />

      {/* 3. INTERACTIVE RENT & DEPOSIT BUDGET CALCULATOR */}
      <RentCalculatorSection />

      {/* 4. LANDLORD & TENANT ECOSYSTEM PORTAL */}
      <EcosystemPortalSection />

      {/* SCROLL-DRIVEN PINNED HORIZONTAL MOVEMENT SHOWCASE */}
      <ScrollHorizontalSection />

      {/* 5. DELALA RENT GUARANTEE & ESCROW PROTECTION */}
      <SecurityGuaranteeSection />

      {/* FULL WIDTH ANIMATED COUNTER SECTION */}
      <section className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 py-16 md:py-20 border-y border-emerald-800/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center justify-center divide-x-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {counterData.map((item, idx) => (
              <div key={idx} className={idx > 0 ? "pt-6 md:pt-0" : ""}>
                <CounterItem
                  value={item.value}
                  label={item.label}
                  icon={item.icon}
                />
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section with a Green Background Layout */}
      <div className="mt-28 mx-auto max-w-5xl px-4 sm:px-6 relative z-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-emerald-950/50 to-slate-950 border border-emerald-500/20 p-8 md:p-16 text-center shadow-2xl backdrop-blur-sm">
          <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex h-1 w-16 bg-emerald-400/50 rounded-full mb-8 mx-auto" />

            <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {cta.title || "Ready to Find Your Ideal Ethiopian Home?"}
            </h3>

            <p className="mt-4 text-emerald-100/80 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              {cta.subtitle || "Join thousands of tenants, landlords, and property managers operating on Ethiopia's unified rental ecosystem."}
            </p>

            <div className="mt-8 flex justify-center">
              <Link href={cta.buttonLink || "/register"}>
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-6 rounded-2xl text-base shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group border-0"
                >
                  {cta.buttonText || "Browse All Home Rentals"}
                  <ArrowRight className="h-5 w-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Clean, Rounded & Minimalist About Us Section with Scroll-Triggered Text Animations */}
      <section
        ref={aboutSectionRef}
        className="mt-28 max-w-[95vw] mx-auto bg-slate-50/90 text-black border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch"
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes textScrollSlideIn {
            0% { opacity: 0; transform: translateY(28px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .scroll-item {
            opacity: 0;
          }
          .animate-scroll-active {
            animation: textScrollSlideIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />

        {/* LEFT COLUMN: Clean Text Structure */}
        <div className="w-full lg:col-span-7 p-8 sm:p-12 md:p-16 lg:pl-16 xl:pl-24 space-y-8 text-left flex flex-col justify-center">
          <div
            className={`space-y-2 scroll-item ${isAboutVisible ? "animate-scroll-active" : ""}`}
            style={{ animationDelay: "100ms" }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block">{about.badge || "About Delala Rentals"}</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black">
              {about.title || "Your comfort, security & peace of mind is our mission!"}
            </h2>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 scroll-item ${isAboutVisible ? "animate-scroll-active" : ""}`}
            style={{ animationDelay: "350ms" }}
          >
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Our Mission</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {about.mission || "To transform home renting in Ethiopia by delivering transparent property listings, verified landlords, and hassle-free move-in services."}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Our Vision</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {about.vision || "To be the go-to home rental and property management platform across Ethiopia and East Africa."}
              </p>
            </div>
          </div>

          <div
            className={`space-y-4 text-sm md:text-base text-slate-800 leading-relaxed font-normal scroll-item ${isAboutVisible ? "animate-scroll-active" : ""}`}
            style={{ animationDelay: "600ms" }}
          >
            {about.paragraph1 && <p>{about.paragraph1}</p>}
            {about.paragraph2 && <p>{about.paragraph2}</p>}
            {about.paragraph3 && <p>{about.paragraph3}</p>}
          </div>

          <div
            className={`space-y-2 pt-2 border-t border-slate-200 scroll-item ${isAboutVisible ? "animate-scroll-active" : ""}`}
            style={{ animationDelay: "850ms" }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Services</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-900 font-medium">
              {(about.services || ["Verified residential & luxury villa home rentals", "Move-in cleaning, inspection & tenant logistics", "Instant Chapa rent payments & digital lease agreements"]).map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-2">✓ {s}</li>
              ))}
            </ul>
          </div>

          <div
            className={`pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 scroll-item ${isAboutVisible ? "animate-scroll-active" : ""}`}
            style={{ animationDelay: "1100ms" }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Contact Us 24/7</span>
              <a
                href={`tel:${(about.phone || "+251911819145").replace(/\s/g, "")}`}
                className="text-xl font-extrabold text-black hover:underline block mt-0.5"
              >
                {about.phone || "+251 911 819 145"}
              </a>
            </div>

            <Link href={about.exploreButtonLink || "/register"}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-bold px-8 py-5 rounded-xl text-sm transition-all shadow-md"
              >
                {about.explorebuttonText || "Find Your Home Now"}
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Static Full-Height Video Frame with Custom Play Button */}
        <div className="w-full lg:col-span-5 relative min-h-[380px] lg:min-h-full bg-slate-200 border-t lg:border-t-0 lg:border-l border-slate-200 flex items-center justify-center group cursor-pointer overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-[0.85]"
            src={about.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-industrial-facility-with-pipelines-at-sunset-41481-large.mp4"}
          />

          <div className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <div className="absolute w-28 h-28 rounded-full bg-white/20 border-2 border-white/40 animate-ping opacity-25 pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full bg-white/30 border border-white/50 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center pl-1.5 relative">
              <Play className="w-9 h-9 fill-blue-600 text-blue-600 stroke-[3]" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE BOOKING */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-slate-900 p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Smart Move-In & Rental Services
              </h2>

              <p className="mt-4 text-slate-300">
                Move-in deep cleaning, property inspection, and tenant moving & logistics — with
                automated price estimation, appointment scheduling, and
                verified provider assignment.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                {["Move-In Cleaning", "Property Inspection", "Tenant Moving"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-6">
              <div className="text-center">
                <Truck className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="mt-2 text-sm">Tenant Move</p>
              </div>

              <div className="text-center">
                <Shield className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="mt-2 text-sm">Chapa Rent</p>
              </div>

              <div className="text-center">
                <Wrench className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="mt-2 text-sm">Inspection</p>
              </div>
            </div>
          </div>

          <Link href="/services" className="mt-8 inline-block">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Book Rental Service Now
            </Button>
          </Link>
        </div>
      </section>


      {/* HOW IT WORKS — PREMIUM PROCESS SECTION */}
      <section className="w-full bg-white py-20 md:py-28 relative overflow-hidden rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-sm my-16">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-100 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-xs font-semibold text-blue-700 tracking-wide uppercase mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {howItWorks.badge || "Simple Rental Process"}
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {howItWorks.title || "How Delala Home Rentals Works"}
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              {howItWorks.subtitle || "From searching verified listings to signing your digital lease and moving in—renting a home in Ethiopia is fast and secure."}
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 z-0" />

            {(howItWorks.steps || [
              { step: "01", title: "Search & Filter Homes", description: "Filter apartments, villas, and townhouses by location, monthly budget, bedrooms, and amenities across Addis Ababa." },
              { step: "02", title: "Schedule Inspection & Tour", description: "Book in-person physical property walkthroughs or 360° virtual tours directly with verified property owners." },
              { step: "03", title: "Secure Lease & Chapa Pay", description: "Pay security deposit and first month's rent securely via Chapa with instant digital lease contract generation." },
              { step: "04", title: "Move In & Enjoy Services", description: "Schedule move-in deep cleaning, luggage transport, key collection, and access 24/7 tenant maintenance support." },
            ]).map((item: any, i: number) => {
              const gradients = ["from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-purple-500 to-pink-500"];
              const icons = [Store, Wrench, CreditCard, Truck];
              const gradient = gradients[i % 4];
              const StepIcon = icons[i % 4];
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative z-10 group"
              >
                <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
                    Step {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">{item.description}</p>
                  <div className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${gradient} opacity-40 group-hover:opacity-100 group-hover:w-full transition-all duration-500`} />
                </div>
              </motion.div>
            );})}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Link href={howItWorks.ctaLink || "/services"}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg hover:-translate-y-0.5 group">
                {howItWorks.ctaText || "Start Renting Today"}
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* IMPRESSIVE FULL-WIDTH APP DOWNLOAD SECTION */}
      <section className="w-full bg-white py-20 md:py-28 relative overflow-hidden rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-sm">
        {/* Fine grid design layer overlay - adjusted for white background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* LEFT COLUMN: TEXTS & DOWNLOAD CALL TO ACTIONS */}
            <div className="w-full lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-lime-50 border border-lime-200 px-4 py-1.5 text-xs font-semibold text-lime-700 tracking-wide uppercase mx-auto lg:mx-0">
                  <Smartphone className="h-3.5 w-3.5 text-lime-600" />
                  {appSection.badge || "Now Available on iOS & Android"}
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  {appSection.title || "Delala Home Rentals App"} <br />
                  <span className="bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-500 bg-clip-text text-transparent">
                    {appSection.titleHighlight || "In the Palm of Your Hand"}
                  </span>
                </h2>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {appSection.subtitle || "Discover new rental listings, chat directly with property owners, pay monthly rent via Chapa, and request maintenance services right from your smartphone."}
                </p>
              </div>

              {/* Bullet Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 text-left">
                {(appSection.features || [
                  "Real-time rental availability alerts",
                  "Instant Chapa rent payments & receipts",
                  "24/7 direct landlord & maintenance chat",
                  "Move-in service booking & contract history"
                ]).map((text: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-lime-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Native App Store Dynamic Store Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                {/* Google Play Button */}
                <a
                  href={appSection.playStoreLink || "#play-store"}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-900 hover:border-lime-500/50 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl transition-all shadow-lg group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-6 h-6 fill-current text-white group-hover:text-lime-400 transition-colors" viewBox="0 0 24 24">
                    <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L14.3,9.5L3.63,4.12C3.43,4.02 3.22,3.97 3,4V4C3.41,4 3.8,4.13 4.13,4.35L17.87,11.33M17.87,12.67L4.13,19.65C3.8,19.87 3.41,20 3,20V20C3.22,20.03 3.43,19.98 3.63,19.88L14.3,14.5L17.87,12.67M20.33,12L16.5,10.12V13.88L20.33,12C20.76,11.79 21,11.4 21,11C21,10.6 20.76,10.21 20.33,12Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Get it on</p>
                    <p className="text-sm font-extrabold -mt-0.5">Google Play</p>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href={appSection.appStoreLink || "#app-store"}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-900 hover:border-lime-500/50 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl transition-all shadow-lg group hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-6 h-6 fill-current text-white group-hover:text-lime-400 transition-colors" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Download on the</p>
                    <p className="text-sm font-extrabold -mt-0.5">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: PROFESSIONAL ANIMATED MOBILE PHONE MOCKUP */}
            <div className="w-full lg:col-span-6 flex justify-center relative select-none">
              <div className="relative w-[290px] h-[580px] sm:w-[310px] sm:h-[620px]">

                {/* Phone Shell Outer Body Border Setup */}
                <div className="absolute inset-0 bg-slate-900 rounded-[50px] p-3.5 shadow-2xl border-4 border-slate-800">
                  {/* Speaker Ear Notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-30 flex items-start justify-center pt-1">
                    <div className="w-12 h-1 bg-slate-800 rounded-full" />
                  </div>

                  {/* Inner Content Display Screen Viewport */}
                  <div className="w-full h-full rounded-[36px] bg-slate-950 overflow-hidden relative border border-slate-900 flex flex-col pt-12 pb-4 px-4 text-white">

                    {/* Animated Store UI Content Frame Sequence Loop */}
                    <motion.div
                      className="w-full h-full flex flex-col justify-between"
                      initial="initial"
                      animate="animate"
                      variants={{
                        animate: {
                          transition: { staggerChildren: 3.5, delayChildren: 0.5 }
                        }
                      }}
                    >
                      {/* Simulated Download Center Header Cards */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center font-black text-xs text-slate-950">D</div>
                            <div>
                              <h4 className="text-xs font-bold tracking-tight">Delala Rentals</h4>
                              <p className="text-[9px] text-slate-400">Delala Tech PLC</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">Official</span>
                        </div>

                        {/* Interactive App Download Animation Status Display */}
                        <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 relative overflow-hidden">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400 font-medium">Status</span>
                            <motion.span
                              className="text-lime-400 font-bold tracking-wide"
                              variants={{
                                initial: { opacity: 1 },
                                animate: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1.5 } }
                              }}
                            >
                              Syncing Setup...
                            </motion.span>
                          </div>

                          {/* Fake App Store Progress Download bar inside phone */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 via-lime-400 to-emerald-400 rounded-full"
                              variants={{
                                initial: { width: "10%" },
                                animate: {
                                  width: ["10%", "45%", "85%", "100%", "100%"],
                                  transition: { repeat: Infinity, duration: 7, ease: "easeInOut" }
                                }
                              }}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>M-PWA v2.6</span>
                            <motion.span
                              variants={{
                                initial: { opacity: 1 },
                                animate: { opacity: [1, 0, 1], transition: { repeat: Infinity, duration: 7 } }
                              }}
                            >
                              Verified Secure
                            </motion.span>
                          </div>
                        </div>
                      </div>

                      {/* Display Screen Simulated App Home UI Previews inside Dashboard phone */}
                      <motion.div
                        className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-3 border border-slate-800/80 space-y-3 flex-1 mt-4 flex flex-col justify-center"
                        variants={{
                          initial: { y: 15, opacity: 0.6 },
                          animate: { y: [15, 0, 0, 15], opacity: [0.6, 1, 1, 0.6], transition: { repeat: Infinity, duration: 7, ease: "easeInOut" } }
                        }}
                      >
                        <div className="h-6 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-between px-2 text-[10px]">
                          <span className="text-lime-400 font-bold">Ethiopia Connected Ecosystem</span>
                          <Sparkles className="h-3 w-3 text-lime-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-xl bg-slate-850 border border-slate-800 text-center">
                            <Store className="h-4 w-4 text-lime-400 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-slate-200">Marketplace</p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-850 border border-slate-800 text-center">
                            <Wrench className="h-4 w-4 text-lime-400 mx-auto mb-1" />
                            <p className="text-[9px] font-bold text-slate-200">Services</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-center text-[10px] flex items-center justify-center gap-1.5 shadow-lg shadow-lime-400/10">
                          <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                          Launch Core Experience
                        </div>
                      </motion.div>

                      {/* Phone Screen Bottom Navigation indicator */}
                      <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-3 shrink-0" />
                    </motion.div>

                  </div>
                </div>

                {/* Glass sheen reflection line accent layout inside app frame section */}
                <div className="absolute inset-4 rounded-[44px] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
              </div>
            </div>

          </div>
        </div>
      </section>





      {/* VENDOR CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 py-12 md:py-16 rounded-[24px] md:rounded-[40px] border border-slate-800 shadow-xl my-16">
        {/* Professional subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-5 pointer-events-none" />

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">

            {/* Left: Text Content and Info Badges */}
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {vendorCta.badge || "B2B Portal"}
              </div>

              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {vendorCta.title || "Are you a vendor or service provider?"}
              </h3>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {vendorCta.subtitle || "Join the Delala Home Rentals ecosystem. Accelerate your listing growth, manage units seamlessly, track real-time analytics, and streamline your tenant contracts all from one unified landlord dashboard."}
              </p>
            </div>

            {/* Right: Premium Dynamic Action Call */}
            <div className="shrink-0">
              <Link href={vendorCta.buttonLink || "/register?role=vendor"}>
                <Button
                  className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {vendorCta.buttonText || "Become a Vendor"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>




      {/* MEET OUR TEAM SECTION */}
      <section className="w-full bg-white py-20 md:py-28 relative overflow-hidden rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-2xl my-16">
        {/* Premium Ambient Background Accents (Softened for white background) */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[120px] pointer-events-none" />

        {/* Grid overlay layer (Adjusted for white background) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-24">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-600 tracking-wide uppercase">
              Innovators & Builders
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Meet the Minds Behind <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-purple-600 bg-clip-text text-transparent">
                Delala Home Rentals
              </span>
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Our elite team combines real estate expertise with digital innovation to deliver Ethiopia's premier home rental ecosystem.
            </p>
          </div>

          {/* Team — Desktop Grid (hidden on mobile) */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(cmsConfig?.cms_meet_the_minds || [
              {
                name: "Nathan Embakom",
                role: "Chief Executive Officer",
                dept: "Executive Leadership",
                bio: "Ex-fintech architect directing corporate tech growth and secure ecosystem partnerships across East Africa.",
              },
              {
                name: "Amara Belay",
                role: "Chief Technology Officer",
                dept: "Engineering",
                bio: "Specialist in high-scale cloud clusters, data structures, and core real-time telemetry streaming platforms.",
              },
              {
                name: "Dawit Kebede",
                role: "Head of Product Infrastructure",
                dept: "Product Management",
                bio: "Translates high-level vendor marketplace visions into intuitive, user-centric system interfaces.",
              },
              {
                name: "Selam Kebede",
                role: "VP of Logistics Operations",
                dept: "Operations",
                bio: "Optimizes end-to-end multi-party shipping pipelines, supply network visibility, and automated merchant routing.",
              },
            ]).map((member: any, i: number) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between bg-white border border-slate-200 hover:border-emerald-200 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div>
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 relative mb-5 border border-slate-100">
                    <img src={member.photo || `https://i.pravatar.cc/300?u=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-xs text-white leading-relaxed italic font-medium">
                        "{member.bio || member.role}"
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {member.dept || "Team"}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight mt-3 group-hover:text-emerald-600 transition-colors duration-200">
                    {member.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 mt-6 pt-4 text-slate-400">
                  <a href="#linkedin" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
                    <FaLinkedin className="h-4 w-4" />
                  </a>
                  <a href="#twitter" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
                    <FaXTwitter className="h-4 w-4" />
                  </a>
                  <a href="#email" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Team — Mobile Auto-Scrolling Marquee (hidden on sm+) */}
          <div className="sm:hidden overflow-hidden w-full relative">
            <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 18, repeat: Infinity }}
              className="flex w-max gap-5"
            >
              {[...Array(2)].flatMap((_, dupeIdx) =>
                (cmsConfig?.cms_meet_the_minds || [
                  {
                    name: "Michael Yohannes",
                    role: "Co-Founder & Chief Executive Officer",
                    dept: "Executive Leadership",
                    bio: "Ex-fintech architect directing corporate tech growth and secure ecosystem partnerships across East Africa.",
                  },
                  {
                    name: "Amara Belay",
                    role: "Chief Technology Officer",
                    dept: "Engineering",
                    bio: "Specialist in high-scale cloud clusters, data structures, and core real-time telemetry streaming platforms.",
                  },
                  {
                    name: "Dawit Kebede",
                    role: "Head of Product Infrastructure",
                    dept: "Product Management",
                    bio: "Translates high-level vendor marketplace visions into intuitive, user-centric system interfaces.",
                  },
                  {
                    name: "Selam Kebede",
                    role: "VP of Logistics Operations",
                    dept: "Operations",
                    bio: "Optimizes end-to-end multi-party shipping pipelines, supply network visibility, and automated merchant routing.",
                  },
                ]).map((member: any, i: number) => (
                  <div
                    key={`${dupeIdx}-${i}`}
                    className="flex-shrink-0 w-[280px] group relative flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  >
                    <div>
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 relative mb-5 border border-slate-100">
                        <img src={member.photo || `https://i.pravatar.cc/300?u=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {member.dept || "Team"}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 tracking-tight mt-3">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {member.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 border-t border-slate-100 mt-6 pt-4 text-slate-400">
                      <a href="#linkedin" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
                        <FaLinkedin className="h-4 w-4" />
                      </a>
                      <a href="#twitter" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
                        <FaXTwitter className="h-4 w-4" />
                      </a>
                      <a href="#email" className="hover:text-emerald-600 transition-colors duration-200 no-underline">
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>




      <section className="py-16 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-900">Partner Companies</h2>
          <p className="text-slate-600 mt-2">Institutional partners supporting our ecosystem.</p>
        </div>

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-16"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <div key={index} className="flex-shrink-0 w-40 h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      <Testimonials testimonials={cmsConfig?.cms_testimonials || []} />


      <ContactSection />



















      <Chatbot />
    </div>
  );
}