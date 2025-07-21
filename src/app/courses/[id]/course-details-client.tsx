
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, PlayCircle, Lock, BarChart, Clock, BookOpen, Star, Award, Circle, CheckCircle2 } from 'lucide-react';
import type { Course, Lesson } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';

interface CourseDetailsClientProps {
  course: Course;
}

export default function CourseDetailsClient({ course }: CourseDetailsClientProps) {
  const { toast } = useToast();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.lessons[0] || null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const handleEnroll = () => {
    toast({
      title: "Enrollment Coming Soon!",
      description: "This feature is currently under development. Stay tuned!",
    });
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };
  
  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    
    // Find next lesson and make it active
    const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < course.lessons.length - 1) {
      setActiveLesson(course.lessons[currentIndex + 1]);
    } else {
       toast({
        title: "Section Complete!",
        description: "Great job! Move on to the final project.",
      });
      setActiveLesson(null); // Or move to project view
    }
  }

  const progressPercentage = (completedLessons.size / course.lessons.length) * 100;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 border-r flex-shrink-0 bg-background flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg truncate">{course.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Progress value={progressPercentage} className="h-2"/>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <Accordion type="multiple" defaultValue={['item-0']} className="w-full flex-grow overflow-y-auto">
            <AccordionItem value="item-0">
                <AccordionTrigger className="px-4 py-3 font-semibold">Lessons</AccordionTrigger>
                <AccordionContent>
                    <ul className="space-y-1">
                        {course.lessons.map((lesson) => (
                        <li key={lesson.id}>
                            <button 
                                onClick={() => handleLessonSelect(lesson)}
                                className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-colors ${activeLesson?.id === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                            >
                                {completedLessons.has(lesson.id) 
                                    ? <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0"/> 
                                    : <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                }
                                <div className="flex-grow">
                                    <span className="font-medium">{lesson.title}</span>
                                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                </div>
                            </button>
                        </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-1">
                <AccordionTrigger className="px-4 py-3 font-semibold">Final Project</AccordionTrigger>
                <AccordionContent>
                     <button 
                        onClick={() => setActiveLesson(null)}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${!activeLesson ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    >
                        <Award className="h-5 w-5 mt-0.5 flex-shrink-0"/> 
                        <span className="font-medium">{course.project.title}</span>
                    </button>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 lg:p-12">
            {activeLesson ? (
              // Lesson View
              <div>
                <Badge variant="secondary" className="mb-4">{activeLesson.duration}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">{activeLesson.title}</h1>
                <div className="prose prose-lg max-w-none mb-12">
                  <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                </div>

                {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                  <Card className="mb-12">
                    <CardHeader><CardTitle>Check Your Knowledge</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      {activeLesson.quiz.map((q, index) => (
                        <div key={index}>
                          <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                          <ul className="space-y-2">
                            {q.options.map((opt, i) => <li key={i}><Button variant="outline" className="w-full justify-start">{opt}</Button></li>)}
                          </ul>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-end">
                    <Button size="lg" onClick={() => handleCompleteLesson(activeLesson.id)}>
                        Mark as Complete
                    </Button>
                </div>
              </div>
            ) : (
              // Project View
              <div>
                <Badge variant="secondary" className="mb-4">Final Project</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">{course.project.title}</h1>
                 <div className="prose prose-lg max-w-none mb-12">
                  <ReactMarkdown>{course.project.description}</ReactMarkdown>
                </div>
                <Button size="lg">Submit Project</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
