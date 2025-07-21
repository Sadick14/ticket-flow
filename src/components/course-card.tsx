
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, BarChart } from 'lucide-react';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full touch-manipulation bg-card border-border rounded-xl">
      <Link href={`/courses/${course.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <Image 
            src={course.imageUrl} 
            alt={course.title} 
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className="absolute top-3 right-3">{course.category}</Badge>
        </div>
      </Link>
      <CardHeader className="p-4">
        <CardTitle className="font-bold text-lg line-clamp-2">
          <Link href={`/courses/${course.id}`} className="hover:text-primary transition-colors">{course.title}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">By {course.instructor}</p>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t flex-col items-start space-y-4">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>{course.duration}</span></div>
            <div className="flex items-center gap-2"><BarChart className="h-4 w-4"/><span>{course.level}</span></div>
        </div>
        <div className="flex justify-between items-center w-full">
            <p className="text-xl font-bold text-primary">{course.price === 0 ? 'Free' : `GH₵${(course.price/100).toFixed(2)}`}</p>
            <Button variant="ghost" asChild>
                <Link href={`/courses/${course.id}`}>
                    View Course <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
