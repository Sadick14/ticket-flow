
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { PaymentSetupForm } from '@/components/payment-setup-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Wallet } from 'lucide-react';
import type { CreatorPaymentProfile } from '@/lib/payment-types';
import { FirebasePaymentService } from '@/lib/firebase-payment-service';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSettingsClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CreatorPaymentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      FirebasePaymentService.getPaymentProfile(user.uid)
        .then((p) => {
          setProfile(p);
          if (!p) setIsEditing(true); // If no profile, go straight to edit mode
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSaveProfile = async (data: Partial<CreatorPaymentProfile>) => {
    if (!user) return;
    setIsSaving(true);
    try {
        await FirebasePaymentService.savePaymentProfile({ ...data, userId: user.uid });
        const updatedProfile = await FirebasePaymentService.getPaymentProfile(user.uid);
        setProfile(updatedProfile);
        setIsEditing(false);
        toast({
            title: 'Success!',
            description: 'Your payment settings have been saved.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to save your settings. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (isEditing || !profile) {
    return (
        <PaymentSetupForm 
            onComplete={handleSaveProfile}
            existingProfile={profile || undefined}
            onSkip={profile ? () => setIsEditing(false) : undefined}
        />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5"/>
            Your Payout Details
          </CardTitle>
          <CardDescription>
            This is where your earnings from ticket sales will be sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
                <p className="text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="h-4 w-4"/>
                    <span>Verified</span>
                </div>
            </div>
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-semibold uppercase">{profile.paymentMethod}</p>
            </div>
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <p className="text-muted-foreground">Mobile Money Number</p>
                <p className="font-semibold">{profile.momoNumber}</p>
            </div>
             <div className="flex items-center justify-between p-3 border rounded-lg">
                <p className="text-muted-foreground">Network</p>
                <p className="font-semibold">{profile.momoNetwork}</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
