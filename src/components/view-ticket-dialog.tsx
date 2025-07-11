
"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Ticket, Event } from '@/lib/types';
import { format } from 'date-fns';
import { Printer, Ticket as TicketIcon, Calendar, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';

interface ViewTicketDialogProps {
  ticket: Ticket;
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodePlaceholder = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-md">
    <path d="M0 0H100V100H0V0Z" fill="white"/>
    <path d="M20 20H35V35H20V20Z" fill="black"/>
    <path d="M25 25V30H30V25H25Z" fill="white"/>
    <path d="M65 20H80V35H65V20Z" fill="black"/>
    <path d="M70 25V30H75V25H70Z" fill="white"/>
    <path d="M20 65H35V80H20V65Z" fill="black"/>
    <path d="M25 70V75H30V70H25Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M45 20H50V25H45V20ZM55 20H60V25H55V20ZM40 30H45V35H40V30ZM50 30H55V35H50V30ZM60 30H65V35H60V30ZM70 40H75V45H70V40ZM60 45H65V50H60V45ZM45 50H50V55H45V50ZM55 55H60V60H55V55ZM65 55H70V60H65V55ZM75 55H80V60H75V55ZM40 60H45V65H40V60ZM50 65H55V70H50V65ZM60 70H65V75H60V70ZM70 75H75V80H70V75ZM45 80H50V85H45V80Z" fill="black"/>
  </svg>
);


export function ViewTicketDialog({ ticket, event, isOpen, onOpenChange }: ViewTicketDialogProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 print:shadow-none print:border-none">
        <div id="ticket-to-print" className="bg-background rounded-lg">
          <div className="relative h-32 bg-muted/50">
             <Image src={event.imageUrl} alt={event.name} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={`${event.category.toLowerCase()}`} />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
          <div className="p-6 pt-0 -mt-8 relative z-10">
            <h2 className="text-2xl font-bold font-headline">{event.name}</h2>
            <p className="text-primary font-semibold">{event.category}</p>
          </div>

          <div className="flex flex-col sm:flex-row border-t border-dashed">
            <div className="flex-grow p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{format(eventDate, 'eeee, MMM dd, yyyy')}</p>
                    <p className="text-muted-foreground">Date</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{format(eventDate, 'p')}</p>
                    <p className="text-muted-foreground">Time</p>
                  </div>
                </div>
                <div className="flex items-start col-span-2">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">{event.location}</p>
                    <p className="text-muted-foreground">Location</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                 <p className="text-muted-foreground text-sm">Attendee</p>
                 <p className="font-semibold text-foreground text-lg">{ticket.attendeeName}</p>
              </div>
            </div>

            <div className="flex-shrink-0 sm:w-32 bg-muted/30 flex flex-col items-center justify-center p-6 border-t sm:border-t-0 sm:border-l border-dashed">
              <QRCodePlaceholder />
              <p className="font-mono text-xs mt-2 break-all text-center">{ticket.id}</p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-b-lg flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-bold text-xl">${event.price.toFixed(2)}</p>
            </div>
             <p className="font-semibold text-lg">ADMIT ONE</p>
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
