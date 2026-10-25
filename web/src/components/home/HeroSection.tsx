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
        <div className="max-w-3xl space-y-6 text-left">
          

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl tracking-tight text-white">
            {hero.title || "Find & Rent Your Next Dream Home in Ethiopia"}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-emerald-50/90 leading-relaxed max-w-2xl">
            {hero.subtitle ||
              "Explore verified apartments, luxury villas, studio flats, and family houses in Addis Ababa, Hawassa, Adama & Bahir Dar with transparent ETB pricing and digital lease agreements!"}
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
      </div>
    </section>
  );
}
