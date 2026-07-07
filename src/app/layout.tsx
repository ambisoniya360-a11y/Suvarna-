import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://suvarnaloan.com'),
  title: {
    default: 'SuvarnaLoan ERP — Transforming Gold Into Trust',
    template: '%s | SuvarnaLoan ERP',
  },
  description:
    'Premium gold loan ERP software for jewelers, pawnbrokers, and NBFCs. Manage customers, loans, gold valuations, payments, and reports — all in one platform.',
  keywords: [
    'gold loan software',
    'jewellery shop ERP',
    'gold loan management',
    'NBFC software',
    'pawnbroker software',
    'gold valuation system',
    'loan management system',
  ],
  authors: [{ name: 'SuvarnaLoan' }],
  creator: 'SuvarnaLoan',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://suvarnaloan.com',
    siteName: 'SuvarnaLoan ERP',
    title: 'SuvarnaLoan ERP — Transforming Gold Into Trust',
    description:
      'Premium gold loan ERP software for jewelers, NBFCs, and pawnbrokers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SuvarnaLoan ERP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuvarnaLoan ERP — Transforming Gold Into Trust',
    description: 'Premium gold loan ERP software for jewelers and NBFCs.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'SuvarnaLoan ERP',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'Premium gold loan ERP software for jewelers, pawnbrokers, and NBFCs.',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'INR',
                lowPrice: '9999',
                highPrice: '24999',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
