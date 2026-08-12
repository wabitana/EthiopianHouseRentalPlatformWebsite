"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
}

interface AddressPickerProps {
  onSelect: (addr: {
    address: string;
    city: string;
    lat?: number;
    lng?: number;
  }) => void;
  selectedAddress?: string;
}

export function AddressPicker({ onSelect, selectedAddress }: AddressPickerProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [locating, setLocating] = useState(false);
  const [manual, setManual] = useState({ label: "", address: "", city: "Addis Ababa" });

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAddresses(d.addresses));
  }, []);

  function useGeolocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
        onSelect({ address, city: "Addis Ababa", lat, lng });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...manual, isDefault: addresses.length === 0 }),
    });
    const data = await res.json();
    if (res.ok) {
      setAddresses((prev) => [...prev, data.address]);
      onSelect({
        address: data.address.address,
        city: data.address.city,
        lat: data.address.lat,
        lng: data.address.lng,
      });
      setShowNew(false);
      setManual({ label: "", address: "", city: "Addis Ababa" });
    }
  }

  async function removeAddress(id: string) {
    await fetch("/api/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useGeolocation}
          disabled={locating}
        >
          <Navigation className="h-4 w-4" />
          {locating ? "Locating..." : "Use my location"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowNew(!showNew)}>
          <Plus className="h-4 w-4" /> Save new address
        </Button>
      </div>

      {showNew && (
        <form onSubmit={saveAddress} className="rounded-xl border border-slate-200 p-4 space-y-3">
          <Input
            placeholder="Label (Home, Office...)"
            value={manual.label}
            onChange={(e) => setManual({ ...manual, label: e.target.value })}
            required
          />
          <Input
            placeholder="Street address"
            value={manual.address}
            onChange={(e) => setManual({ ...manual, address: e.target.value })}
            required
          />
          <Input
            placeholder="City"
            value={manual.city}
            onChange={(e) => setManual({ ...manual, city: e.target.value })}
          />
          <Button type="submit" size="sm">Save & use</Button>
        </form>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={`flex w-full items-start gap-3 rounded-xl border p-4 transition-colors ${
            selectedAddress === addr.address
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <button
            type="button"
            onClick={() =>
              onSelect({
                address: addr.address,
                city: addr.city,
                lat: addr.lat ?? undefined,
                lng: addr.lng ?? undefined,
              })
            }
            className="flex flex-1 min-w-0 items-start gap-3 text-left"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{addr.label}</p>
              <p className="text-sm text-slate-600 truncate">{addr.address}</p>
              <p className="text-xs text-slate-400">{addr.city}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => removeAddress(addr.id)}
            className="p-1 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
