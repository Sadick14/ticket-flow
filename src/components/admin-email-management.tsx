
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Rocket,
  Users2,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  FileText,
  Megaphone,
  Palette,
  Trash2,
  PlusCircle,
  Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailTemplates, type EmailTemplate, type TemplateId } from '@/lib/email-templates';
import { ImageUploader } from './image-uploader';
import { generateEmailContent } from '@/ai/flows/generate-email-content';

interface RecipientGroup {
    id: 'all-users' | 'event-creators' | 'launch-subscribers' | 'custom';
    name: string;
    icon: React.ReactNode;
}

interface EmailStatus {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
  details?: {
    total: number;
    successful: number;
    failed: number;
  };
}

const featureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
});

const formSchema = z.object({
  recipientType: z.enum(['all-users', 'event-creators', 'launch-subscribers', 'custom']),
  customEmails: z.string().optional(),
  selectedTemplateId: z.string().min(1, 'Please select a template'),
  subject: z.string().optional(),
  headline: z.string().optional(),
  intro: z.string().optional(),
  message: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  features: z.array(featureSchema).optional(),
}).refine(data => {
    if (data.recipientType === 'custom') {
        return !!data.customEmails && data.customEmails.length > 0;
    }
    return true;
}, {
    message: "Custom email list cannot be empty.",
    path: ["customEmails"],
});

type EmailFormValues = z.infer<typeof formSchema>;


