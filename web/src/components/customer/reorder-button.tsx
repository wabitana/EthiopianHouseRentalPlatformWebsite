"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      router.push(data.redirect || "/cart");
      router.refresh();
    } else {
      alert(data.error || "Reorder failed");
    }
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReorder} disabled={loading}>
      <RotateCcw className="h-4 w-4" />
      {loading ? "Adding..." : "Reorder"}
    </Button>
  );
}
