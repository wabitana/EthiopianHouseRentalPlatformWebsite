"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Highlight {
  id: string;
  category: string;
  name: string;
  desc: string;
  image?: string;
  icon: React.ComponentType<any>;
}

interface PlatformHighlightsSectionProps {
  highlights: Highlight[];
}

export default function PlatformHighlightsSection({ highlights }: PlatformHighlightsSectionProps) {
  return (
    <section className="bg-white py-16">
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
          {highlights.map((highlight) => (
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
  );
}
