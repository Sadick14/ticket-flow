
'use client';

import { Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSettingsClient() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <Card>
        <CardHeader>
          <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Payments Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are working hard to launch our full payment and payout system. You'll soon be able to manage your earnings and get paid directly from your dashboard.
          </p>
          <p className="text-muted-foreground mt-4">
            Thank you for your patience!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
