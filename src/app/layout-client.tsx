
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { shouldShowCountdown } from '@/lib/launch';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // The launch page is the root page, but it doesn't have a header/footer.
    // We check the path directly to avoid showing them.
    const isLaunchPage = pathname === '/';

    if (isLaunchPage && shouldShowCountdown()) {
        return (
             <div className="flex flex-col min-h-screen">
                <main className="flex-grow">{children}</main>
                <Toaster />
            </div>
        )
    }

    // For all other pages, show the full layout
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
        </div>
    )
}
