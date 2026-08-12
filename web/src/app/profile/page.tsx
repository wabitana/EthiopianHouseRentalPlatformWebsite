"use client";

import { useEffect, useState } from "react";
import { User, MapPin, Package, Wrench, Bell } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressPicker } from "@/components/customer/address-picker";

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  createdAt: string;
  _count: { orders: number; serviceBookings: number };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.json();
      })
      .then((d) => {
        if (d.user) {
          setProfile(d.user);
          setForm({
            name: d.user.name || "",
            phone: d.user.phone || "",
            address: d.user.address || "",
            city: d.user.city || "Addis Ababa",
          });
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile((p) => (p ? { ...p, ...data.user } : p));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (!profile) {
    return <div className="py-20 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <p className="text-slate-500">{profile.email}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Link href="/orders">
          <Card className="card-hover text-center">
            <CardContent className="p-4">
              <Package className="mx-auto h-5 w-5 text-emerald-600" />
              <p className="mt-1 text-lg font-bold">{profile._count.orders}</p>
              <p className="text-xs text-slate-500">Orders</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/orders">
          <Card className="card-hover text-center">
            <CardContent className="p-4">
              <Wrench className="mx-auto h-5 w-5 text-emerald-600" />
              <p className="mt-1 text-lg font-bold">{profile._count.serviceBookings}</p>
              <p className="text-xs text-slate-500">Bookings</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/notifications">
          <Card className="card-hover text-center">
            <CardContent className="p-4">
              <Bell className="mx-auto h-5 w-5 text-emerald-600" />
              <p className="mt-1 text-sm font-bold">Alerts</p>
              <p className="text-xs text-slate-500">View all</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="09xxxxxxxx"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Default Address</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Saved Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressPicker
            selectedAddress={form.address}
            onSelect={(addr) =>
              setForm({ ...form, address: addr.address, city: addr.city })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
