import type { Metadata } from 'next';
import './globals.css';

// Railway live URL 
const siteUrl = 'https://gifthub.up.railway.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GiftHub | Digital Gift Cards & Luxury Store',
    template: '%s | GiftHub',
  },
  description: 'Digital gift cards & luxury store. Buy Apple Gift cards, Amazon gift cards Luxury watches, Fine Jewellery and instant gifts seamlessly.',
  keywords: ['GiftHub', 'Gift Cards', 'Luxury Store', 'Digital Cards', 'Shopping'],

  // Favicon aur Browser Icons (Next.js default hatane ke liye)
  icons: {
    icon: [
      { url: '/icon.svg' },
      { url: '/icon.svg', type: 'image/svg' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
  
  // WhatsApp, Facebook, LinkedIn previews
  openGraph: {
    title: 'GiftHub | Digital Gift Cards & Luxury Store',
    description: 'Digital gift cards & luxury store. Buy Apple Gift cards, Amazon gift cards Luxury watches, Fine Jewellery and instant gifts seamlessly.',
    url: siteUrl,
    siteName: 'GiftHub',
    images: [
      {
        url: '/og-image.png', // public/og-image.png me image save karein
        width: 1200,
        height: 630,
        alt: 'GiftHub Preview Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter / X preview card
  twitter: {
    card: 'summary_large_image',
    title: 'GiftHub | Digital Gift Cards & Luxury Store',
    description: 'Digital gift cards & luxury store. Buy Apple Gift cards, Amazon gift cards Luxury watches, Fine Jewellery and instant gifts seamlessly.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Browser extensions ke inject kiye hue attributes ko patch karne ke liye */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  if (typeof args[0] === 'string' && (args[0].includes('bis_skin_checked') || args[0].includes('hydration-mismatch'))) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#0b101b] text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}