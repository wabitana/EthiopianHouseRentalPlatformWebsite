"use client";



import { useState, Suspense, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { SERVICE_LABELS } from "@/lib/pricing";

import type { ServiceType } from "@/types";

import { AddressPicker } from "@/components/customer/address-picker";

import { AppointmentSlotPicker } from "@/components/services/appointment-slot-picker";

import { PricingBreakdown } from "@/components/services/pricing-breakdown";



function BookingForm() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const type = (searchParams.get("type") || "CLEANING") as ServiceType;

  const packageSlug = searchParams.get("package");

  const [scheduledAt, setScheduledAt] = useState("");

  const [breakdown, setBreakdown] = useState<{

    items: Array<{ label: string; amount: number }>;

    total: number;

    discount: number;

  } | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [location, setLocation] = useState({

    address: "",

    city: "Addis Ababa",

    lat: undefined as number | undefined,

    lng: undefined as number | undefined,

  });



  const handleSlotChange = useCallback((iso: string) => {

    setScheduledAt(iso);

  }, []);



  async function calculateEstimate(form: FormData) {

    const res = await fetch("/api/services/estimate", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        type,

        propertySize: form.get("propertySize"),

        rooms: Number(form.get("rooms")) || undefined,

        distanceKm: Number(form.get("distanceKm")) || undefined,

        packageName: form.get("packageName"),

      }),

    });

    const data = await res.json();

    if (data.breakdown) setBreakdown(data.breakdown);

  }



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    if (!location.address.trim()) {

      setError("Please select or enter a service address");

      return;

    }

    if (!scheduledAt) {

      setError("Please select an appointment date and time slot");

      return;

    }

    setLoading(true);

    setError("");



    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/services/book", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        type,

        scheduledAt,

        address: location.address || (form.get("address") as string),

        city: location.city || "Addis Ababa",

        lat: location.lat,

        lng: location.lng,

        propertySize: form.get("propertySize"),

        rooms: Number(form.get("rooms")) || undefined,

        distanceKm: Number(form.get("distanceKm")) || undefined,

        packageName: form.get("packageName") || packageSlug,

        notes: form.get("notes"),

      }),

    });



    const data = await res.json();

    if (!res.ok) {

      setError(data.error || "Booking failed");

      if (res.status === 401) router.push("/login");

      setLoading(false);

      return;

    }



    if (data.checkoutUrl) {

      window.location.href = data.checkoutUrl;

    } else {

      router.push("/orders?booking=success");

    }

  }



  return (

    <Card className="mx-auto max-w-xl">

      <CardHeader>

        <CardTitle>Book {SERVICE_LABELS[type]}</CardTitle>

        <p className="text-sm text-slate-500">

          Select an appointment slot and get instant automated pricing

        </p>

      </CardHeader>

      <CardContent>

        <form

          onSubmit={handleSubmit}

          onChange={(e) => calculateEstimate(new FormData(e.currentTarget))}

          className="space-y-4"

        >

          <AppointmentSlotPicker

            type={type}

            value={scheduledAt}

            onChange={handleSlotChange}

          />



          <div>

            <label className="mb-2 block text-sm font-medium">Service Location</label>

            <AddressPicker

              selectedAddress={location.address}

              onSelect={(addr) => setLocation({ address: addr.address, city: addr.city, lat: addr.lat, lng: addr.lng })}

            />

            <Input

              name="address"

              className="mt-3"

              required

              placeholder="Or type address manually"

              value={location.address}

              onChange={(e) =>

                setLocation({ ...location, address: e.target.value })

              }

            />

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium">Property Size</label>

            <select

              name="propertySize"

              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"

            >

              <option value="small">Small</option>

              <option value="medium">Medium</option>

              <option value="large">Large</option>

              <option value="commercial">Commercial</option>

            </select>

          </div>



          {type === "CLEANING" && (

            <div>

              <label className="mb-1 block text-sm font-medium">Number of Rooms</label>

              <Input name="rooms" type="number" min="1" defaultValue="3" />

            </div>

          )}



          {type === "MOVING" && (

            <div>

              <label className="mb-1 block text-sm font-medium">Distance (km)</label>

              <Input name="distanceKm" type="number" min="1" defaultValue="10" />

            </div>

          )}



          <div>

            <label className="mb-1 block text-sm font-medium">Service Package</label>

            <select

              name="packageName"

              defaultValue={packageSlug || "standard"}

              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"

            >

              <option value="standard">Standard — one-time service</option>

              <option value="premium">Premium — deep clean / extended (+35%)</option>

              <option value="subscription_monthly">Subscriber rate (-15%)</option>

            </select>

          </div>



          <div>

            <label className="mb-1 block text-sm font-medium">Special Notes</label>

            <textarea

              name="notes"

              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"

              rows={3}

              placeholder="Access instructions, pets, fragile items..."

            />

          </div>



          {breakdown && (

            <PricingBreakdown

              items={breakdown.items}

              total={breakdown.total}

              discount={breakdown.discount}

            />

          )}



          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>

            {loading ? "Processing..." : "Confirm & Pay with Chapa"}

          </Button>

        </form>

      </CardContent>

    </Card>

  );

}



export default function BookServicePage() {

  return (

    <div className="px-4 py-8">

      <Link

        href="/services"

        className="mx-auto mb-6 flex max-w-xl items-center gap-2 text-sm text-emerald-600 hover:underline"

      >

        <ArrowLeft className="h-4 w-4" /> Back to Services

      </Link>

      <Suspense>

        <BookingForm />

      </Suspense>

    </div>

  );

}

