"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVendor = searchParams.get("role") === "vendor";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        phone: form.get("phone"),
        role: isVendor ? "VENDOR" : "CUSTOMER",
        businessName: form.get("businessName") || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isVendor ? "Landlord & Agent Registration" : "Create Tenant Account"}</CardTitle>
        <p className="text-sm text-slate-500">
          {isVendor
            ? "List properties and collect rent on Delala Home Rentals"
            : "Start searching, inspecting, and booking Ethiopian home rentals"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <Input name="name" required placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" required placeholder="you@email.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <Input name="phone" placeholder="09xxxxxxxx" />
          </div>
          {isVendor && (
            <div>
              <label className="mb-1 block text-sm font-medium">Business Name</label>
              <Input name="businessName" required placeholder="Your business name" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input name="password" type="password" required minLength={6} placeholder="Min 6 characters" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
