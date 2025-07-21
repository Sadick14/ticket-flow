
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { CourseCard } from '@/components/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users as UsersIcon, Star, TrendingUp, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import type { Course } from '@/lib/types';


export default function CoursesClient() {
  const { courses, loading } = useAppContext();
  
  const publishedCourses = useMemo(() => courses.filter(c => c.status === 'published'), [courses]);
  const featuredCourses = useMemo(() => publishedCourses.filter(c => c.isFeatured).slice(0, 3), [publishedCourses]);
  const popularCourses = useMemo(() => publishedCourses.filter(c => c.isPopular).slice(0, 8), [publishedCourses]);
  const trendingCourses = useMemo(() => publishedCourses.filter(c => c.isTrending).slice(0, 4), [publishedCourses]);

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
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {eventsToShow.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-muted/40">
      <section className="py-20 text-center bg-background">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">Master Your Events. Elevate Your Career.</h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Gain in-demand skills with expert-led courses on event marketing, sponsorship, and production.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* Featured Courses / Roles Section */}
        <section>
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold">Featured Courses</h2>
                <p className="text-muted-foreground mt-1">Gain the knowledge and skills you need to advance.</p>
            </div>
             {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-80 w-full"/>)}
                 </div>
            ) : featuredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredCourses.map(course => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                            <CardHeader className="flex-row items-start gap-4 p-6">
                                <Image src={course.imageUrl} alt={course.title} width={80} height={80} className="rounded-lg object-cover w-20 h-20"/>
                                <div>
                                    <CardTitle>{course.title}</CardTitle>
                                    <CardDescription className="mt-2 line-clamp-2">{course.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 flex-grow">
                                <p className="text-sm font-semibold mb-2">Lessons include:</p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {course.lessons.slice(0, 3).map((lesson, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <ChevronRight className="h-4 w-4 text-primary"/>
                                            <span>{lesson.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto">
                                <Button variant="outline" asChild className="w-full">
                                    <Link href={`/courses/${course.id}`}>Explore Course</Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
             ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No Featured Courses Yet</h3>
                   <p className="mt-1 text-sm text-muted-foreground">
                        Featured courses will appear here.
                    </p>
                </div>
            )}
        </section>

        {/* Most Popular Courses Section */}
        <section>
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold">Most Popular Courses</h2>
                <p className="text-muted-foreground mt-1">Explore our most popular programs, get job-ready for an in-demand career.</p>
            </div>
            {renderCourseGrid(popularCourses, "No popular courses available.")}
            <div className="mt-12 text-center">
                <Button variant="outline" asChild>
                    <Link href="/courses/all">View All Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </section>

        {/* Trending Now Section */}
        <section>
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold">Trending Now</h2>
                <p className="text-muted-foreground mt-1">Discover the courses and programs that learners are enrolling in the most right now.</p>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-48 w-full"/>)}
                </div>
            ) : trendingCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trendingCourses.map(course => (
                        <Link key={course.id} href={`/courses/${course.id}`}>
                            <Card className="relative h-48 flex items-end p-6 text-white overflow-hidden group">
                                <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold">{course.title}</h3>
                                    <p className="text-sm">{course.instructor}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No Trending Courses</h3>
                   <p className="mt-1 text-sm text-muted-foreground">
                       Trending courses will be shown here.
                    </p>
                </div>
            )}
        </section>
      </div>
    </div>
  );
}
