
'use client';

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

  const handleNotify = () => {
    // In a real app, this would trigger a backend process to send emails.
    toast({
        title: 'Simulating Notifications',
        description: `In a real app, emails would be sent to ${launchSubscribers.length} subscribers.`,
    })
  }
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Launch Subscribers</h1>
          <p className="text-muted-foreground">Users waiting for the launch notification.</p>
        </div>
        <Button onClick={handleNotify} disabled={launchSubscribers.length === 0}>
            <Mail className="mr-2 h-4 w-4" />
            Notify All Subscribers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>
            {launchSubscribers.length} user(s) have subscribed for launch notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <Avatar className="h-9 w-9">
                              <AvatarFallback>{sub.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span className="font-medium">{sub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sub.email}</TableCell>
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
