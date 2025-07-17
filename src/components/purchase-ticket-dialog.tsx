
"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { Event, PromoCode } from '@/lib/types';
import { Loader2, Minus, Plus, Rocket } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PurchaseTicketDialogProps {
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const purchaseSchema = z.object({
  attendees: z.array(
    z.object({
      attendeeName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
      attendeeEmail: z.string().email({ message: 'Please enter a valid email address.' }),
    })
  ).min(1, 'At least one attendee is required.')
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function PurchaseTicketDialog({ event, isOpen, onOpenChange }: PurchaseTicketDialogProps) {
  const { addTicket } = useAppContext();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      attendees: [{ attendeeName: '', attendeeEmail: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees"
  });

  useEffect(() => {
    const currentCount = fields.length;
    if (quantity > currentCount) {
      for (let i = 0; i < quantity - currentCount; i++) {
        append({ attendeeName: '', attendeeEmail: '' });
      }
    } else if (quantity < currentCount) {
      for (let i = 0; i < currentCount - quantity; i++) {
        remove(currentCount - 1 - i);
      }
    }
  }, [quantity, fields.length, append, remove]);

  const handleFreeTicketSubmit = async (data: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
      for (const attendee of data.attendees) {
        await addTicket({
          eventId: event.id,
          attendeeName: attendee.attendeeName,
          attendeeEmail: attendee.attendeeEmail,
          price: 0,
        });
      }
      toast({
        title: 'Registration Successful!',
        description: `You've got tickets for ${event.name}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFree = event.price === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
        setQuantity(1);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isFree ? 'Register for Event' : 'Tickets Coming Soon'}
          </DialogTitle>
          <DialogDescription>
            {isFree ? `You are registering for ${event.name}.` : `Online payments for this event are not yet available.`}
          </DialogDescription>
        </DialogHeader>
        
        {isFree ? (
          <form onSubmit={form.handleSubmit(handleFreeTicketSubmit)} className="space-y-4">
              <div className="flex items-center justify-between mt-4">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                          <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}>
                          <Plus className="h-4 w-4" />
                      </Button>
                  </div>
              </div>

              <ScrollArea className="h-64 pr-4 mt-4">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-muted/30">
                          <Label className="font-semibold">Ticket #{index + 1}</Label>
                          <div className="space-y-2">
                            <Label htmlFor={`attendees.${index}.attendeeName`}>Attendee Name</Label>
                            <Input id={`attendees.${index}.attendeeName`} {...form.register(`attendees.${index}.attendeeName`)} />
                            {form.formState.errors.attendees?.[index]?.attendeeName && <p className="text-sm text-destructive">{form.formState.errors.attendees?.[index]?.attendeeName?.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`attendees.${index}.attendeeEmail`}>Email Address</Label>
                            <Input id={`attendees.${index}.attendeeEmail`} type="email" {...form.register(`attendees.${index}.attendeeEmail`)} />
                            {form.formState.errors.attendees?.[index]?.attendeeEmail && <p className="text-sm text-destructive">{form.formState.errors.attendees?.[index]?.attendeeEmail?.message}</p>}
                          </div>
                      </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Get Free Ticket'}
                </Button>
              </DialogFooter>
          </form>
        ) : (
          <div className="text-center py-8">
            <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Online Payments Coming Soon!</h3>
            <p className="text-muted-foreground">
              We are finalizing our secure payment system. Please check back soon to purchase your tickets.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-6">
              OK
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
