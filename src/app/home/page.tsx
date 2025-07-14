
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { useAppContext } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Newspaper, CalendarX, Star, Users, Clock, MapPin, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { NewsCard } from '@/components/news-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { events, news, loading } = useAppContext();

  const recentEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [events]);

  const featuredEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  return (
    <>
      <div className="w-full">
        {/* Hero Section - Enhanced */}
        <section className="relative min-h-[80vh] flex items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%239C92AC%27%20fill-opacity%3D%270.1%27%3E%3Ccircle%20cx%3D%2730%27%20cy%3D%2730%27%20r%3D%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-2000" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-4 py-2 text-sm">
                🎉 New Platform Launch
              </Badge>
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl font-headline bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Where Amazing Events
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Come to Life
              </span>
            </h1>
            <p className="mt-8 text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              The most powerful platform for creating, discovering, and managing unforgettable events. 
              <br />
              <span className="text-white font-semibold">Join thousands of event creators worldwide.</span>
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105">
                <Link href="/events">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Discover Events
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300">
                <Link href="/create">
                  <Zap className="mr-2 h-5 w-5" />
                  Create Event
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">10K+</div>
                <div className="text-sm text-blue-200">Events Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">500K+</div>
                <div className="text-sm text-blue-200">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">50K+</div>
                <div className="text-sm text-blue-200">Happy Organizers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for 
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Perfect Events</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From creation to completion, we've got every aspect of event management covered
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Event Creation</h3>
                  <p className="text-gray-600">Create stunning events in minutes with our intuitive builder and customizable templates.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
                  <p className="text-gray-600">Multiple payment gateways, instant payouts, and enterprise-grade security for all transactions.</p>
                </CardContent>
              </Card>

              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
                  <p className="text-gray-600">Track sales, attendance, and engagement with detailed analytics and insights.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        {/* Featured Events Section */}
        <section id="events" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-orange-400 to-red-500 text-white">
                🔥 Trending Now
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured 
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"> Events</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't miss these amazing events happening near you
              </p>
            </div>

            <div className="mt-12">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : featuredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to create an amazing event!</p>
                  <Button asChild>
                    <Link href="/create">Create Event</Link>
                  </Button>
                </div>
              )}

              {featuredEvents.length > 0 && (
                <div className="text-center mt-12">
                  <Button asChild size="lg" variant="outline" className="px-8">
                    <Link href="/events">
                      View All Events
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Create Your Next 
              <br />
              <span className="text-yellow-300">Unforgettable Event?</span>
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Join thousands of successful event organizers who trust TicketFlow to manage their events, sell tickets, and create amazing experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                <Link href="/create">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Creating
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Recent Events Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Latest 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Events</span>
              </h2>
              <p className="text-xl text-gray-600">
                Discover the newest events on our platform
              </p>
            </div>

            <div className="mt-12">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to create an amazing event!</p>
                  <Button asChild>
                    <Link href="/create">Create Event</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* News & Updates Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-green-400 to-blue-500 text-white">
                📰 Latest Updates
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                In The 
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> News</span>
              </h2>
              <p className="text-xl text-gray-600">
                Stay updated with the latest trends and news in the events industry
              </p>
            </div>

            <div className="mt-12">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {news.slice(0, 3).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No news yet</h3>
                  <p className="text-gray-600">Check back soon for the latest updates and industry news!</p>
                </div>
              )}

              {news.length > 0 && (
                <div className="text-center mt-12">
                  <Button asChild size="lg" variant="outline" className="px-8">
                    <Link href="/news">
                      View All News
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your Next Great Event
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join the revolution in event management. Create, promote, and manage events that people will remember forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-4 text-lg font-bold shadow-2xl">
                <Link href="/create">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your Event
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-gray-300 text-white hover:bg-white hover:text-gray-900 px-10 py-4 text-lg font-semibold backdrop-blur-sm">
                <Link href="/events">
                  Explore Events
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-400 mb-4">Trusted by event organizers worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-white font-semibold">10,000+ Events</div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="text-white font-semibold">500K+ Tickets</div>
                <div className="w-px h-4 bg-gray-600"></div>
                <div className="text-white font-semibold">50K+ Organizers</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
