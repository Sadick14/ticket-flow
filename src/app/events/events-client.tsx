
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, CalendarX, ArrowRight, Building, Users } from 'lucide-react';
import type { Event, Organization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryFilters } from '@/components/category-filters';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function EventsPageClient() {
  const { events, organizations, users, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      const matchesCategory = activeCategory === 'All Events' || event.category === activeCategory;
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, searchTerm, activeCategory]);

  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEvents]);

  const recentEvents = useMemo(() => {
    return [...filteredEvents]
      .filter(event => new Date(event.date) < new Date())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredEvents]);
  
  const staffPicks = useMemo(() => upcomingEvents.slice(0, 10), [upcomingEvents]);
  const popularEvents = useMemo(() => [...upcomingEvents].reverse().slice(0, 10), [upcomingEvents]);


  const renderEventGrid = (eventsToShow: Event[], noEventsMessage: string) => {
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

    if (eventsToShow.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
          <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">{noEventsMessage}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or category filters.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:gap-8">
        {eventsToShow.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <PageHero
        title="Discover Your Next Experience"
        backgroundImage="/event.jpg"
        description="Browse thousands of events, from local meetups to global conferences. Your next adventure awaits."
        height="lg"
      />
      
      {/* Organizations Carousel */}
      <section className="py-16 bg-background">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">Featured Organizers</h2>
              <p className="text-muted-foreground mt-1">Discover events from our top organizers.</p>
            </div>
            {loading ? (
                <div className="flex space-x-4">
                    {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-40 w-64 rounded-lg"/>)}
                </div>
            ) : organizations.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent>
                {organizations.map((org) => {
                  const followers = (org.followerIds || []).map(id => users.find(u => u.uid === id)).filter(Boolean);
                  return (
                  <CarouselItem key={org.id} className="basis-auto">
                    <Link href={`/organization/${org.id}`}>
                      <Card className="w-64 h-40 p-4 flex flex-col justify-between hover:bg-muted transition-colors">
                          <div className="flex items-start gap-4">
                            <Image src={org.logoUrl || 'https://placehold.co/64x64.png'} alt={org.name} width={48} height={48} className="rounded-md object-cover h-12 w-12"/>
                            <div className="flex-1">
                                <p className="font-semibold truncate">{org.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{org.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm font-medium">{followers.length}</span>
                            </div>
                            <div className="flex -space-x-2">
                                {followers.slice(0, 3).map(f => f && (
                                    <Avatar key={f.uid} className="h-6 w-6 border-2 border-background">
                                        <AvatarImage src={f.photoURL || ''} />
                                        <AvatarFallback>{f.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                          </div>
                      </Card>
                    </Link>
                  </CarouselItem>
                )})}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
             ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg col-span-full">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No Organizations Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Event organizers will be featured here.
                    </p>
                </div>
            )}
          </div>
        </section>


      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">All Events</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                placeholder="Search events by name or location..."
                className="pl-9 w-full rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="mb-8">
            <CategoryFilters
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />
        </div>
        
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
            <TabsList className="mb-6">
                <TabsTrigger value="staff-picks">Staff Picks</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="staff-picks">{renderEventGrid(staffPicks, "No Staff Picks Found")}</TabsContent>
            <TabsContent value="popular">{renderEventGrid(popularEvents, "No Popular Events Found")}</TabsContent>
            <TabsContent value="upcoming">{renderEventGrid(upcomingEvents, "No Upcoming Events Found")}</TabsContent>
            <TabsContent value="recent">{renderEventGrid(recentEvents, "No Recent Events Found")}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
