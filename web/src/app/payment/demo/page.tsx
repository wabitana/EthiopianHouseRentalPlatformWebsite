"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DemoPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref");

  async function completePayment() {
    if (txRef) {
      await fetch(`/api/payments/chapa/callback?tx_ref=${txRef}`);
    }
    router.push("/orders?payment=success");
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <CreditCard className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold">Chapa Payment (Demo Mode)</h1>
          <p className="mt-2 text-sm text-slate-600">
            Chapa API keys are not configured. This simulates a successful payment.
          </p>
          {txRef && (
            <p className="mt-2 text-xs text-slate-400">Ref: {txRef}</p>
          )}
          <Button onClick={completePayment} className="mt-6 w-full">
            <CheckCircle className="h-4 w-4" /> Simulate Successful Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentDemoPage() {
  return (
    <Suspense>
      <DemoPayment />
    </Suspense>
  );
}
