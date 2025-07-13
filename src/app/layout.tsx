
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { shouldShowCountdown } from '@/lib/launch';
import LaunchPage from './launch/page';

export const metadata: Metadata = {
  title: 'TicketFlow - Modern Event Ticketing',
  description: 'The all-in-one platform for event organizers and attendees.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  if (shouldShowCountdown()) {
    // If in countdown mode, render only the launch page.
    return (
      <html lang="en" className="h-full">
        <head>
          <title>TicketFlow - Launching Soon!</title>
          <meta name="description" content="The future of event management is coming soon." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased">
          <AuthProvider>
            <AppProvider>
                <LaunchPage />
                <Toaster />
            </AppProvider>
          </AuthProvider>
        </body>
      </html>
    );
  }

  // Otherwise, render the main application layout.
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
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