export default function AdminEmailManagement() {
  const [status, setStatus] = useState<EmailStatus>({ type: null, message: '', details: undefined });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        recipientType: 'all-users',
        selectedTemplateId: '',
        features: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features"
  });
  
  const selectedTemplateId = form.watch('selectedTemplateId') as TemplateId | '';
  const recipientType = form.watch('recipientType');
  const selectedTemplate: EmailTemplate | undefined = selectedTemplateId ? emailTemplates[selectedTemplateId] : undefined;

  const handleGenerateContent = async (e: React.MouseEvent<HTMLButtonElement>, field: 'message' | 'intro' | `features.${number}.description`) => {
      e.preventDefault(); // Prevent form submission
      const isFeature = field.startsWith('features');
      let topic: string | undefined;

      if (isFeature) {
          const featureIndex = parseInt(field.split('.')[1], 10);
          topic = form.getValues(`features.${featureIndex}.title`);
      } else {
          topic = form.getValues('subject') || form.getValues('headline');
      }
      
      if (!topic) {
          toast({ variant: 'destructive', title: 'Topic required', description: `Please fill in a ${isFeature ? 'Feature Title' : 'Subject or Headline'} to generate content.` });
          return;
      }

      setGeneratingField(field);
      setIsGenerating(true);
      
      try {
          const audience = recipientGroups.find(g => g.id === recipientType)?.name || 'general users';
          const result = await generateEmailContent({ topic, audience });
          form.setValue(field, result.emailBody, { shouldValidate: true });
          toast({ title: "Content Generated!", description: "AI-generated content has been added."});
      } catch (error) {
          toast({ variant: 'destructive', title: "Generation Failed", description: "Could not generate content."});
      } finally {
          setIsGenerating(false);
          setGeneratingField(null);
      }
  };


  const handleSendEmail = async (data: EmailFormValues) => {
    setStatus({ type: 'loading', message: 'Sending emails...', details: undefined });

    const templateContent: Record<string, any> = {};
    if (selectedTemplate) {
        Object.keys(selectedTemplate.fields).forEach(key => {
            templateContent[key] = data[key as keyof EmailFormValues];
        });
    }

    if (data.features) {
      templateContent.features = data.features;
    }

    try {
      const emailData = {
        type: 'template',
        templateId: selectedTemplateId,
        templateContent,
        recipientType: data.recipientType,
        recipients: data.recipientType === 'custom' ? (data.customEmails || '').split(',').map(e => e.trim()).filter(Boolean) : [],
        senderRole: 'admin',
      };
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });
      
      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Email batch processed!', details: result.details });
        toast({ title: 'Success', description: `Emails sent to ${result.details.successful} recipients.`});
        form.reset();
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send emails' });
      }
    } catch (error) {
       setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
  };
  
  const recipientGroups: RecipientGroup[] = [
    { id: 'all-users', name: 'All Users', icon: <Globe /> },
    { id: 'event-creators', name: 'Event Creators', icon: <Users2 /> },
    { id: 'launch-subscribers', name: 'Launch Subscribers', icon: <Rocket /> },
    { id: 'custom', name: 'Custom List', icon: <Mail /> },
  ];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSendEmail)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Select Recipients</CardTitle>
                    <CardDescription>Choose who will receive this email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Select onValueChange={(value) => form.setValue('recipientType', value as any)} value={recipientType}>
                        <SelectTrigger><SelectValue placeholder="Select a group" /></SelectTrigger>
                        <SelectContent>
                            {recipientGroups.map(group => (
                                <SelectItem key={group.id} value={group.id}>
                                    <div className="flex items-center gap-2">{group.icon} {group.name}</div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {recipientType === 'custom' && (
                      <div className="pt-2">
                        <Textarea
                          placeholder="Enter emails separated by commas..."
                          {...form.register('customEmails')}
                          className="min-h-[100px]"
                        />
                        {form.formState.errors.customEmails && <p className="text-destructive text-sm mt-1">{form.formState.errors.customEmails.message}</p>}
                      </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>2. Choose a Template</CardTitle>
                    <CardDescription>Select a pre-designed template for your email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Select onValueChange={(value) => form.setValue('selectedTemplateId', value)} value={selectedTemplateId}>
                      <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                      <SelectContent>
                          {Object.entries(emailTemplates).map(([id, template]) => {
                            if(template.category === "announcement" || template.category === "newsletter") {
                              return (
                                <SelectItem key={id} value={id}>
                                    <div className="flex items-center gap-2">
                                        {template.category === 'newsletter' ? <FileText /> : <Megaphone />}
                                        {template.name}
                                    </div>
                                </SelectItem>
                              )
                            }
                            return null;
                          })}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.selectedTemplateId && <p className="text-destructive text-sm mt-1">{form.formState.errors.selectedTemplateId.message}</p>}
                </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>3. Compose Content</CardTitle>
                <CardDescription>Fill in the content for your chosen template. No HTML needed!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedTemplate ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium text-foreground">No Template Selected</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Please choose a template to begin composing.</p>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(selectedTemplate.fields).map(([key, field]) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor={key}>{field.label}</Label>
                          {(key === 'message' || key === 'intro') && (
                            <Button type="button" variant="ghost" size="sm" onClick={(e) => handleGenerateContent(e, key as 'message' | 'intro')} disabled={isGenerating}>
                                {isGenerating && generatingField === key ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                Generate with AI
                            </Button>
                          )}
                        </div>
                        {field.type === 'textarea' ? (
                          <Textarea id={key} placeholder={field.placeholder} {...form.register(key as any)} rows={5}/>
                        ) : (
                          <Input id={key} type={field.type} placeholder={field.placeholder} {...form.register(key as any)}/>
                        )}
                      </div>
                    ))}

                    {selectedTemplateId === 'featureNewsletter' && (
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold">Newsletter Features</h4>
                            {fields.map((field, index) => (
                                <Card key={field.id} className="p-4 bg-muted/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-medium">Feature #{index + 1}</h5>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                      <Input placeholder="Feature Title" {...form.register(`features.${index}.title`)} />
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <Label htmlFor={`features.${index}.description`}>Description</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={(e) => handleGenerateContent(e, `features.${index}.description`)} disabled={isGenerating}>
                                                {isGenerating && generatingField === `features.${index}.description` ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                                                AI
                                            </Button>
                                        </div>
                                        <Textarea id={`features.${index}.description`} placeholder="Feature Description" {...form.register(`features.${index}.description`)} />
                                      </div>
                                      <Input placeholder="Button Text (Optional)" {...form.register(`features.${index}.buttonText`)} />
                                      <Input placeholder="Button URL (Optional)" {...form.register(`features.${index}.buttonUrl`)} />
                                      <div>
                                        <Label>Image (Optional)</Label>
                                        <ImageUploader onUpload={(url) => form.setValue(`features.${index}.imageUrl`, url)} value={form.watch(`features.${index}.imageUrl`)} />
                                      </div>
                                    </div>
                                </Card>
                            ))}
                            <Button type="button" variant="outline" onClick={() => append({ title: '', description: '', imageUrl: '', buttonText: '', buttonUrl: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Feature
                            </Button>
                        </div>
                    )}
                  </div>
                )}
                
                {selectedTemplate && (
                  <>
                    {status.type && (
                      <Alert className={ status.type === 'success' ? 'border-green-200 bg-green-50' : status.type === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50' }>
                        <div className="flex items-center gap-2">
                          {status.type === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                          {status.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {status.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                          <AlertDescription>
                            {status.message}
                            {status.details && (
                              <div className="mt-2 flex gap-4">
                                <Badge variant="outline">Total: {status.details.total}</Badge>
                                <Badge variant="outline" className="text-green-600">Successful: {status.details.successful}</Badge>
                                {status.details.failed > 0 && <Badge variant="outline" className="text-red-600">Failed: {status.details.failed}</Badge>}
                              </div>
                            )}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="submit" disabled={status.type === 'loading' || !form.formState.isValid}>
                        {status.type === 'loading' ? ( <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> ) : ( <><Send className="h-4 w-4 mr-2" /> Send Email</> )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
