"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (res.ok) {
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 2000);
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleAdd} disabled={loading} className="w-full sm:w-auto">
      <ShoppingCart className="h-4 w-4" />
      {loading ? "Adding..." : added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
