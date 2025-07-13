
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { shouldShowCountdown } from '@/lib/launch';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'TicketFlow - Modern Event Ticketing',
  description: 'The all-in-one platform for event organizers and attendees.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  if (!shouldShowCountdown()) {
    // If launch is complete, the main app lives under /home
    // The root path '/' should redirect to '/home'
    // This logic can be refined depending on desired behavior post-launch.
    // For now, we allow access to both, with the main content at /home.
  }

  // Render the main application layout for all pages.
  // The root page ('/') will now be the launch page.
  // The home page will be at '/home'.
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
