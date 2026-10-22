"use client";

import React from "react";
import Link from "next/link";
import { Truck, Shield, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServiceBookingSection() {
  return (
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
  );
}
