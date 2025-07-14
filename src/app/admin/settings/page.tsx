
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Manage platform-wide settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>
            These settings affect the entire platform. Be careful when making changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformFee">Platform Fee (%)</Label>
            <Input id="platformFee" type="number" defaultValue="5" />
            <p className="text-sm text-muted-foreground">
              The percentage fee TicketFlow takes from each ticket sale.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input id="supportEmail" type="email" defaultValue="support@ticketflow.com" />
            <p className="text-sm text-muted-foreground">
              The primary email address for customer support inquiries.
            </p>
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
