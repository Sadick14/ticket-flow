
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { AppProvider } from '@/context/app-context';
import './globals.css';
import RootLayoutClient from './layout-client';
import Script from 'next/script';


export const metadata: Metadata = {
  title: 'TicketFlow - Modern Event Ticketing',
  description: 'The all-in-one platform for event organizers and attendees.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TicketFlow',
  },
};

export const viewport: Viewport = {
  themeColor: '#f76610',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
         <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
              crossOrigin=""/>
      </head>
      <body className="font-body antialiased touch-manipulation safe-area-inset">
        <AuthProvider>
          <AppProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </AppProvider>
        </AuthProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z7YWDKFBF7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z7YWDKFBF7');
          `}
        </Script>
      </body>
    </html>
  );
}
