"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackingTimeline } from "@/components/customer/tracking-timeline";
import { ReorderButton } from "@/components/customer/reorder-button";
import { formatCurrency } from "@/lib/utils";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<{
    order: Record<string, unknown>;
    timeline: Array<Record<string, unknown>>;
  } | null>(null);

  function load() {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then(setData);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data?.order) {
    return <div className="py-20 text-center text-slate-500">Loading order...</div>;
  }

  const order = data.order;
  const items = order.items as Array<Record<string, unknown>>;
  const payment = order.payment as Record<string, unknown> | null;
  const tracking = (order.tracking as Array<Record<string, unknown>>) || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber as string}</h1>
          <p className="text-slate-500">
            {new Date(order.createdAt as string).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <ReorderButton orderId={id} />
          <button
            onClick={load}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Tracking</CardTitle>
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
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id as string} className="flex justify-between text-sm">
                  <span>
                    {item.name as string} × {item.quantity as number}
                  </span>
                  <span className="font-medium">
                    {formatCurrency((item.price as number) * (item.quantity as number))}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-emerald-700">
                  {formatCurrency(order.total as number)}
                </span>
              </div>
            </CardContent>
          </Card>

          {!!order.shippingAddress && (
            <Card>
              <CardContent className="flex gap-3 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-sm text-slate-600">{order.shippingAddress as string}</p>
                  <p className="text-sm text-slate-500">{order.shippingCity as string}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {payment && (
            <Card>
              <CardContent className="p-4 text-sm">
                <p>
                  Payment:{" "}
                  <span className="font-semibold text-emerald-600">
                    {payment.status as string}
                  </span>
                </p>
                <p className="text-slate-500">
                  {formatCurrency(payment.amount as number)} via Chapa
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
