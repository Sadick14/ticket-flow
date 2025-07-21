
'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { CourseCard } from '@/components/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Award, PlayCircle } from 'lucide-react';
import type { Course } from '@/lib/types';
import { PageHero } from '@/components/page-hero';

export default function MyLearningPage() {
  const { courses, loading } = useAppContext();

  // For now, we'll assume the user is enrolled in some courses for demonstration.
  // In a real app, this would come from the user's profile and enrollment data.
  const enrolledCourses = useMemo(() => courses.filter(c => c.status === 'published' && c.isFeatured), [courses]);
  const continueLearningCourse = enrolledCourses[0]; // Placeholder for the last viewed course

  const achievements = [ // Placeholder data
    { id: '1', title: 'Marketing Masterclass', type: 'Certificate' },
    { id: '2', title: 'First Course Completed', type: 'Badge' },
  ];

  return (
    <div>
        <PageHero
            title="My Learning Dashboard"
            description="Your central hub for all your courses and achievements."
            height="sm"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            {/* Continue Learning Section */}
            {continueLearningCourse && (
                <section>
                    <Card className="bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <PlayCircle className="h-6 w-6 text-primary" />
                                Continue Learning
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-bold">{continueLearningCourse.title}</h3>
                                <p className="text-muted-foreground mt-2">{continueLearningCourse.description}</p>
                                <Button asChild className="mt-4">
                                    <Link href={`/courses/${continueLearningCourse.id}`}>Jump Back In</Link>
                                </Button>
                            </div>
                            <div className="hidden md:block">
                               <CourseCard course={continueLearningCourse} />
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* My Courses Section */}
            <section>
                <h2 className="text-3xl font-bold mb-6">My Courses</h2>
                {loading ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                    </div>
                ) : enrolledCourses.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {enrolledCourses.map(course => <CourseCard key={course.id} course={course} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium text-foreground">No Courses Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground mb-4">
                            Start your learning journey by enrolling in a course.
                        </p>
                        <Button asChild>
                            <Link href="/courses">Explore Courses</Link>
                        </Button>
                    </div>
                )}
            </section>

            {/* My Achievements Section */}
            <section>
                <h2 className="text-3xl font-bold mb-6">My Achievements</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {achievements.map(ach => (
                        <Card key={ach.id} className="text-center p-6 flex flex-col items-center justify-center">
                            <Award className="h-12 w-12 text-yellow-500 mb-4" />
                            <h3 className="font-semibold">{ach.title}</h3>
                            <p className="text-sm text-muted-foreground">{ach.type}</p>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    </div>
  );
}
