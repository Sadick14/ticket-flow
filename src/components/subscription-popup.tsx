
'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle, X } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { motion, AnimatePresence } from 'framer-motion';

const subscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export function SubscriptionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { addSubscriber } = useAppContext();

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
  });

  useEffect(() => {
    const sessionKey = 'subscriptionPopupShown';
    const hasBeenShown = sessionStorage.getItem(sessionKey);
    
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(sessionKey, 'true');
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      form.reset();
      setIsSubmitted(false);
    }, 300);
  };
  
  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsSubmitting(true);
    try {
      await addSubscriber(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      if (error.message.includes('already subscribed')) {
        setIsSubmitted(true); // Treat as success
      } else {
        toast({
          variant: 'destructive',
          title: 'Subscription Failed',
          description: 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent 
            className="sm:max-w-md p-0 overflow-hidden" 
            as={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button 
              onClick={handleClose} 
              className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="p-8 text-center">
              {isSubmitted ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">You're In!</DialogTitle>
                    <DialogDescription className="mt-2 text-base text-muted-foreground">
                      Thanks for subscribing. Keep an eye on your inbox for updates.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-6">
                    <Button onClick={handleClose} className="w-full">Close</Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Don't Miss Out!</DialogTitle>
                    <DialogDescription className="mt-2 text-base text-muted-foreground">
                      Subscribe to our newsletter for the latest event updates, new features, and special offers.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-popup" className="sr-only">Email</Label>
                      <Input id="email-popup" type="email" placeholder="Enter your email address" {...form.register('email')} />
                      {form.formState.errors.email && <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>}
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Subscribe Now
                      </Button>
                    </DialogFooter>
                  </form>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
