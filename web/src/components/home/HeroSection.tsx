"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
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
      className={`relative overflow-hidden px-6 pt-24 pb-52 text-white sm:px-10 lg:px-14 xl:px-16 lg:pt-32 lg:pb-64 ${(!hero.backgroundType || hero.backgroundType === 'animation') ? 'gradient-hero' : ''}`}
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
  );
}
