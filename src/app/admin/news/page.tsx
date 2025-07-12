
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/context/app-context';
import type { NewsArticle } from '@/lib/types';
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
import { format } from 'date-fns';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Loader2, Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/image-uploader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const articleSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  source: z.string().min(2, 'Source is required.'),
  articleUrl: z.string().url('Must be a valid URL.'),
  imageUrl: z.string().min(1, 'Image is required.'),
  description: z.string().min(10, 'Description is required.'),
  gallery: z.array(z.object({
    url: z.string().min(1, 'Image is required.')
  })).optional(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function NewsArticleForm({ article, onFinished }: { article?: NewsArticle, onFinished: () => void }) {
  const { addNewsArticle, updateNewsArticle } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!article;

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      source: article?.source || '',
      articleUrl: article?.articleUrl || '',
      imageUrl: article?.imageUrl || '',
      description: article?.description || '',
      gallery: article?.gallery || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'gallery'
  });

  const onSubmit = async (data: ArticleFormValues) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      publishedDate: new Date().toISOString(),
      gallery: data.gallery || [],
    };
    try {
      if (isEditMode) {
        await updateNewsArticle(article.id, payload);
        toast({ title: 'Success', description: 'Article updated successfully.' });
      } else {
        await addNewsArticle(payload);
        toast({ title: 'Success', description: 'Article created successfully.' });
      }
      onFinished();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save article.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source (e.g., TechCrunch)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="articleUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article URL</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUploader onUpload={(url) => field.onChange(url)} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Image Gallery</FormLabel>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`gallery.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <ImageUploader onUpload={field.onChange} value={field.value} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ url: '' })}>
            Add Gallery Image
          </Button>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Article'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminNewsPage() {
  const { news, loading, deleteNewsArticle } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | undefined>(undefined);
  const { toast } = useToast();

  const handleOpenForm = (article?: NewsArticle) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArticle(undefined);
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteNewsArticle(id);
        toast({ title: "Article deleted" });
    } catch {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete article." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News Management</h1>
          <p className="text-muted-foreground">Create and manage news articles for the homepage.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Edit Article' : 'Add New Article'}</DialogTitle>
            </DialogHeader>
            <NewsArticleForm article={editingArticle} onFinished={handleCloseForm} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Articles</CardTitle>
          <CardDescription>
            {news.length} articles currently published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : news.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">
                     <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No articles found.
                    </TableCell></TableRow>
                ) : (
                  news.map(article => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Image src={article.imageUrl} alt={article.title} width={50} height={50} className="rounded-md object-cover aspect-square" />
                      </TableCell>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.source}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(article.publishedDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the article.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(article.id)}>
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
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
