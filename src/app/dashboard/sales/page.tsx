
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Eye,
  HandCoins,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import Link from 'next/link';
import type { Ticket, Event } from '@/lib/types';
import { PaymentCalculator, PAYMENT_CONFIG } from '@/lib/payment-config';
import { FirebasePaymentService } from '@/lib/firebase-payment-service';
import { useToast } from '@/hooks/use-toast';

export default function SalesPage() {
  const { user } = useAuth();
  const { events, tickets, getEventsByCreator } = useAppContext();
  const [timeRange, setTimeRange] = useState('30d');
  const { toast } = useToast();
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [hasPendingPayout, setHasPendingPayout] = useState(false);

  const userEvents = user ? getEventsByCreator(user.uid) : [];
  
  const allUserTickets = useMemo(() => {
    const userEventIds = new Set(userEvents.map(e => e.id));
    return tickets.filter((ticket: Ticket) => userEventIds.has(ticket.eventId) && ticket.status === 'confirmed');
  }, [tickets, userEvents]);
  
  const unpaidTransactions = useMemo(() => {
    return allUserTickets.filter(t => !t.payoutId);
  }, [allUserTickets]);
  
  const availableForPayout = useMemo(() => {
    return unpaidTransactions.reduce((sum, tx) => sum + (tx.paymentSplit?.creatorPayout || 0), 0);
  }, [unpaidTransactions]);


  useEffect(() => {
    const checkForPending = async () => {
        if (user) {
            const pending = await FirebasePaymentService.hasPendingPayout(user.uid);
            setHasPendingPayout(pending);
        }
    };
    checkForPending();
  }, [user, availableForPayout]);


  const handleRequestPayout = async () => {
    if (!user || availableForPayout <= 0) return;
    setIsRequestingPayout(true);
    try {
        const payoutId = await FirebasePaymentService.createPayout(
            user.uid, 
            availableForPayout, 
            unpaidTransactions.map(t => t.id),
            'momo', // Hardcoded as it's the only option
            new Date()
        );
        toast({
            title: "Payout Requested!",
            description: `Your request for ${PaymentCalculator.formatCurrency(availableForPayout, 'GHS')} has been submitted.`
        });
        setHasPendingPayout(true);
        // This is a client-side update for immediate feedback. A full re-fetch would be better in a larger app.
        unpaidTransactions.forEach(t => t.payoutId = payoutId);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Request Failed",
            description: "Could not submit your payout request. Please try again later."
        });
    } finally {
        setIsRequestingPayout(false);
    }
  };

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
    
    const commissionRate = PaymentCalculator.getCommissionRate(user?.subscriptionPlan || 'Free');
    const platformFeeRate = PAYMENT_CONFIG.platformFee;
    const adminCommission = totalRevenue * commissionRate;
    const platformCommission = totalRevenue * platformFeeRate;
    const totalCommission = adminCommission + platformCommission; // Simplified
    const netPayout = totalRevenue - totalCommission;


    return {
      totalRevenue,
      totalTickets,
      averageTicketPrice,
      revenueGrowth,
      totalCommission,
      netPayout
    };
  }, [filteredTickets, allUserTickets, dateRange, user?.subscriptionPlan]);

  // Event performance
  const eventPerformance = useMemo(() => {
    return userEvents.map(event => {
      const eventTickets = allUserTickets.filter(t => t.eventId === event.id);
      const totalRevenue = eventTickets.reduce((sum, ticket) => sum + ticket.price, 0);
      const totalTicketsSold = eventTickets.length;
      const salesRate = event.capacity > 0 ? (totalTicketsSold / event.capacity) * 100 : 0;

      const commissionRate = PaymentCalculator.getCommissionRate(user?.subscriptionPlan || 'Free');
      const platformFeeRate = PAYMENT_CONFIG.platformFee;
      const adminCommission = totalRevenue * commissionRate;
      const platformCommission = totalRevenue * platformFeeRate;
      const totalCommission = adminCommission + platformCommission;
      const netPayout = totalRevenue - totalCommission;

      return {
        ...event,
        totalRevenue,
        totalTicketsSold,
        salesRate,
        totalCommission,
        netPayout
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [userEvents, allUserTickets, user?.subscriptionPlan]);

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
      ['Event', 'Date', 'Tickets Sold', 'Revenue (GHS)', 'Commission (GHS)', 'Net Payout (GHS)', 'Capacity', 'Sales Rate'].join(','),
      ...eventPerformance.map(event => [
        event.name,
        event.date,
        event.totalTicketsSold,
        `${(event.totalRevenue).toFixed(2)}`,
        `${(event.totalCommission).toFixed(2)}`,
        `${(event.netPayout).toFixed(2)}`,
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
      
       {/* Payout Card */}
      <Card>
          <CardHeader>
              <CardTitle>Your Earnings</CardTitle>
              <CardDescription>Request a payout for your available balance.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available for Payout</p>
                <p className="text-3xl font-bold">{PaymentCalculator.formatCurrency(availableForPayout, 'GHS')}</p>
                {hasPendingPayout && <p className="text-xs text-yellow-600">You have a payout request pending processing.</p>}
              </div>
              <Button 
                size="lg" 
                onClick={handleRequestPayout}
                disabled={isRequestingPayout || availableForPayout <= 0 || hasPendingPayout}
              >
                  {isRequestingPayout && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  {hasPendingPayout ? <><CheckCircle className="mr-2 h-4 w-4"/> Requested</> : 'Request Payout'}
              </Button>
          </CardContent>
      </Card>


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
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PaymentCalculator.formatCurrency(salesStats.totalCommission * 100, 'GHS')}</div>
            <p className="text-xs text-muted-foreground">
              Total platform fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{PaymentCalculator.formatCurrency(salesStats.netPayout * 100, 'GHS')}</div>
            <p className="text-xs text-muted-foreground">
              Your estimated earnings
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
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Net Payout</TableHead>
                    <TableHead>Sales Rate</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                        <Badge variant="secondary">{PaymentCalculator.formatCurrency(event.totalRevenue * 100, 'GHS')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{PaymentCalculator.formatCurrency(event.totalCommission * 100, 'GHS')}</Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant="outline" className="text-green-600 font-semibold">{PaymentCalculator.formatCurrency(event.netPayout * 100, 'GHS')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                             <span>{event.totalTicketsSold} / {event.capacity}</span>
                            <span>{event.salesRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={event.salesRate} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
