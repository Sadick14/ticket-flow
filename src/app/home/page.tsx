
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
        {/* Hero Section with Video Background */}
        <section className="relative h-screen min-h-[800px] flex items-center justify-center text-center text-white overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -z-20"
            poster="/women-s-panel-discussion.jpg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            <source src="/hero-video.webm" type="video/webm" />
          </video>
          
          {/* Fallback Image */}
          <Image
            src="/women-s-panel-discussion.jpg"
            alt="Event background"
            fill
            className="absolute inset-0 object-cover -z-10"
            priority
          />
          
          {/* Elegant Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/30 to-black/80 -z-5" />
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight">
                  <span className="block text-white font-light">Create. Share.</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 font-bold">
                    Experience.
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
                  The most elegant platform for event creation and management. Start for free, scale without limits.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-12 py-6 text-xl font-medium rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Link href="/create">
                    Start Creating
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-medium rounded-2xl backdrop-blur-sm">
                  <Link href="/events">
                    Explore Events
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-8">
                <span className="block">Simple, Transparent</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Pricing
                </span>
              </h2>
              <p className="text-2xl text-slate-600 max-w-4xl mx-auto font-light">
                Choose the perfect plan for your event needs. Start free, upgrade when you grow.
              </p>
            </div>

            <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-3 mt-20">
              {/* Free Plan */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Free</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">$0</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                  <p className="text-slate-600 mb-8">Perfect for getting started</p>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Unlimited free events
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Basic event management
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Community support
                    </li>
                  </ul>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-medium">
                    Get Started
                  </Button>
                </div>
              </div>

              {/* Essential Plan */}
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl transform scale-105 hover:scale-110 transition-all duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-400 text-white px-6 py-2 rounded-full text-sm font-bold">MOST POPULAR</span>
                </div>
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Essential</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">$29</span>
                    <span className="text-purple-200">/month</span>
                  </div>
                  <p className="text-purple-200 mb-8">For growing event organizers</p>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Everything in Free
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Paid ticket sales (2% fee)
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Advanced analytics
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Priority support
                    </li>
                  </ul>
                  <Button className="w-full bg-white text-purple-600 hover:bg-purple-50 py-4 rounded-2xl font-medium">
                    Start Essential
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Pro</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">$99</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                  <p className="text-slate-600 mb-8">For professional organizers</p>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Everything in Essential
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Reduced fees (1% only)
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      White-label branding
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      API access
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Dedicated support
                    </li>
                  </ul>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-medium">
                    Start Pro
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Featured Events Section */}
        <section id="events" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                <span className="block">Newest Events</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Don't Miss These Exciting Experiences
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Check out the latest events added to our platform. From tech conferences to music festivals, find your perfect experience.
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
              ) : recentEvents.length > 0 ? (
                 <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {recentEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm">
                  <CalendarX className="mx-auto h-16 w-16 text-slate-400" />
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">No Events Yet</h3>
                  <p className="mt-2 text-slate-600">Check back soon for new and exciting events!</p>
                  <Button asChild size="lg" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
                    <Link href="/create">Create Your First Event</Link>
                  </Button>
                </div>
              )}
            </div>
            
            {recentEvents.length > 0 && (
              <div className="mt-16 text-center">
                  <Button asChild size="lg" className="bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 hover:bg-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg">
                      <Link href="/events">
                        View All Events
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                  </Button>
              </div>
            )}
          </div>
        </section>

        {/* In The News Section */}
        <section id="news" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                <span className="block">In The News</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Featured Events From Around the Web
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Discover trending events curated by our team to keep you in the loop with the latest happenings.
              </p>
            </div>

            <div className="mt-16">
              {loading ? (
                 <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-lg">
                      <Skeleton className="h-48 w-full rounded-xl" />
                      <div className="space-y-2 p-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {news.slice(0, 3).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50">
                  <Newspaper className="mx-auto h-16 w-16 text-slate-400" />
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">No News Yet</h3>
                  <p className="mt-2 text-slate-600">Check back soon for curated events and news from around the web!</p>
                </div>
              )}
            </div>

             {news.length > 0 && (
              <div className="mt-16 text-center">
                  <Button asChild size="lg" variant="outline" className="bg-white border-slate-200 text-slate-900 hover:bg-slate-50 px-12 py-4 text-lg font-semibold rounded-full shadow-lg">
                      <Link href="/news">
                        View All News
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                  </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
