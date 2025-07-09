
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { Calendar, MapPin, Tag, Users, Mic, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

export default function EventDetailsPage() {
  const { id } = useParams();
  const { getEventById } = useAppContext();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const event = getEventById(id as string);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-xl text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const eventDate = new Date(`${event.date}T${event.time}`);

  return (
    <>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={event.imageUrl} 
                alt={event.name} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={`${event.category.toLowerCase()}`}
              />
            </div>
            <div className="mt-8">
              <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
                {event.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>{format(eventDate, 'PPP')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  <span>{format(eventDate, 'p')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  <span>{event.category}</span>
                </div>
              </div>
              <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
                {event.description}
              </p>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-bold font-headline mb-6">About this event</h2>
              <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold flex items-center mb-4"><Mic className="mr-3 h-6 w-6 text-primary"/>Speakers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {event.speakers && event.speakers.length > 0 ? event.speakers.map(speaker => (
                            <Card key={speaker.name} className="text-center p-4">
                                <Image src={speaker.imageUrl} alt={speaker.name} width={80} height={80} className="rounded-full mx-auto mb-3" data-ai-hint="person portrait"/>
                                <h4 className="font-semibold">{speaker.name}</h4>
                                <p className="text-sm text-muted-foreground">{speaker.title}</p>
                            </Card>
                        )) : <p className="text-muted-foreground">Speakers to be announced soon!</p>}
                    </div>
                </div>

                 <div>
                    <h3 className="text-xl font-semibold flex items-center mb-4"><Calendar className="mr-3 h-6 w-6 text-primary"/>Activities</h3>
                     <div className="space-y-4">
                        {event.activities && event.activities.length > 0 ? event.activities.map(activity => (
                             <Card key={activity.name} className="p-4">
                               <h4 className="font-semibold">{activity.name}</h4>
                               <p className="text-sm text-muted-foreground">{activity.time}</p>
                               <p className="text-sm mt-1">{activity.description}</p>
                            </Card>
                        )): <p className="text-muted-foreground">Event schedule will be updated shortly.</p>}
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
             <Card className="sticky top-24 shadow-lg">
                <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4">${event.price.toFixed(2)}</h3>
                    <div className="space-y-3 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center">
                            <Users className="mr-3 h-5 w-5"/>
                            <span>{event.capacity} capacity</span>
                        </div>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => setIsPurchaseModalOpen(true)}>
                        Get Tickets
                    </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
      <PurchaseTicketDialog
        event={event}
        isOpen={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
      />
    </>
  );
}
