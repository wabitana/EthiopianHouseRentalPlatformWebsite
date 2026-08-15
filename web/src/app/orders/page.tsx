"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Wrench, CheckCircle, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReorderButton } from "@/components/customer/reorder-button";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_LABELS } from "@/lib/pricing";
import type { ServiceType } from "@/types";

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "orders" | "services">("all");

  const showSuccess =
    searchParams.get("payment") === "success" ||
    searchParams.get("booking") === "success";

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/services/book").then((r) => r.json()),
    ]).then(([ordersData, bookingsData]) => {
      setOrders(ordersData.orders || []);
      setBookings(bookingsData.bookings || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-20 text-center text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold text-slate-900">Orders & Transactions</h1>
      <p className="mt-1 text-slate-600">Track purchases and service bookings</p>

      {showSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle className="h-5 w-5" />
          Payment successful! Your order/booking has been confirmed.
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {(["all", "orders", "services"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Filter className="mr-1 inline h-3 w-3" />
            {f}
          </button>
        ))}
      </div>

      {(filter === "all" || filter === "orders") && (
        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Package className="h-5 w-5" /> Product Orders
          </h2>
          {orders.length === 0 ? (
            <p className="text-slate-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id as string} className="card-hover">
                  <CardContent className="p-0">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-semibold">{order.orderNumber as string}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(order.createdAt as string).toLocaleDateString()}
                          {" · "}
                          {(order.items as unknown[])?.length || 0} items
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.total as number)}</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {order.status as string}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </div>
                    </Link>
                    <div className="border-t border-slate-100 px-4 py-2">
                      <ReorderButton orderId={order.id as string} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {(filter === "all" || filter === "services") && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Wrench className="h-5 w-5" /> Service Bookings
          </h2>
          {bookings.length === 0 ? (
            <p className="text-slate-500">No service bookings yet</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Link key={booking.id as string} href={`/bookings/${booking.id}`}>
                  <Card className="card-hover">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">
                          {SERVICE_LABELS[booking.type as ServiceType]}
                        </p>
                        <p className="text-sm text-slate-500">{booking.bookingNumber as string}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(booking.scheduledAt as string).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(
                              (booking.finalPrice || booking.estimatedPrice) as number
                            )}
                          </p>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {booking.status as string}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
