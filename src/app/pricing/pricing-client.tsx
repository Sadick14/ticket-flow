
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { SubscriptionPlan } from '@/lib/types';

export default function PricingClientPage() {
  const { user } = useAuth();
  const { updateUser } = useAppContext();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState<SubscriptionPlan | null>(null);

  const handleChoosePlan = async (plan: SubscriptionPlan, price: number) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please sign in',
        description: 'You need to be logged in to upgrade your plan.',
      });
      return;
    }
    
    setIsUpgrading(plan);
    
    // In a real app, this would trigger a payment flow for the plan price.
    // This is now set up to call the payment intent API.
    try {
      // For non-free plans, initiate payment
      if (price > 0) {
        toast({ title: "Redirecting to Payment...", description: "Please complete the payment to upgrade your plan."});
        // Here you would integrate with your payment gateway's subscription API
        // For now, we simulate a successful payment and update the user's plan
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await updateUser(user.uid, { subscriptionPlan: plan });
      toast({
        title: 'Upgrade Successful!',
        description: `You are now on the ${plan} plan.`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Upgrade Failed',
        description: 'Could not update your plan. Please try again.',
      });
    } finally {
      setIsUpgrading(null);
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
    priceGHS: 0,
    ctaLink: '/dashboard/create'
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
      ctaLink: '#',
      color: 'blue'
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
      ctaLink: '#',
      color: 'primary',
      popular: true
    },
    {
      name: 'Custom' as SubscriptionPlan,
      price: 'Contact Us',
      priceGHS: -1,
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
      ctaLink: '/contact',
      color: 'dark'
    }
  ];

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <PageHero
          title="Simple, Transparent Pricing"
          backgroundImage = "/price.jpg"
          description="Choose a plan that scales with you. From free community gatherings to large-scale professional conferences, we have you covered."
          ctaText="GET STARTED FOR FREE"
          ctaLink="/dashboard/create"
          height="xl"
        />

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                <span className="block">Choose Your Plan</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Select the plan that fits your event needs. Paid plans are a monthly fee plus commission.
              </p>
            </div>

            {/* Free Plan - Prominent Section */}
            <Card className="mb-16 border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-background">
              <div className="grid md:grid-cols-2 gap-8 items-center p-8">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">{freePlan.name}</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">{freePlan.description}</CardDescription>
                  <ul className="space-y-4 text-left my-8 text-sm">
                      {freePlan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="text-center bg-background p-8 rounded-lg">
                  <div className="text-6xl font-bold text-primary mb-2">
                      {freePlan.price}
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">{freePlan.priceDescription}</div>
                   <Button 
                      onClick={() => handleChoosePlan(freePlan.name, freePlan.priceGHS)}
                      size="lg" 
                      className="w-full"
                      disabled={isUpgrading === freePlan.name || user?.subscriptionPlan === freePlan.name}
                    >
                      {isUpgrading === freePlan.name ? <Loader2 className="animate-spin"/> : (user?.subscriptionPlan === freePlan.name ? 'Current Plan' : 'Downgrade to Free')}
                    </Button>
                </div>
              </div>
            </Card>


            <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-16 items-stretch">
              {paidPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 shadow-lg transition-all duration-300 transform hover:-translate-y-2 flex flex-col ${
                    plan.popular
                      ? 'bg-gradient-to-br from-primary to-accent text-white scale-105'
                      : plan.color === 'dark'
                      ? 'bg-gray-900 text-white'
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
                      <div className={`text-5xl font-bold mb-2 ${
                        plan.popular ? 'text-white' : 
                        plan.color === 'blue' ? 'text-blue-500' :
                        plan.color === 'dark' ? 'text-white' : 'text-primary'
                      }`}>
                        {plan.price}
                      </div>
                      <div className={`text-sm ${
                        plan.popular || plan.color === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
                      }`}>
                        {plan.priceDescription}
                      </div>
                    </div>
                    <p className={`mb-8 h-20 ${
                      plan.popular || plan.color === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
                    }`}>
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-4 text-left mb-8 text-sm">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            plan.popular ? 'text-green-300' : 'text-primary'
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto pt-8">
                    <Button 
                      onClick={() => plan.name === 'Custom' ? window.location.href = '/contact' : handleChoosePlan(plan.name, plan.priceGHS)}
                      disabled={isUpgrading === plan.name || user?.subscriptionPlan === plan.name}
                      className={`w-full py-3 rounded-full font-medium ${
                        plan.popular 
                          ? 'bg-white text-primary hover:bg-gray-100'
                          : plan.color === 'dark'
                          ? 'bg-white text-gray-900 hover:bg-gray-200'
                          : ''
                      }`}
                      variant={plan.popular || plan.color === 'dark' ? 'default' : 'outline'}
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
    </>
  );
}
