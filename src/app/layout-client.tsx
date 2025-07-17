
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { shouldShowCountdown } from '@/lib/launch';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLaunchPage = pathname === '/';
    const isAdminOrDashboard = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

    // For admin or dashboard, the layout is handled by their own layout files.
    if (isAdminOrDashboard) {
        return (
            <>
                {children}
                <Toaster />
            </>
        );
    }
    
    // Show only the launch page content if countdown is active
    if (isLaunchPage && shouldShowCountdown()) {
        return (
             <>
                {children}
                <Toaster />
            </>
        )
    }

    // For all other public pages, show the full layout with header and footer
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
        </div>
    )
}
