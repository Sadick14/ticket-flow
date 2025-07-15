
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Newspaper, CalendarX } from 'lucide-react';
import { useMemo } from 'react';
import { NewsCard } from '@/components/news-card';

export default function HomePage() {
  const { events, news, loading } = useAppContext();

  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [events]);

  return (
    <>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
          <Image
            src="/women-s-panel-discussion.jpg"
            alt="An exciting event background"
            fill
            className="object-cover -z-20"
            data-ai-hint="event concert"
            priority
          />
          <div className="absolute inset-0 bg-black/50 -z-10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-headline">
                Where Events Come to Life
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
                The all-in-one platform for event organizers and attendees. Buy tickets, manage events, and track attendance seamlessly.
              </p>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Button asChild size="default" className="w-full sm:w-auto">
                  <Link href="/events">
                    Browse Events
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button asChild size="default" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/create">
                    Create an Event
                  </Link>
                </Button>
              </div>
          </div>
        </section>


        {/* Featured Events Section */}
        <section id="events" className="py-12 sm:py-16 lg:py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-sm sm:text-base text-primary font-semibold tracking-wide uppercase font-headline">Newest Events</h2>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-headline">
                Don&apos;t miss these exciting new events
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-muted-foreground">
                Check out the latest events added to our platform.
              </p>
            </div>

            <div className="mt-8 sm:mt-12">
              {loading ? (
                <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
                      <div className="space-y-2 p-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentEvents.length > 0 ? (
                 <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {recentEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
              ) : (
                <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-lg">
                  <CalendarX className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-base sm:text-lg font-medium text-foreground">No Events Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Check back soon for new and exciting events!</p>
                </div>
              )}
            </div>
            
            {recentEvents.length > 0 && (
              <div className="mt-12 sm:mt-16 text-center">
                  <Button asChild size="default" className="w-full sm:w-auto">
                      <Link href="/events">View All Events</Link>
                  </Button>
              </div>
            )}
          </div>
        </section>

        {/* In The News Section */}
        <section id="news" className="py-12 sm:py-16 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-sm sm:text-base text-primary font-semibold tracking-wide uppercase font-headline">In The News</h2>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-headline">
                Featured Events From Around the Web
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-muted-foreground">
                Discover trending events curated by our team to keep you in the loop.
              </p>
            </div>

            <div className="mt-8 sm:mt-12">
              {loading ? (
                 <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
                      <div className="space-y-2 p-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {news.slice(0, 3).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-lg">
                  <Newspaper className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-base sm:text-lg font-medium text-foreground">No News Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Check back soon for curated events and news from around the web!</p>
                </div>
              )}
            </div>

             {news.length > 0 && (
              <div className="mt-12 sm:mt-16 text-center">
                  <Button asChild size="default" className="w-full sm:w-auto">
                      <Link href="/news">View All News</Link>
                  </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
