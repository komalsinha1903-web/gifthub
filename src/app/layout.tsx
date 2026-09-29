import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GiftHub',
  description: 'Digital gift cards & luxury store',
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