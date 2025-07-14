
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Send, 
  Users, 
  Calendar, 
  Megaphone, 
  Loader2, 
  FileText,
  Shield,
  Globe,
  Target
} from 'lucide-react';

interface AdminEmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'newsletter' | 'announcement' | 'promotion' | 'system';
}

export default function AdminEmailManagement() {
  const [emailType, setEmailType] = useState<'newsletter' | 'announcement' | 'system' | 'promotion'>('newsletter');
  const [recipientType, setRecipientType] = useState<'all-users' | 'event-creators' | 'attendees' | 'custom'>('all-users');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [customEmails, setCustomEmails] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock templates - in real app, fetch from database
  const templates: AdminEmailTemplate[] = [
    {
      id: '1', name: 'Monthly Newsletter', subject: 'TicketFlow Monthly Update',
      content: `<h2>🎉 What's New This Month</h2><p>Here are the latest updates...</p>`, category: 'newsletter'
    },
    {
      id: '2', name: 'System Maintenance', subject: '🔧 Scheduled Maintenance Notice',
      content: `<h2>Scheduled System Maintenance</h2><p>We'll be performing maintenance...</p>`, category: 'system'
    },
    {
      id: '3', name: 'New Feature', subject: '🚀 New Feature Announcement',
      content: `<h2>🚀 Exciting New Feature!</h2><p>Introducing our latest feature...</p>`, category: 'announcement'
    }
  ];

  const recipientStats = {
    'all-users': { count: 15420, description: 'All registered users' },
    'event-creators': { count: 2340, description: 'Active event organizers' },
    'attendees': { count: 13080, description: 'Event attendees' },
    'custom': { count: customEmails.split(',').filter(e => e.trim()).length, description: 'Custom email list' }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template.id);
      setSubject(template.subject);
      setContent(template.content);
      setEmailType(template.category);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    // Simulate sending
    console.log('Sending email:', {
      type: emailType,
      recipients: recipientType,
      subject,
      content,
      customEmails: recipientType === 'custom' ? customEmails : undefined
    });
    setTimeout(() => setIsLoading(false), 2000);
  };

  const getEmailTypeIcon = (type: string) => {
    const icons = {
      newsletter: <FileText className="h-4 w-4" />,
      announcement: <Megaphone className="h-4 w-4" />,
      system: <Shield className="h-4 w-4" />,
      promotion: <Target className="h-4 w-4" />,
    };
    return icons[type as keyof typeof icons] || <Mail className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Templates and Stats */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Start with a pre-built template.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? 'default' : 'outline'}
                className="w-full justify-start h-auto"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-center gap-3 py-1">
                  {getEmailTypeIcon(template.category)}
                  <div className="text-left">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Column 2: Composer */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>Create and send platform-wide communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email Type</Label>
                <Select value={emailType} onValueChange={(value) => setEmailType(value as any)}>
                  <SelectTrigger>{getEmailTypeIcon(emailType)} <span className="ml-2 capitalize">{emailType}</span></SelectTrigger>
                  <SelectContent>
                    {['newsletter', 'announcement', 'system', 'promotion'].map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getEmailTypeIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipients</Label>
                <Select value={recipientType} onValueChange={(value) => setRecipientType(value as any)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {recipientStats[recipientType].description} ({recipientStats[recipientType].count.toLocaleString()})
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(recipientStats).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {key === 'all-users' ? <Globe className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          <span>{value.description} ({value.count.toLocaleString()})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {recipientType === 'custom' && (
              <div>
                <Label>Custom Email List</Label>
                <Textarea
                  placeholder="Enter email addresses separated by commas..."
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            <div>
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter email content..."
                className="min-h-[250px]"
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline">Preview</Button>
              <Button onClick={handleSendEmail} disabled={isLoading || !subject || !content}>
                {isLoading ? (
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
