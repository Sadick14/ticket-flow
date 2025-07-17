

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Newspaper, CalendarX, Zap, CreditCard, BarChart, Mail, PenSquare, Ticket, Users as UsersIcon, Search, CheckCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewsCard } from '@/components/news-card';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryFilters } from '@/components/category-filters';


export default function HomePage() {
  const { events, news, loading, addSubscriber } = useAppContext();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('All Events');

  const filteredEvents = useMemo(() => {
    return activeCategory === 'All Events'
      ? events
      : events.filter(event => event.category === activeCategory);
  }, [events, activeCategory]);

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
  
  // For demo purposes, we'll use upcoming for staff picks and popular
  const staffPicks = useMemo(() => upcomingEvents.slice(0, 8), [upcomingEvents]);
  const popularEvents = useMemo(() => [...upcomingEvents].reverse().slice(0, 8), [upcomingEvents]);


  const featureCards = [
    {
      icon: Zap,
      title: "Easy Event Creation",
      description: "Create beautiful event pages in minutes with our AI-powered description generator and intuitive interface.",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Integrate with Stripe, PayPal, and more to offer secure, multi-gateway payment options for your attendees.",
    },
    {
      icon: BarChart,
      title: "Real-time Analytics",
      description: "Track ticket sales, attendee demographics, and marketing performance with our powerful analytics dashboard.",
    }
  ];

  const organizerSteps = [
    {
      icon: PenSquare,
      step: "Step 1",
      title: "Create Your Event",
      description: "Use our simple form to create a stunning event page in minutes. Add all the details, from speakers to schedules."
    },
    {
      icon: Ticket,
      step: "Step 2",
      title: "Sell Tickets",
      description: "Set your ticket prices, manage capacity, and start selling immediately with our secure, integrated payment system."
    },
    {
      icon: UsersIcon,
      step: "Step 3",
      title: "Manage & Engage",
      description: "Track your sales in real-time, check in attendees with our scanner, and send updates to build excitement."
    }
  ];

  const attendeeSteps = [
    {
      icon: Search,
      step: "Step 1",
      title: "Discover Events",
      description: "Explore a wide variety of events. Use our powerful search and filters to find your next great experience."
    },
    {
      icon: CreditCard,
      step: "Step 2",
      title: "Purchase Securely",
      description: "Buy tickets in just a few clicks with our secure and reliable payment system. Your tickets are delivered instantly."
    },
    {
      icon: CheckCircle,
      step: "Step 3",
      title: "Enjoy the Event",
      description: "Access your tickets easily from your email or our app. Simply show your QR code at the event for seamless entry."
    }
  ];

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    try {
      await addSubscriber(email);
      toast({
        title: "Subscribed!",
        description: "Thanks for joining our mailing list.",
      });
      setEmail('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Failed to subscribe",
        description: "Please try again later.",
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const renderEventGrid = (eventsToShow: any[]) => {
    if (loading) {
      return (
        <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      );
    }

    if (eventsToShow.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
          <CalendarX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Events Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no events matching the selected criteria.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {eventsToShow.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };


  return (
    <>
      <div className="w-full">
        {/* Hero Section with Video Background */}
         <section className="relative h-screen min-h-[600px] md:min-h-[800px] flex items-center justify-center text-center text-white overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover -z-20"
                poster="/women-s-panel-discussion.jpg"
            >
                <source src="https://cdn.coverr.co/videos/coverr-a-crowd-of-people-at-a-concert-4186/1080p.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/75 -z-10" />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="space-y-8">
                <div className="space-y-6">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                    <span className="block text-white/90 font-light text-3xl sm:text-4xl lg:text-5xl mb-4">
                        The Future of
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                        Event Management
                    </span>
                    </h1>
                    <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
                    TicketFlow provides powerful tools for event organizers to create, manage, and promote unforgettable experiences.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <Button asChild size="lg">
                    <Link href="/create">
                        Start Creating
                    </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                    <Link href="/events">
                        Explore Events
                    </Link>
                    </Button>
                </div>
                </div>
            </motion.div>
        </section>

        {/* Stats Section */}
        <section className="bg-background py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="p-4">
                <div className="text-4xl font-bold text-primary">10K+</div>
                <div className="text-muted-foreground mt-1">Events Hosted</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-primary">500K+</div>
                <div className="text-muted-foreground mt-1">Tickets Sold</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-primary">50K+</div>
                <div className="text-muted-foreground mt-1">Happy Organizers</div>
              </div>
              <div className="p-4">
                <div className="text-4xl font-bold text-primary">20+</div>
                <div className="text-muted-foreground mt-1">Countries Served</div>
              </div>
            </div>
          </div>
        </section>


        {/* Feature Showcase Section */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Why Choose TicketFlow?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We provide a comprehensive suite of tools designed to make your events successful and your life easier.
              </p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center transition-transform duration-300 hover:-translate-y-2">
                     <CardHeader className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                How TicketFlow Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Simple for organizers, seamless for attendees.
              </p>
            </div>
            
            <Tabs defaultValue="organizers" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList>
                  <TabsTrigger value="organizers">For Organizers</TabsTrigger>
                  <TabsTrigger value="attendees">For Attendees</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="organizers">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block" aria-hidden="true"></div>
                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {organizerSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                        viewport={{ once: true }}
                        className="text-center bg-background p-8 rounded-xl shadow-lg border"
                      >
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20">
                              <step.icon className="h-8 w-8" />
                            </div>
                        </div>
                        <p className="font-semibold text-primary mb-2">{step.step}</p>
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="attendees">
                 <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block" aria-hidden="true"></div>
                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {attendeeSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                        viewport={{ once: true }}
                        className="text-center bg-background p-8 rounded-xl shadow-lg border"
                      >
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20">
                              <step.icon className="h-8 w-8" />
                            </div>
                        </div>
                        <p className="font-semibold text-primary mb-2">{step.step}</p>
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* New Event Discovery Section */}
        <section id="events" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Discover Your Next Experience
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Browse our curated selections of popular and upcoming events, or filter by your favorite category.
              </p>
            </div>
            <CategoryFilters
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
            <Tabs defaultValue="staff-picks" className="w-full mt-8">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="staff-picks">Staff Picks</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
                <Button variant="link" asChild className="hidden sm:inline-flex">
                  <Link href="/events">
                    See More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <TabsContent value="staff-picks">{renderEventGrid(staffPicks)}</TabsContent>
              <TabsContent value="popular">{renderEventGrid(popularEvents)}</TabsContent>
              <TabsContent value="upcoming">{renderEventGrid(upcomingEvents)}</TabsContent>
              <TabsContent value="recent">{renderEventGrid(recentEvents)}</TabsContent>
            </Tabs>
            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/events">Find More Events</Link>
              </Button>
            </div>
          </div>
        </section>


        {/* News Section */}
        <section className="py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-4">
                📰 Latest Updates
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                News & Industry Insights
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Stay informed with the latest trends and stories from the event world.
              </p>
            </div>
            {loading ? (
              <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : news.length > 0 ? (
              <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {news.slice(0, 3).map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p>No news articles available yet.</p>
              </div>
            )}
            <div className="mt-16 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/news">
                  Read More News <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="py-24 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Stay in the Loop
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Subscribe to our newsletter for the latest event updates, new features, and special offers.
            </p>
            <form onSubmit={handleSubscription} className="mt-6 flex max-w-md gap-x-4 mx-auto">
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-foreground shadow-sm ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Enter your email"
              />
              <Button type="submit" disabled={isSubscribing}>
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
