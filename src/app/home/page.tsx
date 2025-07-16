
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Newspaper, CalendarX, Zap, CreditCard, BarChart, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewsCard } from '@/components/news-card';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PageHero } from '@/components/page-hero';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { events, news, loading, addSubscriber, getTicketsByEvent } = useAppContext();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const availableEvents = useMemo(() => {
    return [...events]
      .filter(event => {
        const ticketsSold = getTicketsByEvent(event.id)?.length || 0;
        const isUpcoming = new Date(event.date) > new Date();
        const hasCapacity = event.capacity > 0;
        const isSoldOut = ticketsSold >= event.capacity;
        return isUpcoming && hasCapacity && !isSoldOut;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by soonest
      .slice(0, 3);
  }, [events, getTicketsByEvent]);

  const latestEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [events]);

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
                    <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-primary hover:bg-white/10 backdrop-blur-sm">
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
        
        {/* Available Tickets Section */}
        <section id="events" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-4">
                🎟️ Grab Your Tickets
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Available Tickets
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Check out these upcoming events with tickets still available.
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
              ) : availableEvents.length > 0 ? (
                 <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {availableEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm">
                  <CalendarX className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">No Tickets Available</h3>
                  <p className="mt-2 text-muted-foreground">All upcoming events are currently sold out or free. Check back soon!</p>
                  <Button asChild size="lg" className="mt-6">
                    <Link href="/create">Host Your Own Event</Link>
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
              <Button asChild variant="outline" size="lg" className="border-white text-primary hover:bg-white/10">
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

        {/* Subscription Section */}
        <section className="py-24 bg-white">
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

// Add this CSS to your globals.css or a style tag if you don't have it already
const dotPatternStyle = `
  .bg-dot-pattern {
    background-image: radial-gradient(circle at 1px 1px, hsla(var(--primary) / 0.2) 1px, transparent 0);
    background-size: 1rem 1rem;
  }
`;
// Note: You would add the dotPatternStyle content to your globals.css file.
