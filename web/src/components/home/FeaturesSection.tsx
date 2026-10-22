"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  title: string;
  desc: string;
  image?: string;
  icon: React.ComponentType<any>;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
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
  );
}
