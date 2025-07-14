
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Send, 
  Users, 
  Rocket,
  Megaphone, 
  Loader2, 
  FileText,
  Shield,
  Globe,
  Target,
  Users2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminEmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'newsletter' | 'announcement' | 'system' | 'promotion';
}

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
  const [emailType, setEmailType] = useState<'newsletter' | 'announcement'>('newsletter');
  const [recipientType, setRecipientType] = useState<RecipientGroup['id']>('all-users');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [customEmails, setCustomEmails] = useState('');
  const [status, setStatus] = useState<EmailStatus>({ type: null, message: '', details: undefined });
  const { toast } = useToast();

  const handleSendEmail = async () => {
    setStatus({ type: 'loading', message: 'Sending emails...', details: undefined });

    try {
      const emailData = {
        type: emailType,
        recipientType,
        recipients: recipientType === 'custom' ? customEmails.split(',').map(e => e.trim()).filter(Boolean) : [],
        subject,
        message: content,
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
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send emails' });
      }
    } catch (error) {
       setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
  };

  const isFormValid = subject.trim() !== '' && content.trim() !== '' && (recipientType !== 'custom' || customEmails.trim() !== '');
  
  const recipientGroups: RecipientGroup[] = [
    { id: 'all-users', name: 'All Users', icon: <Globe /> },
    { id: 'event-creators', name: 'Event Creators', icon: <Users2 /> },
    { id: 'launch-subscribers', name: 'Launch Subscribers', icon: <Rocket /> },
    { id: 'custom', name: 'Custom List', icon: <Mail /> },
  ];

  const getEmailTypeIcon = (type: string) => ({
    newsletter: <FileText className="h-4 w-4" />,
    announcement: <Megaphone className="h-4 w-4" />,
  }[type] || <Mail className="h-4 w-4" />);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Recipient Group</CardTitle>
                <CardDescription>Select who will receive this email.</CardDescription>
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
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>Create and send platform-wide communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Tabs value={emailType} onValueChange={(value) => setEmailType(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                    <TabsTrigger value="announcement">Announcement</TabsTrigger>
                </TabsList>
             </Tabs>
             
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Announcing our new feature..."
              />
            </div>

            <div>
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<h1>New Feature!</h1><p>We're excited to announce...</p>"
                className="min-h-[250px] font-mono"
              />
            </div>
            
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
