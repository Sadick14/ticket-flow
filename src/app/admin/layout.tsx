

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Loader2, Newspaper, Shield, LogOut, Ticket, Users, Mail } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user?.isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-muted/40">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-xl font-bold text-primary font-headline"
              >
                <Shield className="h-6 w-6" />
                <span>Admin Panel</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin')}
                  tooltip={{ children: 'Dashboard' }}
                >
                  <Link href="/admin">
                    <Shield />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/news')}
                  tooltip={{ children: 'Manage News' }}
                >
                  <Link href="/admin/news">
                    <Newspaper />
                    <span>Manage News</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/subscribers')}
                  tooltip={{ children: 'Launch Subscribers' }}
                >
                  <Link href="/admin/subscribers">
                    <Users />
                    <span>Subscribers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/emails')}
                  tooltip={{ children: 'Email Management' }}
                >
                  <Link href="/admin/emails">
                    <Mail />
                    <span>Emails</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            {user && (
              <div className="flex items-center gap-3">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    <Badge variant="destructive" className="mt-1">Admin</Badge>
                </div>
                 <Button variant="ghost" size="icon" onClick={signOut} className="ml-auto flex-shrink-0">
                    <LogOut className="h-5 w-5" />
                 </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6 flex-shrink-0">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold">
                      {pathname === '/admin' && 'Admin Dashboard'}
                      {pathname === '/admin/news' && 'News Management'}
                      {pathname === '/admin/subscribers' && 'Launch Subscribers'}
                      {pathname === '/admin/emails' && 'Email Management'}
                    </h1> 
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
