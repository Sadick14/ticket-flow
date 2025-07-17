
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
import type { Event, PromoCode } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2, Minus, Plus, Trash2, Ticket, Percent } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PurchaseTicketDialogProps {
  event: Event;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const purchaseSchema = z.object({
    promoCode: z.string().optional(),
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
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
        attendees: [{ attendeeName: '', attendeeEmail: '' }],
        promoCode: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees"
  });

  const watchPromoCode = form.watch('promoCode');

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

  const handleApplyPromo = () => {
    const promo = event.promoCodes?.find(p => p.code.toLowerCase() === watchPromoCode?.toLowerCase());
    if (promo) {
        setAppliedPromo(promo);
        toast({ title: "Promo Code Applied!", description: `You've received a discount.`});
    } else {
        setAppliedPromo(null);
        toast({ variant: 'destructive', title: "Invalid Code", description: "This promo code is not valid."});
    }
  };

  const calculateDiscount = () => {
      if (!appliedPromo) return { discountAmount: 0, finalPrice: event.price * quantity };
      const originalTotal = event.price * quantity;

      if (appliedPromo.discountType === 'percentage') {
          const discount = originalTotal * (appliedPromo.value / 100);
          return { discountAmount: discount, finalPrice: originalTotal - discount };
      }
      if (appliedPromo.discountType === 'fixed') {
          const discount = appliedPromo.value * 100 * quantity; // convert dollars to cents
          return { discountAmount: discount, finalPrice: Math.max(0, originalTotal - discount) };
      }
      return { discountAmount: 0, finalPrice: originalTotal };
  };

  const { discountAmount, finalPrice } = calculateDiscount();

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
        setAppliedPromo(null);
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
  const isFree = event.price === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            form.reset();
            setQuantity(1);
            setAppliedPromo(null);
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
           
            {!isFree && event.promoCodes && event.promoCodes.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="promoCode">Promotional Code</Label>
                    <div className="flex gap-2">
                        <Input id="promoCode" placeholder="Enter code" {...form.register('promoCode')} />
                        <Button type="button" variant="secondary" onClick={handleApplyPromo}>Apply</Button>
                    </div>
                </div>
            )}

            <div className="bg-muted/50 px-4 py-3 space-y-2 rounded-md mt-4">
                 <div className="flex justify-between items-center text-sm">
                    <p>Subtotal</p>
                    <p>${(event.price * quantity).toFixed(2)}</p>
                </div>
                {appliedPromo && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                        <p>Discount ({appliedPromo.code})</p>
                        <p>-${(discountAmount).toFixed(2)}</p>
                    </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                    <p>Total Price</p>
                    <p>{isFree ? 'Free' : `$${(finalPrice).toFixed(2)}`}</p>
                </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isFree ? 'Get Free Ticket' : 'Confirm Purchase'}
              </Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
