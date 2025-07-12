
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { Calendar, MapPin, Clock, Loader2, Share2, Twitter, Facebook, Linkedin, Building, Mic, Users, Video, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event, Ticket } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function EventDetailsView({ initialEvent }: { initialEvent: Event }) {
  const { getTicketsByEvent, loading } = useAppContext();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event>(initialEvent);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (event) {
        const ticketData = getTicketsByEvent(event.id);
        setTickets(ticketData);
    }
  }, [event, getTicketsByEvent]);

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const startDate = new Date(`${event.date}T${event.time}`);
  const endDate = event.endDate && event.date !== event.endDate ? new Date(`${event.endDate}T23:59:59`) : startDate;
  const isMultiDay = event.endDate && event.date !== event.endDate;

  const formattedDate = isMultiDay 
    ? `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
    : format(startDate, 'PPP');
    
  const ticketsSold = tickets.length;
  const salesRate = event.capacity > 0 ? (ticketsSold / event.capacity) * 100 : 0;
  const ticketsLeft = event.capacity - ticketsSold;

  const getShareUrl = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (typeof window === 'undefined') return '#';
    const url = window.location.href;
    const text = `Check out this event: ${event.name}!`;
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
  };

  const copyLink = () => {
    if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied!', description: 'Event link copied to clipboard.' });
    }
  }

  return (
    <>
      <div className="bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                <main className="lg:col-span-2 space-y-8">
                    <Card className="overflow-hidden">
                        <div className="relative w-full h-64 sm:h-80 md:h-96">
                            <Image 
                            src={event.imageUrl} 
                            alt={event.name} 
                            fill
                            className="object-cover"
                            data-ai-hint={`${event.category.toLowerCase()}`}
                            priority
                            />
                        </div>
                        <CardContent className="p-6">
                            <p className="text-primary font-semibold">{event.category.toUpperCase()}</p>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-headline mt-2">
                                {event.name}
                            </h1>
                            {event.organizationName && (
                                <Link href="#" className="mt-4 flex items-center gap-3 group">
                                    {event.organizationLogoUrl && (
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={event.organizationLogoUrl} alt={event.organizationName} />
                                            <AvatarFallback>{event.organizationName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div>
                                        <p className="text-sm text-muted-foreground">Organized by</p>
                                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {event.organizationName}
                                        </p>
                                    </div>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>About this event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <article className="prose prose-lg max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                <p>{event.description}</p>
                            </article>
                        </CardContent>
                    </Card>

                    {event.speakers && event.speakers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Mic className="h-6 w-6 text-primary"/>Speakers</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {event.speakers.map(speaker => (
                                    <div key={speaker.name} className="flex flex-col items-center text-center">
                                        <div className="relative h-24 w-24 rounded-full mb-3 overflow-hidden">
                                            <Image src={speaker.imageUrl || 'https://placehold.co/100x100.png'} alt={speaker.name} fill className="object-cover" data-ai-hint="person portrait"/>
                                        </div>
                                        <h4 className="font-semibold">{speaker.name}</h4>
                                        <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {event.activities && event.activities.length > 0 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calendar className="h-6 w-6 text-primary"/>Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {event.activities.map(activity => (
                                    <div key={activity.name} className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                                        <p className="text-sm text-primary font-semibold font-mono w-24 shrink-0 pt-1">{activity.time}</p>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{activity.name}</h4>
                                            <p className="text-sm mt-1 text-muted-foreground">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {event.sponsors && event.sponsors.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6 text-primary"/>Sponsors</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {event.sponsors.map(sponsor => (
                                    <div key={sponsor.name} className="p-4 bg-muted/50 rounded-lg flex items-center justify-center">
                                        <div className="relative h-16 w-full grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                                            <Image src={sponsor.logoUrl || 'https://placehold.co/150x75.png'} alt={sponsor.name} fill className="object-contain" data-ai-hint="company logo"/>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </main>
                <aside className="hidden lg:block space-y-6">
                    <Card className="sticky top-24 shadow-lg">
                        <CardHeader>
                           <p className="text-3xl font-bold">${event.price > 0 ? event.price.toFixed(2) : 'Free'}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="mr-3 h-4 w-4"/>
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-3 h-4 w-4"/>
                                    <span>{format(startDate, 'p')}</span>
                                </div>
                                {event.venueType === 'online' ? (
                                     <div className="flex items-center">
                                        <Video className="mr-3 h-4 w-4"/>
                                        <span>Online Event</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <MapPin className="mr-3 h-4 w-4"/>
                                        <span>{event.location}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-4 border-t">
                                <p className="font-medium text-foreground">{ticketsSold} / {event.capacity} sold</p>
                                <Progress value={salesRate} className="h-2 mt-2" />
                                <p className="text-xs text-muted-foreground mt-1">{ticketsLeft} tickets remaining</p>
                            </div>

                             {event.venueType === 'online' && event.onlineUrl ? (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer">
                                        Join Event <LinkIcon className="ml-2 h-4 w-4"/>
                                    </a>
                                </Button>
                            ) : (
                                <Button className="w-full" size="lg" onClick={() => setIsPurchaseModalOpen(true)}>
                                    Get Tickets
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Share2 className="h-5 w-5"/>Share this event</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                             <Button variant="outline" size="icon" asChild>
                                <a href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer"><Twitter /></a>
                             </Button>
                              <Button variant="outline" size="icon" asChild>
                                <a href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer"><Facebook /></a>
                             </Button>
                              <Button variant="outline" size="icon" asChild>
                                <a href={getShareUrl('linkedin')} target="_blank" rel="noopener noreferrer"><Linkedin /></a>
                             </Button>
                             <Button variant="outline" className="flex-1" onClick={copyLink}>Copy Link</Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
      </div>
      
      {/* Floating Action Bar for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t z-10">
          <div className="flex justify-between items-center">
                <p className="text-xl font-bold">${event.price > 0 ? event.price.toFixed(2) : 'Free'}</p>
                <Button className="w-1/2" size="lg" onClick={() => setIsPurchaseModalOpen(true)}>
                  Get Tickets
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
