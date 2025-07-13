'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, CalendarX } from 'lucide-react';
import type { Event } from '@/lib/types';
import { isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

const categories = ["All", "Music", "Sports", "Food & Drink", "Arts & Theater", "Technology", "Business", "Other"];

export default function EventsPageClient() {
  const { events, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    const upcoming = events
      .filter((event: Event) => {
        const eventDate = parseISO(`${event.date}T${event.time}`);
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        return !isPast(eventDate) && matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const past = events
      .filter((event: Event) => {
        const eventDate = parseISO(`${event.date}T${event.time}`);
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        return isPast(eventDate) && matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { upcoming, past };

  }, [events, searchTerm, selectedCategory]);

  const renderEventList = (eventList: Event[]) => {
    if (loading) {
      return (
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
      )
    }
    
    if (eventList.length > 0) {
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {eventList.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )
    }

    return (
       <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Events Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or category filters.
          </p>
        </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          Browse Events
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Find your next experience. Filter by category or search by name.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for an event..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="upcoming">
          <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
              <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map(category => (
                    <Button 
                        key={category} 
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
              </div>
          </div>
          <TabsContent value="upcoming" className="mt-8">
            {renderEventList(filteredEvents.upcoming)}
          </TabsContent>
          <TabsContent value="past" className="mt-8">
            {renderEventList(filteredEvents.past)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
