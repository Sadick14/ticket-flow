
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Loader2, Shield, Mail, LogOut, Settings, Home, Globe, Newspaper, Users, Archive, Users2, MessageSquare, Calendar, CreditCard, Image as ImageIcon } from 'lucide-react';
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
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
          <SidebarHeader>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xl font-bold text-sidebar-foreground font-headline"
            >
              <Shield className="h-6 w-6" />
              <span className="group-data-[collapsible=icon]:hidden">Admin Panel</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin'}
                  tooltip={{ children: 'Dashboard' }}
                >
                  <Link href="/admin">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/events')}
                  tooltip={{ children: 'Event Management' }}
                >
                  <Link href="/admin/events">
                    <Calendar />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/payouts')}
                  tooltip={{ children: 'Payout Management' }}
                >
                  <Link href="/admin/payouts">
                    <CreditCard />
                    <span>Payouts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/users')}
                  tooltip={{ children: 'User Management' }}
                >
                  <Link href="/admin/users">
                    <Users2 />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/contact-messages')}
                  tooltip={{ children: 'Contact Messages' }}
                >
                  <Link href="/admin/contact-messages">
                    <MessageSquare />
                    <span>Contact Messages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/news')}
                  tooltip={{ children: 'News Management' }}
                >
                  <Link href="/admin/news">
                    <Newspaper />
                    <span>News Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/featured-article')}
                  tooltip={{ children: 'Featured Article' }}
                >
                  <Link href="/admin/featured-article">
                    <ImageIcon />
                    <span>Featured Article</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/subscribers')}
                  tooltip={{ children: 'Subscribers' }}
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
                    <span>Email Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/archived-events')}
                  tooltip={{ children: 'Archived Events' }}
                >
                  <Link href="/admin/archived-events">
                    <Archive />
                    <span>Archived Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/admin/settings')}
                  tooltip={{ children: 'Settings' }}
                >
                  <Link href="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start items-center gap-3 px-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:size-8">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                                <p className="text-sm font-medium truncate">{user.displayName}</p>
                                <Badge variant="destructive" className="mt-1">Admin</Badge>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" align="start" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/home">
                                <Globe className="mr-2 h-4 w-4" />
                                <span>View Website</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
          </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 flex-shrink-0">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
                <h1 className="text-lg font-semibold">
                  {pathname === '/admin' && 'Admin Dashboard'}
                  {pathname.startsWith('/admin/events') && 'Event Management'}
                  {pathname.startsWith('/admin/payouts') && 'Payout Management'}
                  {pathname.startsWith('/admin/users') && 'User Management'}
                  {pathname.startsWith('/admin/contact-messages') && 'Contact Messages'}
                  {pathname.startsWith('/admin/news') && 'News Management'}
                  {pathname.startsWith('/admin/featured-article') && 'Featured Article'}
                  {pathname.startsWith('/admin/subscribers') && 'Subscriber Management'}
                  {pathname.startsWith('/admin/emails') && 'Email Management'}
                  {pathname.startsWith('/admin/archived-events') && 'Archived Events'}
                  {pathname.startsWith('/admin/settings') && 'Admin Settings'}
                </h1> 
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
