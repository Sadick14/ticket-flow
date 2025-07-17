
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
import { Loader2, Minus, Plus, Ticket, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PaymentCalculator, PAYMENT_ENV } from '@/lib/payment-config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FirebasePaymentService } from '@/lib/firebase-payment-service';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(PAYMENT_ENV.stripe.publicKey);

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

function CheckoutForm({ event, quantity, promoCode, onSuccessfulPayment }: { event: Event; quantity: number; promoCode: string | undefined, onSuccessfulPayment: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const { addTicket } = useAppContext();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || 'An error occurred during submission.');
            setIsLoading(false);
            return;
        }

        const { clientSecret } = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: PaymentCalculator.calculateTicketTotal(event.price * quantity, {id: 'stripe', processingFee: 2.9, fixedFee: 30} as any).totalAmount,
                currency: 'USD',
                gatewayId: 'stripe',
                metadata: { eventId: event.id }
            }),
        }).then(res => res.json());

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/events/${event.id}?purchase=success`,
            },
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
        } else {
            // This part is mainly for free tickets or if payment confirmation is handled client-side
            // But with Stripe, the redirect is the primary confirmation method.
            onSuccessfulPayment();
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
             {errorMessage && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{errorMessage}</AlertDescription></Alert>}
            <Button disabled={isLoading || !stripe || !elements} className="w-full" type="submit">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay $${(PaymentCalculator.calculateTicketTotal(event.price * quantity, {id: 'stripe', processingFee: 2.9, fixedFee: 30} as any).totalAmount / 100).toFixed(2)}`}
            </Button>
        </form>
    );
}

export function PurchaseTicketDialog({ event, isOpen, onOpenChange }: PurchaseTicketDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [step, setStep] = useState(1); // 1 for details, 2 for payment
  const [clientSecret, setClientSecret] = useState<string | null>(null);

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

  const calculateTotal = () => {
    let total = event.price * quantity;
    if (appliedPromo) {
        if (appliedPromo.discountType === 'percentage') {
            total -= total * (appliedPromo.value / 100);
        } else {
            total -= (appliedPromo.value * 100) * quantity;
        }
    }
    return Math.max(0, total);
  };
  
  const finalPrice = calculateTotal();

  const handleProceedToPayment = async (data: PurchaseFormValues) => {
    if (finalPrice === 0) {
        // Handle free ticket submission
        // This part needs implementation to save tickets directly
        return;
    }
    
    // Create payment intent and get client secret
    const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: finalPrice,
            currency: 'USD',
            gatewayId: 'stripe',
            metadata: { 
                eventId: event.id,
                quantity: quantity,
                attendees: JSON.stringify(data.attendees)
            }
        })
    });
    const { clientSecret: secret } = await res.json();
    setClientSecret(secret);
    setStep(2);
  };

  const isFree = event.price === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
        setQuantity(1);
        setAppliedPromo(null);
        setStep(1);
        setClientSecret(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{step === 1 ? 'Purchase Tickets' : 'Complete Payment'}</DialogTitle>
          <DialogDescription>
            {step === 1 ? `You are purchasing tickets for ${event.name}.` : 'Enter your payment details below.'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
            <form onSubmit={form.handleSubmit(handleProceedToPayment)} className="space-y-4">
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

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit">
                    {isFree ? 'Get Free Ticket' : 'Proceed to Payment'}
                  </Button>
                </DialogFooter>
            </form>
        )}

        {step === 2 && clientSecret && (
          <Elements options={{ clientSecret }} stripe={stripePromise}>
            <CheckoutForm 
                event={event} 
                quantity={quantity} 
                promoCode={watchPromoCode} 
                onSuccessfulPayment={() => {
                    // This callback might be used for post-payment actions if not handled by webhooks
                    onOpenChange(false);
                }}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
