"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressPicker } from "@/components/customer/address-picker";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shipping, setShipping] = useState<{
    address: string;
    city: string;
    lat?: number;
    lng?: number;
  }>({
    address: "",
    city: "Addis Ababa",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/cart").then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      }),
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
    ]).then(([cartData, profileData]) => {
      if (cartData?.items?.length === 0) router.push("/cart");
      if (cartData) setItems(cartData.items);
      if (profileData?.user) {
        setShipping((s) => ({
          ...s,
          address: profileData.user.address || s.address,
          city: profileData.user.city || s.city,
        }));
      }
      setLoading(false);
    });
  }, [router]);

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  async function handleCheckout() {
    if (!shipping.address) {
      alert("Please select or enter a delivery address");
      return;
    }
    setProcessing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingLat: shipping.lat,
        shippingLng: shipping.lng,
        notes,
      }),
    });
    const data = await res.json();
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else if (res.ok) {
      router.push("/orders?payment=success");
    } else {
      alert(data.error || "Checkout failed");
    }
    setProcessing(false);
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading checkout...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressPicker
                selectedAddress={shipping.address}
                onSelect={(addr) => setShipping(addr)}
              />
              <Input
                placeholder="Or type address manually"
                value={shipping.address}
                onChange={(e) =>
                  setShipping({ ...shipping, address: e.target.value })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                rows={3}
                placeholder="Special delivery instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-emerald-700">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={processing}
              >
                <CreditCard className="h-4 w-4" />
                {processing ? "Processing..." : "Pay with Chapa"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
