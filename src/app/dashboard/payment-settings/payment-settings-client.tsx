'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { PaymentSetupForm } from '@/components/payment-setup-form';
import { PAYMENT_GATEWAYS, PaymentCalculator } from '@/lib/payment-config';
import type { CreatorPaymentProfile, Payout, Transaction, PaymentAnalytics } from '@/lib/payment-types';

export default function PaymentSettingsClient() {
  const [profile, setProfile] = useState<CreatorPaymentProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [recentPayouts, setRecentPayouts] = useState<Payout[]>([]);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    // Load payment profile and analytics
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    // TODO: Implement API calls
    // Simulate data for now
    setProfile({
      userId: 'user123',
      preferredGateway: 'stripe',
      minimumPayoutAmount: 2000,
      payoutSchedule: 'weekly',
      isVerified: true,
      bankAccountDetails: {
        accountNumber: '****1234',
        routingNumber: '****5678',
        accountHolderName: 'John Doe',
        bankName: 'Chase Bank',
        country: 'US'
      }
    });

    setAnalytics({
      totalRevenue: 125000,
      platformCommission: 6250,
      adminCommission: 6250,
      creatorPayouts: 108750,
      processingFees: 3750,
      refunds: 2500,
      period: {
        start: '2025-06-01',
        end: '2025-07-13'
      },
      gatewayBreakdown: {
        stripe: { volume: 100000, transactions: 150, fees: 3000 },
        paypal: { volume: 25000, transactions: 30, fees: 750 },
        razorpay: { volume: 0, transactions: 0, fees: 0 },
        flutterwave: { volume: 0, transactions: 0, fees: 0 }
      }
    });

    setRecentPayouts([
      {
        id: 'payout_1',
        creatorId: 'user123',
        amount: 15000,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        transactionIds: ['tx_1', 'tx_2'],
        scheduledDate: '2025-07-08',
        processedDate: '2025-07-08'
      },
      {
        id: 'payout_2',
        creatorId: 'user123',
        amount: 8750,
        currency: 'USD',
        status: 'processing',
        paymentMethod: 'bank_transfer',
        transactionIds: ['tx_3'],
        scheduledDate: '2025-07-15'
      }
    ]);

    setPendingBalance(4250);
    setAvailableBalance(12800);
  };

  const handlePaymentSetup = (newProfile: Partial<CreatorPaymentProfile>) => {
    // TODO: Save to API
    setProfile(prev => prev ? { ...prev, ...newProfile } : null);
    setShowSetup(false);
  };

  const requestPayout = async () => {
    // TODO: Implement payout request
    console.log('Requesting payout...');
  };

  const selectedGateway = PAYMENT_GATEWAYS.find(g => g.id === profile?.preferredGateway);

  if (!profile || showSetup) {
    return (
      <PaymentSetupForm
        onComplete={handlePaymentSetup}
        existingProfile={profile || undefined}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">
            Manage your earnings, payouts, and payment preferences
          </p>
        </div>
        <Button onClick={() => setShowSetup(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Edit Settings
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(availableBalance / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for next payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${(pendingBalance / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Processing from recent sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics ? (analytics.creatorPayouts / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            onClick={requestPayout}
            disabled={availableBalance < (profile.minimumPayoutAmount || 2000)}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Request Payout
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Statement
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Balance
          </Button>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{selectedGateway?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {profile.bankAccountDetails?.bankName} ending in {profile.bankAccountDetails?.accountNumber}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {profile.isVerified ? (
                    <Badge variant="secondary" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {selectedGateway?.processingFee}% + ${(selectedGateway?.fixedFee || 0) / 100}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Payout Schedule</div>
              <div className="font-semibold capitalize">{profile.payoutSchedule}</div>
              <div className="text-xs text-muted-foreground">
                Minimum: ${(profile.minimumPayoutAmount / 100).toFixed(2)}
              </div>
            </div>
          </div>

          {!profile.isVerified && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account needs verification to receive payouts. 
                <Button variant="link" className="p-0 h-auto font-semibold">
                  Complete verification <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${
                    payout.status === 'completed' ? 'bg-green-500' :
                    payout.status === 'processing' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <div className="font-semibold">
                      ${(payout.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payout.processedDate ? 
                        `Completed on ${new Date(payout.processedDate).toLocaleDateString()}` :
                        `Scheduled for ${new Date(payout.scheduledDate).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </div>
                <Badge variant={
                  payout.status === 'completed' ? 'secondary' :
                  payout.status === 'processing' ? 'default' :
                  'outline'
                }>
                  {payout.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Earnings Summary
            </CardTitle>
            <CardDescription>
              {new Date(analytics.period.start).toLocaleDateString()} - {new Date(analytics.period.end).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Gross Revenue</div>
                <div className="text-2xl font-bold">
                  ${(analytics.totalRevenue / 100).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Platform Fees</div>
                <div className="text-2xl font-bold text-red-600">
                  -${((analytics.platformCommission + analytics.adminCommission) / 100).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Processing Fees</div>
                <div className="text-2xl font-bold text-red-600">
                  -${(analytics.processingFees / 100).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Net Earnings</div>
                <div className="text-2xl font-bold text-green-600">
                  ${(analytics.creatorPayouts / 100).toFixed(2)}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h4 className="font-semibold mb-3">Payment Gateway Breakdown</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(analytics.gatewayBreakdown).map(([gatewayId, data]) => {
                  const gateway = PAYMENT_GATEWAYS.find(g => g.id === gatewayId);
                  if (!gateway || data.volume === 0) return null;
                  
                  return (
                    <div key={gatewayId} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{gateway.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.transactions} transactions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${(data.volume / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(data.fees / 100).toFixed(2)} fees
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
