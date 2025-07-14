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
import { Mail, Send, Users, Calendar, Megaphone, Bell, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailStatus {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
  details?: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function EmailManagementPage() {
  const [emailType, setEmailType] = useState<'event-reminder' | 'event-update'>('event-reminder');
  const [recipientType, setRecipientType] = useState<'event-attendees' | 'custom'>('event-attendees');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [status, setStatus] = useState<EmailStatus>({ type: null, message: '', details: undefined });
  const { toast } = useToast();

  // Mock events data - in real app, fetch from API
  const events = [
    { id: '1', title: 'Tech Conference 2025', date: '2025-08-15', location: 'Convention Center' },
    { id: '2', title: 'Music Festival', date: '2025-09-20', location: 'Central Park' },
    { id: '3', title: 'Workshop: React Basics', date: '2025-07-25', location: 'Online' },
  ];

  const getRecipients = () => {
    switch (recipientType) {
      case 'event-attendees':
        return selectedEvent ? [`attendees-of-${selectedEvent}`] : [];
      case 'custom':
        return customEmails.split(',').map(email => email.trim()).filter(email => email);
      default:
        return [];
    }
  };

  const handleSendEmail = async () => {
    try {
      setStatus({ type: 'loading', message: 'Sending emails...', details: undefined });

      const recipients = getRecipients();
      
      if (recipients.length === 0) {
        setStatus({ type: 'error', message: 'Please select recipients or enter email addresses', details: undefined });
        return;
      }

      const emailData = {
        type: emailType,
        recipients,
        subject,
        message,
        eventTitle,
        eventDate,
        eventLocation,
        senderRole: 'organizer', // Organizer specific page
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Emails sent successfully!',
          details: result.details
        });
        
        // Reset form
        setSubject('');
        setMessage('');
        setCustomEmails('');
        
        toast({
          title: 'Success',
          description: `Emails sent to ${result.details?.successful || 0} recipients`,
        });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send emails', details: undefined });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while sending emails', details: undefined });
    }
  };

  const getEmailTypeIcon = (type: string) => {
    switch (type) {
      case 'event-reminder': return <Calendar className="h-4 w-4" />;
      case 'event-update': return <Bell className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const isFormValid = () => {
    if (getRecipients().length === 0) return false;
    if (!message.trim()) return false;
    
    if (emailType === 'event-reminder' && (!eventTitle || !eventDate || !eventLocation)) return false;
    if (emailType === 'event-update' && !eventTitle) return false;
    
    return true;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-gray-600">Send emails to your event attendees</p>
        </div>
      </div>

      <Tabs value={emailType} onValueChange={(value) => setEmailType(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="event-reminder" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="event-update" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Updates
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getEmailTypeIcon(emailType)}
              {emailType === 'event-reminder' && 'Send Event Reminder'}
              {emailType === 'event-update' && 'Send Event Update'}
            </CardTitle>
            <CardDescription>
              As an event organizer, you can send reminders and updates to your event attendees.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Recipients Section */}
            <div className="space-y-4">
              <Label>Recipients</Label>
              <Select value={recipientType} onValueChange={(value) => setRecipientType(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event-attendees">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Event Attendees
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Custom Email List
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {recipientType === 'event-attendees' && (
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {event.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {recipientType === 'custom' && (
                <div>
                  <Textarea
                    placeholder="Enter email addresses separated by commas..."
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Example: user1@example.com, user2@example.com
                  </p>
                </div>
              )}
            </div>

            {/* Event Details (for reminders and updates) */}
            {(emailType === 'event-reminder' || emailType === 'event-update') && (
              <div className="space-y-4">
                <Label>Event Details</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="eventTitle">Event Title</Label>
                    <Input
                      id="eventTitle"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Enter event title"
                    />
                  </div>
                  {emailType === 'event-reminder' && (
                    <>
                      <div>
                        <Label htmlFor="eventDate">Event Date</Label>
                        <Input
                          id="eventDate"
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventLocation">Event Location</Label>
                        <Input
                          id="eventLocation"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="Enter event location"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <Label htmlFor="message">
                {emailType === 'event-reminder' ? 'Additional Message (optional)' : 'Message'}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  emailType === 'event-reminder' 
                    ? 'Add any additional information for attendees...'
                    : 'Enter your message...'
                }
                className="min-h-[150px]"
              />
            </div>

            {/* Status Alert */}
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

            {/* Send Button */}
            <Button
              onClick={handleSendEmail}
              disabled={!isFormValid() || status.type === 'loading'}
              className="w-full"
              size="lg"
            >
              {status.type === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Emails
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
