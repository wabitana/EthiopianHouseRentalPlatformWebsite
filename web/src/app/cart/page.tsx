"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    vendor: { businessName: string };
  };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  function loadCart() {
    fetch("/api/cart")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setItems(data.items);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadCart();
  }, [router]);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return removeItem(productId);
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  async function removeItem(productId: string) {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading cart...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">Your cart is empty</p>
          <Link href="/marketplace" className="mt-4 inline-block">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.product.name}</h3>
                    <p className="text-sm text-slate-500">{item.product.vendor.businessName}</p>
                    <p className="mt-1 font-bold text-emerald-700">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600">Subtotal ({items.length} items)</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</p>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
