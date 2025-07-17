
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { shouldShowCountdown } from '@/lib/launch';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLaunchPage = pathname === '/';
    const isAdminPage = pathname.startsWith('/admin');
    const isDashboardPage = pathname.startsWith('/dashboard');

    const noHeaderFooterRoutes = ['/admin', '/dashboard'];
    const showHeaderFooter = !noHeaderFooterRoutes.some(path => pathname.startsWith(path));

    // Show only the page content for admin or dashboard routes
    if (isAdminPage || isDashboardPage) {
        return (
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">{children}</main>
                <Toaster />
            </div>
        );
    }
    
    // Show only the launch page content if countdown is active
    if (isLaunchPage && shouldShowCountdown()) {
        return (
             <div className="flex flex-col min-h-screen">
                <main className="flex-grow">{children}</main>
                <Toaster />
            </div>
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
