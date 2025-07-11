
'use client';

import { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { Ticket, Event } from '@/lib/types';
import { Loader2, CheckCircle, XCircle, User, Ticket as TicketIcon, Calendar, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

interface TicketScannerProps {
  onScanSuccess: () => void;
}

export function TicketScanner({ onScanSuccess }: TicketScannerProps) {
  const { toast } = useToast();
  const { getTicketById, getEventById, checkInTicket } = useAppContext();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    if (scanResult) {
      handleScanResult(scanResult.text);
    }
  }, [scanResult]);

  const handleScanResult = async (result: string) => {
    setIsLoading(true);
    setTicket(null);
    setEvent(null);
    setError(null);
    
    try {
      const ticketData = await getTicketById(result);

      if (!ticketData) {
        throw new Error("Invalid Ticket: This QR code is not a valid ticket.");
      }

      setTicket(ticketData);

      const eventData = await getEventById(ticketData.eventId);
      if (!eventData) {
        throw new Error("Invalid Event: The event for this ticket could not be found.");
      }
      setEvent(eventData);

    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
      toast({
        variant: 'destructive',
        title: 'Scan Error',
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!ticket) return;

    setIsLoading(true);
    try {
      await checkInTicket(ticket.id);
      setTicket({ ...ticket, checkedIn: true });
      toast({
        title: 'Check-in Successful',
        description: `${ticket.attendeeName} has been checked in.`,
      });
      // Delay before resetting to show success message
      setTimeout(() => {
        resetScanner();
        onScanSuccess();
      }, 2000);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Check-in Failed',
        description: 'Could not update ticket status. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setTicket(null);
    setEvent(null);
    setError(null);
    setIsLoading(false);
  };

  if (isLoading && !ticket && !error) {
    return <div className="flex flex-col items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-4">Verifying ticket...</p></div>;
  }

  if (ticket && event) {
    return (
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {ticket.checkedIn ? <XCircle className="h-6 w-6 text-destructive" /> : <CheckCircle className="h-6 w-6 text-green-500" />}
            Verification Result
          </CardTitle>
          <CardDescription>
            {ticket.checkedIn ? "This ticket has already been used." : "Ticket is valid for check-in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold text-lg">{event.name}</h4>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-2 h-4 w-4"/>
              <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Attendee</p>
                <p className="font-semibold">{ticket.attendeeName}</p>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center">
              <TicketIcon className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ticket ID</p>
                <p className="font-mono text-xs">{ticket.id}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={resetScanner} className="w-full">Scan Another</Button>
            <Button 
              onClick={handleCheckIn} 
              disabled={ticket.checkedIn || isLoading} 
              className="w-full"
              variant={ticket.checkedIn ? "secondary" : "default"}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ticket.checkedIn ? 'Already Checked In' : 'Confirm Check-in'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
       <Card className="text-left border-destructive">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-destructive">
             <XCircle className="h-6 w-6" />
             Scan Failed
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            <p>{error}</p>
            <Button variant="outline" onClick={resetScanner} className="w-full">Try Again</Button>
         </CardContent>
       </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-lg border">
        <QrScanner
          onResult={(result) => setScanResult(result)}
          onError={(error) => console.log(error?.message)}
          constraints={{ video: { facingMode: 'environment' } }}
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ScanLine className="h-2/3 w-2/3 text-white/50 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Point your camera at the QR code on the ticket.
      </p>
    </div>
  );
}
