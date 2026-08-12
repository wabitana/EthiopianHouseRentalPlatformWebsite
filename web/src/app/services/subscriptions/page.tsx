"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Pause, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_LABELS } from "@/lib/pricing";
import type { ServiceType } from "@/types";

interface Subscription {
  id: string;
  type: string;
  status: string;
  price: number;
  address: string;
  city: string;
  nextServiceAt: string | null;
  package: { name: string };
}

function SubscriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPackage = searchParams.get("package");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [showForm, setShowForm] = useState(!!preselectedPackage);
  const [packageId, setPackageId] = useState(preselectedPackage || "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/services/subscriptions").then((r) => r.json()),
      fetch("/api/services/packages").then((r) => r.json()),
    ]).then(([subData, pkgData]) => {
      setSubscriptions(subData.subscriptions || []);
      setPackages(
        (pkgData.packages || []).filter((p: { isSubscription: boolean }) => p.isSubscription)
      );
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/services/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId, address }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setShowForm(false);
    setLoading(false);
    load();
  }

  async function toggleStatus(id: string, status: string) {
    await fetch("/api/services/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Subscriptions</h1>
          <p className="text-slate-600">Manage recurring cleaning, pest control, and maintenance plans</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          {showForm ? "Cancel" : "New Subscription"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <form onSubmit={subscribe} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Package</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                >
                  <option value="">Select a plan</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {SERVICE_LABELS[p.type as ServiceType]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Service Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Bole, Addis Ababa"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Activating..." : "Activate Subscription"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        {subscriptions.length === 0 ? (
          <p className="text-center text-slate-500 py-12">
            No active subscriptions. Browse{" "}
            <Link href="/services/packages" className="text-emerald-600 hover:underline">
              service packages
            </Link>{" "}
            to get started.
          </p>
        ) : (
          subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{sub.package.name}</p>
                  <p className="text-sm text-slate-500">
                    {SERVICE_LABELS[sub.type as ServiceType]} · {sub.address}
                  </p>
                  {sub.nextServiceAt && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="h-3 w-3" />
                      Next service: {new Date(sub.nextServiceAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">{formatCurrency(sub.price)}/mo</p>
                    <span
                      className={`text-xs font-medium ${
                        sub.status === "ACTIVE" ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  {sub.status === "ACTIVE" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(sub.id, "PAUSED")}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : sub.status === "PAUSED" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(sub.id, "ACTIVE")}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function ServiceSubscriptionsPage() {
  return (
    <Suspense>
      <SubscriptionsContent />
    </Suspense>
  );
}
