"use client";

import Link from 'next/link';
import { Ticket as TicketIcon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className="text-base" onClick={onClick}>{children}</Button>
  </Link>
);

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary font-headline">
              <TicketIcon className="h-6 w-6" />
              <span>TicketFlow</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/create">Create Event</NavLink>
            <NavLink href="/tickets">My Tickets</NavLink>
          </div>
          <div className="hidden md:flex items-center">
             <Button>Sign In</Button>
          </div>
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2 text-xl font-bold text-primary font-headline">
                      <TicketIcon className="h-6 w-6" />
                      <span>TicketFlow</span>
                    </Link>
                    <SheetClose asChild>
                       <Button variant="ghost" size="icon"><X className="h-6 w-6" /></Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    <NavLink href="/" onClick={closeMobileMenu}>Home</NavLink>
                    <NavLink href="/create" onClick={closeMobileMenu}>Create Event</NavLink>
                    <NavLink href="/tickets" onClick={closeMobileMenu}>My Tickets</NavLink>
                    <Button onClick={closeMobileMenu}>Sign In</Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
