
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import type { Ticket, Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket as TicketIcon, Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TicketCard } from '@/components/ticket-card';
import { ViewTicketDialog } from '@/components/view-ticket-dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { PageHero } from '@/components/page-hero';

export default function MyTicketsClient() {
  const { user, loading: authLoading } = useAuth();
  const { getUserTicketsByEmail, loading: appLoading } = useAppContext();
  
  const [attendeeEmail, setAttendeeEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setAttendeeEmail(user.email);
      setIsVerified(true);
    }
  }, [user]);

  useEffect(() => {
    if (isVerified && attendeeEmail) {
      getUserTicketsByEmail(attendeeEmail).then(setTickets);
    }
  }, [isVerified, attendeeEmail, getUserTicketsByEmail]);

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

  const renderContent = () => {
    if (!attendeeEmail) {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                    <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">View Your Tickets</h3>
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
                        <Button onClick={handleShowTickets}>Find My Tickets</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!isVerified) {
        return (
             <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2"><KeyRound/> Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {otpSent ? `We sent a code to ${attendeeEmail}.` : "To view your tickets, we need to verify your email."}
                    </p>
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

    if (tickets.length === 0) {
      return (
        <Card>
            <CardContent className="py-16 text-center">
                <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No Tickets Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">No tickets were found for {attendeeEmail}.</p>
            </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {tickets.map(ticket => (
            ticket.event ? 
            <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onViewTicket={() => setSelectedTicket(ticket)}
            />
            : null
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="My Tickets"
        description="Access all your event tickets in one place."
        backgroundImage="/tickets-hero.jpg"
      />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {appLoading || authLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : renderContent()}
      </div>

       {selectedTicket && selectedTicket.event && (
        <ViewTicketDialog
          isOpen={!!selectedTicket}
          onOpenChange={() => setSelectedTicket(null)}
          ticket={selectedTicket}
          event={selectedTicket.event}
        />
      )}
    </div>
  );
}
