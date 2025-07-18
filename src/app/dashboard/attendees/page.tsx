
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Mail, MapPin, Search, Users, Download, CheckCircle, Loader2, Hourglass } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Ticket, Event, UserProfile } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function AttendeesPage() {
  const { user } = useAuth();
  const { events, tickets, getEventsByCreator, getCollaboratedEvents, manualCheckInTicket } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const userEvents = user ? getEventsByCreator(user.uid) : [];
  const collaboratedEvents = user ? getCollaboratedEvents(user.uid) : [];
  const allManagedEvents = [...userEvents, ...collaboratedEvents.filter(ce => !userEvents.find(ue => ue.id === ce.id))];

  
  const allAttendees = useMemo(() => {
    const attendeeTickets = tickets.filter((ticket: Ticket) => 
      allManagedEvents.some((event: Event) => event.id === ticket.eventId)
    );

    return attendeeTickets.map((ticket: Ticket) => {
      const event = allManagedEvents.find((e: Event) => e.id === ticket.eventId);
      return {
        ...ticket,
        eventName: event?.name || 'Unknown Event',
        eventDate: event?.date || '',
        eventLocation: event?.location || '',
        price: event?.price || 0,
      };
    });
  }, [tickets, allManagedEvents]);

  const filteredAttendees = useMemo(() => {
    return allAttendees.filter((attendee: any) => {
      const matchesSearch = attendee.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attendee.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attendee.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = selectedEventId === 'all' || attendee.eventId === selectedEventId;
      
      return matchesSearch && matchesEvent;
    });
  }, [allAttendees, searchTerm, selectedEventId]);

  const stats = useMemo(() => {
    const totalAttendees = allAttendees.length;
    const upcomingEventAttendees = allAttendees.filter((attendee: any) => 
      new Date(attendee.eventDate) >= new Date()
    ).length;
    const uniqueAttendees = new Set(allAttendees.map((a: any) => a.attendeeEmail)).size;
    
    return {
      total: totalAttendees,
      upcoming: upcomingEventAttendees,
      unique: uniqueAttendees,
    };
  }, [allAttendees]);

  const handleCheckInToggle = async (ticket: any) => {
    if (!user) return;
    setCheckingIn(ticket.id);
    try {
      await manualCheckInTicket(ticket.id, ticket.eventId, user.uid, !ticket.checkedIn);
      toast({
        title: `Check-in ${ticket.checkedIn ? 'Reverted' : 'Successful'}`,
        description: `${ticket.attendeeName}'s status has been updated.`,
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: e.message,
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const getStatusBadge = (status: 'pending' | 'confirmed' | undefined) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive"><Hourglass className="mr-1 h-3 w-3" />Pending Payment</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>;
    }
  };

  const exportAttendees = () => {
    const csvContent = [
      ['Name', 'Email', 'Event', 'Date', 'Location', 'Purchase Date', 'Price (GHS)', 'Checked In', 'Status', 'Booking Code'].join(','),
      ...filteredAttendees.map((attendee: any) => [
        attendee.attendeeName,
        attendee.attendeeEmail,
        attendee.eventName,
        attendee.eventDate,
        attendee.eventLocation,
        typeof attendee.purchaseDate === 'string' ? format(parseISO(attendee.purchaseDate), 'yyyy-MM-dd') : 'N/A',
        `${attendee.price.toFixed(2)}`,
        attendee.checkedIn ? 'Yes' : 'No',
        attendee.status || 'confirmed',
        attendee.bookingCode || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendees</h1>
          <p className="text-muted-foreground">Manage and view all your event attendees</p>
        </div>
        <Button onClick={exportAttendees} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all your events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Attendees for future events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Attendees</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unique}</div>
            <p className="text-xs text-muted-foreground">
              Unique email addresses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {allManagedEvents.map((event: Event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
          <CardDescription>
            {filteredAttendees.length} of {allAttendees.length} attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAttendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No attendees found</h3>
              <p className="text-muted-foreground">
                {allAttendees.length === 0 
                  ? "You don't have any attendees yet." 
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Checked In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.map((attendee: any) => (
                    <TableRow key={attendee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {attendee.attendeeName.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{attendee.attendeeName}</div>
                            <div className="text-sm text-muted-foreground">{attendee.attendeeEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{attendee.eventName}</div>
                        <div className="text-xs text-muted-foreground">
                            {format(parseISO(attendee.eventDate), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                       <TableCell>
                        {getStatusBadge(attendee.status)}
                      </TableCell>
                       <TableCell className="text-center">
                        {checkingIn === attendee.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          <Switch
                            checked={attendee.checkedIn}
                            onCheckedChange={() => handleCheckInToggle(attendee)}
                            aria-label={`Check in ${attendee.attendeeName}`}
                          />
                        )}
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
