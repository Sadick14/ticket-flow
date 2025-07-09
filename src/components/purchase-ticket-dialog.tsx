
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface PurchaseTicketDialogProps {
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const purchaseSchema = z.object({
  attendeeName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  attendeeEmail: z.string().email({ message: 'Please enter a valid email address.' }),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function PurchaseTicketDialog({ event, isOpen, onOpenChange }: PurchaseTicketDialogProps) {
  const { addTicket } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
  });

  const onSubmit = async (data: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
        await addTicket({
          eventId: event.id,
          ...data,
        });
        toast({
          title: 'Purchase Successful!',
          description: `You've got a ticket for ${event.name}.`,
        });
        reset();
        onOpenChange(false);
    } catch(e) {
         toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: `Could not complete your purchase. Please try again.`,
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const eventDate = new Date(`${event.date}T${event.time}`);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Purchase Ticket</DialogTitle>
          <DialogDescription>
            You are about to purchase a ticket for {event.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
            <div className="ticket-card bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold">{event.name}</h3>
                            <p className="text-muted-foreground text-sm">{format(eventDate, 'PPPp')}</p>
                            <p className="text-muted-foreground text-sm">{event.location}</p>
                        </div>
                        <Badge variant="secondary">{event.category}</Badge>
                    </div>
                </div>
                <div className="bg-muted/50 px-4 py-3 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-lg font-bold">${event.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={isSubmitting}>
            <div className="space-y-2">
              <Label htmlFor="attendeeName">Attendee Name</Label>
              <Input id="attendeeName" {...register('attendeeName')} />
              {errors.attendeeName && <p className="text-sm text-destructive">{errors.attendeeName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendeeEmail">Email Address</Label>
              <Input id="attendeeEmail" type="email" {...register('attendeeEmail')} />
              {errors.attendeeEmail && <p className="text-sm text-destructive">{errors.attendeeEmail.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Purchase
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
