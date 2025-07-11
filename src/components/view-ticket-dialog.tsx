
"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Ticket, Event } from '@/lib/types';
import { format } from 'date-fns';
import { Printer, Ticket as TicketIcon, Calendar, Clock, MapPin, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViewTicketDialogProps {
  ticket: Ticket;
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodePlaceholder = () => (
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-md bg-white p-1">
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
      <DialogContent className="sm:max-w-3xl p-0 gap-0 print:shadow-none print:border-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Event Ticket</DialogTitle>
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
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                            <span>{event.location}</span>
                        </div>
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
                    <div className="mt-2">
                        <QRCodePlaceholder />
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
