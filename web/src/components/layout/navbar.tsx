"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Store,
  LayoutDashboard,
  Wrench,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Info,
  Building2,
  Home,
  LogIn,
  UserPlus,
  Send,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import { NotificationBell } from "@/components/customer/notification-bell";

interface NavbarProps {
  user: SessionUser | null;
  cartCount?: number;
  cmsNavbar?: {
    siteName?: string;
    siteTagline?: string;
    logoLetter?: string;
    logoColor?: string;
  };
}

const customerLinks = [
  { href: "/", label: "Home", icon: Store },
  { href: "/about", label: "About", icon: Info },
  { href: "/browse-houses", label: "Browse Houses", icon: Building2 },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/#contact", label: "Contact", icon: MessageSquare },
  { href: "/launch-app", label: "Launch App", icon: LayoutDashboard },
];

export function Navbar({ user, cartCount = 0, cmsNavbar = {} }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: cmsNavbar.logoColor || "#059669" }}
          >
            <Home className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{cmsNavbar.siteName || "Ethiopian Property Platform"}</p>
            <p className="text-[10px] text-slate-500">{cmsNavbar.siteTagline || "Ethiopian Home & Commercial Property Rental & Sale Platform"}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {customerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/EthioHouseRentalBot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors border border-sky-200/60"
            title="Chat with our Telegram Bot"
          >
            <Send className="h-3.5 w-3.5 text-sky-600" />
            <span>Telegram Bot</span>
          </a>
          {user && user.role === "CUSTOMER" && (
            <>
              <NotificationBell />
              <Link
                href="/cart"
                className="relative hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:flex"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4 text-emerald-600" />
                {user.name}
              </Link>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  document.cookie = "delala_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch (_) {}
                  window.location.href = '/cms/login';
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          ) : null}

          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden space-y-2">
          {customerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="mt-3 border-t pt-3 flex flex-col gap-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  document.cookie = "delala_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch (_) {}
                  window.location.href = '/cms/login';
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-50 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </header>
  );
}