
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Tag, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { usePathname, useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname.startsWith('/dashboard');

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/events/${event.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/dashboard/edit/${event.id}`);
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={`/events/${event.id}`} className="flex flex-col h-full">
        <div className="relative h-48 w-full">
          <Image src={event.imageUrl} alt={event.name} layout="fill" objectFit="cover" data-ai-hint={`${event.category.toLowerCase()}`} />
          <Badge variant="secondary" className="absolute top-2 right-2">{`$${event.price.toFixed(2)}`}</Badge>
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(eventDate, 'PPPp')}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="mr-2 h-4 w-4" />
              <span>{event.category}</span>
          </div>
          <p className="text-sm text-foreground/80 pt-2 line-clamp-3">
            {event.description}
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
            <Button className="w-full" onClick={handleViewClick}>
              View Event
            </Button>
            {isDashboard && (
              <Button variant="outline" className="w-full" onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4"/>
                Edit
              </Button>
            )}
        </CardFooter>
      </Link>
    </Card>
  );
}
