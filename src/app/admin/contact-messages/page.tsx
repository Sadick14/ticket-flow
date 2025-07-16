
'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, MessageSquare, Send, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { ContactSubmission } from '@/lib/types';

export default function AdminContactMessagesPage() {
  const { contactSubmissions, loading, replyToSubmission } = useAppContext();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const handleOpenDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setReplyMessage('');
  };

  const handleSendReply = async () => {
    if (!selectedSubmission || !replyMessage) return;
    setIsReplying(true);
    try {
      await replyToSubmission(selectedSubmission, replyMessage);
      toast({ title: 'Reply Sent!', description: `Your reply has been sent to ${selectedSubmission.email}.` });
      setSelectedSubmission(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send reply.' });
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status: ContactSubmission['status']) => {
    switch (status) {
      case 'new': return <Badge variant="destructive">New</Badge>;
      case 'read': return <Badge variant="secondary">Read</Badge>;
      case 'replied': return <Badge variant="outline">Replied</Badge>;
      default: return <Badge variant="outline">Archived</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">View and reply to messages from users.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>{contactSubmissions.length} message(s) received.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : contactSubmissions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No messages yet.
                  </TableCell></TableRow>
                ) : (
                  contactSubmissions.map(submission => (
                    <TableRow key={submission.id} className={submission.status === 'new' ? 'font-bold' : ''}>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div>{submission.name}</div>
                        <div className="text-xs text-muted-foreground">{submission.email}</div>
                      </TableCell>
                      <TableCell>{submission.subject}</TableCell>
                      <TableCell>{format(parseISO(submission.submittedAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(submission)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={(isOpen) => !isOpen && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message from {selectedSubmission?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedSubmission?.subject}</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-md border">
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission?.message}</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="replyMessage">Your Reply</Label>
                <Textarea 
                    id="replyMessage"
                    placeholder={`Hi ${selectedSubmission?.name}, thanks for reaching out...`}
                    rows={6}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={handleSendReply} disabled={isReplying || !replyMessage}>
              {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
