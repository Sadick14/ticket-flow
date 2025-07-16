
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { Loader2, Mail, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminSubscribersPage() {
  const { launchSubscribers, loading } = useAppContext();
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);

  const handleNotify = async () => {
    setIsNotifying(true);
    try {
      // The secret key here is a simple security measure for the demo.
      // In a real production app, this should be a more secure, unique key
      // stored in your environment variables.
      const response = await fetch('/api/notify-subscribers?key=your-super-secret-key');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send notifications.');
      }

      toast({
        title: 'Notifications Sent!',
        description: `Emails have been sent to ${data.sentCount} subscribers.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Emails',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsNotifying(false);
    }
  };
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscribers</h1>
          <p className="text-muted-foreground">Users who subscribed to launch and newsletter notifications.</p>
        </div>
        <Button onClick={handleNotify} disabled={launchSubscribers.length === 0 || isNotifying}>
            {isNotifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Mail className="mr-2 h-4 w-4" />
            )}
            {isNotifying ? 'Sending...' : 'Notify All Subscribers'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>
            {launchSubscribers.length} user(s) have subscribed for notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Subscribed On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : launchSubscribers.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8">
                     <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No subscribers found yet.
                    </TableCell></TableRow>
                ) : (
                  launchSubscribers.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.email}</TableCell>
                      <TableCell>{sub.name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(sub.subscribedAt), 'MMM dd, yyyy')}</TableCell>
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
