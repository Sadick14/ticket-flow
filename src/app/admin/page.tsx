
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Users, Ticket, DollarSign, Eye, RefreshCw, Star } from 'lucide-react';
import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function AdminDashboardPage() {
  const { events, tickets, news, users } = useAppContext();

  const totalRevenue = useMemo(() => {
    return tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
  }, [tickets]);

  const subscriptionPrices = {
    'Free': 0,
    'Starter': 10, // Assuming $10/month
    'Pro': 25,     // Assuming $25/month
  };

  const totalSubscriptionRevenue = useMemo(() => {
    return users.reduce((sum, user) => {
      return sum + (subscriptionPrices[user.subscriptionPlan] || 0);
    }, 0);
  }, [users]);

  const salesLast7Days = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      const dayTickets = tickets.filter(
        ticket => format(new Date(ticket.purchaseDate), 'yyyy-MM-dd') === dayString
      );
      return {
        date: format(day, 'MMM d'),
        revenue: dayTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0),
        tickets: dayTickets.length,
      };
    });
  }, [tickets]);

  const recentSales = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, 5);
  }, [tickets]);

  const recentUsers = useMemo(() => {
    // Assuming users are sorted by join date from context, otherwise we'd need a join date field
    return [...users].reverse().slice(0, 5);
  }, [users]);

  // Mock data for visitor analytics. In a real app, this would come from an API call to Google Analytics.
  const visitorData = {
    activeUsers: 28,
    sessions: 310,
    avgSessionDuration: '2m 15s',
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings from all sales</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalSubscriptionRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total monthly recurring revenue</p>
            </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Signed up on the platform</p>
          </CardContent>
        </Card>
         <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitorData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users on the site right now</p>
          </CardContent>
        </Card>
      </div>
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
                    Summary of user engagement.
                    <Button variant="link" asChild className="p-0 h-auto ml-1">
                      <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                        View on Google Analytics
                      </a>
                    </Button>
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                 <div>
                    <p className="text-sm text-muted-foreground">Visitors</p>
                    <p className="text-2xl font-bold">{visitorData.sessions}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">New Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Avg. Time</p>
                    <p className="text-2xl font-bold">{visitorData.avgSessionDuration}</p>
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
