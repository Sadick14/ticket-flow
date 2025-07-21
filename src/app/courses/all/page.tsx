
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { CourseCard } from '@/components/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ArrowLeft } from 'lucide-react';
import type { Course } from '@/lib/types';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AllCoursesPage() {
  const { courses, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const publishedCourses = useMemo(() => {
    return courses.filter(course => 
      course.status === 'published' &&
      (
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [courses, searchTerm]);

  return (
    <div className="min-h-screen bg-muted/40">
      <PageHero
        title="All Courses"
        description="Explore our full catalog of expert-led courses to master event management."
        height="sm"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Button variant="outline" asChild>
                <Link href="/courses"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Courses Home</Link>
            </Button>
            <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Search all courses..."
                    className="pl-9 w-full rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
            ))}
            </div>
        ) : publishedCourses.length > 0 ? (
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {publishedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No Courses Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or check back later for new courses.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
