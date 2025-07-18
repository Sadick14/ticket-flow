
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import type { Ticket, Event, SubscriptionRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Ticket as TicketIcon, Loader2, KeyRound, CheckCircle, Hourglass, Star, Copy, XCircle, Ban } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { PageHero } from '@/components/page-hero';
import { format, parseISO, isPast } from 'date-fns';
import { PaymentCalculator } from '@/lib/payment-config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { 
    getUserTicketsByEmail, 
    getUserSubscriptionRequests, 
    loading: appLoading, 
    deleteTicket,
  } = useAppContext();
  
  const [attendeeEmail, setAttendeeEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<SubscriptionRequest[]>([]);
  
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);


  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setAttendeeEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isVerified && attendeeEmail) {
      const fetchItems = async () => {
        const fetchedTickets = await getUserTicketsByEmail(attendeeEmail);
        setTickets(fetchedTickets);
        
        const fetchedSubs = await getUserSubscriptionRequests(attendeeEmail);
        setPendingSubscriptions(fetchedSubs.filter(s => s.status === 'pending'));
      };
      fetchItems();
    }
  }, [isVerified, attendeeEmail, getUserTicketsByEmail, getUserSubscriptionRequests]);

  const handleShowItems = () => {
    if (emailInput) {
      setAttendeeEmail(emailInput);
      setIsVerified(false);
      setOtpSent(false);
      setOtp('');
    }
  };

  const handleSendOtp = async () => {
    if (!attendeeEmail) return;
    setIsVerifying(true);
    try {
        const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: attendeeEmail, name: user?.displayName || '' })
        });
        if (!res.ok) throw new Error('Failed to send OTP.');
        setOtpSent(true);
        toast({ title: 'OTP Sent', description: 'Check your email for the verification code.' });
    } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send OTP. Please try again.' });
    } finally {
        setIsVerifying(false);
    }
  }

  const handleVerifyOtp = async () => {
    if (!attendeeEmail || otp.length < 6) return;
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: attendeeEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      setIsVerified(true);
      toast({ title: 'Success', description: 'Email verified successfully.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: e.message });
    } finally {
      setIsVerifying(false);
    }
  }
  
  const handleCancelTicket = async (ticketId: string) => {
    setIsCancelling(ticketId);
    try {
      await deleteTicket(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      toast({ title: "Booking Cancelled", description: "Your ticket reservation has been cancelled." });
    } catch {
      toast({ variant: 'destructive', title: "Cancellation Failed" });
    } finally {
      setIsCancelling(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Booking code copied!" });
  };
  
  const renderContent = () => {
    if (!attendeeEmail) {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                    <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Find Your Bookings</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter the email address you used during purchase to view your tickets and subscriptions.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleShowItems()}
                        />
                        <Button onClick={handleShowItems}>View My Items</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!isVerified) {
        return (
             <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><KeyRound/> Email Verification</CardTitle>
                  <CardDescription>
                    {otpSent ? `We sent a code to ${attendeeEmail}. Please enter it below.` : "To protect your information, we need to verify your email."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 text-center space-y-4">
                    {otpSent ? (
                        <div className="space-y-4">
                             <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                             <Button onClick={handleVerifyOtp} disabled={isVerifying || otp.length < 6} className="w-full">
                                {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify'}
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleSendOtp} disabled={isVerifying} className="w-full" size="lg">
                            {isVerifying ? <Loader2 className="animate-spin" /> : 'Send Verification Code'}
                        </Button>
                    )}
                    <Button variant="link" size="sm" onClick={() => setAttendeeEmail(null)}>Use a different email</Button>
                </CardContent>
            </Card>
        )
    }

    if (tickets.length === 0 && pendingSubscriptions.length === 0) {
      return (
        <Card>
            <CardContent className="py-16 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-medium text-foreground">You're All Set!</h3>
                <p className="mt-1 text-sm text-muted-foreground">You have no items pending for {attendeeEmail}.</p>
                <div className="mt-6">
                    <Button asChild>
                      <Link href="/events">Browse More Events</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-8">
        {pendingSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star/> Pending Subscription</CardTitle>
              <CardDescription>Your subscription upgrade is awaiting payment confirmation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingSubscriptions.map(sub => (
                <div key={sub.id} className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{sub.plan} Plan</h4>
                    <p className="font-bold text-primary">{PaymentCalculator.formatCurrency(sub.price, 'GHS')}</p>
                  </div>
                   <p className="text-sm text-muted-foreground">Please complete the payment using the booking code below as your reference.</p>
                   <div className="flex items-center gap-2">
                      <Input readOnly value={sub.bookingCode} className="font-mono text-xs h-8"/>
                      <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(sub.bookingCode)}><Copy className="h-4 w-4"/></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {tickets.length > 0 && (
           <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TicketIcon/> My Tickets</CardTitle>
                <CardDescription>All your tickets, both pending and confirmed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tickets.map(ticket => {
                  const isTicketExpired = ticket.event ? isPast(new Date(`${ticket.event.date}T23:59:59`)) : false;

                  return (
                  <div key={ticket.id} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                        <div>
                           <p className="text-sm text-muted-foreground">Ticket for {ticket.attendeeName}</p>
                           <h4 className="font-semibold text-lg">{ticket.event?.name || 'Loading event...'}</h4>
                        </div>
                        <p className="font-bold text-primary">{PaymentCalculator.formatCurrency(ticket.price * 100, 'GHS')}</p>
                    </div>
                     <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {isTicketExpired ? (
                            <Badge variant="outline"><Ban className="mr-1 h-3 w-3" />Expired</Badge>
                          ) : ticket.status === 'confirmed' ? (
                            <Badge className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Confirmed</Badge>
                          ) : (
                            <Badge variant="destructive"><Hourglass className="mr-1 h-3 w-3" />Pending Payment</Badge>
                          )}
                        </div>
                        {ticket.status === 'pending' && !isTicketExpired && (
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isCancelling === ticket.id}>
                                {isCancelling === ticket.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />}
                                Cancel Booking
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will cancel your unpaid ticket reservation for {ticket.event?.name}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelTicket(ticket.id)}>
                                  Yes, Cancel It
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>

                      {ticket.status === 'pending' && !isTicketExpired && (
                        <div className="mt-3 p-3 bg-blue-50/50 rounded-md border border-blue-200">
                          <p className="text-sm text-blue-700 font-medium mb-1">Action Required</p>
                          <p className="text-xs text-blue-600">Please use the booking code below as a reference to complete your payment.</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Input readOnly value={ticket.bookingCode} className="font-mono text-xs h-8"/>
                            <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(ticket.bookingCode)}><Copy className="h-4 w-4"/></Button>
                          </div>
                        </div>
                      )}
                  </div>
                )})}
              </CardContent>
            </Card>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="My Page"
        backgroundImage = "/2.jpg"
        description="Here you can find all your pending tickets and subscriptions that are awaiting approval."
      />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {appLoading || authLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : renderContent()}
      </div>
    </div>
  );
}
