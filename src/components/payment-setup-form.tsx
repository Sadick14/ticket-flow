
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  DollarSign, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Wallet,
  Info
} from 'lucide-react';
import { PAYMENT_GATEWAYS, PaymentCalculator, PAYMENT_CONFIG } from '@/lib/payment-config';
import type { PaymentGateway, CreatorPaymentProfile } from '@/lib/payment-types';

interface PaymentSetupProps {
  onComplete: (profile: Partial<CreatorPaymentProfile>) => void;
  onSkip?: () => void;
  existingProfile?: CreatorPaymentProfile;
}

export function PaymentSetupForm({ onComplete, onSkip, existingProfile }: PaymentSetupProps) {
  const mtnGateway = PAYMENT_GATEWAYS.find(g => g.id === 'mtn-momo')!;
  
  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'monthly'>(
    existingProfile?.payoutSchedule || 'weekly'
  );
  const [minimumPayout, setMinimumPayout] = useState(
    existingProfile?.minimumPayoutAmount || 2000
  );
  
  const [momoDetails, setMomoDetails] = useState({
    momoNumber: existingProfile?.momoNumber || '',
    momoNetwork: existingProfile?.momoNetwork || 'MTN'
  });

  const [taxInfo, setTaxInfo] = useState({
    taxId: existingProfile?.taxInformation?.taxId || '',
    country: existingProfile?.taxInformation?.country || 'GH',
    businessType: existingProfile?.taxInformation?.businessType || 'individual' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profile: Partial<CreatorPaymentProfile> = {
      preferredGateway: 'mtn-momo',
      payoutSchedule,
      minimumPayoutAmount: minimumPayout,
      momoNumber: momoDetails.momoNumber,
      momoNetwork: momoDetails.momoNetwork,
      taxInformation: taxInfo,
      isVerified: false,
      paymentMethod: 'momo'
    };

    onComplete(profile);
  };

  const exampleSplit = PaymentCalculator.calculatePaymentSplit(5000, mtnGateway);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Payment Setup</h1>
        <p className="text-muted-foreground">
          Configure your MTN Mobile Money to receive earnings from ticket sales.
        </p>
      </div>

      {/* Fee Structure Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Payment Processing Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Fee Structure</h4>
              <ul className="space-y-1 text-sm">
                <li>• Platform Commission: <strong>{PAYMENT_CONFIG.adminCommissionRate * 100}%</strong> (helps maintain the platform)</li>
                <li>• Platform Fee: <strong>{PAYMENT_CONFIG.platformFee * 100}%</strong> (operational costs)</li>
                <li>• MTN MoMo Processing: <strong>{mtnGateway.processingFee}%</strong></li>
                <li>• You receive the remaining amount</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Example: 50 GHS Ticket</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Ticket Price:</span>
                  <span>{PaymentCalculator.formatCurrency(5000)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Commission ({PAYMENT_CONFIG.adminCommissionRate * 100}%):</span>
                  <span>-{PaymentCalculator.formatCurrency(exampleSplit.adminCommission)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee ({PAYMENT_CONFIG.platformFee * 100}%):</span>
                  <span>-{PaymentCalculator.formatCurrency(exampleSplit.platformCommission)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee ({mtnGateway.processingFee}%):</span>
                  <span>-{PaymentCalculator.formatCurrency(exampleSplit.paymentProcessingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-green-600">
                  <span>You Receive:</span>
                  <span>{PaymentCalculator.formatCurrency(exampleSplit.creatorPayout)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payout Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>
              Configure when and how you want to receive your earnings via Mobile Money.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="momoNumber">Mobile Money Number</Label>
                <Input
                    id="momoNumber"
                    type="tel"
                    value={momoDetails.momoNumber}
                    onChange={(e) => setMomoDetails({...momoDetails, momoNumber: e.target.value})}
                    placeholder="e.g., 024xxxxxxx"
                    required
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="momoNetwork">Mobile Network</Label>
                <Select value={momoDetails.momoNetwork} onValueChange={(value) => setMomoDetails({...momoDetails, momoNetwork: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MTN">MTN</SelectItem>
                        <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                        <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                <Select value={payoutSchedule} onValueChange={(value: any) => setPayoutSchedule(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often you want to receive payouts
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumPayout">Minimum Payout Amount (GHS)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">GH₵</span>
                  <Input
                    id="minimumPayout"
                    type="number"
                    min="10"
                    step="10"
                    value={minimumPayout / 100}
                    onChange={(e) => setMinimumPayout(Math.max(1000, parseInt(e.target.value) * 100))}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: 10.00 GHS. Payouts below this amount will be held.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
            <CardDescription>
              Required for tax reporting and compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Account Type</Label>
                <Select value={taxInfo.businessType} onValueChange={(value: any) => setTaxInfo({...taxInfo, businessType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxCountry">Tax Country</Label>
                <Select value={taxInfo.country} onValueChange={(value) => setTaxInfo({...taxInfo, country: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID (e.g., Ghana Card TIN)</Label>
                <Input
                  id="taxId"
                  value={taxInfo.taxId}
                  onChange={(e) => setTaxInfo({...taxInfo, taxId: e.target.value})}
                  placeholder="Optional but recommended"
                />
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tax information helps us generate accurate tax forms. You're responsible for reporting earnings in your jurisdiction.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          {onSkip && (
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip for Now
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button type="submit" className="min-w-[120px]">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
