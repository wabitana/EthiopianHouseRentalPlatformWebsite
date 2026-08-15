"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, RefreshCw, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackingTimeline } from "@/components/customer/tracking-timeline";
import { ServiceReviewForm } from "@/components/services/service-review-form";
import { StarRating } from "@/components/services/star-rating";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_LABELS } from "@/lib/pricing";
import type { ServiceType } from "@/types";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<{
    booking: Record<string, unknown>;
    timeline: Array<Record<string, unknown>>;
  } | null>(null);

  function load() {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then(setData);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data?.booking) {
    return <div className="py-20 text-center text-slate-500">Loading booking...</div>;
  }

  const booking = data.booking;
  const provider = booking.provider as { name: string; phone: string } | null;
  const assignedName = booking.assignedProviderName as string | null;
  const review = booking.review as { rating: number; comment: string } | null;
  const tracking = (booking.tracking as Array<Record<string, unknown>>) || [];
  const isCompleted = booking.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {SERVICE_LABELS[booking.type as ServiceType]}
          </h1>
          <p className="text-slate-500">{booking.bookingNumber as string}</p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Tracking</CardTitle>
            <p className="text-xs text-slate-500">Auto-refreshes every 15 seconds</p>
          </CardHeader>
          <CardContent>
            <TrackingTimeline
              steps={data.timeline as never}
              events={tracking.map((e) => ({
                status: e.status as string,
                message: e.message as string,
                createdAt: e.createdAt as string,
              }))}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled</span>
                <span className="font-medium">
                  {new Date(booking.scheduledAt as string).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Price</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(
                    (booking.finalPrice || booking.estimatedPrice) as number
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex gap-3 p-4">
              <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium">Service Location</p>
                <p className="text-sm text-slate-600">{booking.address as string}</p>
                <p className="text-sm text-slate-500">{booking.city as string}</p>
                {!!booking.lat && (
                  <a
                    href={`https://maps.google.com/?q=${booking.lat as number},${booking.lng as number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-emerald-600 hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {(provider || assignedName) && (
            <Card>
              <CardContent className="flex gap-3 p-4">
                <User className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium">Assigned Provider</p>
                  <p className="text-sm text-slate-600">
                    {provider?.name || assignedName}
                  </p>
                  {provider?.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      {provider.phone}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isCompleted && !review && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 font-medium">Rate your service</p>
                <ServiceReviewForm bookingId={id} onSubmitted={load} />
              </CardContent>
            </Card>
          )}

          {review && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-2 font-medium">Your Review</p>
                <StarRating value={review.rating} size="sm" />
                {review.comment && (
                  <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
