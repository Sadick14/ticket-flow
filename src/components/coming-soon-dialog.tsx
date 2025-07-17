
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Loader2, CheckCircle } from 'lucide-react';

interface ComingSoonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const leadFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().optional()
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export function ComingSoonDialog({ isOpen, onOpenChange }: ComingSoonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after a small delay to allow dialog to close
    setTimeout(() => {
      form.reset();
      setIsSubmitted(false);
    }, 300);
  };
  
  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subject: 'Paid Plan Inquiry',
          category: 'Pricing'
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      setIsSubmitted(true);
      toast({
        title: "We'll be in touch!",
        description: "Thanks for your interest. We've received your info.",
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Paid Plans Coming Soon!</DialogTitle>
          <DialogDescription className="mt-2 text-base text-muted-foreground">
            This feature is part of our upcoming paid plans. Leave your details, and we'll notify you as soon as it's live!
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
            <div className="py-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">
                    We've received your information and will be in touch soon.
                </p>
                <Button onClick={handleClose}>Close</Button>
            </div>
        ) : (
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...form.register('name')} />
                    {form.formState.errors.name && <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register('email')} />
                    {form.formState.errors.email && <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea id="message" {...form.register('message')} placeholder="Tell us what you're looking for..."/>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Notify Me
                    </Button>
                </DialogFooter>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
