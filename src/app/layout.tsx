

'use client';

import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import LaunchWrapper from '@/components/launch-wrapper';


// This is now a client component, so metadata should be defined statically here.
// export const metadata: Metadata = {
//   title: 'TicketFlow - Modern Event Ticketing',
//   description: 'The all-in-one platform for event organizers and attendees.',
// };

function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname === '/create';
  const isAdminRoute = pathname.startsWith('/admin');
  const isLaunchRoute = pathname === '/launch';

  if (isAdminRoute) {
    return <AdminLayout>{children}</AdminLayout>
  }

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // Render only the children for the launch page, no header/footer
  if (isLaunchRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
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
        <meta name="description" content="The all-in-one platform for event organizers and attendees." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppProvider>
            <LaunchWrapper>
              <MainLayout>{children}</MainLayout>
            </LaunchWrapper>
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
