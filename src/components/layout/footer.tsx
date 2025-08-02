
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ticket, Facebook, Twitter, Instagram, Linkedin, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }
      toast({
        title: 'Subscribed!',
        description: data.message || "Thanks for subscribing!",
      });
      setEmail('');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Subscription failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <footer className="bg-gray-900 text-white safe-area-bottom">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            <div className="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-2 space-y-4">
               <div className="flex items-center gap-2 mb-4">
                  <Ticket className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-bold text-white font-headline">TicketFlow</h3>
                </div>
                <p className="text-sm text-gray-400 max-w-sm">
                  The most elegant platform for event creation and management. Start for free, scale without limits.
                </p>
                <div className="flex space-x-4 sm:space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
            </div>

            <div className="col-span-1">
                 <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase font-headline mb-4">Explore</h3>
                <ul className="mt-3 sm:mt-4 space-y-2">
                  <li><Link href="/events" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Browse Events</Link></li>
                  <li><Link href="/news" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">News</Link></li>
                  <li><Link href="/pricing" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/my-page" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">My Page</Link></li>
                </ul>
            </div>
             <div className="col-span-1">
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase font-headline mb-4">Organize</h3>
                <ul className="mt-3 sm:mt-4 space-y-2">
                  <li><Link href="/create" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Create Event</Link></li>
                  <li><Link href="/dashboard" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
            </div>
            
            <div className="col-span-1 md:col-span-2 xl:col-span-2">
               <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase font-headline mb-4">Stay Updated</h3>
                <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for the latest events and news.</p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                  </Button>
                </form>
            </div>
        </div>

        <div className="mt-8 sm:mt-12 border-t border-gray-700 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TicketFlow. All rights reserved. • 
            <Link href="/privacy" className="hover:text-white mx-2">Privacy Policy</Link> • 
            <Link href="/terms" className="hover:text-white mx-2">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
