
"use client";

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, CalendarX, ArrowRight } from 'lucide-react';
import type { Event, NewsArticle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryFilters } from '@/components/category-filters';
import { NewsCard } from './news-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

export default function HomePageClient() {
  const { events, news, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Events');

  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => new Date(event.date) >= new Date())
      .filter(event => 
        (activeCategory === 'All Events' || event.category === activeCategory) &&
        (event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchTerm, activeCategory]);

  const allContent = useMemo(() => {
    const combined = [
      ...news.map(item => ({ ...item, type: 'news' as const, date: new Date(item.publishedDate) })),
      ...upcomingEvents.map(item => ({ ...item, type: 'event' as const, date: new Date(item.date) }))
    ];
    
    return combined
      .filter(item => 
        (item.title || item.name).toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());

  }, [news, upcomingEvents, searchTerm]);

  return (
    <div className="min-h-screen bg-muted/40">
      <PageHero
        title="Never Miss a Beat"
        description="Your hub for all events in Ghana and beyond. Discover what's happening now."
        height="xl"
        overlay="dark"
      >
        <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-sm p-2 rounded-full">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 h-5 w-5 text-gray-300" />
                    <Input 
                        placeholder="Search events by name or location..."
                        className="pl-12 pr-28 h-12 w-full rounded-full bg-transparent text-white placeholder:text-gray-300 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                        <Button asChild size="lg" className="rounded-full">
                          <Link href={`/events?search=${searchTerm}`}>Find Events</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </PageHero>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Discover Events Happening in Ghana
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            Explore our curated feed of events and industry news.
          </p>
        </div>

        <div className="mb-8">
            <CategoryFilters
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />
        </div>
        
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : allContent.length > 0 ? (
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {allContent.map((item) => (
                item.type === 'news' 
                  ? <NewsCard key={`news-${item.id}`} article={item as NewsArticle} />
                  : <EventCard key={`event-${item.id}`} event={item as Event} />
              ))}
            </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
            <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No Events or News Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or category filters.
            </p>
          </div>
        )}

      </div>
       <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-8 md:p-12 bg-primary text-primary-foreground shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Ready to Host? Our Audience is Waiting.</CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-2 text-lg">
                  Join a growing community of organizers and share your event with our engaged audience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" variant="secondary">
                <Link href="/create">Host an Event</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
       </section>
    </div>
  );
}
