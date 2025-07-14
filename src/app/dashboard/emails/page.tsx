
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, Calendar, Bell, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import type { Event } from '@/lib/types';


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
  const { user } = useAuth();
  const { getEventsByCreator } = useAppContext();
  const { toast } = useToast();
  
  const [emailType, setEmailType] = useState<'event-reminder' | 'event-update'>('event-reminder');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<EmailStatus>({ type: null, message: '', details: undefined });

  const userEvents = user ? getEventsByCreator(user.uid) : [];
  const selectedEvent = userEvents.find(e => e.id === selectedEventId);

  const handleSendEmail = async () => {
    if (!selectedEvent) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select an event.' });
        return;
    }
    
    setStatus({ type: 'loading', message: 'Sending emails...', details: undefined });

    try {
      const emailData = {
        type: emailType,
        recipientType: 'event-attendees',
        eventId: selectedEvent.id,
        recipients: [], // Will be fetched on the server
        message,
        eventTitle: selectedEvent.name,
        eventDate: new Date(selectedEvent.date).toLocaleDateString('en-US', { dateStyle: 'full' }),
        eventLocation: selectedEvent.location,
        senderRole: 'organizer',
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Email batch processed!',
          details: result.details
        });
        setMessage('');
        toast({
          title: 'Success',
          description: `Emails sent to ${result.details?.successful || 0} recipients`,
        });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send emails' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while sending emails' });
    }
  };

  const isFormValid = () => {
    if (!selectedEventId) return false;
    if (emailType === 'event-update' && !message.trim()) return false;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Email Your Attendees</h1>
          <p className="text-gray-600">Send reminders and updates for your events.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>
            Select an event and compose your message below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={emailType} onValueChange={(value) => setEmailType(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="event-reminder" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Reminder
              </TabsTrigger>
              <TabsTrigger value="event-update" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Event Update
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <Label htmlFor="eventSelect">Select Event</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger id="eventSelect">
                <SelectValue placeholder="Choose an event..." />
              </SelectTrigger>
              <SelectContent>
                {userEvents.length > 0 ? userEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString()}
                  </SelectItem>
                )) : <SelectItem value="none" disabled>No events found</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">
              {emailType === 'event-reminder' ? 'Additional Message (optional)' : 'Update Message'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                emailType === 'event-reminder' 
                  ? 'Add any extra details...'
                  : 'Let attendees know what has changed...'
              }
              className="min-h-[150px]"
            />
             <p className="text-sm text-gray-500 mt-1">
                {emailType === 'event-reminder' 
                ? 'A standard reminder with event details will be sent. Add any extra notes here.'
                : 'Your message will be sent as an update to all attendees of the selected event.'}
            </p>
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
                      <Badge variant="outline">Total Recipients: {status.details.total}</Badge>
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

          <Button
            onClick={handleSendEmail}
            disabled={!isFormValid() || status.type === 'loading'}
            className="w-full"
            size="lg"
          >
            {status.type === 'loading' ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Send Email</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
