"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_LABELS } from "@/lib/pricing";
import type { ServiceType } from "@/types";

interface ServicePackage {
  id: string;
  type: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  features: string[];
  isSubscription: boolean;
  billingCycle: string | null;
  discountPercent: number;
}

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  useEffect(() => {
    fetch("/api/services/packages")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages || []));
  }, []);

  const grouped = packages.reduce(
    (acc, pkg) => {
      if (!acc[pkg.type]) acc[pkg.type] = [];
      acc[pkg.type].push(pkg);
      return acc;
    },
    {} as Record<string, ServicePackage[]>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Link>

      <h1 className="text-3xl font-bold text-slate-900">Service Packages</h1>
      <p className="mt-2 text-slate-600">
        Compare one-time and subscription packages with transparent ETB pricing.
      </p>

      {Object.entries(grouped).map(([type, pkgs]) => (
        <section key={type} className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">
            {SERVICE_LABELS[type as ServiceType]}
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {pkgs.map((pkg) => (
              <Card
                key={pkg.id}
                className={pkg.isSubscription ? "border-emerald-300 ring-1 ring-emerald-200" : ""}
              >
                <CardContent className="flex h-full flex-col p-6">
                  {pkg.isSubscription && (
                    <span className="mb-2 w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Subscription
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
                  <p className="mt-4 text-2xl font-bold text-emerald-700">
                    {formatCurrency(pkg.basePrice)}
                    {pkg.isSubscription && (
                      <span className="text-sm font-normal text-slate-500">
                        /{pkg.billingCycle || "month"}
                      </span>
                    )}
                  </p>
                  {pkg.discountPercent > 0 && (
                    <p className="text-xs text-emerald-600">
                      Save {pkg.discountPercent}% vs one-time
                    </p>
                  )}
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {pkg.isSubscription ? (
                    <Link href={`/services/subscriptions?package=${pkg.id}`} className="mt-6 block">
                      <Button className="w-full" variant="outline">
                        Subscribe
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/services/book?type=${pkg.type}&package=${pkg.slug}`}
                      className="mt-6 block"
                    >
                      <Button className="w-full">Book Now</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
