
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Newspaper, CalendarX, Zap, CreditCard, BarChart } from 'lucide-react';
import { useMemo } from 'react';
import { NewsCard } from '@/components/news-card';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PageHero } from '@/components/page-hero';

export default function HomePage() {
  const { events, news, loading } = useAppContext();

  const featuredEvents = useMemo(() => {
    return [...events]
      .filter(event => new Date(event.date) > new Date())
      .sort((a, b) => (b.capacity - (getTicketsByEvent(b.id)?.length || 0)) - (a.capacity - (getTicketsByEvent(a.id)?.length || 0)))
      .slice(0, 3);
  }, [events]);

  const latestEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [events]);

  const getTicketsByEvent = (eventId: string) => {
    // This function should be part of your context, here's a placeholder
    return [];
  };

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

  return (
    <>
      <div className="w-full">
        {/* Hero Section with Video Background */}
        <PageHero
            title="Event Management"
            subtitle="The Future of"
            description="TicketFlow provides powerful tools for event organizers to create, manage, and promote unforgettable experiences."
            backgroundVideo="https://cdn.coverr.co/videos/coverr-a-crowd-of-people-at-a-concert-4186/1080p.mp4"
            ctaText="Start Creating"
            ctaLink="/create"
            secondaryCtaText="Explore Events"
            secondaryCtaLink="/events"
        />

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
        
        {/* Featured Events Section */}
        <section id="events" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-4">
                🔥 Trending Now
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Featured Events
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Check out the hottest events on our platform. Don't miss out!
              </p>
            </div>
            <div className="mt-16">
              {loading ? (
                <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                      <Skeleton className="h-48 w-full rounded-xl" />
                      <div className="space-y-2 p-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredEvents.length > 0 ? (
                 <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm">
                  <CalendarX className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">No Featured Events Yet</h3>
                  <p className="mt-2 text-muted-foreground">Check back soon for new and exciting events!</p>
                  <Button asChild size="lg" className="mt-6">
                    <Link href="/create">Create Your First Event</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Something Amazing?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of creators and start building your next successful event with TicketFlow.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link href="/create">Start Creating</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Latest Events Section */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Latest Events
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover the newest additions to our platform.
              </p>
            </div>
            {loading ? (
              <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {latestEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
            <div className="mt-16 text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/events">
                  Explore All Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="py-24 bg-muted/30">
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

         {/* Final CTA */}
        <section className="relative py-24 bg-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary to-accent opacity-90"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h2 className="text-4xl font-bold mb-4">Your Next Event Starts Here</h2>
             <p className="text-xl text-white/80 mb-8">
               Trusted by thousands of event organizers worldwide. Join the community and start creating today.
             </p>
             <div className="flex justify-center gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                  <Link href="/create">Create Event</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Link href="/events">Explore Events</Link>
                </Button>
              </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Add this CSS to your globals.css or a style tag if you don't have it already
const dotPatternStyle = `
  .bg-dot-pattern {
    background-image: radial-gradient(circle at 1px 1px, hsla(var(--primary) / 0.2) 1px, transparent 0);
    background-size: 1rem 1rem;
  }
`;
// Note: You would add the dotPatternStyle content to your globals.css file.
