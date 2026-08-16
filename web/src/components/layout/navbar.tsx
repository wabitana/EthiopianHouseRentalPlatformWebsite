'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
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
  ShieldAlert,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuthStore';

interface NavbarProps {
  user?: any;
  cartCount?: number;
  cmsNavbar?: {
    siteName?: string;
    siteTagline?: string;
    logoLetter?: string;
    logoColor?: string;
  };
}

const customerLinks = [
  { href: '/', label: 'Home', icon: Store },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/about', label: 'About', icon: Info },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/#contact', label: 'Contact', icon: MessageSquare },
];

export function Navbar({ cmsNavbar = {} }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // Determine user dashboard link based on RBAC roles
  let dashboardLink = '/renter/dashboard';
  let dashboardLabel = 'Dashboard';
  if (user?.roles?.includes('ADMIN')) {
    dashboardLink = '/admin/dashboard';
    dashboardLabel = 'Admin Dashboard';
  } else if (user?.roles?.includes('OWNER')) {
    dashboardLink = '/owner/dashboard';
    dashboardLabel = 'Owner Control Panel';
  } else if (user?.roles?.includes('RENTER') || user?.roles?.includes('BUYER')) {
    dashboardLink = '/renter/dashboard';
    dashboardLabel = 'My Dashboard';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: cmsNavbar.logoColor || '#059669' }}
          >
            <Home className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{cmsNavbar.siteName || 'Delala Rentals'}</p>
            <p className="text-[10px] text-slate-500">{cmsNavbar.siteTagline || 'Ethiopian Property Platform'}</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {customerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Action Buttons */}
        <div className="flex items-center gap-3">
          {mounted && isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-sm font-bold shadow-sm transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{dashboardLabel}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogIn className="h-4 w-4 text-slate-500" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden space-y-2">
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
          {mounted && isAuthenticated && user ? (
            <div className="pt-2 border-t space-y-2">
              <Link
                href={dashboardLink}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2.5 text-sm font-bold"
              >
                <LayoutDashboard className="h-4 w-4" />
                {dashboardLabel}
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t flex gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2 border rounded-lg text-sm font-bold"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
