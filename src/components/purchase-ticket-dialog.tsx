
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
import type { Event } from '@/lib/types';
import { Loader2, Minus, Plus, Wallet, Phone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PaymentCalculator } from '@/lib/payment-config';

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
  ).min(1, 'At least one attendee is required.'),
  // MoMo number is now optional as it's not needed for free events
  momoNumber: z.string().min(10, 'Please enter a valid phone number.').optional().or(z.literal('')),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function PurchaseTicketDialog({ event, isOpen, onOpenChange }: PurchaseTicketDialogProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'approval'>('details');

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      attendees: [{ attendeeName: '', attendeeEmail: '' }],
      momoNumber: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees"
  });
  
  const isFree = event.price === 0;

  useEffect(() => {
    // When the dialog opens, reset form with the correct number of attendees
    if (isOpen) {
        const currentCount = form.getValues('attendees').length;
        if (quantity > currentCount) {
            for (let i = 0; i < quantity - currentCount; i++) {
                append({ attendeeName: '', attendeeEmail: '' });
            }
        } else if (quantity < currentCount) {
            for (let i = 0; i < currentCount - quantity; i++) {
                remove(currentCount - 1 - i);
            }
        }
    }
  }, [quantity, isOpen, append, remove, form]);
  
  const handlePurchase = async (data: PurchaseFormValues) => {
    setIsSubmitting(true);
    
    // For free events, just add the tickets directly
    if (isFree) {
      try {
        const response = await fetch('/api/add-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: event.id,
              attendees: data.attendees,
              price: 0,
            })
        });
        if (!response.ok) throw new Error("Registration failed.");

        toast({
          title: 'Registration Successful!',
          description: `You've got ${quantity} ticket(s) for ${event.name}.`,
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
      return;
    }

    // For paid events, call the payment API
    if (!data.momoNumber) {
        toast({variant: 'destructive', title: 'Payment Failed', description: 'Mobile Money number is required.'});
        setIsSubmitting(false);
        return;
    }

    try {
      setPaymentStep('approval');
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: event.price * quantity,
          currency: 'GHS',
          gatewayId: 'mtn-momo',
          momoNumber: data.momoNumber,
          metadata: {
            eventId: event.id,
            eventName: event.name,
            quantity: quantity,
          },
        }),
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentResult.error || 'Payment request failed.');
      }
      
      toast({
        title: 'Check Your Phone',
        description: 'Approve the transaction by entering your MoMo PIN.',
      });
      
      const ticketResponse = await fetch('/api/add-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          attendees: data.attendees,
          price: event.price
        })
      });

      if (!ticketResponse.ok) throw new Error("Ticket creation failed after payment.");
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Could not initiate payment.',
      });
      setPaymentStep('details');
    } finally {
        setIsSubmitting(false);
    }
  };

  const resetState = () => {
    form.reset({attendees: [{ attendeeName: '', attendeeEmail: '' }], momoNumber: ''});
    setQuantity(1);
    setPaymentStep('details');
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetState();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isFree ? 'Register for Event' : 'Buy Tickets'}
          </DialogTitle>
          <DialogDescription>
            You are getting {quantity} ticket(s) for {event.name}.
          </DialogDescription>
        </DialogHeader>
        
        {paymentStep === 'approval' ? (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Awaiting Approval</h3>
            <p className="text-muted-foreground">
              Please check your phone and enter your MoMo PIN to approve the payment of
              <strong className="text-foreground"> {PaymentCalculator.formatCurrency((event.price * quantity) * 100, 'GHS')}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handlePurchase)} className="space-y-4">
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
              
              {!isFree && (
                <div className="space-y-2">
                    <Label htmlFor="momoNumber" className="flex items-center gap-2"><Wallet/> Mobile Money Payment</Label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="momoNumber" placeholder="Enter MoMo Number" {...form.register('momoNumber')} className="pl-10" required/>
                    </div>
                    {form.formState.errors.momoNumber && <p className="text-sm text-destructive">{form.formState.errors.momoNumber.message}</p>}
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-3xl font-bold">
                  {isFree ? 'FREE' : PaymentCalculator.formatCurrency((event.price * quantity) * 100, 'GHS')}
                </p>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : isFree ? 'Get Free Ticket' : 'Pay Now'}
                </Button>
              </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
