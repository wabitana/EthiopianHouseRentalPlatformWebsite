"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroAnimationWrapper from "@/components/home/HeroAnimationWrapper";

interface HeroConfig {
  backgroundType?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

interface HeroSectionProps {
  config: HeroConfig;
}

export default function HeroSection({ config: hero }: HeroSectionProps) {
  return (
    <section
      className={`relative overflow-hidden px-6 pt-20 pb-44 text-white sm:px-10 lg:px-14 xl:px-16 lg:pt-28 lg:pb-56 ${
        !hero.backgroundType || hero.backgroundType === "animation" ? "gradient-hero" : ""
      }`}
      style={hero.backgroundType === "color" ? { backgroundColor: hero.backgroundColor || "#059669" } : {}}
    >
      {(!hero.backgroundType || hero.backgroundType === "animation") && <HeroAnimationWrapper />}
      {hero.backgroundType === "image" && hero.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img src={hero.backgroundImage} alt="Hero Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      {hero.backgroundType === "video" && hero.backgroundVideo && (
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline src={hero.backgroundVideo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl tracking-tight text-white">
              {hero.title || "Find & Rent Your Next Dream Home in Ethiopia"}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-emerald-50/90 leading-relaxed max-w-2xl">
              {hero.subtitle ||
                "Explore verified apartments, luxury villas, studio flats, and family houses in Addis Ababa, Hawassa, Adama & Bahir Dar with transparent ETB pricing and digital lease agreements."}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link href={hero.primaryButtonLink || "/browse-houses"}>
                <Button
                  size="lg"
                  className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {hero.primaryButtonText || "Explore Home Rentals"}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>

              <Link href={hero.secondaryButtonLink || "/services"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/80 text-white hover:bg-white/10 font-bold px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all"
                >
                  {hero.secondaryButtonText || "Book Rental Inspection"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Impressive Ethiopian Property Consultant Showcase */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 bg-emerald-400/25 rounded-[3rem] blur-3xl pointer-events-none" />

            {/* Main Showcase Frame */}
            <div className="relative w-full max-w-md rounded-[2.5rem] p-2.5 sm:p-3 bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-inner">
                <img
                  src="/images/ethiopian_woman_seller_white_bg.png"
                  alt="Ethiopian Property Consultant & Verified Landlord"
                  className="w-full h-auto max-h-[460px] object-cover object-top transition-transform duration-500 hover:scale-105"
                />
              </div>


             
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
