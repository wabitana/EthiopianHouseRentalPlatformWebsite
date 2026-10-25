"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface FeatureItem {
  title: string;
  desc: string;
  image?: string;
  icon: React.ComponentType<any>;
}

interface PlatformHighlightsSectionProps {
  features: FeatureItem[];
}

export default function PlatformHighlightsSection({ features }: PlatformHighlightsSectionProps) {
  return (
    <section className="relative z-20 -mt-20 sm:-mt-24 rounded-t-[50px] sm:rounded-t-[80px] bg-white pt-20 sm:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-16">
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
          {features.map((f) => (
            <Card
              key={f.title}
              className="card-hover overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-sm flex flex-col justify-between"
            >
              <CardContent className="p-6">
                {f.image ? (
                  <div className="mb-4 h-14 w-14">
                    <img src={f.image} alt={f.title} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <f.icon className="h-6 w-6" />
                  </div>
                )}

                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {f.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
