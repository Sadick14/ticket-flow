
"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Calendar as CalendarIcon, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { generateEventDescription } from '@/ai/flows/generate-event-description';
import { useRouter } from 'next/navigation';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  date: z.date({ required_error: 'A date is required.' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:MM).' }),
  location: z.string().min(3, { message: 'Location is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative.' }),
  capacity: z.coerce.number().int().min(1, { message: 'Capacity must be at least 1.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const categories = ["Music", "Sports", "Food & Drink", "Arts & Theater", "Technology", "Business", "Other"];
const FREE_PLAN_EVENT_LIMIT = 2;

export function CreateEventForm() {
  const { addEvent, getEventsByCreator } = useAppContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
      price: 0,
      capacity: 100,
      imageUrl: '',
    },
  });

  const userIsOnFreePlan = user?.subscriptionPlan === 'Free';
  const userEventCount = user ? getEventsByCreator(user.uid).length : 0;
  const hasReachedFreeLimit = userIsOnFreePlan && userEventCount >= FREE_PLAN_EVENT_LIMIT;


  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    const values = form.getValues();
    if (!values.name || !values.category || !values.date || !values.time || !values.location) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in Name, Category, Date, Time, and Location to generate a description.',
      });
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateEventDescription({
        eventName: values.name,
        eventCategory: values.category,
        eventDate: format(values.date, 'yyyy-MM-dd'),
        eventTime: values.time,
        eventLocation: values.location,
        eventDescription: values.description,
        ticketPrice: values.price,
        eventCapacity: values.capacity,
      });
      form.setValue('description', result.generatedDescription, { shouldValidate: true });
      toast({
        title: 'Success!',
        description: 'AI-powered description has been generated.',
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate description. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  function onSubmit(data: EventFormValues) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be signed in to create an event.',
        });
        return;
    }

    if (hasReachedFreeLimit) {
        toast({
            variant: 'destructive',
            title: 'Upgrade Required',
            description: 'You have reached the event limit for the Free plan.',
        });
        return;
    }

    const newEvent = {
      id: crypto.randomUUID(),
      creatorId: user.uid,
      name: data.name,
      category: data.category,
      date: format(data.date, 'yyyy-MM-dd'),
      time: data.time,
      location: data.location,
      description: data.description,
      price: data.price,
      capacity: data.capacity,
      imageUrl: data.imageUrl || `https://placehold.co/600x400.png`,
      speakers: [
          { name: 'John Doe', title: 'Lead Speaker', imageUrl: 'https://placehold.co/100x100.png' },
          { name: 'Jane Smith', title: 'Keynote Speaker', imageUrl: 'https://placehold.co/100x100.png' }
      ],
      activities: [
          { name: 'Registration & Welcome Coffee', time: '09:00 AM', description: 'Kick off the day with registration and networking over coffee.' },
          { name: 'Opening Keynote', time: '10:00 AM', description: 'Insightful opening session by our keynote speaker.' },
          { name: 'Panel Discussion', time: '11:00 AM', description: 'Engaging panel on the future of the industry.' }
      ]
    };
    addEvent(newEvent);
    toast({
      title: 'Event Created!',
      description: `Your event "${data.name}" has been successfully created.`,
    });
    form.reset();
    router.push('/dashboard');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Fill out the form below to create your new event.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasReachedFreeLimit && (
            <Alert className="mb-8">
              <Zap className="h-4 w-4" />
              <AlertTitle>You've Reached Your Limit!</AlertTitle>
              <AlertDescription>
                You have created {userEventCount} of {FREE_PLAN_EVENT_LIMIT} events included in the Free plan. Please upgrade to a Starter or Pro plan to create more events.
              </AlertDescription>
               <Button size="sm" className="mt-4">Upgrade Plan</Button>
            </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <fieldset disabled={hasReachedFreeLimit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Summer Music Festival" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="mt-8">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Central Park, New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-8">
                      <div className="flex justify-between items-center">
                        <FormLabel>Description</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                          {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                          )}
                          Generate with AI
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about your event"
                          className="resize-y min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                 <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="mt-8">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/image.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                   <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                   <Button type="submit" disabled={form.formState.isSubmitting || hasReachedFreeLimit}>
                     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Create Event
                    </Button>
                </div>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
