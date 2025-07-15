
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { Loader2, Archive, Calendar, User, Eye, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ArchivedEventsPage() {
  const { events, users, loading } = useAppContext();

  const archivedEvents = useMemo(() => {
    return events.filter(event => event.status === 'archived');
  }, [events]);

  const getUserById = (id: string) => users.find(u => u.uid === id);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Archived Events</h1>
          <p className="text-muted-foreground">Events that have been archived by their creators.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archived Event List</CardTitle>
          <CardDescription>
            {archivedEvents.length} event(s) have been archived.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : archivedEvents.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">
                     <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No archived events found.
                    </TableCell></TableRow>
                ) : (
                  archivedEvents.map(event => {
                    const creator = getUserById(event.creatorId);
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
                                    <div className="text-sm text-muted-foreground">Unknown Creator</div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    {format(parseISO(event.date), 'MMM dd, yyyy')}
                                </div>
                            </TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/events/${event.id}`} target="_blank">
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </Link>
                                </Button>
                                {/* Future actions like 'Restore' could go here */}
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
