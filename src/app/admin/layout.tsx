

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Loader2, Shield, Mail, LogOut, Settings, Home, Globe, Newspaper, Users, Archive, Users2, MessageSquare, Calendar, CreditCard, Image as ImageIcon, Star, BookOpen, UserCheck, Activity, UserCog } from 'lucide-react';
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
import type { AdminPermissions } from '@/lib/types';


// Define which permission controls which page
const pagePermissions: Record<string, keyof AdminPermissions | 'isSuperAdmin'> = {
    '/admin/events': 'canManageEvents',
    '/admin/subscriptions': 'canManageSubscriptions',
    '/admin/payouts': 'canManagePayouts',
    '/admin/users': 'canManageUsers',
    '/admin/courses': 'canManageCourses',
    '/admin/course-enrollments': 'canManageCourses',
    '/admin/news': 'canManageNews',
    '/admin/featured-article': 'canManageNews',
    '/admin/settings': 'canManageSettings',
    '/admin/logs': 'canViewLogs',
    '/admin/staff': 'isSuperAdmin',
    '/admin/contact-messages': 'canManageContactMessages',
    '/admin/emails': 'canManageEmails',
    '/admin/subscribers': 'isSuperAdmin',
    '/admin/archived-events': 'isSuperAdmin',
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && (user?.role !== 'admin' && user?.role !== 'super-admin')) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (path: string) => pathname.startsWith(path);
  const isSuperAdmin = user.role === 'super-admin';
  
  const hasPermission = (path: string): boolean => {
      if (isSuperAdmin) return true;
      const permissionKey = pagePermissions[path];
      if (!permissionKey) return false; // Default to no access if not defined
      if (permissionKey === 'isSuperAdmin') return false; // Only super admin can access
      return user.permissions?.[permissionKey] ?? false;
  };

  const navItems = [
    { path: '/admin/events', icon: <Calendar />, label: 'Events', permission: 'canManageEvents' },
    { path: '/admin/subscriptions', icon: <Star />, label: 'Subscriptions', permission: 'canManageSubscriptions' },
    { path: '/admin/payouts', icon: <CreditCard />, label: 'Payouts', permission: 'canManagePayouts' },
    { path: '/admin/users', icon: <Users2 />, label: 'Users', permission: 'canManageUsers' },
    // { path: '/admin/courses', icon: <BookOpen />, label: 'Courses', permission: 'canManageCourses' },
    // { path: '/admin/course-enrollments', icon: <UserCheck />, label: 'Enrollments', permission: 'canManageCourses' },
    { path: '/admin/news', icon: <Newspaper />, label: 'News', permission: 'canManageNews' },
    // { path: '/admin/featured-article', icon: <ImageIcon />, label: 'Featured Article', permission: 'canManageNews' },
    { path: '/admin/emails', icon: <Mail />, label: 'Email Management', permission: 'canManageEmails' },
    { path: '/admin/contact-messages', icon: <MessageSquare />, label: 'Contact Messages', permission: 'canManageContactMessages' },
    { path: '/admin/logs', icon: <Activity />, label: 'Logs', permission: 'canViewLogs' },
    { path: '/admin/settings', icon: <Settings />, label: 'Settings', permission: 'canManageSettings' },
  ];

  const superAdminNavItems = [
    { path: '/admin/staff', icon: <UserCog />, label: 'Staff' },
    { path: '/admin/subscribers', icon: <Users />, label: 'Subscribers' },
    { path: '/admin/archived-events', icon: <Archive />, label: 'Archived Events' },
  ];


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
                <SidebarMenuButton asChild isActive={pathname === '/admin'} tooltip={{ children: 'Dashboard' }}>
                  <Link href="/admin"><Home /><span>Dashboard</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {navItems.map(item => hasPermission(item.path) && (
                <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={{ children: item.label }}>
                        <Link href={item.path}>{item.icon}<span>{item.label}</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isSuperAdmin && superAdminNavItems.map(item => (
                 <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={{ children: item.label }}>
                        <Link href={item.path}>{item.icon}<span>{item.label}</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

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
                                <Badge variant="destructive" className="mt-1 capitalize">{user.role}</Badge>
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
                <h1 className="text-lg font-semibold capitalize">
                  {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
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
