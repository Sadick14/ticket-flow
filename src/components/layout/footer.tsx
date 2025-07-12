
import Link from 'next/link';
import { Ticket, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary/90 text-primary-foreground">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase font-headline">TicketFlow</h3>
            <p className="mt-4 text-base text-primary-foreground/70">
              The all-in-one platform for event organizers and attendees.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground/80 tracking-wider uppercase font-headline">Events</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/events" className="text-base text-primary-foreground/70 hover:text-primary-foreground">Browse Events</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground/80 tracking-wider uppercase font-headline">Organize</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/create" className="text-base text-primary-foreground/70 hover:text-primary-foreground">Create Event</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-foreground/80 tracking-wider uppercase font-headline">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-base text-primary-foreground/70 hover:text-primary-foreground">Help Center</a></li>
              <li><a href="#" className="text-base text-primary-foreground/70 hover:text-primary-foreground">Contact Us</a></li>
              <li><a href="#" className="text-base text-primary-foreground/70 hover:text-primary-foreground">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-primary-foreground/70 text-center md:text-left">
            &copy; {new Date().getFullYear()} TicketFlow. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
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
