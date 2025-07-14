
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { Calendar, MapPin, Clock, Loader2, Share2, Twitter, Facebook, Linkedin, Building, Mic, Users, Video, Link as LinkIcon, Star, Tv } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event, Ticket } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface EventDetailsClientProps {
  eventId: string;
}

export default function EventDetailsClient({ eventId }: EventDetailsClientProps) {
  const { getEventById, getTicketsByEvent, loading } = useAppContext();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchEventData = async () => {
      setPageLoading(true);
      const eventData = await getEventById(eventId);
      if (eventData) {
        setEvent(eventData);
        const ticketData = getTicketsByEvent(eventData.id);
        setTickets(ticketData);
      }
      setPageLoading(false);
    };

    fetchEventData();
  }, [eventId, getEventById, getTicketsByEvent]);

  if (pageLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${event.name} on TicketFlow!`;

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Event link has been copied to clipboard.",
        });
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  // Calculate tickets sold and availability
  const totalTicketsAvailable = event.capacity;
  const totalTicketsSold = tickets.length;
  const availabilityPercentage = totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0;
  
  const ticketsAvailableForPurchase = event.price >= 0 && event.capacity > 0;
  
  // Check if event is in the past
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Image */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={event.imageUrl || '/placeholder-image.jpg'}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
             <div className="absolute bottom-4 left-4 text-white">
                <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold font-headline">
                  {event.name}
                </h1>
             </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <Card>
                <CardContent className="p-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-gray-600">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>{format(new Date(event.date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {event.venueType === 'online' ? <Tv className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={() => handleShare('copy')}><LinkIcon className="h-4 w-4 mr-2" />Copy Link</Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}><Twitter className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}><Facebook className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}><Linkedin className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
            </Card>

            {isPastEvent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">This event has already taken place.</p>
              </div>
            )}

            {/* Organizer Info */}
             <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                    {event.organizationLogoUrl && (
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={event.organizationLogoUrl} alt={event.organizationName} />
                            <AvatarFallback><Building className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        {event.organizationName && <p className="font-semibold">{event.organizationName}</p>}
                        <div className="prose max-w-none mt-2">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Speakers</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {event.speakers.map((speaker, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={speaker.imageUrl} alt={speaker.name} />
                                    <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{speaker.name}</p>
                                    <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

             {/* Schedule / Activities */}
            {event.activities && event.activities.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {event.activities.map((activity, index) => (
                            <div key={index} className="flex gap-4 p-3 border-l-4 border-primary bg-muted/50 rounded-r-lg">
                                <div className="font-semibold text-primary w-24">{activity.time}</div>
                                <div className="flex-1">
                                    <p className="font-semibold">{activity.name}</p>
                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

             {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Our Sponsors</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-8">
                        {event.sponsors.map((sponsor, index) => (
                            <div key={index} className="relative h-12 w-32 grayscale hover:grayscale-0 transition-all">
                                <Image src={sponsor.logoUrl} alt={sponsor.name} layout="fill" objectFit="contain" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl">Get Your Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketsAvailableForPurchase ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                    </div>
                    <p className="text-sm text-gray-600">per ticket</p>
                  </div>

                  {event.capacity > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                        <span>Tickets Sold</span>
                        <span>{totalTicketsSold}/{totalTicketsAvailable}</span>
                        </div>
                        <Progress value={availabilityPercentage} className="h-2" />
                        <p className="text-xs text-gray-600">
                        {totalTicketsAvailable - totalTicketsSold} tickets remaining
                        </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsPurchaseModalOpen(true)}
                    disabled={isPastEvent || (event.capacity > 0 && totalTicketsSold >= totalTicketsAvailable)}
                  >
                    {isPastEvent 
                      ? 'Event Ended' 
                      : (event.capacity > 0 && totalTicketsSold >= totalTicketsAvailable) 
                        ? 'Sold Out' 
                        : event.price === 0 ? 'Get Free Ticket' : 'Buy Tickets'
                    }
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No tickets available for this event.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {ticketsAvailableForPurchase && (
        <PurchaseTicketDialog
          isOpen={isPurchaseModalOpen}
          onOpenChange={setIsPurchaseModalOpen}
          event={event}
        />
      )}
    </div>
  );
}
