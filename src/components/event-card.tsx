
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Tag, Edit, Video, Trash2 } from 'lucide-react';
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
  const { deleteEvent } = useAppContext();
  const { toast } = useToast();
  const isDashboard = pathname.startsWith('/dashboard');

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/events/${event.id}`);
  };

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
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 touch-manipulation">
      <Link href={`/events/${event.id}`} className="flex flex-col h-full">
        <div className="relative h-40 sm:h-48 w-full">
          <Image 
            src={event.imageUrl} 
            alt={event.name} 
            fill
            className="object-cover" 
            data-ai-hint={`${event.category.toLowerCase()}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
            ${event.price.toFixed(2)}
          </Badge>
        </div>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-xl line-clamp-2">
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{format(eventDate, 'MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            {event.venueType === 'online' ? (
                <>
                    <Video className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Online Event</span>
                </>
            ) : (
                <>
                    <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                </>
            )}
          </div>
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Tag className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{event.category}</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/80 pt-1 sm:pt-2 line-clamp-2 sm:line-clamp-3">
            {event.description}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2 p-3 sm:p-6 pt-0">
            <Button className="flex-1 text-sm" onClick={handleViewClick} size="sm">
              View Event
            </Button>
            {isDashboard && (
              <>
                <Button variant="outline" className="flex-1 text-sm" onClick={handleEditClick} size="sm">
                  <Edit className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden xs:inline">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 text-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} size="sm">
                      <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                      <span className="hidden xs:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        event and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                      >
                        Delete Event
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
        </CardFooter>
      </Link>
    </Card>
  );
}
