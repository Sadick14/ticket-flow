
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Users, Ticket, DollarSign, Eye, Star, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


interface AnalyticsData {
    activeUsers: number;
    sessions: number;
    avgSessionDuration: string;
}

export default function AdminDashboardPage() {
  const { events, tickets, news, users } = useAppContext();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics data');
        }
        setAnalytics(data);
      } catch (error: any) {
        console.error("Analytics fetch error:", error);
        setAnalyticsError(error.message || "Could not load visitor analytics.");
      }
    }
    fetchAnalytics();
  }, []);

  const totalRevenue = useMemo(() => {
    return tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
  }, [tickets]);

  const subscriptionPrices = {
    'Free': 0,
    'Essential': 10,
    'Pro': 25,     
    'Custom': 0,
  };

  const totalSubscriptionRevenue = useMemo(() => {
    return users.reduce((sum, user) => {
      const plan = user.subscriptionPlan || 'Free';
      return sum + (subscriptionPrices[plan as keyof typeof subscriptionPrices] || 0);
    }, 0);
  }, [users]);
  
  const safeParseDate = (date: any): Date | null => {
    if (!date) return null;
    if (typeof date === 'string') return parseISO(date);
    // Handle Firebase Timestamp
    if (typeof date.toDate === 'function') return date.toDate();
    // Handle other potential object formats from server
    if (date.seconds) return new Date(date.seconds * 1000);
    return null;
  }

  const salesLast7Days = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayTickets = tickets.filter(ticket => {
        const purchaseDate = safeParseDate(ticket.purchaseDate);
        return purchaseDate ? format(purchaseDate, 'yyyy-MM-dd') === dayString : false;
      });
      return {
        date: format(day, 'MMM d'),
        revenue: dayTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0),
        tickets: dayTickets.length,
      };
    });
  }, [tickets]);

  const recentSales = useMemo(() => {
    return [...tickets]
      .sort((a, b) => {
        const dateA = safeParseDate(a.purchaseDate);
        const dateB = safeParseDate(b.purchaseDate);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [tickets]);

  const recentUsers = useMemo(() => {
    return [...users].reverse().slice(0, 5);
  }, [users]);

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
    tickets: {
      label: 'Tickets',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of the entire platform.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings from all sales</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalSubscriptionRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total monthly recurring revenue</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Signed up on the platform</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">Total events on the platform</p>
            </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analytics === null && !analyticsError ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : analyticsError ? (
                <div className="text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Not Configured
                </div>
            ) : (
                <div className="text-2xl font-bold">{analytics?.activeUsers}</div>
            )}
            <p className="text-xs text-muted-foreground">Users on the site right now</p>
          </CardContent>
        </Card>
      </div>
       {analyticsError && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analytics Service Error</AlertTitle>
            <AlertDescription>
                {analyticsError} Please ensure Google Analytics credentials (GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY) are set in your environment variables.
            </AlertDescription>
        </Alert>
       )}
      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Sales This Week</CardTitle>
                <CardDescription>Revenue and tickets sold over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart accessibilityLayer data={salesLast7Days}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis yAxisId="revenue" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis yAxisId="tickets" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                            </linearGradient>
                             <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-tickets)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-tickets)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area dataKey="revenue" type="monotone" fill="url(#colorRevenue)" stroke="var(--color-revenue)" stackId="a" yAxisId="revenue" />
                        <Area dataKey="tickets" type="monotone" fill="url(#colorTickets)" stroke="var(--color-tickets)" stackId="b" yAxisId="tickets"/>
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>The last 5 tickets sold on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Attendee</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentSales.map(ticket => {
                            const event = events.find(e => e.id === ticket.eventId);
                            const price = typeof ticket.price === 'number' ? ticket.price : 0;
                            return (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        <div className="font-medium truncate max-w-xs">{event?.name || 'Unknown Event'}</div>
                                    </TableCell>
                                    <TableCell>{ticket.attendeeName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline">${price.toFixed(2)}</Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Website Analytics</CardTitle>
                <CardDescription>
                    Summary of user engagement from Google Analytics.
                    <Button variant="link" asChild className="p-0 h-auto ml-1">
                      <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                        View Full Report
                      </a>
                    </Button>
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                 <div>
                    <p className="text-sm text-muted-foreground">Visitors</p>
                    {analytics === null && !analyticsError ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : analyticsError ? <AlertCircle className="h-5 w-5 mx-auto text-destructive" title={analyticsError} /> : <p className="text-2xl font-bold">{analytics?.sessions ?? 'N/A'}</p>}
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">New Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Avg. Time</p>
                    {analytics === null && !analyticsError ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : analyticsError ? <AlertCircle className="h-5 w-5 mx-auto text-destructive" title={analyticsError} /> : <p className="text-2xl font-bold">{analytics?.avgSessionDuration ?? 'N/A'}</p>}
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Newest Users</CardTitle>
                <CardDescription>The last 5 users to sign up.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentUsers.map(user => (
                        <div key={user.uid} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.photoURL || ''} />
                                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{user.displayName}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/users`}>View</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
