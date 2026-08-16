import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/lib/providers';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Delala Property Platform | Ethiopian Real Estate',
  description: 'Find houses for rent and sale across Ethiopia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
