
'use client';

import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Header } from './header';
import { Footer } from './footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
    </div>
  );
}
