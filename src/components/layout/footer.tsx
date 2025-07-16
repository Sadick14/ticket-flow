
import Link from 'next/link';
import { Ticket, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white safe-area-bottom">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-bold text-white font-headline">TicketFlow</h3>
            </div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/70 max-w-sm">
              The most elegant platform for event creation and management. Start for free, scale without limits.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase font-headline mb-4">Explore</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/events" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Browse Events</Link></li>
              <li><Link href="/news" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">News</Link></li>
              <li><Link href="/pricing" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Pricing</Link></li>
              <li><Link href="/tickets" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">My Tickets</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase font-headline mb-4">Organize</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/create" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Create Event</Link></li>
              <li><Link href="/dashboard" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase font-headline mb-4">Company</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/about" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase font-headline mb-4">Support</h3>
            <ul className="mt-3 sm:mt-4 space-y-2">
              <li><Link href="/help-center" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Help Center</Link></li>
              <li><Link href="/faq" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm sm:text-base text-white/70 hover:text-orange-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 border-t border-white/20 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-xs sm:text-sm text-white/70 text-center sm:text-left">
            &copy; {new Date().getFullYear()} TicketFlow. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" className="text-white/70 hover:text-orange-400 transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/70 hover:text-orange-400 transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/70 hover:text-orange-400 transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/70 hover:text-orange-400 transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
