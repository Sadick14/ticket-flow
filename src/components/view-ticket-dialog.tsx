
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Ticket, Event } from '@/lib/types';
import { format } from 'date-fns';
import { Printer, Ticket as TicketIcon, Calendar, Clock, MapPin, Building, Video, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import QRCode from 'qrcode.react';

interface ViewTicketDialogProps {
  ticket: Ticket;
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTicketDialog({ ticket, event, isOpen, onOpenChange }: ViewTicketDialogProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 print:shadow-none print:border-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Event Ticket for {event.name}</DialogTitle>
          <DialogDescription>Your ticket for {event.name}.</DialogDescription>
        </DialogHeader>
        <div id="ticket-to-print" className="bg-background rounded-lg flex flex-col sm:flex-row">
            {/* Main ticket body */}
            <div className="flex-grow p-6 sm:p-8 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                           <TicketIcon className="h-8 w-8 text-primary" />
                           <div>
                                <p className="text-muted-foreground text-sm">Ticket for</p>
                                <h2 className="text-2xl font-bold font-headline leading-tight">{event.name}</h2>
                           </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-sm">${event.price.toFixed(2)}</Badge>
                    </div>

                    <div className="space-y-3 mt-6 text-sm">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                            <span>{format(eventDate, 'eeee, MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                            <span>{format(eventDate, 'p')}</span>
                        </div>
                         {event.venueType === 'online' ? (
                            <div className="flex items-center">
                                <Video className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer">
                                        Join Online Event <LinkIcon className="ml-2 h-3 w-3" />
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                <span>{event.location}</span>
                            </div>
                        )}
                        {event.organizationName && (
                             <div className="flex items-center">
                                <Building className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                                <span>{event.organizationName}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 border-t pt-4">
                    <p className="text-muted-foreground text-xs">ADMITTEE</p>
                    <p className="font-semibold text-lg">{ticket.attendeeName}</p>
                </div>
            </div>

            {/* Stub */}
            <div className="sm:w-56 flex-shrink-0 bg-muted/40 flex flex-col items-center justify-between p-6 border-t sm:border-t-0 sm:border-l border-dashed">
                <div className="text-center">
                    <p className="text-muted-foreground text-xs">Scan at entry</p>
                    <div className="mt-2 bg-white p-1 rounded-md inline-block">
                        <QRCode value={ticket.id} size={120} />
                    </div>
                    <p className="font-mono text-[10px] mt-2 break-all text-muted-foreground">{ticket.id}</p>
                </div>
                <div className="text-center">
                    <p className="font-bold text-2xl tracking-widest font-headline">ADMIT</p>
                    <p className="font-bold text-2xl tracking-widest font-headline -mt-1">ONE</p>
                </div>
            </div>
        </div>

        <DialogFooter className="p-4 border-t print:hidden">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print or Save
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
