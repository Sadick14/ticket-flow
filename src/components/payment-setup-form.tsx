'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Info,
  Ban
} from 'lucide-react';
import { PAYMENT_GATEWAYS, PaymentCalculator } from '@/lib/payment-config';
import type { PaymentGateway, CreatorPaymentProfile } from '@/lib/payment-types';

interface PaymentSetupProps {
  onComplete: (profile: Partial<CreatorPaymentProfile>) => void;
  onSkip?: () => void;
  existingProfile?: CreatorPaymentProfile;
}

export function PaymentSetupForm({ onComplete, onSkip, existingProfile }: PaymentSetupProps) {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway['id']>(
    existingProfile?.preferredGateway || 'stripe'
  );
  const [payoutSchedule, setPayoutSchedule] = useState<'daily' | 'weekly' | 'monthly'>(
    existingProfile?.payoutSchedule || 'weekly'
  );
  const [minimumPayout, setMinimumPayout] = useState(
    existingProfile?.minimumPayoutAmount || 2000
  );

  const [bankDetails, setBankDetails] = useState({
    accountNumber: existingProfile?.bankAccountDetails?.accountNumber || '',
    routingNumber: existingProfile?.bankAccountDetails?.routingNumber || '',
    accountHolderName: existingProfile?.bankAccountDetails?.accountHolderName || '',
    bankName: existingProfile?.bankAccountDetails?.bankName || '',
    country: existingProfile?.bankAccountDetails?.country || 'US'
  });

  const [paypalEmail, setPaypalEmail] = useState(existingProfile?.paypalEmail || '');
  const [taxInfo, setTaxInfo] = useState({
    taxId: existingProfile?.taxInformation?.taxId || '',
    country: existingProfile?.taxInformation?.country || 'US',
    businessType: existingProfile?.taxInformation?.businessType || 'individual' as const
  });

  const selectedGatewayConfig = PAYMENT_GATEWAYS.find(g => g.id === selectedGateway)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profile: Partial<CreatorPaymentProfile> = {
      preferredGateway: selectedGateway,
      payoutSchedule,
      minimumPayoutAmount: minimumPayout,
      bankAccountDetails: selectedGateway === 'stripe' || selectedGateway === 'razorpay' ? bankDetails : undefined,
      paypalEmail: selectedGateway === 'paypal' ? paypalEmail : undefined,
      taxInformation: taxInfo,
      isVerified: false
    };

    onComplete(profile);
  };

  const exampleSplit = PaymentCalculator.calculatePaymentSplit(5000, selectedGatewayConfig); // $50 ticket

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Payment Setup</h1>
        <p className="text-muted-foreground">
          Configure your payment preferences to receive earnings from ticket sales
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
                <li>• Platform Commission: <strong>5%</strong> (helps maintain the platform)</li>
                <li>• Platform Fee: <strong>1%</strong> (operational costs)</li>
                <li>• Payment Processing: <strong>Varies by gateway</strong></li>
                <li>• You receive the remaining amount</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Example: $50 Ticket</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Ticket Price:</span>
                  <span>$50.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Commission (5%):</span>
                  <span>-${(exampleSplit.adminCommission / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee (1%):</span>
                  <span>-${(exampleSplit.platformCommission / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee ({selectedGatewayConfig.processingFee}%):</span>
                  <span>-${(exampleSplit.paymentProcessingFee / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-green-600">
                  <span>You Receive:</span>
                  <span>${(exampleSplit.creatorPayout / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Gateway Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Payment Gateway</CardTitle>
            <CardDescription>
              Select your preferred payment processor. Different gateways have different fees and supported regions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {PAYMENT_GATEWAYS.map((gateway) => (
                <div
                  key={gateway.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedGateway === gateway.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedGateway(gateway.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{gateway.name}</h4>
                        {selectedGateway === gateway.id && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {gateway.processingFee}% + ${(gateway.fixedFee / 100).toFixed(2)} per transaction
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {gateway.supportedCountries.slice(0, 5).map(country => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {gateway.supportedCountries.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{gateway.supportedCountries.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
            <CardDescription>
              Configure when and how you want to receive your earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Label htmlFor="minimumPayout">Minimum Payout Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  Minimum: $10.00. Payouts below this amount will be held until reached.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Set up how you want to receive your payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedGateway} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="stripe">Stripe</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
                <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
                <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stripe" className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Stripe Connect will securely handle your payouts. You'll be redirected to Stripe to complete verification.
                  </AlertDescription>
                </Alert>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                      placeholder="Full legal name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={bankDetails.country} onValueChange={(value) => setBankDetails({...bankDetails, country: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="NG">Nigeria</SelectItem>
                        <SelectItem value="GH">Ghana</SelectItem>
                        <SelectItem value="KE">Kenya</SelectItem>
                        <SelectItem value="ZA">South Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="paypal" className="space-y-4">
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Enter your PayPal email address to receive payouts directly to your PayPal account.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="paypalEmail">PayPal Email Address</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="razorpay" className="space-y-4">
                <Alert>
                  <Ban className="h-4 w-4" />
                  <AlertDescription>
                    Razorpay will handle payouts to your bank account. Popular in India and Southeast Asia.
                  </AlertDescription>
                </Alert>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      placeholder="Bank account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">IFSC/Sort Code</Label>
                    <Input
                      id="routingNumber"
                      value={bankDetails.routingNumber}
                      onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                      placeholder="Bank routing/IFSC code"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="flutterwave" className="space-y-4">
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertDescription>
                    Flutterwave supports bank transfers across Africa. Great for Nigeria, Ghana, Kenya, and more.
                  </AlertDescription>
                </Alert>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      placeholder="Bank account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      placeholder="Your bank name"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="GH">Ghana</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="ZA">South Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  value={taxInfo.taxId}
                  onChange={(e) => setTaxInfo({...taxInfo, taxId: e.target.value})}
                  placeholder="SSN, EIN, or Tax ID"
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
