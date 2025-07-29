
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/context/app-context';
import type { Course, Lesson as LessonType, Page as PageType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Loader2, BookOpen, ToggleLeft, ToggleRight, Wand2, ChevronDown, Star, TrendingUp, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/image-uploader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { generateCourseContent } from '@/ai/flows/generate-course-content';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { Label } from '@/components/ui/label';


const pageSchema = z.object({
  content: z.string().min(1, 'Page content cannot be empty.'),
  imageUrl: z.string().url().optional(),
});

const lessonSchema = z.object({
    id: z.string(),
    title: z.string().min(3, 'Title is required.'),
    duration: z.string().min(1, 'Duration is required.'),
    videoUrl: z.string().url().optional(),
    quiz: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
    })).optional(),
    pages: z.array(pageSchema).min(1, 'Lesson must have at least one page.'),
});

const projectSchema = z.object({
    title: z.string().min(3, 'Title is required.'),
    description: z.string().min(10, 'Description is required.'),
});

const courseSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  instructor: z.string().min(2, 'Instructor name is required.'),
  imageUrl: z.string().min(1, 'Image is required.'),
  description: z.string().min(10, 'Description is required.'),
  category: z.string({ required_error: 'Please select a category.' }),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  duration: z.string().min(1, 'Course duration is required.'),
  price: z.coerce.number().min(0, 'Price must be 0 or more.'),
  status: z.enum(['published', 'draft']).default('published'),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  lessons: z.array(lessonSchema).min(1, 'At least one lesson is required.'),
  project: projectSchema.optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

