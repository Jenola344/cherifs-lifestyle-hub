import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cherif’s Lifestyle Hub | Luxury Interior Architecture & Art',
  description: 'Curating timeless interiors, artistic living, and elegant lifestyle spaces. Discover bespoke interior design and hand-curated art collections in Lagos.',
  keywords: ['Interior Design', 'Lagos Art Gallery', 'Luxury Minimalism', 'Bespoke Furniture', 'Cherif Hub'],
};

import { CartProvider } from '@/context/CartContext';
import { UserProvider } from '@/context/UserContext';
import NextAuthProvider from '@/components/layout/NextAuthProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <NextAuthProvider>
          <UserProvider>
            <CartProvider>
              <Navbar />
              {children}
              <Footer />
            </CartProvider>
          </UserProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
