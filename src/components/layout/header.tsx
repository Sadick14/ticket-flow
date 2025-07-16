
"use client";

import Link from 'next/link';
import { Ticket as TicketIcon, Menu, LogOut, LayoutDashboard, Shield, PlusCircle, Home, Newspaper, DollarSign } from 'lucide-react';
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
    <Button variant="ghost" className="w-full justify-start text-left h-12 gap-3 text-white hover:bg-white/10 hover:text-white" onClick={onClick}>{children}</Button>
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
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback className="bg-orange-500 text-white">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border-white/20" align="end" forceMount>
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
            <DropdownMenuItem>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            {user.isAdmin && (
            <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <Link href="/admin">Admin</Link>
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-sm border-b border-white/10 safe-area-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white font-headline hover:text-orange-400 transition-colors">
              <TicketIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              <span className="hidden xs:inline">TicketFlow</span>
              <span className="xs:hidden">TF</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-orange-400">
              <Link href="/home">Home</Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-orange-400">
              <Link href="/events">Events</Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-orange-400">
              <Link href="/news">News</Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-orange-400">
              <Link href="/tickets">Tickets</Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-orange-400">
              <Link href="/pricing">Pricing</Link>
            </Button>
          </div>
          
          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
             {user ? (
                <>
                    <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-xl">
                        <Link href="/dashboard/create"><PlusCircle className="mr-2 h-4 w-4" /> Create</Link>
                    </Button>
                    <UserMenu />
                </>
             ) : (
                <Button onClick={signInWithGoogle} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-xl">Sign In</Button>
             )}
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <Button asChild size="sm" variant="outline" className="p-2 xs:px-2 border-white/20 text-white hover:bg-white/10">
                <Link href="/dashboard/create">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden xs:ml-1 xs:inline">Create</span>
                </Link>
              </Button>
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96 p-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-l border-white/10">
                 <SheetHeader className="sr-only">
                  <SheetTitle>Mobile Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Main navigation links for TicketFlow, including pages for home, events, news, tickets, and user account management.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full p-4">
                  <div className="flex justify-between items-center mb-6">
                    <Link href="/home" onClick={closeMobileMenu} className="flex items-center gap-2 text-xl font-bold text-white font-headline hover:text-orange-400 transition-colors">
                      <TicketIcon className="h-6 w-6 text-orange-500" />
                      <span>TicketFlow</span>
                    </Link>
                  </div>
                  
                  <nav className="flex flex-col space-y-2 flex-1">
                    <div className="space-y-1 border-b border-white/10 pb-4 mb-4">
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
                      <NavLink href="/tickets" onClick={closeMobileMenu}>
                        <TicketIcon className="h-5 w-5" />
                        <span>My Tickets</span>
                      </NavLink>
                      <NavLink href="/pricing" onClick={closeMobileMenu}>
                        <DollarSign className="h-5 w-5" />
                        <span>Pricing</span>
                      </NavLink>
                    </div>
                    
                    {user ? (
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback className="bg-orange-500 text-white">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">{user.displayName}</p>
                            <Badge variant="outline" className="mt-1 border-orange-500 text-orange-400">{user.subscriptionPlan} Plan</Badge>
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
                          className="w-full justify-start text-left h-12 gap-3 text-white hover:bg-white/10 hover:text-white"
                          onClick={() => { signOut(); closeMobileMenu(); }}
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-auto">
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-xl" 
                          onClick={() => { signInWithGoogle(); closeMobileMenu(); }}
                        >
                          Sign In with Google
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
