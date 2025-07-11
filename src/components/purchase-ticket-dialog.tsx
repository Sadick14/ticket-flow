
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
        attendees: [{ attendeeName: '', attendeeEmail: '' }]
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


  const onSubmit = async (data: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
        await Promise.all(data.attendees.map(attendee => 
            addTicket({
                eventId: event.id,
                ...attendee,
            })
        ));
        
        toast({
          title: 'Purchase Successful!',
          description: `You've got ${data.attendees.length} ticket(s) for ${event.name}.`,
        });
        form.reset();
        setQuantity(1);
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
  const totalPrice = event.price * quantity;

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
          <DialogTitle className="font-headline">Purchase Tickets</DialogTitle>
          <DialogDescription>
            You are purchasing tickets for {event.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={isSubmitting}>
            <div className="flex items-center justify-between mt-4">
                <Label>Quantity</Label>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q-1))} disabled={quantity <= 1}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q+1)}>
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
           
            <div className="bg-muted/50 px-4 py-3 flex justify-between items-center rounded-md mt-4">
                <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
            </div>


            <DialogFooter className="mt-6">
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
