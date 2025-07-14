'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Send, 
  Users, 
  Calendar, 
  Megaphone, 
  Bell, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Shield,
  Globe,
  Target,
  FileText
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
      id: '1',
      name: 'Monthly Newsletter',
      subject: 'TicketFlow Monthly Update - New Features & Events',
      content: `
        <h2>🎉 What's New This Month</h2>
        <p>We're excited to share the latest updates and improvements to TicketFlow!</p>
        
        <h3>✨ New Features</h3>
        <ul>
          <li>Enhanced event analytics dashboard</li>
          <li>Improved mobile ticket scanning</li>
          <li>New social media integration</li>
        </ul>
        
        <h3>📊 Platform Statistics</h3>
        <p>This month, our community has grown significantly:</p>
        <ul>
          <li>2,500+ new events created</li>
          <li>150,000+ tickets sold</li>
          <li>95% customer satisfaction rate</li>
        </ul>
        
        <h3>🎯 Featured Events</h3>
        <p>Check out some amazing events happening this month on TicketFlow!</p>
      `,
      category: 'newsletter'
    },
    {
      id: '2',
      name: 'System Maintenance Notice',
      subject: '🔧 Scheduled Maintenance - TicketFlow Platform',
      content: `
        <h2>Scheduled System Maintenance</h2>
        <p>We'll be performing scheduled maintenance to improve our platform performance.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
          <h3>⏰ Maintenance Window</h3>
          <p><strong>Date:</strong> Saturday, [DATE]</p>
          <p><strong>Time:</strong> 2:00 AM - 6:00 AM EST</p>
          <p><strong>Duration:</strong> Approximately 4 hours</p>
        </div>
        
        <h3>What to Expect</h3>
        <ul>
          <li>Platform will be temporarily unavailable</li>
          <li>No impact on existing events or tickets</li>
          <li>Improved performance after maintenance</li>
        </ul>
        
        <p>We apologize for any inconvenience and appreciate your patience.</p>
      `,
      category: 'system'
    },
    {
      id: '3',
      name: 'New Feature Announcement',
      subject: '🚀 Introducing: Advanced Event Analytics',
      content: `
        <h2>🚀 Exciting New Feature Launch!</h2>
        <p>We're thrilled to announce our latest feature: Advanced Event Analytics!</p>
        
        <h3>📊 What's New</h3>
        <ul>
          <li>Real-time attendee insights</li>
          <li>Revenue tracking and forecasting</li>
          <li>Demographic analysis</li>
          <li>Marketing campaign performance</li>
        </ul>
        
        <h3>🎯 Benefits for Event Organizers</h3>
        <p>This new feature helps you:</p>
        <ul>
          <li>Make data-driven decisions</li>
          <li>Optimize your marketing efforts</li>
          <li>Understand your audience better</li>
          <li>Increase event success rates</li>
        </ul>
        
        <p>The feature is now available in your dashboard. Try it out and let us know what you think!</p>
      `,
      category: 'announcement'
    }
  ];

  const recipientStats = {
    'all-users': { count: 15420, description: 'All registered users' },
    'event-creators': { count: 2340, description: 'Active event organizers' },
    'attendees': { count: 13080, description: 'Event attendees' },
    'custom': { count: 0, description: 'Custom email list' }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setContent(template.content);
      setEmailType(template.category);
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    // Simulate sending
    setTimeout(() => {
      setIsLoading(false);
      // Reset form or show success message
    }, 3000);
  };

  const getEmailTypeIcon = (type: string) => {
    switch (type) {
      case 'newsletter': return <FileText className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'system': return <Shield className="h-4 w-4" />;
      case 'promotion': return <Target className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Admin Email Management</h2>
          <p className="text-gray-600">Send platform-wide communications to users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(recipientStats).map(([key, stats]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">{stats.description}</p>
                    <p className="text-2xl font-bold">{stats.count.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Pre-built templates for common communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedTemplate(template.id);
                  handleTemplateSelect(template.id);
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  {getEmailTypeIcon(template.category)}
                  <div className="text-left">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {template.subject}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Email Composer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Type */}
              <div>
                <Label>Email Type</Label>
                <Select value={emailType} onValueChange={(value) => setEmailType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Newsletter
                      </div>
                    </SelectItem>
                    <SelectItem value="announcement">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4" />
                        Announcement
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        System Notice
                      </div>
                    </SelectItem>
                    <SelectItem value="promotion">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Promotional
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div>
                <Label>Recipients</Label>
                <Select value={recipientType} onValueChange={(value) => setRecipientType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-users">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        All Users ({recipientStats['all-users'].count.toLocaleString()})
                      </div>
                    </SelectItem>
                    <SelectItem value="event-creators">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Event Creators ({recipientStats['event-creators'].count.toLocaleString()})
                      </div>
                    </SelectItem>
                    <SelectItem value="attendees">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Event Attendees ({recipientStats['attendees'].count.toLocaleString()})
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Custom List
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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

              {/* Subject */}
              <div>
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              {/* Content */}
              <div>
                <Label>Content</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter email content (HTML supported)..."
                  className="min-h-[200px]"
                />
              </div>

              <Separator />

              {/* Preview & Send */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Preview Email
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  disabled={isLoading || !subject || !content}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {recipientStats[recipientType].count.toLocaleString()} users
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
