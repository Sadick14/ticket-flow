
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
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
  SidebarInset
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
  Globe,
  Building,
  ArrowLeft
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
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { organizations, loading: appLoading } = useAppContext();
  const pathname = usePathname();
  const params = useParams();
  const organizationId = params.organizationId as string;

  const selectedOrg = React.useMemo(() => {
    // Guard against organizations being undefined during initial load
    if (!organizations) {
        return null;
    }
    return organizations.find(org => org.id === organizationId);
  }, [organizations, organizationId]);

  const isActive = (path: string) => {
    const basePath = `/dashboard/${organizationId}`;
    if (path === basePath) return pathname === path;
    return pathname.startsWith(path);
  }
  
  const hasProFeatures = user?.subscriptionPlan === 'Pro';
  const hasSalesAccess = user?.subscriptionPlan === 'Pro' || user?.subscriptionPlan === 'Essential';
  
  if (pathname === '/dashboard') {
    return (
      <div className="p-4 md:p-6 lg:p-8">{children}</div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
          <SidebarHeader>
            {selectedOrg ? (
                 <div className="flex items-center gap-2 text-xl font-bold text-sidebar-foreground font-headline">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedOrg.logoUrl || ''} />
                        <AvatarFallback>{selectedOrg.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="group-data-[collapsible=icon]:hidden">{selectedOrg.name}</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
                </div>
            )}
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild variant="ghost" className="mb-2">
                    <Link href="/dashboard"><ArrowLeft/> Back to Orgs</Link>
                 </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-2 bg-sidebar-border" />

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/events`)}
                  tooltip={{ children: 'Events' }}
                >
                  <Link href={`/dashboard/${organizationId}/events`}>
                    <Home />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/create`)}
                  tooltip={{ children: 'Create Event' }}
                >
                  <Link href={`/dashboard/${organizationId}/create`}>
                    <PlusCircle />
                    <span>Create Event</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-2 bg-sidebar-border" />
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/attendees`)}
                  tooltip={{ children: 'Attendees' }}
                >
                  <Link href={`/dashboard/${organizationId}/attendees`}>
                    <Users />
                    <span>Attendees</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/scanner`)}
                  tooltip={{ children: 'Ticket Scanner' }}
                >
                  <Link href={`/dashboard/${organizationId}/scanner`}>
                    <QrCode />
                    <span>Ticket Scanner</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/emails`)}
                  tooltip={{ children: 'Email Management' }}
                >
                  <Link href={`/dashboard/${organizationId}/emails`}>
                    <Mail />
                    <span>Email Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {(hasSalesAccess || hasProFeatures) && <Separator className="my-2 bg-sidebar-border" />}
              
              {hasSalesAccess && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/dashboard/${organizationId}/sales`)}
                      tooltip={{ children: 'Ticket Sales' }}
                    >
                      <Link href={`/dashboard/${organizationId}/sales`}>
                        <CreditCard />
                        <span>Ticket Sales</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              )}

              {hasProFeatures && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/dashboard/${organizationId}/marketing`)}
                      tooltip={{ children: 'Marketing' }}
                    >
                      <Link href={`/dashboard/${organizationId}/marketing`}>
                        <Megaphone />
                        <span>Marketing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/dashboard/${organizationId}/analytics`)}
                      tooltip={{ children: 'Analytics' }}
                    >
                      <Link href={`/dashboard/${organizationId}/analytics`}>
                        <LineChart />
                        <span>Analytics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              </>
              )}
               <Separator className="my-2 bg-sidebar-border" />
               <SidebarMenuItem>
                 <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/payment-settings`)}
                  tooltip={{ children: 'Payments' }}
                >
                  <Link href={`/dashboard/${organizationId}/payment-settings`}>
                    <CreditCard />
                    <span>Payments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(`/dashboard/${organizationId}/settings`)}
                  tooltip={{ children: 'Org Settings' }}
                >
                  <Link href={`/dashboard/${organizationId}/settings`}>
                    <Settings />
                    <span>Org Settings</span>
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
                                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                                <p className="text-sm font-medium truncate">{user.displayName}</p>
                                <Badge variant={user.subscriptionPlan === 'Pro' ? 'default' : 'secondary'} className="mt-1">{user.subscriptionPlan} Plan</Badge>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2 bg-white/95 backdrop-blur-sm border-gray-200" align="start" forceMount>
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
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 flex-shrink-0">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">
                  {pathname.endsWith('/events') && 'Events Dashboard'}
                  {pathname.endsWith('/create') && 'Create Event'}
                  {pathname.endsWith('/attendees') && 'Attendees'}
                  {pathname.endsWith('/scanner') && 'Ticket Scanner'}
                  {pathname.endsWith('/emails') && 'Email Management'}
                  {pathname.endsWith('/sales') && 'Sales & Revenue'}
                  {pathname.endsWith('/analytics') && 'Analytics Dashboard'}
                  {pathname.endsWith('/marketing') && 'Marketing Tools'}
                  {pathname.endsWith('/payment-settings') && 'Payment Settings'}
                  {pathname.endsWith('/settings') && 'Organization Settings'}
                  {pathname.includes('/edit/') && 'Edit Event'}
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
