
'use client';

import { useState, useEffect } from 'react';
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
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailTemplates, type EmailTemplate, type TemplateId } from '@/lib/email-templates';

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


export default function AdminEmailManagement() {
  const [recipientType, setRecipientType] = useState<RecipientGroup['id']>('all-users');
  const [customEmails, setCustomEmails] = useState('');
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId | ''>('');
  const [templateContent, setTemplateContent] = useState<Record<string, string>>({});
  
  const [status, setStatus] = useState<EmailStatus>({ type: null, message: '', details: undefined });
  const { toast } = useToast();

  const selectedTemplate: EmailTemplate | undefined = emailTemplates[selectedTemplateId as TemplateId];
  
  useEffect(() => {
    // When template changes, populate content with default values
    if (selectedTemplate) {
        const defaultContent: Record<string, string> = {};
        for (const key in selectedTemplate.fields) {
            defaultContent[key] = selectedTemplate.fields[key].defaultValue;
        }
        setTemplateContent(defaultContent);
    } else {
        setTemplateContent({});
    }
  }, [selectedTemplateId, selectedTemplate]);

  const handleContentChange = (field: string, value: string) => {
    setTemplateContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    if (!selectedTemplateId) {
      toast({ variant: 'destructive', title: "Error", description: "Please select an email template."});
      return;
    }
    
    setStatus({ type: 'loading', message: 'Sending emails...', details: undefined });

    try {
      const emailData = {
        type: 'template',
        templateId: selectedTemplateId,
        templateContent,
        recipientType,
        recipients: recipientType === 'custom' ? customEmails.split(',').map(e => e.trim()).filter(Boolean) : [],
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
        setTemplateContent({});
        setSelectedTemplateId('');
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send emails' });
      }
    } catch (error) {
       setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
  };

  const isFormValid = selectedTemplateId && 
                      (!selectedTemplate || Object.keys(selectedTemplate.fields).every(key => !!templateContent[key])) &&
                      (recipientType !== 'custom' || customEmails.trim() !== '');
  
  const recipientGroups: RecipientGroup[] = [
    { id: 'all-users', name: 'All Users', icon: <Globe /> },
    { id: 'event-creators', name: 'Event Creators', icon: <Users2 /> },
    { id: 'launch-subscribers', name: 'Launch Subscribers', icon: <Rocket /> },
    { id: 'custom', name: 'Custom List', icon: <Mail /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>1. Select Recipients</CardTitle>
                <CardDescription>Choose who will receive this email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Select value={recipientType} onValueChange={(value) => setRecipientType(value as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                        {recipientGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                                <div className="flex items-center gap-2">
                                    {group.icon} {group.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {recipientType === 'custom' && (
                  <div className="pt-2">
                    <Textarea
                      placeholder="Enter emails separated by commas..."
                      value={customEmails}
                      onChange={(e) => setCustomEmails(e.target.value)}
                      className="min-h-[100px]"
                    />
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
                <Select value={selectedTemplateId} onValueChange={(value) => setSelectedTemplateId(value as TemplateId)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
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
            {selectedTemplate ? (
              <div className="space-y-4">
                {Object.entries(selectedTemplate.fields).map(([key, field]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea 
                        id={key}
                        placeholder={field.placeholder}
                        value={templateContent[key] || ''}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        className="mt-1"
                        rows={5}
                      />
                    ) : (
                       <Input 
                        id={key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={templateContent[key] || ''}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        className="mt-1"
                       />
                    )}
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Palette className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">No Template Selected</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Please choose a template to begin composing.</p>
                </div>
            )}
            
            {selectedTemplate && (
              <>
                {status.type && (
                  <Alert className={
                    status.type === 'success' ? 'border-green-200 bg-green-50' :
                    status.type === 'error' ? 'border-red-200 bg-red-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <div className="flex items-center gap-2">
                      {status.type === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {status.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {status.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      <AlertDescription>
                        {status.message}
                        {status.details && (
                          <div className="mt-2 flex gap-4">
                            <Badge variant="outline">Total: {status.details.total}</Badge>
                            <Badge variant="outline" className="text-green-600">
                              Successful: {status.details.successful}
                            </Badge>
                            {status.details.failed > 0 && (
                              <Badge variant="outline" className="text-red-600">
                                Failed: {status.details.failed}
                              </Badge>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button onClick={handleSendEmail} disabled={status.type === 'loading' || !isFormValid}>
                    {status.type === 'loading' ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Send Email</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
