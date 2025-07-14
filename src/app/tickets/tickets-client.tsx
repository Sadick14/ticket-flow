
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import type { Ticket, Event } from '@/lib/types';
import { ViewTicketDialog } from '@/components/view-ticket-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Ticket as TicketIcon, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { TicketCard } from '@/components/ticket-card';
import { useToast } from '@/hooks/use-toast';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"


export default function TicketsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const { getUserTickets, loading: appLoading, getEventById } = useAppContext();
  const [attendeeEmail, setAttendeeEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setAttendeeEmail(user.email);
    }
  }, [user]);

  const handleShowTickets = () => {
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

  const handleViewTicket = async (ticket: Ticket) => {
    const eventData = await getEventById(ticket.eventId);
    if (eventData) {
      setSelectedTicket(ticket);
      setSelectedEvent(eventData);
      setIsViewModalOpen(true);
    }
  };

  if (authLoading || appLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  const userTickets = attendeeEmail ? getUserTickets(attendeeEmail) : [];

  const renderContent = () => {
    if (!attendeeEmail) {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                    <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Find Your Tickets</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter the email address you used during purchase to view your tickets.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleShowTickets()}
                        />
                        <Button onClick={handleShowTickets}>Show My Tickets</Button>
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
                    {otpSent ? `We sent a code to ${attendeeEmail}. Please enter it below.` : "To protect your tickets, we need to verify your email."}
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

    if (userTickets.length > 0) {
        return (
          <div className="space-y-6">
            {userTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onViewTicket={() => handleViewTicket(ticket)} />
            ))}
          </div>
        )
    }

    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No Tickets Found for {attendeeEmail}</h3>
        <p className="mt-1 text-sm text-muted-foreground">You haven&apos;t purchased any tickets with this email yet.</p>
        <div className="mt-6">
            <Button asChild>
            <Link href="/">Browse Events</Link>
            </Button>
        </div>
        </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">My Tickets</h1>
          <p className="mt-2 text-lg text-muted-foreground">Here are all the tickets you have purchased.</p>
        </div>
        {renderContent()}
      </div>

      {selectedTicket && selectedEvent && (
        <ViewTicketDialog
          ticket={selectedTicket}
          event={selectedEvent}
          isOpen={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        />
      )}
    </>
  );
}
