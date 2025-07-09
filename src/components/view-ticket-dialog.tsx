"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Ticket, Event } from '@/lib/types';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

interface ViewTicketDialogProps {
  ticket: Ticket;
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Barcode = () => (
  <div
    style={{
      background: 'repeating-linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--foreground)) 2px, transparent 2px, transparent 4px)',
    }}
    className="h-16 w-full"
    aria-label="Ticket barcode"
  ></div>
);

export function ViewTicketDialog({ ticket, event, isOpen, onOpenChange }: ViewTicketDialogProps) {
  const eventDate = new Date(`${event.date}T${event.time}`);

  const handlePrint = () => {
    // This is a browser API, so it's safe to call here.
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <div className="p-6">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{event.name}</DialogTitle>
                <DialogDescription>{format(eventDate, 'PPPp')}</DialogDescription>
            </DialogHeader>
            <div className="my-6 space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-right">{event.location}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Attendee</span>
                    <span className="font-medium">{ticket.attendeeName}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket ID</span>
                    <span className="font-mono text-xs">{ticket.id}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-bold text-lg">${event.price.toFixed(2)}</span>
                </div>
            </div>
            <Barcode />
             <p className="text-center text-xs text-muted-foreground mt-4">
              Present this ticket at the entrance. Each ticket admits one person.
            </p>
        </div>
        <DialogFooter className="bg-muted/50 p-4 border-t">
          <Button type="button" variant="ghost" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Ticket
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
