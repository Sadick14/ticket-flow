
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Edit, Video, Trash2, Heart, Users } from 'lucide-react';
import { format } from 'date-fns';
import { usePathname, useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const pathname = usePathname();
  const router = useRouter();
  const { deleteEvent, getTicketsByEvent } = useAppContext();
  const { toast } = useToast();
  const isDashboard = pathname.startsWith('/dashboard');

  const ticketsSold = getTicketsByEvent(event.id).length;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/edit/${event.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id);
      toast({ title: 'Event Deleted', description: `The event "${event.name}" has been successfully deleted.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete the event.' });
    }
  };

  return (
    <div className="group relative rounded-lg p-[2px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 touch-manipulation bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_200%] animate-border-gradient">
      <Card className="h-full overflow-hidden rounded-[7px]">
        <Link href={`/events/${event.id}`} className="flex flex-col h-full">
          <div className="relative h-48 w-full overflow-hidden">
            <Image 
              src={event.imageUrl} 
              alt={event.name} 
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105" 
              data-ai-hint={`${event.category.toLowerCase()}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
             <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" className="bg-background/70 hover:bg-background h-8 w-8 rounded-full">
                    <Heart className="h-4 w-4" />
                </Button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <CardContent className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <CardTitle className="font-bold text-lg leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                {event.name}
              </CardTitle>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{format(eventDate, 'eee, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    {event.venueType === 'online' ? (
                        <Video className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    ) : (
                        <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{event.location}</span>
                  </div>
                   <div className="flex items-center">
                    <Users className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.organizationName || "Community Event"}</span>
                  </div>
              </div>
            </div>
            <div className="mt-4">
                <Badge variant="outline" className="font-mono text-primary border-primary/50">
                    {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                </Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}
