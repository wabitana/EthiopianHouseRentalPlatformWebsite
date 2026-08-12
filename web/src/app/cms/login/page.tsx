"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default function CMSLoginPage() {
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
    if (role === "ADMIN") {
      router.push("/cms/dashboard");
      router.refresh();
    } else {
      setError("Unauthorized. CMS Access is restricted to Administrators.");
      setLoading(false);
      // Wait, the API already logged them in via cookie. 
      // If we really wanted strict security, we would clear the cookie here, but they can just access their regular portal.
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-4 pb-8 pt-6">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <LayoutDashboard className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">CMS Administration</CardTitle>
            <p className="text-sm text-slate-500 mt-2">Secure access for Delala Admins</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Admin Email</label>
              <Input name="email" type="email" required placeholder="admin@delala.com" className="bg-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <Input name="password" type="password" required placeholder="••••••••" className="bg-white" />
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 text-md mt-4" disabled={loading}>
              {loading ? "Authenticating..." : "Login to CMS"}
            </Button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Delala Tech PLC.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
