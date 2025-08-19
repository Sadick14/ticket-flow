
"use client";

import Link from 'next/link';
import { Ticket as TicketIcon, Menu, LogOut, LayoutDashboard, Shield, PlusCircle, Home, Newspaper, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className="w-full justify-start text-left h-12 gap-3" onClick={onClick}>{children}</Button>
  </Link>
);

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const { user, signInWithGoogle, signOut } = useAuth();

  const UserMenu = () => {
    if (!user) return null;
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {user.email}
                </p>
                <Badge variant="outline" className="mt-1 w-fit">{user.subscriptionPlan} Plan</Badge>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            {user.isAdmin && (
            <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
            </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
  };

  const handleSignIn = () => {
    signInWithGoogle();
    closeMobileMenu();
  };

  const handleSignOut = () => {
    signOut();
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm safe-area-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary font-headline hover:opacity-80 transition-opacity">
              <TicketIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden xs:inline">TicketFlow</span>
              <span className="xs:hidden">TF</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="/home">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/events">Events</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/news">News</Link>
            </Button>
             <Button variant="ghost" asChild>
              <Link href="/create">For Organizers</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
             <Button variant="ghost" asChild>
              <Link href="/tickets">My Tickets</Link>
            </Button>
          </div>
          
          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
             {user ? (
                <>
                    <Button asChild size="sm">
                        <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                    </Button>
                    <UserMenu />
                </>
             ) : (
                <div className="flex items-center gap-2">
                    <Button onClick={signInWithGoogle} size="sm" variant="ghost">Sign In</Button>
                    <Button asChild size="sm">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
             )}
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            {user && <UserMenu />}
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96 p-0">
                 <SheetHeader className="sr-only">
                  <SheetTitle>Mobile Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Main navigation links for TicketFlow, including pages for home, events, news, and user account management.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full p-4">
                  <div className="flex justify-between items-center mb-6">
                    <Link href="/home" onClick={closeMobileMenu} className="flex items-center gap-2 text-xl font-bold text-primary font-headline">
                      <TicketIcon className="h-6 w-6" />
                      <span>TicketFlow</span>
                    </Link>
                  </div>
                  
                  <nav className="flex flex-col space-y-2 flex-1">
                    <div className="space-y-1 border-b pb-4 mb-4">
                      <NavLink href="/home" onClick={closeMobileMenu}>
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                      </NavLink>
                      <NavLink href="/events" onClick={closeMobileMenu}>
                        <TicketIcon className="h-5 w-5" />
                        <span>Browse Events</span>
                      </NavLink>
                      <NavLink href="/news" onClick={closeMobileMenu}>
                        <Newspaper className="h-5 w-5" />
                        <span>News</span>
                      </NavLink>
                       <NavLink href="/create" onClick={closeMobileMenu}>
                        <PlusCircle className="h-5 w-5" />
                        <span>For Organizers</span>
                      </NavLink>
                      <NavLink href="/pricing" onClick={closeMobileMenu}>
                        <DollarSign className="h-5 w-5" />
                        <span>Pricing</span>
                      </NavLink>
                       <NavLink href="/tickets" onClick={closeMobileMenu}>
                        <TicketIcon className="h-5 w-5" />
                        <span>My Tickets</span>
                      </NavLink>
                    </div>
                    
                    {user ? (
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.displayName}</p>
                            <Badge variant="outline" className="mt-1">{user.subscriptionPlan} Plan</Badge>
                          </div>
                        </div>
                        
                        <NavLink href="/dashboard" onClick={closeMobileMenu}>
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Dashboard</span>
                        </NavLink>
                        
                        {user.isAdmin && (
                          <NavLink href="/admin" onClick={closeMobileMenu}>
                            <Shield className="h-5 w-5" />
                            <span>Admin</span>
                          </NavLink>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left h-12 gap-3"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-auto space-y-2">
                        <Button 
                          className="w-full" 
                          onClick={handleSignIn}
                        >
                          Sign In
                        </Button>
                         <Button 
                          className="w-full"
                          variant="outline"
                          asChild
                          onClick={closeMobileMenu}
                        >
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </div>
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
