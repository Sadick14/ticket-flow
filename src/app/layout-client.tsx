
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { shouldShowCountdown } from '@/lib/launch';
import { SubscriptionPopup } from '@/components/subscription-popup';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLaunchPage = pathname === '/';
    // Only apply the special dashboard/admin layout if the path is not the root dashboard page
    const isAdminOrDashboard = pathname.startsWith('/admin') || (pathname.startsWith('/dashboard') && pathname !== '/dashboard');

    // For admin or specific organization dashboard pages, the layout is handled by their own layout files.
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

    // For all other public pages (including /dashboard), show the full layout with header and footer
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
            <SubscriptionPopup />
        </div>
    )
}
