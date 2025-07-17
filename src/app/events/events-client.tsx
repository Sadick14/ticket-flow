
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, CalendarX, Sparkles, Pin, Video, CalendarDays, Music, Utensils, Heart } from 'lucide-react';
import type { Event } from '@/lib/types';
import { isPast, isSameDay, isThisWeekend, parseISO, startOfToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


const categories = ["All", "For You", "Online", "Today", "This Weekend", "Music", "Food & Drink", "Charity"];

function EventCarousel({ title, events, loading, icon }: { title: string, events: Event[], loading: boolean, icon: React.ReactNode }) {
    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="flex space-x-4">
                    <Skeleton className="h-96 w-72" />
                    <Skeleton className="h-96 w-72" />
                    <Skeleton className="h-96 w-72" />
                </div>
            </div>
        )
    }

    if (events.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                {icon}
                {title}
            </h2>
            <Carousel opts={{
                align: "start",
                dragFree: true,
            }}
            className="w-full">
                <CarouselContent className="-ml-4">
                    {events.map((event) => (
                        <CarouselItem key={event.id} className="basis-auto pl-4">
                            <div className="w-72">
                                <EventCard event={event} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
            </Carousel>
        </div>
    )
}

export default function EventsPageClient() {
  const { events, loading } = useAppContext();
  const safeEvents = events ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const upcomingEvents = useMemo(() => {
    return safeEvents
        .filter((event: Event) => !isPast(parseISO(`${event.date}T${event.time}`)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [safeEvents]);

  const filteredEvents = useMemo(() => {
    return safeEvents.filter((event: Event) => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              event.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const today = startOfToday();
        const eventDate = parseISO(`${event.date}T${event.time}`);

        let matchesCategory = false;
        switch (selectedCategory) {
            case 'All':
            case 'For You':
                matchesCategory = true;
                break;
            case 'Online':
                matchesCategory = event.venueType === 'online';
                break;
            case 'Today':
                matchesCategory = isSameDay(eventDate, today);
                break;
            case 'This Weekend':
                matchesCategory = isThisWeekend(eventDate);
                break;
            case 'Music':
            case 'Food & Drink':
                matchesCategory = event.category === selectedCategory;
                break;
            case 'Charity':
                 matchesCategory = event.category === 'Business'; // Remapping for demo data
                 break;
            default:
                matchesCategory = true;
        }

        return matchesSearch && matchesCategory;
    });
  }, [safeEvents, searchTerm, selectedCategory]);

  const sections = {
    "In your city": {
        icon: <Pin className="text-primary"/>,
        events: upcomingEvents.filter(e => e.venueType === 'in-person' && e.category !== 'Business').slice(0, 10)
    },
    "Online events": {
        icon: <Video className="text-primary"/>,
        events: upcomingEvents.filter(e => e.venueType === 'online').slice(0, 10)
    },
    "This weekend": {
        icon: <CalendarDays className="text-primary"/>,
        events: upcomingEvents.filter(e => isThisWeekend(parseISO(`${e.date}T${e.time}`))).slice(0, 10)
    },
    "Music": {
        icon: <Music className="text-primary"/>,
        events: upcomingEvents.filter(e => e.category === 'Music').slice(0, 10)
    },
    "Food & Drink": {
        icon: <Utensils className="text-primary"/>,
        events: upcomingEvents.filter(e => e.category === 'Food & Drink').slice(0, 10)
    },
    "Charity events": {
        icon: <Heart className="text-primary"/>,
        events: safeEvents.filter(e => e.category === 'Business').slice(0, 10) // Use safeEvents to include past events
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2 p-2 sm:p-0">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (searchTerm || selectedCategory !== 'All') {
         if (filteredEvents.length === 0) {
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
        )
    }
    
    return (
        <div className="space-y-12">
            {Object.entries(sections).map(([title, {icon, events}]) => (
                <EventCarousel key={title} title={title} events={events} loading={loading} icon={icon}/>
            ))}
        </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="Events for you"
        description="Discover thousands of live events from all over the world."
        height="md"
      />
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
           <div className="mb-12 space-y-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search events, locations, or categories..."
                className="pl-10 w-full h-12 rounded-full shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map(category => (
                    <Button 
                        key={category} 
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                        size="sm"
                        className="rounded-full"
                    >
                        {category}
                    </Button>
                ))}
          </div>
          </div>
          
          {renderContent()}

        </div>
        </div>
    </div>
  );
}
