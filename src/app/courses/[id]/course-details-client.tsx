
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, Award, Circle, CheckCircle2, Youtube, Lock, BookOpen, Clock, BarChart, Info, Shield, Copy } from 'lucide-react';
import type { Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PaymentCalculator } from '@/lib/payment-config';
import Link from 'next/link';

interface CourseDetailsClientProps {
  course: Course;
}

export default function CourseDetailsClient({ course }: CourseDetailsClientProps) {
  const { user, signInWithGoogle } = useAuth();
  const { createCourseEnrollmentRequest, addEnrolledCourse } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  
  const isEnrolled = user?.enrolledCourseIds?.includes(course.id);
  const isFree = course.price === 0;

  const handleEnroll = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setIsEnrolling(true);
    
    try {
      if (isFree) {
        await addEnrolledCourse(user.uid, course.id);
        toast({ title: 'Enrollment Successful!', description: `You can now start learning ${course.title}.` });
        router.push(`/my-learning/${course.id}`);
      } else {
        const newBookingCode = `ENROLL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setBookingCode(newBookingCode);
        await createCourseEnrollmentRequest(user.uid, course.id, course.title, course.price, newBookingCode);
        setShowPaymentDialog(true);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Enrollment Failed', description: 'Could not process your enrollment request.' });
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard!" });
  };

  return (
    <>
    <div className="bg-muted/40">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card className="overflow-hidden">
                    <div className="relative h-64 md:h-96 w-full">
                        <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" />
                    </div>
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">{course.category}</Badge>
                        <CardTitle className="text-3xl md:text-4xl">{course.title}</CardTitle>
                        <CardDescription className="text-lg">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex items-center gap-6 text-muted-foreground text-sm">
                           <div className="flex items-center gap-2"><Clock/><span>{course.duration}</span></div>
                           <div className="flex items-center gap-2"><BarChart/><span>{course.level}</span></div>
                           <div className="flex items-center gap-2"><span>By <strong>{course.instructor}</strong></span></div>
                       </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>What You'll Learn</CardTitle></CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <ReactMarkdown>{course.description}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Course Curriculum</CardTitle></CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {course.lessons.map((lesson, index) => (
                                <AccordionItem key={lesson.id} value={`item-${index}`}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-3">
                                            <PlayCircle className="h-5 w-5 text-primary"/>
                                            <span className="font-semibold">{lesson.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-8 text-muted-foreground">
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li>{lesson.pages.length} pages of content</li>
                                            <li>Recommended video: <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Watch on YouTube</a></li>
                                            <li>Includes a {lesson.quiz.length}-question quiz</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            {course.project && (
                                <AccordionItem value="project">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-3">
                                            <Award className="h-5 w-5 text-primary"/>
                                            <span className="font-semibold">Final Project: {course.project.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-8 text-muted-foreground">
                                        <ReactMarkdown>{course.project.description}</ReactMarkdown>
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
            
            <aside className="space-y-6">
                <Card className="sticky top-8">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                          {isFree ? 'Enroll for Free' : `Price: ${PaymentCalculator.formatCurrency(course.price, 'GHS')}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEnrolled ? (
                            <Button size="lg" className="w-full" asChild>
                                <Link href={`/my-learning/${course.id}`}>Go to Course</Link>
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full" onClick={handleEnroll} disabled={isEnrolling}>
                                {isEnrolling ? 'Processing...' : 'Enroll Now'}
                            </Button>
                        )}
                        <p className="text-xs text-muted-foreground mt-4 text-center">Full lifetime access. Certificate of completion.</p>
                    </CardContent>
                </Card>
            </aside>
        </div>
       </div>
    </div>
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Complete Your Enrollment</DialogTitle>
                <DialogDescription>
                    Your enrollment is pending. Please complete the payment to get access.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 text-center">
              <Shield className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Manual Payment Required</h3>
              <p className="text-muted-foreground">
                Follow the instructions below. Your enrollment will be approved by an admin upon confirmation.
              </p>
              <Card className="text-left p-4 bg-muted/50">
                 <p className="text-sm font-semibold">Instructions:</p>
                 <ol className="text-sm list-decimal list-inside space-y-1 mt-2">
                    <li>Send Mobile Money to: <strong className="text-primary">0597479994</strong></li>
                    <li>Amount: <strong className="text-primary">{PaymentCalculator.formatCurrency(course.price, 'GHS')}</strong></li>
                    <li>
                      Reference/Narration:
                      <div className="flex items-center gap-2 mt-1">
                        <Input readOnly value={bookingCode} className="font-mono text-xs h-8"/>
                        <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(bookingCode)}><Copy className="h-4 w-4"/></Button>
                      </div>
                    </li>
                 </ol>
                 <p className="text-xs text-muted-foreground mt-4">You will be notified once your enrollment is approved.</p>
              </Card>
            </div>
            <DialogFooter>
                <Button onClick={() => setShowPaymentDialog(false)} className="w-full">
                    Done
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
