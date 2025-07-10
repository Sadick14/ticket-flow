
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { Calendar, MapPin, Tag, Users, Mic, Clock, Building, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import type { Event } from '@/lib/types';

export default function EventDetailsPage() {
  const { id } = useParams();
  const { getEventById, loading } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        const eventData = await getEventById(id as string);
        setEvent(eventData || null);
      };
      fetchEvent();
    }
  }, [id, getEventById]);


  if (loading || !event) {
    return (
      <div className="flex items-center justify-center h-screen">
        {loading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <p className="text-xl text-muted-foreground">Event not found.</p>}
      </div>
    );
  }

  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = event.endDate && event.date !== event.endDate ? new Date(`${event.endDate}T23:59:59`) : startDate;
  const isMultiDay = event.endDate && event.date !== event.endDate;

  const formattedDate = isMultiDay 
    ? `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
    : format(startDate, 'PPP');

  return (
    <>
      <div className="relative w-full h-64 sm:h-80 md:h-96">
        <Image 
          src={event.imageUrl} 
          alt={event.name} 
          fill
          className="object-cover"
          data-ai-hint={`${event.category.toLowerCase()}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 sm:-mt-24">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            <main className="lg:col-span-2">
                 <div className="bg-card p-6 rounded-lg shadow-lg">
                     <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
                        {event.name}
                      </h1>
                      {event.organizationName && (
                        <p className="mt-2 text-xl text-muted-foreground">
                          by {event.organizationName}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-5 w-5" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-5 w-5" />
                          <span>{format(startDate, 'p')}</span>
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
                 </div>

                <article className="prose prose-lg max-w-none mt-12 text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    <p>{event.description}</p>
                </article>

                <div className="mt-16 space-y-16">
                    <div>
                        <h3 className="text-2xl font-bold font-headline flex items-center mb-6"><Mic className="mr-3 h-6 w-6 text-primary"/>Speakers</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {event.speakers && event.speakers.length > 0 ? event.speakers.map(speaker => (
                                <Card key={speaker.name} className="text-center p-4">
                                    <div className="relative h-20 w-20 rounded-full mx-auto mb-3 overflow-hidden">
                                        <Image src={speaker.imageUrl || 'https://placehold.co/100x100.png'} alt={speaker.name} fill className="object-cover" data-ai-hint="person portrait"/>
                                    </div>
                                    <h4 className="font-semibold">{speaker.name}</h4>
                                    <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                </Card>
                            )) : <p className="text-muted-foreground">Speakers to be announced soon!</p>}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold font-headline flex items-center mb-6"><Calendar className="mr-3 h-6 w-6 text-primary"/>Activities</h3>
                        <div className="space-y-4">
                            {event.activities && event.activities.length > 0 ? event.activities.map(activity => (
                                <Card key={activity.name} className="p-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">{activity.name}</h4>
                                    <p className="text-sm text-muted-foreground font-mono">{activity.time}</p>
                                </div>
                                <p className="text-sm mt-1">{activity.description}</p>
                                </Card>
                            )): <p className="text-muted-foreground">Event schedule will be updated shortly.</p>}
                        </div>
                    </div>

                    {event.sponsors && event.sponsors.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-bold font-headline flex items-center mb-6"><Building className="mr-3 h-6 w-6 text-primary"/>Sponsors</h3>
                            <div className="flex flex-wrap items-center gap-8">
                                {event.sponsors.map(sponsor => (
                                    <div key={sponsor.name} className="text-center">
                                        <div className="relative h-16 w-32">
                                            <Image src={sponsor.logoUrl || 'https://placehold.co/150x75.png'} alt={sponsor.name} fill className="object-contain" data-ai-hint="company logo"/>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">{sponsor.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <aside className="hidden lg:block">
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
            </aside>
        </div>

        {/* Floating Action Button for mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
            <Button className="w-full" size="lg" onClick={() => setIsPurchaseModalOpen(true)}>
                Get Tickets - ${event.price.toFixed(2)}
            </Button>
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
