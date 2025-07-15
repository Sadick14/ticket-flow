
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
  QrCode,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  const hasPaidPlan = user?.subscriptionPlan === 'Starter' || user?.subscriptionPlan === 'Pro';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-muted/40">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Link
                href="/home"
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
                  isActive={isActive('/dashboard/create')}
                  tooltip={{
                    children: 'Create Event',
                  }}
                >
                  <Link href="/dashboard/create">
                    <PlusCircle />
                    <span>Create Event</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-2" />
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/attendees')}
                  tooltip={{
                    children: 'Attendees',
                  }}
                >
                  <Link href="/dashboard/attendees">
                    <Users />
                    <span>Attendees</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/scanner')}
                  tooltip={{
                    children: 'Ticket Scanner',
                  }}
                >
                  <Link href="/dashboard/scanner">
                    <QrCode />
                    <span>Ticket Scanner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/emails')}
                  tooltip={{
                    children: 'Email Management',
                  }}
                >
                  <Link href="/dashboard/emails">
                    <Mail />
                    <span>Email Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {hasPaidPlan && (
                <>
                  <Separator className="my-2" />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/dashboard/sales')}
                      tooltip={{
                        children: 'Ticket Sales',
                      }}
                    >
                      <Link href="/dashboard/sales">
                        <CreditCard />
                        <span>Ticket Sales</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/dashboard/marketing')}
                      tooltip={{
                        children: 'Marketing',
                      }}
                    >
                      <Link href="/dashboard/marketing">
                        <Megaphone />
                        <span>Marketing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/dashboard/analytics')}
                      tooltip={{
                        children: 'Analytics',
                      }}
                    >
                      <Link href="/dashboard/analytics">
                        <LineChart />
                        <span>Analytics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
               <Separator className="my-2" />
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/settings')}
                  tooltip={{
                    children: 'Settings',
                  }}
                >
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start items-center gap-3 px-2 h-auto">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.displayName}</p>
                                <Badge variant="secondary" className="mt-1">{user.subscriptionPlan} Plan</Badge>
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
        <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6 flex-shrink-0">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold">
                      {pathname === '/dashboard' && 'My Events'}
                      {pathname === '/dashboard/create' && 'Create Event'}
                      {pathname === '/dashboard/attendees' && 'Attendees'}
                      {pathname === '/dashboard/scanner' && 'Ticket Scanner'}
                      {pathname === '/dashboard/sales' && 'Sales & Revenue'}
                      {pathname === '/dashboard/analytics' && 'Analytics Dashboard'}
                      {pathname === '/dashboard/marketing' && 'Marketing Tools'}
                      {pathname === '/dashboard/settings' && 'Settings'}
                      {pathname.startsWith('/dashboard/edit/') && 'Edit Event'}
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
