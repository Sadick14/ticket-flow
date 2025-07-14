
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Loader2, PlusCircle, Calendar, Edit, Trash2, Eye, CalendarX, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { getEventsByCreator, getCollaboratedEvents, getTicketsByEvent, deleteEvent } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userEvents = getEventsByCreator(user.uid);
  const collaboratedEvents = getCollaboratedEvents(user.uid);
  const allVisibleEvents = [...userEvents, ...collaboratedEvents.filter(ce => !userEvents.find(ue => ue.id === ce.id))];

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast({ title: "Event Deleted", description: "The event has been successfully removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete the event." });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Events List</CardTitle>
          <CardDescription>
            You are managing {allVisibleEvents.length} event(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allVisibleEvents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Check-ins</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allVisibleEvents.map((event: Event) => {
                    const ticketsSold = getTicketsByEvent(event.id).length;
                    const checkedInCount = getTicketsByEvent(event.id).filter(t => t.checkedIn).length;
                    const salesRate = event.capacity > 0 ? (ticketsSold / event.capacity) * 100 : 0;
                    const checkInRate = ticketsSold > 0 ? (checkedInCount / ticketsSold) * 100 : 0;
                    const isCreator = event.creatorId === user.uid;

                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-muted-foreground">{event.location}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(parseISO(event.date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>{ticketsSold} / {event.capacity} sold</span>
                                <span>{salesRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={salesRate} className="h-2" />
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>{checkedInCount} / {ticketsSold} checked in</span>
                            </div>
                            <Progress value={checkInRate} className="h-2" />
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/events/${event.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/edit/${event.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          {isCreator && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this event and all related data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(event.id)}>
                                    Delete Event
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No Events Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">You haven't created or been added to any events yet.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/create">Create Your First Event</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
