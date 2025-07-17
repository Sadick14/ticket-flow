
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CalendarX } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const categories = ["All Events", "Nightlife & Parties", "Movies & Cinema", "Arts & Theatre", "Food & Drinks", "Networking", "Travel & Outdoor", "Professional", "Health & Wellness"];

export default function EventsPageClient() {
  const { events, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      const matchesCategory = selectedCategory === 'All Events' || event.category === selectedCategory;
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, searchTerm, selectedCategory]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:gap-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <div className="space-y-2 p-2 sm:p-0">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
          <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Events Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or category filters.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:gap-8">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Ghana Events</h1>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search events..."
              className="pl-9 w-full rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select defaultValue="anything">
                <SelectTrigger className="w-auto rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="anything">Anything</SelectItem></SelectContent>
            </Select>
            <Select defaultValue="any-date">
                <SelectTrigger className="w-auto rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="any-date">Any Date</SelectItem></SelectContent>
            </Select>
            <Select defaultValue="any-price">
                <SelectTrigger className="w-auto rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="any-price">Any Price</SelectItem></SelectContent>
            </Select>
            <Select defaultValue="ghana">
                <SelectTrigger className="w-auto rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ghana">Ghana</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        
        {renderContent()}

        <div className="mt-12 text-center">
            <Button size="lg" className="rounded-full bg-black text-white hover:bg-gray-800">
                VIEW MORE EVENTS
            </Button>
        </div>
      </div>
    </div>
  );
}
