"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { PushPrompt } from "@/components/customer/push-prompt";
import { PortalHotkeyListener } from "@/components/portal/portal-hotkey-listener";
import { Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface MainLayoutWrapperProps {
  user: SessionUser | null;
  cartCount: number;
  cmsNavbar: any;
  cmsFooter: any;
  children: React.ReactNode;
}

export function MainLayoutWrapper({
  user,
  cartCount,
  cmsNavbar,
  cmsFooter,
  children,
}: MainLayoutWrapperProps) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  if (isPortal) {
    return (
      <>
        <PortalHotkeyListener />
        <div className="min-h-screen bg-slate-900">{children}</div>
      </>
    );
  }

  return (
    <>
      <PortalHotkeyListener />
      <Navbar user={user} cartCount={cartCount} cmsNavbar={cmsNavbar} />
      <main className="flex-1 pb-0">{children}</main>
      <PushPrompt />
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Address Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Address</h4>
            <div className="space-y-4">
              <p className="flex items-center gap-3">
                <MapPin size={20} className="text-blue-500" /> {cmsFooter?.address}
              </p>
              <p className="flex items-center gap-3">
                <Phone size={20} className="text-blue-500" /> {cmsFooter?.phone}
              </p>
              <p className="flex items-center gap-3">
                <Mail size={20} className="text-blue-500" /> {cmsFooter?.email}
              </p>
            </div>
          </div>

          {/* Office Hours Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Office Hours</h4>
            <div className="space-y-4">
              <p>
                <span className="block text-white font-semibold">Monday - Friday:</span>{" "}
                {cmsFooter?.officeHoursWeekday}
              </p>
              <p>
                <span className="block text-white font-semibold">Saturday - Sunday:</span>{" "}
                {cmsFooter?.officeHoursWeekend}
              </p>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              {(cmsFooter?.services || []).map((service: string) => (
                <li key={service} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <ChevronRight size={16} /> {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-sm mb-4">
              Our Ethiopian Home Rental Platform is now live. Browse verified listings and book move-in services in one place.
            </p>
            <div className="flex bg-white rounded-lg overflow-hidden">
              <input type="email" placeholder="Your email" className="w-full px-4 py-2 text-slate-900 outline-none" />
              <button className="bg-blue-600 px-4 text-white font-bold">SignUp</button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>{cmsFooter?.copyright}</p>
          <div className="flex items-center gap-4">
            <p>Powered by Delala Home Rentals</p>
            {user?.role === "ADMIN" ? (
              <a href="/cms/dashboard" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                CMS Admin
              </a>
            ) : (
              <a href="/cms/login" className="text-slate-500 hover:text-slate-400 text-xs transition-colors">
                CMS Login
              </a>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
