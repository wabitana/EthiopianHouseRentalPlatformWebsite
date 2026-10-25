"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AboutConfig {
  badge?: string;
  title?: string;
  mission?: string;
  vision?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  services?: string[];
  phone?: string;
  exploreButtonLink?: string;
  explorebuttonText?: string;
  videoUrl?: string;
}

interface AboutUsSectionProps {
  config: AboutConfig;
}

const SCROLL_ANIMATION_CSS = `
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
`;

export default function AboutUsSection({ config: about }: AboutUsSectionProps) {
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

  const defaultServices = [
    "Verified residential & luxury villa home rentals",
    "Move-in cleaning, inspection & tenant logistics",
    "Instant Chapa rent payments & digital lease agreements",
  ];

  return (
    <div className="mt-28 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
      <section
        ref={aboutSectionRef}
        className="w-full bg-slate-50/90 text-black border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch"
      >
      <style dangerouslySetInnerHTML={{ __html: SCROLL_ANIMATION_CSS }} />

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
            {(about.services || defaultServices).map((s: string, i: number) => (
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
  </div>
  );
}
