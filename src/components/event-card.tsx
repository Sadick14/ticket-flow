
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Event } from '@/lib/types';
import { formatRelativeDate } from '@/lib/utils';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';

interface EventCardProps {
  event: Event;
}

const getPriceDisplay = (price: number) => {
    if (price === 0) return 'FREE';
    return `GH₵${price.toFixed(2)}`;
};


export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const formattedDate = formatRelativeDate(eventDate);

  return (
    <Card className="h-full overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border-border/60 group flex flex-col">
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative h-40 w-full overflow-hidden">
          <Image 
            src={event.imageUrl} 
            alt={event.name} 
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
            data-ai-hint={`${event.category.toLowerCase()}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardHeader className="p-4">
          <Badge variant="secondary" className="w-fit mb-2">{event.category}</Badge>
          <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors h-12">
            <Link href={`/events/${event.id}`}>{event.name}</Link>
          </h3>
          <div className="text-sm text-muted-foreground flex flex-col gap-1">
            {formattedDate !== 'Invalid date' && (
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}
            <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span className="truncate">{event.location}</span>
            </div>
          </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
          <Button asChild className="w-full">
            <Link href={`/events/${event.id}`}>
              {getPriceDisplay(event.price)} - Get Ticket
              <ArrowRight className="ml-2 h-4 w-4"/>
            </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
