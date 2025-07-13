'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { PurchaseTicketDialog } from '@/components/purchase-ticket-dialog';
import { Calendar, MapPin, Clock, Loader2, Share2, Twitter, Facebook, Linkedin, Building, Mic, Users, Video, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event, Ticket } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

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

  const shareUrl = `${window.location.origin}/events/${event.id}`;
  const shareText = `Check out ${event.title} on TicketFlow!`;

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
  const totalTicketsAvailable = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
  const availabilityPercentage = totalTicketsAvailable > 0 ? (totalTicketsSold / totalTicketsAvailable) * 100 : 0;

  // Get lowest price ticket
  const lowestPrice = Math.min(...tickets.map(t => t.price));
  const hasTickets = tickets.length > 0;

  // Check if event is in the past
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Image */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            <Image
              src={event.image || '/placeholder-image.jpg'}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{format(new Date(event.date), 'p')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Event Status */}
            {isPastEvent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">This event has already taken place.</p>
              </div>
            )}

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <Building className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{event.organizerName || 'Event Organizer'}</p>
                    <p className="text-sm text-gray-600">Event Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mic className="h-5 w-5" />
                    <span className="text-sm">Live Speakers</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Networking</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Video className="h-5 w-5" />
                    <span className="text-sm">Recorded Sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Interactive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Purchase Card */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl">Get Your Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasTickets ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {lowestPrice === 0 ? 'Free' : `From $${lowestPrice}`}
                    </div>
                    <p className="text-sm text-gray-600">per ticket</p>
                  </div>

                  {/* Availability Progress */}
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

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsPurchaseModalOpen(true)}
                    disabled={isPastEvent || totalTicketsSold >= totalTicketsAvailable}
                  >
                    {isPastEvent 
                      ? 'Event Ended' 
                      : totalTicketsSold >= totalTicketsAvailable 
                        ? 'Sold Out' 
                        : 'Buy Tickets'
                    }
                  </Button>

                  {/* Ticket Types */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-gray-900">Available Tickets</h4>
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{ticket.type}</p>
                          <p className="text-xs text-gray-600">
                            {ticket.quantity - ticket.sold} of {ticket.quantity} available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No tickets available for this event.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Date & Time</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.date), 'h:mm a')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Location</h4>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>

                {event.category && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                    <p className="text-sm text-gray-600 capitalize">{event.category}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">More Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Discover more events from this organizer and others in your area.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/events">Browse All Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Modal */}
      {hasTickets && (
        <PurchaseTicketDialog
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          event={event}
          tickets={tickets}
        />
      )}
    </div>
  );
}
