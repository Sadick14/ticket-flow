
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { BookOpen, User } from 'lucide-react';

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/courses" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="inline-block font-bold">Courses</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
               <Button variant="ghost" asChild>
                <Link href="/courses">Home</Link>
              </Button>
              {user && (
                 <Button variant="ghost" asChild>
                  <Link href="/my-learning">My Learning</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