function CourseForm({ course, onFinished }: { course?: Course, onFinished: () => void }) {
  const { addCourse, updateCourse } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!course;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
        ...course,
        price: course.price / 100, // Convert from cents
    } : {
      title: '',
      instructor: '',
      imageUrl: '',
      description: '',
      category: "Event Marketing",
      level: 'Beginner',
      duration: '',
      price: 0,
      status: 'published',
      isFeatured: false,
      isPopular: false,
      isTrending: false,
      lessons: [],
      project: { title: '', description: '' },
    },
  });

  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control: form.control,
    name: 'lessons'
  });

  const handleGenerateCourse = async () => {
    const title = form.getValues('title');
    if (!title) {
        toast({ variant: 'destructive', title: 'Title is required', description: 'Please enter a course title before generating.' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateCourseContent({ title });
        form.setValue('description', result.description);
        form.setValue('lessons', result.lessons as any); // Type assertion might be needed
        form.setValue('project', result.project);
        form.setValue('imageUrl', result.imageUrl);
        
        // Calculate total duration
        const totalMinutes = result.lessons.reduce((acc, lesson) => {
          const duration = parseInt(lesson.duration.split(' ')[0]) || 0;
          return acc + duration;
        }, 0);
        form.setValue('duration', `${Math.round(totalMinutes / 60)} hours`);


        toast({ title: "Course Content Generated!", description: "Review the generated lessons and project below." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ 
            variant: 'destructive', 
            title: "AI Generation Failed", 
            description: errorMessage
        });
    } finally {
        setIsGenerating(false);
    }
  };


  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    const payload: Omit<Course, 'id' | 'lessons'> & { lessons: LessonType[] } = {
      ...data,
      price: data.price * 100, // Convert to cents
      lessons: data.lessons as LessonType[], // Ensure type compatibility
      project: data.project!,
    };
    try {
      if (isEditMode) {
        await updateCourse(course.id, payload);
        toast({ title: 'Success', description: 'Course updated successfully.' });
      } else {
        await addCourse(payload);
        toast({ title: 'Success', description: 'Course created successfully.' });
      }
      onFinished();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save course.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="title" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Course Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Advanced Event Sponsorship Techniques"/></FormControl><FormMessage /></FormItem>
        )}/>
        <Button type="button" onClick={handleGenerateCourse} disabled={isGenerating} className="w-full">
            <Wand2 className="mr-2 h-4 w-4"/> {isGenerating ? <Loader2 className="animate-spin"/> : "Generate Course Content with AI"}
        </Button>
        <Separator/>

        <FormField name="description" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="instructor" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Instructor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="imageUrl" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Cover Image</FormLabel><FormControl><ImageUploader onUpload={field.onChange} value={field.value} /></FormControl><FormMessage /></FormItem>
        )}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="category" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{["Event Marketing", "Audience Growth", "Sponsorship", "Event Production", "Community Building"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
            )}/>
            <FormField name="level" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{["Beginner", "Intermediate", "Advanced"].map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="duration" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Total Duration (e.g., 4 hours)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Price (GH₵)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>

        <div className="space-y-4 pt-4">
            <Label>Visibility Settings</Label>
            <div className="flex flex-wrap gap-4 items-center">
                 <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full sm:w-auto">
                            <div className="space-y-0.5 mr-4">
                                <FormLabel>Featured</FormLabel>
                                <FormDescription>Show on homepage featured section.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full sm:w-auto">
                            <div className="space-y-0.5 mr-4">
                                <FormLabel>Popular</FormLabel>
                                <FormDescription>Mark as a popular course.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="isTrending"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full sm:w-auto">
                            <div className="space-y-0.5 mr-4">
                                <FormLabel>Trending</FormLabel>
                                <FormDescription>Highlight as currently trending.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Curriculum</CardTitle>
                <CardDescription>Manage the lessons and final project for this course.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="lessons">
                        <AccordionTrigger>Lessons ({lessonFields.length})</AccordionTrigger>
                        <AccordionContent className="p-1 space-y-4">
                           {lessonFields.map((lesson, lessonIndex) => (
                             <Accordion key={lesson.id} type="single" collapsible className="border rounded-md px-4">
                                <AccordionItem value={`lesson-${lessonIndex}`}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <span className="font-semibold">{lessonIndex + 1}. {form.watch(`lessons.${lessonIndex}.title`)}</span>
                                            <Badge variant="outline">{form.watch(`lessons.${lessonIndex}.duration`)}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                       <FormField control={form.control} name={`lessons.${lessonIndex}.title`} render={({field}) => (
                                         <FormItem><FormLabel>Lesson Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                                       )}/>
                                        {lesson.pages.map((page, pageIndex) => (
                                           <div key={pageIndex} className="p-3 border rounded-md bg-muted/50">
                                             <Label className="text-sm font-semibold">Page {pageIndex + 1}</Label>
                                             <FormField control={form.control} name={`lessons.${lessonIndex}.pages.${pageIndex}.content`} render={({field}) => (
                                                <FormItem><FormLabel>Page Content</FormLabel><FormControl><Textarea {...field} rows={8}/></FormControl><FormMessage/></FormItem>
                                             )}/>
                                           </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                           ))}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="project">
                        <AccordionTrigger>Final Project</AccordionTrigger>
                        <AccordionContent className="p-1 pt-4 space-y-4">
                           <FormField control={form.control} name="project.title" render={({field}) => (
                             <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                           )}/>
                            <FormField control={form.control} name="project.description" render={({field}) => (
                             <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea {...field} rows={6}/></FormControl><FormMessage/></FormItem>
                           )}/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {isEditMode ? 'Save Changes' : 'Create Course'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminCoursesPage() {
  const { courses, loading, deleteCourse, updateCourse } = useAppContext();
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const { toast } = useToast();

  const handleOpenForm = (course?: Course) => {
    setEditingCourse(course);
  };

  const handleCloseForm = () => {
    setEditingCourse(undefined);
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteCourse(id);
        toast({ title: "Course deleted" });
    } catch {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete course." });
    }
  }

  const handleToggleStatus = async (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await updateCourse(course.id, { status: newStatus });
      toast({ title: "Status Updated", description: `Course is now a ${newStatus}.` });
    } catch {
      toast({ variant: 'destructive', title: "Error", description: "Failed to update status." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Create and manage courses for your users.</p>
        </div>
        <Dialog onOpenChange={(isOpen) => !isOpen && handleCloseForm()}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Course</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
               <DialogDescription>
                {editingCourse ? "Edit the course details." : "Enter a title and use AI to generate the full course content."}
               </DialogDescription>
            </DialogHeader>
            <CourseForm course={editingCourse} onFinished={handleCloseForm} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Courses</CardTitle>
          <CardDescription>{courses.length} courses on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
                ) : courses.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4"/>No courses found.</TableCell></TableRow>
                ) : (
                  courses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell><div className="flex items-center gap-3"><Image src={course.imageUrl} alt={course.title} width={40} height={40} className="rounded-md object-cover"/><div className="font-medium">{course.title}</div></div></TableCell>
                      <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => handleToggleStatus(course)} className="flex items-center gap-1">{course.status === 'published' ? <ToggleRight className="h-5 w-5 text-green-500"/> : <ToggleLeft className="h-5 w-5 text-muted-foreground"/>}<span className="capitalize">{course.status}</span></Button></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                            {course.isFeatured && <Badge variant="secondary"><Award className="h-3 w-3 mr-1"/>Featured</Badge>}
                            {course.isPopular && <Badge variant="secondary"><Star className="h-3 w-3 mr-1"/>Popular</Badge>}
                            {course.isTrending && <Badge variant="secondary"><TrendingUp className="h-3 w-3 mr-1"/>Trending</Badge>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{course.price === 0 ? 'Free' : `GH₵${(course.price/100).toFixed(2)}`}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Dialog onOpenChange={(isOpen) => !isOpen && handleCloseForm()}>
                           <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenForm(course)}><Edit className="h-4 w-4"/></Button>
                           </DialogTrigger>
                           <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Course</DialogTitle>
                                <DialogDescription>Edit the course details.</DialogDescription>
                              </DialogHeader>
                              <CourseForm course={course} onFinished={handleCloseForm} />
                           </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the course.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(course.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
