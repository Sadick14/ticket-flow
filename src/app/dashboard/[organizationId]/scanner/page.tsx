
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Ticket, User, Camera } from 'lucide-react';
import { TicketScanner } from '@/components/ticket-scanner';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Ticket Scanner</h1>
        <p className="text-muted-foreground">Scan attendee QR codes to check them in.</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          {isScanning ? (
            <TicketScanner onScanSuccess={() => setIsScanning(false)} />
          ) : (
            <>
              <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Scan</h3>
              <p className="text-muted-foreground mb-6">
                Click the button below to open your camera and start scanning tickets.
              </p>
              <Button size="lg" onClick={() => setIsScanning(true)}>
                <QrCode className="mr-2 h-5 w-5" />
                Start Scanning
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      {isScanning && (
        <Button variant="outline" onClick={() => setIsScanning(false)}>
          Cancel
        </Button>
      )}
    </div>
  );
}
