
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/context/app-context';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle, Edit, Trash2, Loader2, BookOpen, ToggleLeft, ToggleRight, Star, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/image-uploader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const courseCategories = ["Event Marketing", "Audience Growth", "Sponsorship", "Event Production", "Community Building"];
const courseLevels = ["Beginner", "Intermediate", "Advanced"];

const lessonSchema = z.object({
    title: z.string().min(3, 'Title is required.'),
    duration: z.string().min(1, 'Duration is required.'),
    isFreePreview: z.boolean().default(false),
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
});

type CourseFormValues = z.infer<typeof courseSchema>;

function CourseForm({ course, onFinished }: { course?: Course, onFinished: () => void }) {
  const { addCourse, updateCourse } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      category: courseCategories[0],
      level: 'Beginner',
      duration: '',
      price: 0,
      status: 'published',
      isFeatured: false,
      isPopular: false,
      isTrending: false,
      lessons: [{ title: '', duration: '', isFreePreview: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lessons'
  });

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      price: data.price * 100, // Convert to cents
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
            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="instructor" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Instructor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="imageUrl" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Image</FormLabel><FormControl><ImageUploader onUpload={field.onChange} value={field.value} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="description" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="category" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{courseCategories.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
            )}/>
            <FormField name="level" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{courseLevels.map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Featured</FormLabel>
                  <FormDescription>Show on homepage</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Popular</FormLabel>
                  <FormDescription>Mark as popular</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isTrending"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Trending</FormLabel>
                  <FormDescription>Mark as trending now</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Lessons</FormLabel>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                <FormField name={`lessons.${index}.title`} control={form.control} render={({ field }) => (
                    <FormItem className="flex-grow"><FormLabel>Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField name={`lessons.${index}.duration`} control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} placeholder="e.g., 15 mins"/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField name={`lessons.${index}.isFreePreview`} control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-col items-center"><FormLabel>Free?</FormLabel><FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-5 w-5"/></FormControl></FormItem>
                )}/>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
          </div>
           <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ title: '', duration: '', isFreePreview: false })}>Add Lesson</Button>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{isEditMode ? 'Save Changes' : 'Create Course'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminCoursesPage() {
  const { courses, loading, deleteCourse, updateCourse } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const { toast } = useToast();

  const handleOpenForm = (course?: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
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
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Course</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
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
                    <TableHead>Flags</TableHead>
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
                          {course.isFeatured && <Badge variant="secondary" title="Featured"><Star className="h-3 w-3"/></Badge>}
                          {course.isPopular && <Badge variant="secondary" title="Popular"><UsersIcon className="h-3 w-3"/></Badge>}
                          {course.isTrending && <Badge variant="secondary" title="Trending"><TrendingUp className="h-3 w-3"/></Badge>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{course.price === 0 ? 'Free' : `GH₵${(course.price/100).toFixed(2)}`}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(course)}><Edit className="h-4 w-4"/></Button>
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
