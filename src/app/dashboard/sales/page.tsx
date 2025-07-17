
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Calendar,
  BarChart3,
  Download,
  Eye
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import Link from 'next/link';
import type { Ticket, Event } from '@/lib/types';
import { PaymentCalculator } from '@/lib/payment-config';

export default function SalesPage() {
  const { user } = useAuth();
  const { events, tickets, getEventsByCreator } = useAppContext();
  const [timeRange, setTimeRange] = useState('30d');

  const userEvents = user ? getEventsByCreator(user.uid) : [];
  
  const allUserTickets = useMemo(() => {
    const userEventIds = new Set(userEvents.map(e => e.id));
    return tickets.filter((ticket: Ticket) => userEventIds.has(ticket.eventId));
  }, [tickets, userEvents]);

  // Calculate time range
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const safeParseDate = (date: any): Date | null => {
    if (!date) return null;
    if (typeof date === 'string') return parseISO(date);
    if (typeof date.toDate === 'function') return date.toDate(); // Firestore Timestamp
    if (date.seconds) return new Date(date.seconds * 1000); // Another Timestamp format
    return null;
  }

  const dateRange = getDateRange();
  
  const filteredTickets = useMemo(() => allUserTickets.filter(ticket => {
    const purchaseDate = safeParseDate(ticket.purchaseDate);
    if (!purchaseDate) return false;
    return purchaseDate >= dateRange.start && purchaseDate <= dateRange.end;
  }), [allUserTickets, dateRange]);

  // Sales stats
  const salesStats = useMemo(() => {
    const totalRevenue = filteredTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const totalTickets = filteredTickets.length;
    const averageTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    
    // Compare with previous period
    const periodLength = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
    const previousStart = new Date(dateRange.start.getTime() - periodLength);
    const previousTickets = allUserTickets.filter(ticket => {
      const purchaseDate = safeParseDate(ticket.purchaseDate);
      if (!purchaseDate) return false;
      return purchaseDate >= previousStart && purchaseDate < dateRange.start;
    });
    
    const previousRevenue = previousTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : totalRevenue > 0 ? 100 : 0;

    return {
      totalRevenue,
      totalTickets,
      averageTicketPrice,
      revenueGrowth,
    };
  }, [filteredTickets, allUserTickets, dateRange]);

  // Event performance
  const eventPerformance = useMemo(() => {
    return userEvents.map(event => {
      const eventTickets = allUserTickets.filter(t => t.eventId === event.id);
      const totalRevenue = eventTickets.reduce((sum, ticket) => sum + ticket.price, 0);
      const totalTicketsSold = eventTickets.length;
      const salesRate = event.capacity > 0 ? (totalTicketsSold / event.capacity) * 100 : 0;

      return {
        ...event,
        totalRevenue,
        totalTicketsSold,
        salesRate,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [userEvents, allUserTickets]);

  // Daily sales chart data
  const dailySales = useMemo(() => {
    if (filteredTickets.length === 0) return [];
    
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    const data = days.map(day => {
      const dayTickets = filteredTickets.filter(ticket => {
        const purchaseDate = safeParseDate(ticket.purchaseDate);
        if (!purchaseDate) return false;
        return format(purchaseDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      
      return {
        date: format(day, 'MMM dd'),
        revenue: dayTickets.reduce((sum, ticket) => sum + ticket.price, 0),
        tickets: dayTickets.length,
      };
    });

    return data.filter(d => d.revenue > 0 || d.tickets > 0);
  }, [filteredTickets, dateRange]);

  const exportSalesData = () => {
    const csvContent = [
      ['Event', 'Date', 'Tickets Sold', 'Revenue', 'Capacity', 'Sales Rate'].join(','),
      ...eventPerformance.map(event => [
        event.name,
        event.date,
        event.totalTicketsSold,
        `${PaymentCalculator.formatCurrency(event.totalRevenue * 100, 'GHS')}`,
        event.capacity,
        `${event.salesRate.toFixed(1)}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales & Revenue</h1>
          <p className="text-muted-foreground">Track your ticket sales and revenue performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportSalesData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PaymentCalculator.formatCurrency(salesStats.totalRevenue * 100, 'GHS')}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats.revenueGrowth >= 0 ? '+' : ''}{salesStats.revenueGrowth.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              In selected time period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Ticket Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PaymentCalculator.formatCurrency(salesStats.averageTicketPrice * 100, 'GHS')}</div>
            <p className="text-xs text-muted-foreground">
              Per ticket average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Total events created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales</CardTitle>
          <CardDescription>Revenue and ticket sales over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailySales.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No sales data</h3>
                <p className="text-muted-foreground">
                  No ticket sales found for the selected period.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dailySales.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">{day.date}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{day.tickets} tickets</span>
                        <span>{PaymentCalculator.formatCurrency(day.revenue * 100, 'GHS')}</span>
                      </div>
                      <Progress 
                        value={Math.max((day.revenue / Math.max(...dailySales.map(d => d.revenue), 1)) * 100, 5)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Performance</CardTitle>
          <CardDescription>Sales performance by event</CardDescription>
        </CardHeader>
        <CardContent>
          {eventPerformance.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground">
                Create your first event to start tracking sales.
              </p>
              <Button asChild className="mt-4">
                <Link href="/create">Create Event</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tickets Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Sales Rate</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventPerformance.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-muted-foreground">{event.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(parseISO(event.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.totalTicketsSold}</span>
                          <span className="text-muted-foreground">/ {event.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {PaymentCalculator.formatCurrency(event.totalRevenue * 100, 'GHS')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{event.salesRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={event.salesRate} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/events/${event.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
