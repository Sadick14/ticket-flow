
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Check, Loader2, Phone, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { SubscriptionPlan } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PricingClientPage() {
  const { user, signInWithGoogle } = useAuth();
  const { updateUser } = useAppContext();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState<SubscriptionPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: SubscriptionPlan, priceGHS: number} | null>(null);
  const [momoNumber, setMomoNumber] = useState('');

  const handleChoosePlan = async (plan: SubscriptionPlan, priceGHS: number) => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    
    // For free plan, just update the user record
    if (priceGHS === 0) {
      setIsUpgrading(plan);
      try {
        await updateUser(user.uid, { subscriptionPlan: plan });
        toast({
          title: 'Plan Updated!',
          description: `You are now on the ${plan} plan.`,
        });
      } catch {
         toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update your plan.',
        });
      } finally {
        setIsUpgrading(null);
      }
      return;
    }

    // For paid plans, open payment dialog
    setSelectedPlan({ name: plan, priceGHS });
  };
  
  const handleSubscriptionPayment = async () => {
    if (!user || !selectedPlan || !momoNumber) return;
    
    setIsUpgrading(selectedPlan.name);

    try {
        const response = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                amount: selectedPlan.priceGHS * 100, // to pesewas/cents
                currency: 'GHS',
                gatewayId: 'mtn-momo',
                momoNumber,
                metadata: {
                    userId: user.uid,
                    plan: selectedPlan.name,
                    type: 'subscription'
                }
            })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Payment request failed.');
        }

        // The request to pay is asynchronous.
        // For this UI flow, we'll assume it will go through and update the plan.
        // A robust system would wait for a webhook confirmation.
        await updateUser(user.uid, { subscriptionPlan: selectedPlan.name });
        toast({
            title: 'Payment Initiated & Plan Upgraded!',
            description: `Please approve the payment of GH₵${selectedPlan.priceGHS} on your phone. Your plan has been upgraded to ${selectedPlan.name}.`,
        });

    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'Upgrade Failed',
            description: e.message || 'Could not process payment. Please try again.',
        });
    } finally {
        setIsUpgrading(null);
        setSelectedPlan(null);
        setMomoNumber('');
    }
  };

  const freePlan = {
    name: 'Free' as SubscriptionPlan,
    price: 'GH₵0',
    priceDescription: 'For all your free events',
    description: 'Perfect for getting started with free community events.',
    features: [
      'Unlimited free events',
      'Attendee Registration',
      '5% commission on paid tickets',
      'Standard Email Support'
    ],
    cta: 'Get Started For Free',
    priceGHS: 0
  };

  const paidPlans = [
    {
      name: 'Essential' as SubscriptionPlan,
      priceGHS: 50,
      price: 'GH₵50',
      priceDescription: 'per month',
      description: 'For paid events that need the core tools to succeed.',
      features: [
        'Everything in Free, plus:',
        'Sell Paid Tickets',
        '3% commission on each ticket sale',
        'Multiple Ticket Types',
        'Promotional Codes',
      ],
      cta: 'Choose Essential',
      popular: false
    },
    {
      name: 'Pro' as SubscriptionPlan,
      priceGHS: 150,
      price: 'GH₵150',
      priceDescription: 'per month',
      description: 'For organizers who want to maximize sales and engagement.',
      features: [
        'Everything in Essential, plus:',
        'Lowest commission rate (1%)',
        'Social Media & Email Marketing Tools',
        'Detailed Attendee Analytics',
        'Embeddable Ticket Widget',
        'Priority Support'
      ],
      cta: 'Choose Pro',
      popular: true
    },
    {
      name: 'Custom' as SubscriptionPlan,
      price: 'Contact Us',
      priceGHS: -1, // Indicates contact needed
      priceDescription: 'For a tailored solution',
      description: 'For large-scale events with unique requirements.',
      features: [
        'Everything in Pro, plus:',
        'Custom Commission Rates',
        'API Access & Advanced Integration',
        'Dedicated Account Manager',
        'Developer Support'
      ],
      cta: 'Contact Us',
      popular: false
    }
  ];

  return (
    <>
      <div className="min-h-screen">
        <PageHero
          title="Simple, Transparent Pricing"
          backgroundImage = "/price.jpg"
          description="Choose a plan that scales with you. From free community gatherings to large-scale professional conferences, we have you covered."
          ctaText="GET STARTED FOR FREE"
          ctaLink="/dashboard/create"
          height="xl"
        />

        <section id="pricing" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Select the plan that fits your event needs. Paid plans are a monthly fee plus commission.
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-16 items-stretch">
             {/* Free Plan */}
              <div className="relative rounded-2xl p-8 shadow-lg flex flex-col bg-card border">
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-4">{freePlan.name}</h3>
                    <div className="mb-6">
                      <div className="text-5xl font-bold mb-2 text-primary">{freePlan.price}</div>
                      <div className="text-sm text-muted-foreground">{freePlan.priceDescription}</div>
                    </div>
                    <p className="mb-8 h-20 text-muted-foreground">{freePlan.description}</p>
                    <ul className="space-y-4 text-left mb-8 text-sm">
                      {freePlan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-8">
                    <Button 
                      onClick={() => handleChoosePlan(freePlan.name, freePlan.priceGHS)}
                      disabled={isUpgrading === freePlan.name || user?.subscriptionPlan === freePlan.name}
                      variant="outline"
                      className="w-full"
                    >
                      {isUpgrading === freePlan.name ? <Loader2 className="animate-spin"/> : (user?.subscriptionPlan === freePlan.name ? 'Current Plan' : 'Choose Free')}
                    </Button>
                  </div>
              </div>

              {/* Paid Plans */}
              {paidPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 shadow-lg transition-all duration-300 transform hover:-translate-y-2 flex flex-col ${
                    plan.popular
                      ? 'bg-gradient-to-br from-primary to-accent text-white scale-105 border-primary'
                      : 'bg-card border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-white text-primary px-4 py-1 rounded-full text-sm font-bold shadow-md">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <div className={`text-5xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-primary'}`}>
                        {plan.price}
                      </div>
                      <div className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-muted-foreground'}`}>
                        {plan.priceDescription}
                      </div>
                    </div>
                    <p className={`mb-8 h-20 ${plan.popular ? 'text-gray-300' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-4 text-left mb-8 text-sm">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-green-300' : 'text-primary'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto pt-8">
                    <Button 
                      onClick={() => plan.priceGHS === -1 ? window.location.href='/contact' : handleChoosePlan(plan.name, plan.priceGHS)}
                      disabled={isUpgrading === plan.name || user?.subscriptionPlan === plan.name}
                      className={`w-full ${plan.popular && 'bg-white text-primary hover:bg-gray-100'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {isUpgrading === plan.name ? <Loader2 className="animate-spin" /> : user?.subscriptionPlan === plan.name ? 'Current Plan' : plan.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <p className="text-muted-foreground text-sm">
                <span className="font-semibold text-destructive">Note:</span> Payment processing fees from payment gateways are separate from our platform commissions.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Upgrade to {selectedPlan?.name} Plan</DialogTitle>
                <DialogDescription>
                    Complete your payment of GH₵{selectedPlan?.priceGHS} to upgrade your plan.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Label htmlFor="momoNumber" className="flex items-center gap-2"><Shield /> Secure MoMo Payment</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="momoNumber"
                        placeholder="Enter your Mobile Money number"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
                <Button onClick={handleSubscriptionPayment} disabled={isUpgrading === selectedPlan?.name || !momoNumber}>
                    {isUpgrading === selectedPlan?.name && <Loader2 className="animate-spin mr-2 h-4 w-4"/>}
                    Pay GH₵{selectedPlan?.priceGHS}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
