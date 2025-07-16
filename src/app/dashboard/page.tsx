
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
      <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 text-xl font-bold">Your Events List</CardTitle>
          <CardDescription className="text-slate-600">
            You are managing {allVisibleEvents.length} event(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allVisibleEvents.length > 0 ? (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <TableRow className="hover:bg-slate-50/80">
                    <TableHead className="text-slate-700 font-semibold">Event</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Date</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Sales</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Check-ins</TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
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
                      <TableRow key={event.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                        <TableCell>
                          <div className="font-medium text-slate-900">{event.name}</div>
                          <div className="text-sm text-slate-600">{event.location}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span className="text-slate-700">{format(parseISO(event.date), 'MMM dd, yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-700">{ticketsSold} / {event.capacity} sold</span>
                                <span className="text-orange-600 font-medium">{salesRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={salesRate} className="h-2 bg-slate-200 [&>*]:bg-gradient-to-r [&>*]:from-orange-500 [&>*]:to-orange-600" />
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-700">{checkedInCount} / {ticketsSold} checked in</span>
                            </div>
                            <Progress value={checkInRate} className="h-2 bg-slate-200 [&>*]:bg-gradient-to-r [&>*]:from-green-500 [&>*]:to-green-600" />
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 text-slate-600 hover:text-slate-900">
                            <Link href={`/events/${event.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100 text-slate-600 hover:text-slate-900">
                            <Link href={`/dashboard/edit/${event.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          {isCreator && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white border-slate-200">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-slate-900">Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-600">
                                    This action cannot be undone. This will permanently delete this event and all related data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="hover:bg-slate-100">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700">
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
            <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-lg bg-gradient-to-br from-slate-50 to-white">
              <CalendarX className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No Events Found</h3>
              <p className="mt-1 text-sm text-slate-600">You haven't created or been added to any events yet.</p>
              <div className="mt-6">
                <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
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
