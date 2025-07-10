
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import {
  LineChart,
  Home,
  PlusCircle,
  Settings,
  LogOut,
  Ticket,
  Users,
  Megaphone,
  CreditCard,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-muted/40">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-primary font-headline"
              >
                <Ticket className="h-6 w-6" />
                <span>TicketFlow</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard')}
                  tooltip={{
                    children: 'My Events',
                  }}
                >
                  <Link href="/dashboard">
                    <Home />
                    <span>My Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/create')}
                  tooltip={{
                    children: 'Create Event',
                  }}
                >
                  <Link href="/create">
                    <PlusCircle />
                    <span>Create Event</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-2" />
               <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: 'Attendees',
                  }}
                >
                  <Users />
                  <span>Attendees</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: 'Ticket Sales',
                  }}
                >
                  <CreditCard />
                  <span>Ticket Sales</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: 'Marketing',
                  }}
                >
                  <Megaphone />
                  <span>Marketing</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: 'Analytics',
                  }}
                >
                  <LineChart />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: 'Settings',
                  }}
                >
                  <Settings />
                  <span>Settings</span>
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
                    <Badge variant="outline" className="mt-1">{user.subscriptionPlan} Plan</Badge>
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
                    {/* We can make this dynamic later */}
                    <h1 className="text-lg font-semibold">My Events</h1> 
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
