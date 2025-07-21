

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { BookOpen, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/courses" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="inline-block font-bold">Courses</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                href="/courses"
                className={`flex items-center text-sm font-medium transition-colors hover:text-foreground/80 ${
                  pathname === '/courses' ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                All Courses
              </Link>
              <Link
                href="/my-learning"
                className={`flex items-center text-sm font-medium transition-colors hover:text-foreground/80 ${
                  pathname === '/my-learning' ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                My Learning
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {user ? (
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
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Ticketing Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild><Link href="/home">Sign In</Link></Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
