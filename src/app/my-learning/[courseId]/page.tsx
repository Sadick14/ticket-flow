
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import type { Course, Lesson, Page } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, Award, Circle, CheckCircle2, Lock, Loader2, ArrowLeft, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type ActiveContent = {
  type: 'lesson';
  lesson: Lesson;
  pageIndex: number;
} | {
  type: 'project';
};

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { getCourseById, loading: appLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeContent, setActiveContent] = useState<ActiveContent | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [pageLoading, setPageLoading] = useState(true);

  const isEnrolled = user?.enrolledCourseIds?.includes(courseId as string);

  useEffect(() => {
    // Wait for all loading to complete before running checks
    if (authLoading || appLoading) return;

    if (!user) {
      router.push('/home'); // Redirect unauthenticated users
      return;
    }
    
    // Check enrollment *after* we're sure the user object is up-to-date
    if (!isEnrolled) {
        toast({ variant: 'destructive', title: "Not Enrolled", description: "You must enroll in this course to view it." });
        router.push(`/courses/${courseId}`);
        return;
    }

    const fetchCourseData = async () => {
        setPageLoading(true); // Start loading page-specific data
        const courseData = await getCourseById(courseId as string);
        if (courseData) {
            setCourse(courseData);
            setLessons(courseData.lessons || []);
            // Set the first lesson as active content if it exists
            if (courseData.lessons && courseData.lessons.length > 0) {
              setActiveContent({ type: 'lesson', lesson: courseData.lessons[0], pageIndex: 0 });
            } else if (courseData.project) {
              setActiveContent({ type: 'project' });
            }
        } else {
            toast({ variant: 'destructive', title: "Course Not Found" });
            router.push('/courses');
        }
        setPageLoading(false); // Finish loading page-specific data
    }
    
    fetchCourseData();

  }, [courseId, user, isEnrolled, authLoading, appLoading, getCourseById, router, toast]);

  
  const handleLessonSelect = (lesson: Lesson, pageIndex: number = 0) => {
    const lessonIndex = lessons.findIndex(l => l.id === lesson.id);
    const isLocked = lessonIndex > 0 && !completedLessons.has(lessons[lessonIndex - 1].id);
    
    if (isLocked) {
        toast({
            variant: 'destructive',
            title: "Lesson Locked",
            description: "Please complete the previous lesson's quiz to unlock this one."
        });
        return;
    }
    setActiveContent({ type: 'lesson', lesson, pageIndex });
    setQuizAnswers({}); // Reset quiz answers when starting a new lesson
  };
  
  const handleQuizSubmit = (lesson: Lesson, answers: Record<string, string>) => {
    let correctCount = 0;
    lesson.quiz.forEach((q, index) => {
        if(answers[`q${index}`] === q.correctAnswer) {
            correctCount++;
        }
    });

    if(correctCount === lesson.quiz.length) {
        toast({ title: "Quiz Passed!", description: "Great job! You've unlocked the next lesson."});
        setCompletedLessons(prev => new Set(prev).add(lesson.id));
        
        const currentIndex = lessons.findIndex(l => l.id === lesson.id);
        if (currentIndex < lessons.length - 1) {
          handleLessonSelect(lessons[currentIndex+1]);
        } else {
          setActiveContent({ type: 'project' });
        }
    } else {
        toast({ variant: 'destructive', title: "Quiz Failed", description: "Not quite! Review the material and try the quiz again."});
    }
  }

  const handlePageNavigation = (direction: 'next' | 'prev') => {
    if (activeContent?.type !== 'lesson') return;
    
    const { lesson, pageIndex } = activeContent;
    const newPageIndex = direction === 'next' ? pageIndex + 1 : pageIndex - 1;

    if (newPageIndex >= 0 && newPageIndex < lesson.pages.length) {
      handleLessonSelect(lesson, newPageIndex);
    }
  }

  if (pageLoading || authLoading || appLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin"/></div>
  }

  if (!course || !activeContent) {
    return <div className="flex items-center justify-center h-screen"><p>Could not load course content.</p></div>
  }

  const progressPercentage = (completedLessons.size / lessons.length) * 100;
  const currentLessonPage = activeContent.type === 'lesson' ? activeContent.lesson.pages[activeContent.pageIndex] : null;
  const isLastPage = activeContent.type === 'lesson' && activeContent.pageIndex === activeContent.lesson.pages.length - 1;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 border-r flex-shrink-0 bg-background flex flex-col">
          <div className="p-4 border-b">
            <Button variant="ghost" asChild className="mb-2 -ml-2">
                <Link href="/my-learning"><ArrowLeft className="h-4 w-4 mr-2"/> Back to My Learning</Link>
            </Button>
            <h2 className="font-bold text-lg truncate">{course.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Progress value={progressPercentage} className="h-2"/>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <Accordion type="multiple" defaultValue={['lessons-item']} className="w-full flex-grow overflow-y-auto">
            <AccordionItem value="lessons-item">
                <AccordionTrigger className="px-4 py-3 font-semibold">Lessons</AccordionTrigger>
                <AccordionContent>
                    <ul className="space-y-1">
                        {lessons.map((lesson, index) => {
                            const isLocked = index > 0 && !completedLessons.has(lessons[index-1].id);
                            return (
                                <li key={lesson.id}>
                                    <button 
                                        onClick={() => handleLessonSelect(lesson)}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 transition-colors ${activeContent.type === 'lesson' && activeContent.lesson.id === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isLocked}
                                    >
                                        {completedLessons.has(lesson.id) 
                                            ? <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0"/> 
                                            : isLocked ? <Lock className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0"/> : <Circle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                        }
                                        <div className="flex-grow">
                                            <span className="font-medium">{lesson.title}</span>
                                            <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="project-item">
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
              <div>
                <Badge variant="secondary" className="mb-4">{activeContent.lesson.duration}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{activeContent.lesson.title}</h1>
                <p className="text-muted-foreground mb-6">Page {activeContent.pageIndex + 1} of {activeContent.lesson.pages.length}</p>

                {activeContent.lesson.videoUrl && (
                    <Button asChild variant="outline" className="mb-8">
                        <a href={activeContent.lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Youtube className="mr-2 h-5 w-5"/> Watch on YouTube
                        </a>
                    </Button>
                )}
                
                <div className="prose prose-lg max-w-none mb-12">
                  <ReactMarkdown>{currentLessonPage?.content}</ReactMarkdown>
                </div>

                <div className="flex justify-between items-center mb-12">
                    <Button variant="outline" onClick={() => handlePageNavigation('prev')} disabled={activeContent.pageIndex === 0}>Previous Page</Button>
                    {!isLastPage && <Button onClick={() => handlePageNavigation('next')}>Next Page</Button>}
                </div>

                {isLastPage && activeContent.lesson.quiz && activeContent.lesson.quiz.length > 0 && (
                  <Card className="mb-12 bg-muted/50">
                    <CardHeader><CardTitle>Check Your Knowledge</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      {activeContent.lesson.quiz.map((q, index) => (
                        <div key={index}>
                          <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, i) => (
                                <Button 
                                    key={i} 
                                    variant={quizAnswers[`q${index}`] === opt ? 'default' : 'outline'}
                                    className="w-full justify-start"
                                    onClick={() => setQuizAnswers(prev => ({...prev, [`q${index}`]: opt}))}
                                >
                                    {opt}
                                </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                       <Button onClick={() => handleQuizSubmit(activeContent.lesson, quizAnswers)} className="w-full" size="lg">Submit Quiz</Button>
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
                <Button size="lg" disabled>Submit Project (Coming Soon)</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
