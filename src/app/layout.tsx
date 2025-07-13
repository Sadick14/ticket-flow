
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { usePathname } from 'next/navigation';
import RootLayoutClient from './layout-client';


export const metadata: Metadata = {
  title: 'TicketFlow - Modern Event Ticketing',
  description: 'The all-in-one platform for event organizers and attendees.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="h-full">
      <head>
        <title>TicketFlow - Modern Event Ticketing</title>
        <meta name="description" content="The all-in-one platform for event organizers and attendees." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
