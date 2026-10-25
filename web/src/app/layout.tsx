import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCmsConfig } from "@/lib/cms";
import { Navbar } from "@/components/layout/navbar";
import { PushPrompt } from "@/components/customer/push-prompt";
import { Mail, Phone, MapPin, ChevronRight, Send } from "lucide-react";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delala Rentals | Ethiopian Home Rental Platform",
  description:
    "Ethiopia's premier home rental platform for apartments, luxury villas, studio flats, and commercial properties. Browse verified listings, pay rent via Chapa, and book move-in services in Addis Ababa.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Delala Rentals",
  },
};

import { PortalHotkeyListener } from "@/components/portal/portal-hotkey-listener";
import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession();
  const cmsData = await getCmsConfig();
  const { cms_footer, cms_navbar } = cmsData as any;

  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <MainLayoutWrapper
          user={user}
          cmsNavbar={cms_navbar}
          cmsFooter={cms_footer}
        >
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}
