
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { PageHero } from '@/components/page-hero';
import { CourseCard } from '@/components/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ArrowRight, User, Star, TrendingUp, BarChart, Users, Megaphone, Calendar } from 'lucide-react';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

const courseCategories = ["All Courses", "Event Marketing", "Audience Growth", "Sponsorship", "Event Production", "Community Building"];
const categoryIcons = {
  "Event Marketing": Megaphone,
  "Audience Growth": Users,
  "Sponsorship": Star,
  "Event Production": Calendar,
  "Community Building": BarChart,
};

export default function CoursesClient() {
  const { courses, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const publishedCourses = useMemo(() => courses.filter(c => c.status === 'published'), [courses]);
  
  const featuredCourses = useMemo(() => publishedCourses.slice(0, 3), [publishedCourses]);
  const trendingCourses = useMemo(() => publishedCourses.slice(3, 8), [publishedCourses]);
  const growingTopics = useMemo(() => publishedCourses.slice(8, 12), [publishedCourses]);

  const testimonials = [
    {
        name: "Aisha Mohammed",
        role: "Conference Organizer",
        quote: "The Sponsorship Mastery course tripled my event's funding. The practical strategies are a game-changer for any organizer.",
        image: "https://placehold.co/100x100.png",
        "data-ai-hint": "woman portrait"
    },
    {
        name: "David Lee",
        role: "Community Manager",
        quote: "I thought I knew community building, but the Audience Growth course provided insights that helped me double my attendee list.",
        image: "https://placehold.co/100x100.png",
        "data-ai-hint": "man portrait"
    },
    {
        name: "Priya Sharma",
        role: "Freelance Event Planner",
        quote: "TicketFlow's courses gave me the confidence to go from small meetups to planning major corporate events. Invaluable!",
        image: "https://placehold.co/100x100.png",
        "data-ai-hint": "woman portrait"
    }
  ]

  const renderCourseGrid = (eventsToShow: Course[], noEventsMessage: string) => {
    if (loading) {
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      );
    }

    if (eventsToShow.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">{noEventsMessage}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for new content!
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {eventsToShow.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-muted/40">
      <section className="bg-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">Master Your Events</h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Level up your skills with expert-led courses on event marketing, sponsorship, production, and more.
            </p>
            <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="#courses">Explore Courses</Link>
                </Button>
            </div>
        </div>
      </section>

      <div id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* Featured Courses Section */}
        <section>
            <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {loading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-64 w-full"/>) : 
                featuredCourses.map(course => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{course.title}</CardTitle>
                                <CardDescription>{course.instructor}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                            <Button variant="secondary" asChild className="w-full">
                                <Link href={`/courses/${course.id}`}>Learn More</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        {/* Trending Courses Section */}
        <section>
            <h2 className="text-3xl font-bold mb-8">Trending Courses</h2>
            {renderCourseGrid(trendingCourses, "No trending courses available.")}
             <div className="mt-12 text-center">
                <Button variant="outline" asChild>
                    <Link href="/events">View All Courses</Link>
                </Button>
            </div>
        </section>

        {/* Growing in Popularity Section */}
        <section>
            <h2 className="text-3xl font-bold mb-2">What's growing in popularity</h2>
            <p className="text-muted-foreground mb-8">Explore the topics your peers are learning about.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {loading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-48 w-full"/>) :
                 growingTopics.map(course => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                        <Card className="relative h-48 flex items-end p-6 text-white overflow-hidden group">
                           <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"/>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                           <div className="relative z-10">
                                <h3 className="text-xl font-bold">{course.title}</h3>
                                <p className="text-sm">{course.lessons.length} lessons</p>
                           </div>
                        </Card>
                    </Link>
                 ))}
            </div>
        </section>

        {/* Explore Categories Section */}
        <section>
            <h2 className="text-3xl font-bold mb-8">Explore Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categoryIcons).map(([category, Icon]) => (
                    <Button key={category} variant="outline" className="h-20 text-lg justify-start p-4 gap-3">
                        <Icon className="h-6 w-6 text-primary"/>
                        <span>{category}</span>
                    </Button>
                ))}
            </div>
        </section>

        {/* Community Testimonials */}
        <section className="bg-background rounded-lg p-12">
            <h2 className="text-3xl font-bold text-center mb-12">From the TicketFlow Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {testimonials.map((t,i) => (
                    <div key={i}>
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                            <AvatarImage src={t.image} data-ai-hint={t['data-ai-hint']} />
                            <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground italic">"{t.quote}"</p>
                        <p className="font-bold mt-4">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
