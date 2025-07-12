
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Newspaper, Share2 } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import type { NewsArticle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

function NewsCard({ article }: { article: NewsArticle }) {
  const { toast } = useToast();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article: ${article.title}`,
        url: `${window.location.origin}/news/${article.id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/news/${article.id}`);
      toast({
        title: "Link Copied",
        description: "Article link copied to clipboard.",
      });
    }
  }
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full">
      <Link href={`/news/${article.id}`} className="block relative h-48 w-full">
        <Image src={article.imageUrl} alt={article.title} layout="fill" objectFit="cover" data-ai-hint="news article" />
      </Link>
      <CardHeader>
        <CardTitle className="font-headline text-lg line-clamp-2">
           <Link href={`/news/${article.id}`} className="hover:text-primary transition-colors">{article.title}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground pt-1">{article.source} &bull; {format(new Date(article.publishedDate), 'MMM dd, yyyy')}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/news/${article.id}`}>
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Home() {
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
            src="https://placehold.co/1600x900.png"
            alt="An exciting event background"
            fill
            className="object-cover -z-20"
            data-ai-hint="event concert"
            priority
          />
          <div className="absolute inset-0 bg-black/50 -z-10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-headline">
                Where Events Come to Life
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/90">
                The all-in-one platform for event organizers and attendees. Buy tickets, manage events, and track attendance seamlessly.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button asChild size="lg">
                  <Link href="/events">
                    Browse Events
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/create">
                    Create an Event
                  </Link>
                </Button>
              </div>
          </div>
        </section>


        {/* Featured Events Section */}
        <section id="events" className="py-16 sm:py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase font-headline">Newest Events</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                Don&apos;t miss these exciting new events
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                Check out the latest events added to our platform.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
            
            <div className="mt-16 text-center">
                <Button asChild size="lg">
                    <Link href="/events">View All Events</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* In The News Section */}
        <section id="news" className="py-16 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase font-headline">In The News</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                Featured Events From Around the Web
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                Discover trending events curated by our team to keep you in the loop.
              </p>
            </div>

            <div className="mt-12">
              {loading ? (
                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {news.slice(0, 3).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No News Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Check back soon for curated events and news from around the web!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
