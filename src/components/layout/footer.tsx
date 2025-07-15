
import Link from 'next/link';
import { Ticket, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary/90 text-primary-foreground safe-area-bottom">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase font-headline">TicketFlow</h3>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-primary-foreground/70 max-w-sm">
              The all-in-one platform for event organizers and attendees.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground/80 tracking-wider uppercase font-headline">Explore</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/events" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">Browse Events</Link></li>
              <li><Link href="/news" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">News</Link></li>
              <li><Link href="/pricing" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground/80 tracking-wider uppercase font-headline">Organize</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/create" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">Create Event</Link></li>
              <li><Link href="/dashboard" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground/80 tracking-wider uppercase font-headline">Support</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/help-center" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/faq" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm sm:text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 border-t border-primary-foreground/20 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-xs sm:text-sm text-primary-foreground/70 text-center sm:text-left">
            &copy; {new Date().getFullYear()} TicketFlow. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
