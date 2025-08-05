
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { Loader2, CreditCard, CheckCircle, RefreshCw, AlertCircle, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FirebasePaymentService } from '@/lib/firebase-payment-service';
import { useToast } from '@/hooks/use-toast';
import { PaymentCalculator } from '@/lib/payment-config';
import type { Payout, CreatorPaymentProfile } from '@/lib/payment-types';

export default function AdminPayoutsPage() {
  const { users, loading } = useAppContext();
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [paymentProfiles, setPaymentProfiles] = useState<Record<string, CreatorPaymentProfile | null>>({});
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
        setPayoutsLoading(true);
        const fetchedPayouts = await FirebasePaymentService.getPendingPayouts();
        setPayouts(fetchedPayouts);
        setPayoutsLoading(false);
    }
    fetchPayouts();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (payouts.length > 0) {
        const creatorIds = [...new Set(payouts.map(p => p.creatorId))];
        const profiles: Record<string, CreatorPaymentProfile | null> = {};
        for (const id of creatorIds) {
          if (!paymentProfiles[id]) { // Fetch only if not already fetched
            profiles[id] = await FirebasePaymentService.getPaymentProfile(id);
          }
        }
        setPaymentProfiles(prev => ({...prev, ...profiles}));
      }
    };
    fetchProfiles();
  }, [payouts]);


  const handleProcessPayout = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      await FirebasePaymentService.updatePayout(payoutId, { status: 'completed' });
      
      const updatedPayouts = await FirebasePaymentService.getPendingPayouts();
      setPayouts(updatedPayouts);
      
      toast({
        title: "Payout Processed",
        description: "The payout has been marked as completed."
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Payout Failed",
        description: "Could not process the payout."
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getUserById = (id: string) => users.find(u => u.uid === id);

  const getStatusBadge = (status: 'pending' | 'processing' | 'completed' | 'failed') => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline"><AlertCircle className="mr-1 h-3 w-3 text-yellow-500" />Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary"><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'failed':
         return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payout Management</h1>
        <p className="text-muted-foreground">Review and process creator payout requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Queue</CardTitle>
          <CardDescription>
            {payouts.length} payout(s) currently pending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payout To</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutsLoading || loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : payouts.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">
                     <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No pending payouts.
                    </TableCell></TableRow>
                ) : (
                  payouts.map(payout => {
                    const creator = getUserById(payout.creatorId);
                    const paymentProfile = paymentProfiles[payout.creatorId];
                    return (
                        <TableRow key={payout.id}>
                            <TableCell>
                                {creator ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={creator.photoURL || ''} />
                                            <AvatarFallback>{creator.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{creator.displayName}</div>
                                            <div className="text-xs text-muted-foreground">{creator.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Unknown Creator</div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{PaymentCalculator.formatCurrency(payout.amount, 'GHS')}</Badge>
                            </TableCell>
                             <TableCell>
                               {paymentProfile ? (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="h-3 w-3" />
                                  <span className="font-mono text-xs">{paymentProfile.momoNumber} ({paymentProfile.momoNetwork})</span>
                                </div>
                               ) : (
                                 <span className="text-xs text-muted-foreground">Loading...</span>
                               )}
                            </TableCell>
                             <TableCell>
                                {format(parseISO(payout.scheduledDate), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>{getStatusBadge(payout.status)}</TableCell>
                             <TableCell className="text-right">
                                {payout.status === 'pending' && (
                                   <Button 
                                      size="sm" 
                                      onClick={() => handleProcessPayout(payout.id)}
                                      disabled={processingId === payout.id || !paymentProfile}
                                    >
                                      {processingId === payout.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                      )}
                                      Process
                                    </Button>
                                )}
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
