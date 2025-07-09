
'use client';

import type { Metadata } from 'next';
import { AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/context/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { usePathname } from 'next/navigation';

// Note: `metadata` export is no longer static because this is a client component.
// For static metadata, this would need to be a Server Component again.
// We are keeping it here for simplicity as the user's last change introduced this pattern.
// export const metadata: Metadata = {
//   title: 'TicketFlow - Modern Event Ticketing',
//   description: 'A modern platform for creating, selling, and buying event tickets.',
//   icons: [{ rel: 'icon', url: '/favicon.ico' }],
// };

function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname === '/create';

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="h-full">
      <head>
        <title>TicketFlow - Modern Event Ticketing</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
