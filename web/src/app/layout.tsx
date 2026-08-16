import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from '@/lib/providers';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCmsConfig } from '@/lib/cms';
import { Navbar } from '@/components/layout/navbar';
import { PushPrompt } from '@/components/customer/push-prompt';
import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Delala Rentals | Ethiopian Home Rental Platform',
  description: 'Ethiopias premier home rental platform for apartments, luxury villas, studio flats, and commercial properties.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Delala Rentals',
  },
};

async function getCartCount(userId: string) {
  return 0;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession();
  const cartCount = user?.role === 'CUSTOMER' ? await getCartCount(user.id) : 0;
  const cmsData = await getCmsConfig();
  const { cms_footer, cms_navbar } = (cmsData || {}) as any;

  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <Providers>
          <Navbar user={user} cartCount={cartCount} cmsNavbar={cms_navbar} />
          <main className="flex-1 pb-0">{children}</main>
          <PushPrompt />
          <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Address</h4>
                <div className="space-y-4">
                  <p className="flex items-center gap-3"><MapPin size={20} className="text-blue-500" /> {cms_footer?.address || 'Bole, Addis Ababa, Ethiopia'}</p>
                  <p className="flex items-center gap-3"><Phone size={20} className="text-blue-500" /> {cms_footer?.phone || '+251 911 000 000'}</p>
                  <p className="flex items-center gap-3"><Mail size={20} className="text-blue-500" /> {cms_footer?.email || 'info@ethioproperty.et'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Office Hours</h4>
                <div className="space-y-4">
                  <p><span className="block text-white font-semibold">Monday - Friday:</span> {cms_footer?.officeHoursWeekday || '8:30 AM - 5:30 PM'}</p>
                  <p><span className="block text-white font-semibold">Saturday - Sunday:</span> {cms_footer?.officeHoursWeekend || '9:00 AM - 1:00 PM'}</p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Services</h4>
                <ul className="space-y-3">
                  {(cms_footer?.services || ['House Rentals', 'Property Sales', 'Verification']).map((service: string) => (
                    <li key={service} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                      <ChevronRight size={16} /> {service}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
                <p className="text-sm mb-4">Our Ethiopian Property Platform is live. Browse verified listings and manage properties in one place.</p>
                <div className="flex bg-white rounded-lg overflow-hidden">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2 text-slate-900 outline-none" />
                  <button className="bg-blue-600 px-4 text-white font-bold">SignUp</button>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <p>{cms_footer?.copyright || 'Copyright 2026 Ethiopian Property Platform.'}</p>
              <div className="flex items-center gap-4">
                <p>Powered by Ethiopian Property Platform</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
