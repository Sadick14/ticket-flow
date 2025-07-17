
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Event } from '@/lib/types';
import { formatRelativeDate } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
}

const getPriceDisplay = (price: number) => {
    if (price === 0) return 'FREE';
    if (price < 1) { // Assuming GHS for prices less than 1
        return `GH₵${(price * 100).toFixed(0)}`;
    }
    return `GH₵${price.toFixed(2)}`;
};


export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Card className="h-full overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border-border/60">
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
        <CardContent className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
            <p className="text-sm font-semibold text-primary/80 mb-1">{formatRelativeDate(eventDate)}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{event.location}</p>
          </div>
          <div className="mt-2">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
              {getPriceDisplay(event.price)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
