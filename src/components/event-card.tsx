
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
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 touch-manipulation bg-white/90 backdrop-blur-sm border-slate-200 rounded-2xl">
      <Link href={`/events/${event.id}`} className="flex flex-col h-full">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <Image 
            src={event.imageUrl} 
            alt={event.name} 
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
            data-ai-hint={`${event.category.toLowerCase()}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-orange-500/90 backdrop-blur-sm text-white border-0 font-semibold px-3 py-1 rounded-full">
              {event.category}
            </Badge>
          </div>
          <Badge className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white border-0 font-bold px-3 py-1 rounded-full">
            ${event.price.toFixed(2)}
          </Badge>
        </div>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-bold text-xl sm:text-2xl line-clamp-2 text-slate-900 group-hover:text-orange-600 transition-colors duration-300">
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
          <div className="flex items-center text-sm sm:text-base text-slate-600 font-medium">
            <Calendar className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-orange-500" />
            <span className="truncate">{format(eventDate, 'MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center text-sm sm:text-base text-slate-600 font-medium">
            {event.venueType === 'online' ? (
                <>
                    <Video className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-blue-500" />
                    <span>Online Event</span>
                </>
            ) : (
                <>
                    <MapPin className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-green-500" />
                    <span className="truncate">{event.location}</span>
                </>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-700 pt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        </CardContent>
        <CardFooter className="flex gap-3 p-4 sm:p-6 pt-0">
            <Button className="flex-1 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-full py-3 transition-all duration-300 hover:shadow-lg" onClick={handleViewClick} size="sm">
              View Event
            </Button>
            {isDashboard && (
              <>
                <Button variant="outline" className="flex-1 text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full py-3" onClick={handleEditClick} size="sm">
                  <Edit className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4"/>
                  <span className="hidden xs:inline">Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 rounded-full py-3" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} size="sm">
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
