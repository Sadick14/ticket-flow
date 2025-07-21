
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, PlayCircle, Lock, BarChart, Clock, BookOpen, Star } from 'lucide-react';
import type { Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CourseDetailsClientProps {
  course: Course;
}

export default function CourseDetailsClient({ course }: CourseDetailsClientProps) {
  const { toast } = useToast();

  const handleEnroll = () => {
    toast({
      title: "Enrollment Coming Soon!",
      description: "This feature is currently under development. Stay tuned!",
    });
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <PageHero
        title={course.title}
        description={`A comprehensive course by ${course.instructor} on ${course.category}.`}
        backgroundImage={course.imageUrl}
        height="lg"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About this course</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>{course.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.lessons.slice(0, 6).map((lesson, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                    <p>{lesson.title}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.lessons.map((lesson, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <p>Lesson {index + 1}: {lesson.title}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex justify-between items-center ml-6">
                        <p className="text-muted-foreground">{lesson.duration}</p>
                        {lesson.isFreePreview ? (
                          <Button variant="secondary" size="sm"><PlayCircle className="mr-2 h-4 w-4"/> Watch Preview</Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled><Lock className="mr-2 h-4 w-4"/> Locked</Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {course.price === 0 ? 'Free' : `GH₵ ${(course.price / 100).toFixed(2)}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleEnroll} className="w-full" size="lg">Enroll Now</Button>
                <div className="space-y-3 mt-6 text-sm">
                    <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-muted-foreground"/><span>{course.lessons.length} lessons</span></div>
                    <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground"/><span>{course.duration} total</span></div>
                    <div className="flex items-center gap-3"><BarChart className="h-4 w-4 text-muted-foreground"/><span>{course.level}</span></div>
                    <div className="flex items-center gap-3"><Star className="h-4 w-4 text-muted-foreground"/><span>Certificate on completion</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="font-bold text-lg">{course.instructor}</p>
                    <Badge variant="secondary" className="mt-1">{course.category} Expert</Badge>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
