
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);
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
        <CardFooter>
            <Button className="w-full" asChild>
              <span onClick={(e) => {
                e.preventDefault();
                // We are inside a Link, so we can just let it propagate
                // or redirect manually if needed for some reason.
                window.location.href = `/events/${event.id}`;
              }}>
                View Event
              </span>
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
