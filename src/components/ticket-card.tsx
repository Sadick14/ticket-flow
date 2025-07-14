
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useAppContext } from '@/context/app-context';
import type { Ticket, Event } from '@/lib/types';
import { Button } from './ui/button';

interface TicketCardProps {
  ticket: Ticket;
  onViewTicket: () => void;
}

export function TicketCard({ ticket, onViewTicket }: TicketCardProps) {
  const { getEventById } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const eventData = await getEventById(ticket.eventId);
      if (eventData) setEvent(eventData);
    };
    fetchEvent();
  }, [ticket.eventId, getEventById]);

  if (!event) {
    return (
      <Card className="overflow-hidden sm:flex transition-all hover:shadow-md p-6 h-[124px] items-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Card>
    );
  }

  const eventDate = new Date(`${event.date}T${event.time}`);

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onViewTicket}
    >
      <div className="flex">
        <div className="relative h-auto w-32 flex-shrink-0 hidden sm:block">
          <Image
            src={event.imageUrl}
            alt={event.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${event.category.toLowerCase()}`}
          />
        </div>
        <CardContent className="p-4 sm:p-6 flex-grow flex justify-between items-center gap-4">
          <div className="flex-grow">
            <p className="text-sm text-primary font-semibold">{event.category.toUpperCase()}</p>
            <h2 className="text-xl font-bold font-headline">{event.name}</h2>
            <div className="text-muted-foreground text-sm mt-2 space-y-1">
               <div className="flex items-center">
                 <Calendar className="mr-2 h-4 w-4" />
                 <span>{format(eventDate, 'eee, MMM dd, yyyy')} at {format(eventDate, 'p')}</span>
               </div>
               <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.location}</span>
               </div>
            </div>
          </div>
          <div className="flex items-center">
              <Button variant="ghost" size="icon">
                  <ChevronRight className="h-6 w-6" />
              </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
