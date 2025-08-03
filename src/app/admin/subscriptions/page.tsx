
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { Loader2, Star, CheckCircle, Hourglass, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionRequest, UserProfile } from '@/lib/types';
import { PaymentCalculator } from '@/lib/payment-config';

export default function AdminSubscriptionsPage() {
  const { users, subscriptionRequests, approveSubscriptionRequest, loading } = useAppContext();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = useMemo(() => {
    return subscriptionRequests.filter(req => req.status === 'pending');
  }, [subscriptionRequests]);
  
  const getUserById = (id: string) => users.find(u => u.uid === id);

  const handleApprove = async (request: SubscriptionRequest) => {
    setProcessingId(request.id);
    const user = getUserById(request.userId);
    if (!user) {
        toast({ variant: 'destructive', title: "Error", description: "Could not find user for this request."});
        setProcessingId(null);
        return;
    }

    try {
      await approveSubscriptionRequest(request.id, request.userId, request.plan, user.email, user.displayName);
      toast({
        title: "Subscription Approved!",
        description: `User's plan has been upgraded to ${request.plan}.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Approval Failed",
        description: "Could not approve the subscription.",
      });
    } finally {
        setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Review and approve pending subscription requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Subscriptions</CardTitle>
          <CardDescription>
            {pendingRequests.length} subscription request(s) awaiting approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan Requested</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : pendingRequests.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">
                     <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No pending subscription requests.
                    </TableCell></TableRow>
                ) : (
                  pendingRequests.map(request => {
                    const user = getUserById(request.userId);
                    return (
                        <TableRow key={request.id}>
                            <TableCell>
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || ''} />
                                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{user.displayName}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Unknown User</div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{request.plan}</Badge>
                            </TableCell>
                             <TableCell>
                               <Badge>{PaymentCalculator.formatCurrency(request.price, 'GHS')}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-mono">{request.bookingCode}</Badge>
                            </TableCell>
                             <TableCell>
                                {request.requestedAt ? format(parseISO(request.requestedAt), 'MMM dd, yyyy') : 'N/A'}
                            </TableCell>
                             <TableCell className="text-right">
                               <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(request)}
                                  disabled={processingId === request.id}
                                >
                                  {processingId === request.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                  )}
                                  Approve
                                </Button>
                             </TableCell>
                        </TableRow>
                    )
                })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
