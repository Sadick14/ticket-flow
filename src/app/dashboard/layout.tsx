
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
  Globe
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


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  const hasStarterPlan = user?.subscriptionPlan === 'Starter' || user?.subscriptionPlan === 'Pro';
  const hasProPlan = user?.subscriptionPlan === 'Pro';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <Sidebar className="bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white border-r border-white/10">
          <SidebarHeader className="p-4 border-b border-white/10">
            <Link
              href="/home"
              className="flex items-center gap-2 text-xl font-bold text-white font-headline hover:text-orange-400 transition-colors"
            >
              <Ticket className="h-6 w-6 text-orange-500" />
              <span>TicketFlow</span>
            </Link>
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
                  className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
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
                  className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
                >
                  <Link href="/dashboard/create">
                    <PlusCircle />
                    <span>Create Event</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-2 bg-white/10" />
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/attendees')}
                  tooltip={{
                    children: 'Attendees',
                  }}
                  className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
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
                  className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
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
                  className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
                >
                  <Link href="/dashboard/emails">
                    <Mail />
                    <span>Email Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {hasStarterPlan && (
                <>
                  <Separator className="my-2 bg-white/10" />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/dashboard/sales')}
                      tooltip={{
                        children: 'Ticket Sales',
                      }}
                      className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
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
                      className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
                    >
                      <Link href="/dashboard/marketing">
                        <Megaphone />
                        <span>Marketing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {hasProPlan && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/dashboard/analytics')}
                      tooltip={{
                        children: 'Analytics',
                      }}
                      className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
                    >
                      <Link href="/dashboard/analytics">
                        <LineChart />
                        <span>Analytics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
               <Separator className="my-2 bg-white/10" />
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/settings')}
                  tooltip={{
                    children: 'Settings',
                  }}
                  className="text-white hover:bg-white/10 hover:text-orange-400 data-[active=true]:bg-orange-500 data-[active=true]:text-white transition-colors"
                >
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-white/10">
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start items-center gap-3 px-2 h-auto text-white hover:bg-white/10 hover:text-white transition-colors">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                <AvatarFallback className="bg-orange-500 text-white">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-medium truncate text-white">{user.displayName}</p>
                                <Badge variant="secondary" className="mt-1 bg-orange-500 text-white">{user.subscriptionPlan} Plan</Badge>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2 bg-white/95 backdrop-blur-sm border-white/20" align="start" forceMount>
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
            <header className="flex h-14 items-center gap-4 border-b border-white/10 bg-white/80 backdrop-blur-sm px-6 flex-shrink-0">
                <div className="md:hidden">
                    <SidebarTrigger className="text-slate-900 hover:bg-slate-100" />
                </div>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-slate-900">
                      {pathname === '/dashboard' && 'My Events'}
                      {pathname === '/dashboard/create' && 'Create Event'}
                      {pathname === '/dashboard/attendees' && 'Attendees'}
                      {pathname === '/dashboard/scanner' && 'Ticket Scanner'}
                      {pathname === '/dashboard/emails' && 'Email Management'}
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
