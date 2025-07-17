
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { Loader2, Calendar, User, Eye, DollarSign, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { PaymentCalculator, PAYMENT_CONFIG } from '@/lib/payment-config';

export default function AdminEventsPage() {
  const { events, users, loading, tickets } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const getUserById = (id: string) => users.find(u => u.uid === id);

  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getUserById(event.creatorId)?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm, users]);

  const getEventFinancials = (event: any) => {
    const eventTickets = tickets.filter(t => t.eventId === event.id);
    const totalRevenue = eventTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const creator = getUserById(event.creatorId);
    const creatorPlan = creator?.subscriptionPlan || 'Free';

    // Simplified calculation for display
    const commissionRate = PAYMENT_CONFIG.commissionRates[creatorPlan];
    const platformFeeRate = PAYMENT_CONFIG.platformFee;
    const adminCommission = totalRevenue * commissionRate;
    const platformCommission = totalRevenue * platformFeeRate;
    const totalCommission = adminCommission + platformCommission;
    const creatorPayout = totalRevenue - totalCommission; // simplified, ignores processor fees for display

    return {
      ticketsSold: eventTickets.length,
      totalRevenue,
      totalCommission,
      creatorPayout
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Oversee all events on the platform.</p>
        </div>
        <div className="w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by event, location, creator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9"
                />
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            {events.length} total event(s) on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Payout Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : filteredEvents.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">
                     <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No events found.
                    </TableCell></TableRow>
                ) : (
                  filteredEvents.map(event => {
                    const creator = getUserById(event.creatorId);
                    const financials = getEventFinancials(event);
                    const salesRate = event.capacity > 0 ? (financials.ticketsSold / event.capacity) * 100 : 0;
                    return (
                        <TableRow key={event.id}>
                            <TableCell>
                                <div className="font-medium">{event.name}</div>
                                <div className="text-sm text-muted-foreground">{event.location}</div>
                            </TableCell>
                            <TableCell>
                                {creator ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={creator.photoURL || ''} />
                                            <AvatarFallback>{creator.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{creator.displayName}</div>
                                            <div className="text-xs text-muted-foreground">{creator.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Unknown</div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div>{financials.ticketsSold} / {event.capacity}</div>
                                <Progress value={salesRate} className="h-1 mt-1"/>
                            </TableCell>
                             <TableCell>
                                <Badge variant="secondary">{PaymentCalculator.formatCurrency(financials.totalRevenue * 100, 'GHS')}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="text-green-600">{PaymentCalculator.formatCurrency(financials.creatorPayout * 100, 'GHS')}</Badge>
                            </TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/events/${event.id}`} target="_blank">
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </Link>
                                </Button>
                             </TableCell>
                        </TableRow>
                    )
                })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
