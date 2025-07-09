
"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Calendar as CalendarIcon, Loader2, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { generateEventDescription } from '@/ai/flows/generate-event-description';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Event } from '@/lib/types';

const eventFormSchema = z.object({
  name: z.string().min(3, { message: 'Event name must be at least 3 characters.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  eventType: z.enum(['single', 'multi'], { required_error: 'Please select an event type.' }),
  date: z.date({ required_error: 'A date is required.' }),
  dateRange: z.object({ from: z.date().optional(), to: z.date().optional() }).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:MM).' }),
  location: z.string().min(3, { message: 'Location is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0, { message: 'Price cannot be negative.' }),
  capacity: z.coerce.number().int().min(1, { message: 'Capacity must be at least 1.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  speakers: z.array(z.object({
    name: z.string().min(1, { message: 'Speaker name is required.' }),
    title: z.string().min(1, { message: 'Speaker title is required.' }),
    imageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  })).optional(),
  activities: z.array(z.object({
    name: z.string().min(1, { message: 'Activity name is required.' }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:MM).' }),
    description: z.string().min(1, { message: 'Description is required.' }),
  })).optional(),
  sponsors: z.array(z.object({
    name: z.string().min(1, { message: 'Sponsor name is required.' }),
    logoUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  })).optional(),
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      eventType: 'single',
      location: '',
      description: '',
      price: 0,
      capacity: 100,
      imageUrl: '',
      speakers: [{ name: '', title: '', imageUrl: 'https://placehold.co/100x100.png' }],
      activities: [{ name: '', time: '09:00', description: '' }],
      sponsors: [{ name: '', logoUrl: 'https://placehold.co/150x75.png' }],
    },
  });
  
  const { fields: sponsorFields, append: appendSponsor, remove: removeSponsor } = useFieldArray({
    control: form.control,
    name: 'sponsors',
  });

  const { fields: speakerFields, append: appendSpeaker, remove: removeSpeaker } = useFieldArray({
    control: form.control,
    name: 'speakers',
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control: form.control,
    name: 'activities',
  });

  const watchEventType = form.watch('eventType');

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

  async function onSubmit(data: EventFormValues) {
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

    setIsSubmitting(true);

    const startDate = data.eventType === 'multi' && data.dateRange?.from ? data.dateRange.from : data.date;
    const endDate = data.eventType === 'multi' && data.dateRange?.to ? data.dateRange.to : undefined;

    const newEvent: Omit<Event, 'id'> = {
      creatorId: user.uid,
      name: data.name,
      category: data.category,
      date: format(startDate, 'yyyy-MM-dd'),
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd'),
      time: data.time,
      location: data.location,
      description: data.description,
      price: data.price,
      capacity: data.capacity,
      imageUrl: data.imageUrl || `https://placehold.co/600x400.png`,
      speakers: data.speakers?.filter(s => s.name && s.title && s.imageUrl),
      activities: data.activities?.map(a => ({...a, time: format(new Date(`1970-01-01T${a.time}`), 'hh:mm a')})).filter(a => a.name && a.description),
      sponsors: data.sponsors?.filter(s => s.name && s.logoUrl),
    };

    try {
        await addEvent(newEvent);
        toast({
          title: 'Event Created!',
          description: `Your event "${data.name}" has been successfully created.`,
        });
        form.reset();
        router.push('/dashboard');
    } catch(error) {
        toast({
          variant: 'destructive',
          title: 'Event Creation Failed',
          description: `Could not create your event. Please try again later.`,
        });
    } finally {
        setIsSubmitting(false);
    }
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
               <Button size="sm" className="mt-4" asChild>
                <Link href="/pricing">Upgrade Plan</Link>
               </Button>
            </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <fieldset disabled={hasReachedFreeLimit || isSubmitting}>
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
                </div>

                 <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem className="mt-8">
                      <FormLabel>Event Type</FormLabel>
                       <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center gap-6"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="single" />
                            </FormControl>
                            <FormLabel className="font-normal">Single Day Event</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="multi" />
                            </FormControl>
                            <FormLabel className="font-normal">Multi-Day Event</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {watchEventType === 'single' ? (
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
                  ) : (
                     <FormField
                        control={form.control}
                        name="dateRange"
                        render={({ field }) => (
                           <FormItem className="flex flex-col">
                            <FormLabel>Date Range</FormLabel>
                             <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value?.from && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value?.from ? (
                                      field.value.to ? (
                                        <>
                                          {format(field.value.from, "LLL dd, y")} -{" "}
                                          {format(field.value.to, "LLL dd, y")}
                                        </>
                                      ) : (
                                        format(field.value.from, "LLL dd, y")
                                      )
                                    ) : (
                                      <span>Pick a date range</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  initialFocus
                                  mode="range"
                                  defaultMonth={field.value?.from}
                                  selected={field.value as DateRange}
                                  onSelect={(range) => field.onChange(range || { from: undefined, to: undefined })}
                                  numberOfMonths={2}
                                />
                              </PopoverContent>
                            </Popover>
                             <FormMessage />
                          </FormItem>
                        )}
                     />
                  )}
                 
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

                <div className="mt-8 space-y-6">
                  <div>
                    <FormLabel>Speakers</FormLabel>
                    <FormDescription>Add speakers for your event.</FormDescription>
                    <div className="space-y-4 mt-4">
                      {speakerFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                          <FormField
                            control={form.control}
                            name={`speakers.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Speaker Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`speakers.${index}.title`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Title / Role</FormLabel>
                                <FormControl><Input placeholder="Lead Speaker" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`speakers.${index}.imageUrl`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Photo URL</FormLabel>
                                <FormControl><Input placeholder="https://example.com/photo.png" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeSpeaker(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSpeaker({ name: '', title: '', imageUrl: 'https://placehold.co/100x100.png' })}>Add Speaker</Button>
                  </div>

                  <div>
                    <FormLabel>Activities</FormLabel>
                    <FormDescription>Add activities or schedule for your event.</FormDescription>
                    <div className="space-y-4 mt-4">
                      {activityFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg">
                          <FormField
                            control={form.control}
                            name={`activities.${index}.time`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`activities.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Activity Name</FormLabel>
                                <FormControl><Input placeholder="Opening Keynote" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-end gap-2 col-span-1 md:col-span-3 lg:col-span-1">
                            <FormField
                              control={form.control}
                              name={`activities.${index}.description`}
                              render={({ field }) => (
                                <FormItem className="flex-grow">
                                  <FormLabel>Description</FormLabel>
                                  <FormControl><Input placeholder="A talk about..." {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeActivity(index)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendActivity({ name: '', time: '09:00', description: '' })}>Add Activity</Button>
                  </div>

                  <div>
                    <FormLabel>Sponsors</FormLabel>
                    <FormDescription>Add sponsors for your event.</FormDescription>
                    <div className="space-y-4 mt-4">
                      {sponsorFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                          <FormField
                            control={form.control}
                            name={`sponsors.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Sponsor Name</FormLabel>
                                <FormControl><Input placeholder="Sponsor Inc." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`sponsors.${index}.logoUrl`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeSponsor(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendSponsor({ name: '', logoUrl: 'https://placehold.co/150x75.png' })}>Add Sponsor</Button>
                  </div>
                </div>


                <div className="flex justify-end space-x-4 mt-8">
                   <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                   <Button type="submit" disabled={isSubmitting || hasReachedFreeLimit}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
