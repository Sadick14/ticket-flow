
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
import type { Event, Ticket } from '@/lib/types';
import { Loader2, Minus, Plus, Wallet, Phone, Shield, Copy, CheckCircle, Hourglass } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { PaymentCalculator } from '@/lib/payment-config';
import { ViewTicketDialog } from './view-ticket-dialog';
import { useAuth } from '@/context/auth-context';

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
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

// Generate a simple human-readable booking code
const generateBookingCode = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


export function PurchaseTicketDialog({ event, isOpen, onOpenChange }: PurchaseTicketDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [bookingCode, setBookingCode] = useState('');

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
  
  const isFree = event.price === 0;
  const totalPrice = event.price * quantity;

  useEffect(() => {
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
    const newBookingCode = generateBookingCode();
    setBookingCode(newBookingCode);

    try {
        const response = await fetch('/api/add-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: event.id,
              attendees: data.attendees,
              price: event.price,
              bookingCode: newBookingCode,
              status: isFree ? 'confirmed' : 'pending'
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Booking failed.");
        
        if(isFree) {
            toast({
              title: 'Registration Successful!',
              description: `You've got ${quantity} ticket(s) for ${event.name}. Check your email!`,
            });
            onOpenChange(false);
        } else {
            setStep('confirmation');
        }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard!" });
  };

  const resetState = () => {
    form.reset({attendees: [{ attendeeName: '', attendeeEmail: '' }]});
    setQuantity(1);
    setStep('details');
    setIsSubmitting(false);
    setBookingCode('');
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {step === 'details' ? (isFree ? 'Register for Event' : 'Reserve Your Tickets') : 'Complete Your Booking'}
            </DialogTitle>
             <DialogDescription>
              {step === 'details' 
                ? `You are reserving ${quantity} ticket(s) for ${event.name}.`
                : 'Follow the instructions below to confirm your payment.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {step === 'confirmation' ? (
            <div className="py-4 space-y-4 text-center">
              <Hourglass className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Payment Required</h3>
              <p className="text-muted-foreground">
                Your booking is pending. Please complete the manual payment to confirm your tickets.
              </p>
              <Card className="text-left p-4 bg-muted/50">
                 <p className="text-sm font-semibold">Instructions:</p>
                 <ol className="text-sm list-decimal list-inside space-y-1 mt-2">
                    <li>Send Mobile Money to: <strong className="text-primary">0597479994</strong></li>
                    <li>Amount: <strong className="text-primary">{PaymentCalculator.formatCurrency(totalPrice * 100, 'GHS')}</strong></li>
                    <li>
                      Reference/Narration:
                      <div className="flex items-center gap-2 mt-1">
                        <Input readOnly value={bookingCode} className="font-mono text-xs h-8"/>
                        <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(bookingCode)}><Copy className="h-4 w-4"/></Button>
                      </div>
                    </li>
                 </ol>
                 <p className="text-xs text-muted-foreground mt-4">Your ticket will be confirmed once payment is received. This may take up to a few hours.</p>
              </Card>
               <Button onClick={() => onOpenChange(false)} className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I Understand, I will Pay Manually
                </Button>
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
                
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-3xl font-bold">
                    {isFree ? 'FREE' : PaymentCalculator.formatCurrency(totalPrice * 100, 'GHS')}
                  </p>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : isFree ? 'Get Free Ticket' : 'Confirm Booking'}
                  </Button>
                </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
