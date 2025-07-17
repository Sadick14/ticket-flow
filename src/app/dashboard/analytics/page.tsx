
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Download
} from 'lucide-react';
import { format, parseISO, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import Link from 'next/link';
import type { Ticket } from '@/lib/types';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { events, tickets, getEventsByCreator, getEventStats } = useAppContext();
  const [timeRange, setTimeRange] = useState('30d');

  const userEvents = user ? getEventsByCreator(user.uid) : [];
  const stats = user ? getEventStats(user.uid) : { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, upcomingEvents: 0 };

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
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const dateRange = getDateRange();

  // Analytics data
  const analyticsData = useMemo(() => {
    const filteredTickets = allUserTickets.filter(ticket => {
      const purchaseDate = parseISO(ticket.purchaseDate);
      return purchaseDate >= dateRange.start && purchaseDate <= dateRange.end;
    });

    // Category breakdown
    const categoryBreakdown = userEvents.reduce((acc, event) => {
      const eventTickets = allUserTickets.filter(t => t.eventId === event.id);
      if (eventTickets.length > 0) {
        acc[event.category] = (acc[event.category] || 0) + eventTickets.length;
      }
      return acc;
    }, {} as Record<string, number>);

    // Weekly trends
    const weeklyData = eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).map(day => {
      const dayTickets = filteredTickets.filter(ticket => {
        const purchaseDate = parseISO(ticket.purchaseDate);
        return format(purchaseDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      
      return {
        date: format(day, 'MMM dd'),
        tickets: dayTickets.length,
        revenue: dayTickets.reduce((sum, ticket) => sum + ticket.price, 0),
      };
    }).filter(d => d.revenue > 0 || d.tickets > 0);


    // Top performing events
    const topEvents = userEvents.map(event => {
      const eventTickets = allUserTickets.filter(t => t.eventId === event.id);
      const revenue = eventTickets.reduce((sum, ticket) => sum + ticket.price, 0);
      const salesRate = event.capacity > 0 ? (eventTickets.length / event.capacity) * 100 : 0;
      
      return {
        ...event,
        ticketsSold: eventTickets.length,
        revenue,
        salesRate,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Calculate growth metrics
    const periodLength = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
    const previousStart = new Date(dateRange.start.getTime() - periodLength);
    const previousTickets = allUserTickets.filter(ticket => {
      const purchaseDate = parseISO(ticket.purchaseDate);
      return purchaseDate >= previousStart && purchaseDate < dateRange.start;
    });

    const currentRevenue = filteredTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const previousRevenue = previousTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : (currentRevenue > 0 ? 100 : 0);
    const attendeeGrowth = previousTickets.length > 0 ? ((filteredTickets.length - previousTickets.length) / previousTickets.length) * 100 : (filteredTickets.length > 0 ? 100 : 0);

    return {
      categoryBreakdown,
      weeklyData,
      topEvents,
      currentRevenue,
      currentAttendees: filteredTickets.length,
      revenueGrowth,
      attendeeGrowth,
      averageTicketPrice: filteredTickets.length > 0 ? currentRevenue / filteredTickets.length : 0,
    };
  }, [userEvents, allUserTickets, dateRange]);

  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value'].join(','),
      ['Total Events', stats.totalEvents],
      ['Total Revenue', `$${stats.totalRevenue.toFixed(2)}`],
      ['Total Tickets Sold', stats.totalTicketsSold],
      ['Upcoming Events', stats.upcomingEvents],
      ['Revenue Growth (current period)', `${analyticsData.revenueGrowth.toFixed(1)}%`],
      ['Attendee Growth (current period)', `${analyticsData.attendeeGrowth.toFixed(1)}%`],
      ['Average Ticket Price (current period)', `$${analyticsData.averageTicketPrice.toFixed(2)}`],
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Deep insights into your event performance</p>
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
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.revenueGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.revenueGrowth >= 0 ? '+' : ''}{analyticsData.revenueGrowth.toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.attendeeGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={analyticsData.attendeeGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.attendeeGrowth >= 0 ? '+' : ''}{analyticsData.attendeeGrowth.toFixed(1)}%
              </span>
              <span className="ml-1">growth</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Ticket Price</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.averageTicketPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current period average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Weekly Trends
          </CardTitle>
          <CardDescription>Sales activity over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.weeklyData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No data available</h3>
              <p className="text-muted-foreground">
                No sales data found for the selected period.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">{day.date}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{day.tickets} tickets</span>
                      <span>${day.revenue.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={Math.max((day.revenue / Math.max(...analyticsData.weeklyData.map(d => d.revenue), 1)) * 100, 2)} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Event Categories
            </CardTitle>
            <CardDescription>Ticket sales by event category (all time)</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analyticsData.categoryBreakdown).length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No category data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analyticsData.categoryBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, tickets]) => {
                    const percentage = stats.totalTicketsSold > 0 ? (tickets / stats.totalTicketsSold) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="text-muted-foreground">{tickets} tickets ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Events
            </CardTitle>
            <CardDescription>Your most successful events by revenue (all time)</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topEvents.length === 0 ? (
              <div className="text-center py-8">
                <Award className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No events data available</p>
                <Button asChild variant="outline" className="mt-2">
                  <Link href="/create">Create Your First Event</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData.topEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.ticketsSold} tickets • {event.salesRate.toFixed(1)}% sold
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${event.revenue.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
