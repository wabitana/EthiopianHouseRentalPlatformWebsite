"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    const role = data.user.role;
    if (role === "ADMIN") router.push("/cms/dashboard");
    else router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <p className="text-sm text-slate-500">Sign in to your Delala Rentals account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input name="email" type="email" required placeholder="you@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <Input name="password" type="password" required placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            No account?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
              Register
            </Link>
          </p>
          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold">Demo accounts:</p>
            <p>admin@delala.com · vendor@delala.com · customer@delala.com</p>
            <p>Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
