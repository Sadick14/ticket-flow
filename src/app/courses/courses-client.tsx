
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { PageHero } from '@/components/page-hero';
import { CourseCard } from '@/components/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';
import { CategoryFilters } from '@/components/category-filters';
import type { Course } from '@/lib/types';

const courseCategories = ["All Courses", "Event Marketing", "Audience Growth", "Sponsorship", "Event Production", "Community Building"];

export default function CoursesClient() {
  const { courses, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Courses');

  const filteredCourses = useMemo(() => {
    return courses
        .filter(c => c.status === 'published')
        .filter((course: Course) => {
            const matchesCategory = activeCategory === 'All Courses' || course.category === activeCategory;
            const matchesSearch = 
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
  }, [courses, searchTerm, activeCategory]);

  return (
    <div className="min-h-screen">
      <PageHero
        title="Level Up Your Skills"
        description="Explore expert-led courses designed to help you create, manage, and grow successful events."
        backgroundImage="/courses-hero.jpg"
        height="lg"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
            <div className="relative flex-grow max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                    placeholder="Search courses by title, topic, or instructor..."
                    className="pl-12 w-full rounded-full text-lg h-14"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="mb-12">
            <CategoryFilters
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />
        </div>
        
        {loading ? (
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {Array.from({ length: 6 }).map((_, i) => (
               <Skeleton key={i} className="h-96 w-full" />
             ))}
           </div>
        ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No Courses Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or category filters. More courses coming soon!
                </p>
            </div>
        ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
