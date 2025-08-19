
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { Calendar, MapPin, Clock, Loader2, Share2, Twitter, Facebook, Linkedin, Building, Users, Video, Link as LinkIcon, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event, Ticket, TicketType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/page-hero';

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

  const totalTicketsSold = tickets.length;
  const totalTicketsAvailable = event.capacity;
  const availabilityPercentage = totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0;
  
  const ticketsAvailableForPurchase = event.capacity > 0;
  const eventDate = new Date(`${event.date}T${event.time}`);
  const isPastEvent = eventDate < new Date();

  const renderTicketPrice = () => {
    if (event.price === 0 && (!event.ticketTypes || event.ticketTypes.length === 0)) {
        return <div className="text-3xl font-bold">Free</div>;
    }
    if (event.ticketTypes && event.ticketTypes.length > 0) {
        const prices = event.ticketTypes.map(t => t.price);
        const minPrice = Math.min(...prices);
        if (minPrice === 0) return <div className="text-3xl font-bold">Free</div>;
        return (
            <div>
                <div className="text-3xl font-bold">GH₵{minPrice.toFixed(2)}+</div>
                <p className="text-sm text-muted-foreground">Multiple ticket types</p>
            </div>
        );
    }
    return <div className="text-3xl font-bold">GH₵{event.price.toFixed(2)}</div>;
  };

  return (
    <>
      <PageHero
        title={event.name}
        description={`Join us on ${format(eventDate, 'PPP')} for an unforgettable experience.`}
        backgroundImage={event.imageUrl}
        height="xl"
      />
      <div className="bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              <div className="space-y-4 bg-background p-6 rounded-lg shadow-sm">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                      <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{format(eventDate, 'PPP')}</span>
                      </div>
                      <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{event.time}</span>
                      </div>
                      {event.venueType === 'online' ? (
                          <div className="flex items-center">
                              <Video className="mr-2 h-4 w-4" />
                              <span>Online Event</span>
                          </div>
                      ) : (
                          <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              <span>{event.location}</span>
                          </div>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleShare('copy')}><LinkIcon className="mr-2 h-4 w-4" /> Copy Link</Button>
                      <Button variant="ghost" size="icon" onClick={() => handleShare('twitter')}><Twitter className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleShare('facebook')}><Facebook className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleShare('linkedin')}><Linkedin className="h-4 w-4" /></Button>
                  </div>
              </div>

              <Card>
                <CardHeader>
                    <CardTitle>Event Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/organization/${event.organizationId}`} className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-md transition-colors">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={event.organizationLogoUrl} alt={event.organizationName} />
                            <AvatarFallback><Building/></AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold">{event.organizationName || 'Event Creator'}</p>
                            <p className="text-sm text-muted-foreground">View Profile</p>
                        </div>
                    </Link>
                </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                    </p>
                  </CardContent>
              </Card>

               {event.venueType === 'in-person' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">{event.location}</div>
                  </CardContent>
                </Card>
              )}
              
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
                        {renderTicketPrice()}
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
                            : 'Get Tickets'
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

              <Card>
                  <CardHeader>
                      <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center">
                          <p className="font-semibold w-24">Date & Time</p>
                          <span>{format(eventDate, 'PPPp')}</span>
                      </div>
                      <div className="flex items-center">
                          <p className="font-semibold w-24">Location</p>
                          {event.venueType === 'online' ? (
                              <span>Online Event</span>
                          ) : (
                              <span>{event.location}</span>
                          )}
                      </div>
                      <div className="flex items-center">
                          <p className="font-semibold w-24">Category</p>
                          <span>{event.category}</span>
                      </div>
                  </CardContent>
              </Card>

            </div>
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
    </>
  );
}
