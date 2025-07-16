
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Edit, Video, Trash2, ArrowRight } from 'lucide-react';
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
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 touch-manipulation bg-card border-border rounded-xl">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold px-3 py-1 rounded-full">
              {event.category}
            </Badge>
          </div>
           <div className="absolute bottom-4 right-4 text-white font-bold text-lg bg-black/30 p-2 rounded-lg backdrop-blur-sm">
            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
          </div>
        </div>
        <CardHeader className="p-4">
          <CardTitle className="font-bold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 p-4 pt-0">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
            <span className="truncate">{format(eventDate, 'eee, MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            {event.venueType === 'online' ? (
                <>
                    <Video className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Online Event</span>
                </>
            ) : (
                <>
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{event.location}</span>
                </>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <Button className="w-full" asChild>
            <Link href={`/events/${event.id}`}>
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
