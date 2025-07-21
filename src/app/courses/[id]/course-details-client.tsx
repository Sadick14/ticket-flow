
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, PlayCircle, Award, Circle, CheckCircle2 } from 'lucide-react';
import type { Course, Lesson, Page } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';

interface CourseDetailsClientProps {
  course: Course;
}

interface ActiveContent {
  type: 'lesson';
  lesson: Lesson;
  pageIndex: number;
} | {
  type: 'project';
}

export default function CourseDetailsClient({ course }: CourseDetailsClientProps) {
  const { toast } = useToast();
  const [activeContent, setActiveContent] = useState<ActiveContent>({ type: 'lesson', lesson: course.lessons[0], pageIndex: 0 });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const handleEnroll = () => {
    toast({
      title: "Enrollment Coming Soon!",
      description: "This feature is currently under development. Stay tuned!",
    });
  };

  const handleLessonSelect = (lesson: Lesson, pageIndex: number = 0) => {
    setActiveContent({ type: 'lesson', lesson, pageIndex });
  };
  
  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    
    // Find next lesson and make it active
    const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < course.lessons.length - 1) {
      handleLessonSelect(course.lessons[currentIndex + 1]);
    } else {
       toast({
        title: "Section Complete!",
        description: "Great job! Move on to the final project.",
      });
      setActiveContent({ type: 'project' });
    }
  }

  const handlePageNavigation = (direction: 'next' | 'prev') => {
    if (activeContent.type !== 'lesson') return;
    
    const { lesson, pageIndex } = activeContent;
    const newPageIndex = direction === 'next' ? pageIndex + 1 : pageIndex - 1;

    if (newPageIndex >= 0 && newPageIndex < lesson.pages.length) {
      handleLessonSelect(lesson, newPageIndex);
    } else if (direction === 'next' && newPageIndex >= lesson.pages.length) {
        // If it's the last page, mark lesson as complete and go to next
        handleCompleteLesson(lesson.id);
    }
  }

  const progressPercentage = (completedLessons.size / course.lessons.length) * 100;

  const currentLessonPage = activeContent.type === 'lesson' ? activeContent.lesson.pages[activeContent.pageIndex] : null;

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
                                className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-colors ${activeContent.type === 'lesson' && activeContent.lesson.id === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
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
                        onClick={() => setActiveContent({ type: 'project' })}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${activeContent.type === 'project' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
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
            {activeContent.type === 'lesson' ? (
              // Lesson View
              <div>
                <Badge variant="secondary" className="mb-4">{activeContent.lesson.duration}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{activeContent.lesson.title}</h1>
                <p className="text-muted-foreground mb-6">Page {activeContent.pageIndex + 1} of {activeContent.lesson.pages.length}</p>

                {currentLessonPage?.imageUrl && (
                    <div className="relative w-full h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
                        <Image src={currentLessonPage.imageUrl} alt={`Illustration for ${activeContent.lesson.title}`} layout="fill" objectFit="cover" />
                    </div>
                )}
                
                <div className="prose prose-lg max-w-none mb-12">
                  <ReactMarkdown>{currentLessonPage?.content}</ReactMarkdown>
                </div>

                <div className="flex justify-between items-center mb-12">
                    <Button variant="outline" onClick={() => handlePageNavigation('prev')} disabled={activeContent.pageIndex === 0}>Previous</Button>
                    <Button onClick={() => handlePageNavigation('next')}>
                        {activeContent.pageIndex === activeContent.lesson.pages.length - 1 ? 'Finish Lesson' : 'Next Page'}
                    </Button>
                </div>

                {activeContent.lesson.quiz && activeContent.lesson.quiz.length > 0 && activeContent.pageIndex === activeContent.lesson.pages.length -1 && (
                  <Card className="mb-12">
                    <CardHeader><CardTitle>Check Your Knowledge</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      {activeContent.lesson.quiz.map((q, index) => (
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
