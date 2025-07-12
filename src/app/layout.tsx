
'use client';

import type { Metadata } from 'next';
import { AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/context/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { useAuth } from '@/context/auth-context';

function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname === '/create';
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>
  }

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
