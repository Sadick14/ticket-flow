
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Users, Ticket, Newspaper, DollarSign, Clock, Eye, BarChart, LineChart as LineChartIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { events, tickets, news, users } = useAppContext();

  const totalRevenue = useMemo(() => {
    return tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
  }, [tickets]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of the entire platform.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings from all sales</p>
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
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesLast7Days}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#8884d8" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                        <Line yAxisId="right" type="monotone" dataKey="tickets" stroke="#82ca9d" name="Tickets" />
                    </LineChart>
                </ResponsiveContainer>
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
                    Summary of user engagement on your website. 
                    <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline ml-1">
                        View on Google Analytics
                    </a>
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
