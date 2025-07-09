
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Ticket as TicketIcon, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className="text-base" onClick={onClick}>{children}</Button>
  </Link>
);

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const { user, signInWithGoogle, signOut } = useAuth();

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
             {user ? <UserMenu /> : <Button onClick={signInWithGoogle}>Sign In</Button>}
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
                    {user ? (
                      <>
                        <NavLink href="/dashboard" onClick={closeMobileMenu}>Dashboard</NavLink>
                        <Button onClick={() => { signOut(); closeMobileMenu(); }}>Sign Out</Button>
                      </>
                    ) : (
                      <Button onClick={() => { signInWithGoogle(); closeMobileMenu(); }}>Sign In with Google</Button>
                    )}
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
