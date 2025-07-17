
'use client';

import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const freePlan = {
  name: 'Free',
  commission: '0%',
  description: 'Perfect for getting started with free community events.',
  features: [
    'Unlimited free events',
    'Attendee Registration',
    'Basic Event Analytics',
    'Standard Email Support'
  ],
  cta: 'GET STARTED FOR FREE',
  ctaLink: '/create'
};

const paidPlans = [
  {
    name: 'Essential',
    commission: '3%',
    description: 'For paid events that need the core tools to succeed.',
    features: [
      'Sell Paid Tickets',
      'Multiple Ticket Types',
      'Promotional Codes',
      'Featured on Homepage'
    ],
    cta: 'GET STARTED',
    ctaLink: '/create',
    color: 'blue'
  },
  {
    name: 'Pro',
    commission: '2%',
    description: 'For organizers who want to maximize sales and engagement.',
    features: [
      'Everything in Essential, plus:',
      'Lowest Commission Rate',
      'Social Media & Email Marketing Tools',
      'Detailed Attendee Analytics',
      'Embeddable Ticket Widget',
      'Priority Support'
    ],
    cta: 'GET STARTED',
    ctaLink: '/create',
    color: 'primary',
    popular: true
  },
  {
    name: 'Custom',
    commission: 'Contact Us',
    description: 'For large-scale events with unique requirements.',
    features: [
      'Everything in Pro, plus:',
      'Custom Commission Rates',
      'API Access & Advanced Integration',
      'Dedicated Account Manager',
      'Developer Support'
    ],
    cta: 'CONTACT US',
    ctaLink: '/contact',
    color: 'dark'
  }
];

export default function PricingClientPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Simple, Transparent Pricing"
        description="Get the most value with powerful features—list your events for free and enjoy the lowest fees in the market, delivering everything you need at the best price point."
        ctaText="GET STARTED FOR FREE"
        ctaLink="/create"
        height="xl"
      />

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              <span className="block">Choose Your Plan</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Pay Only When You Earn
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select the plan that fits your event needs—pay only when you earn from ticket sales.
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
                    {freePlan.commission}
                </div>
                <div className="text-sm text-muted-foreground mb-6">For all your free events</div>
                <Button asChild size="lg" className="w-full">
                  <Link href={freePlan.ctaLink}>{freePlan.cta}</Link>
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
                      {plan.commission}
                    </div>
                    <div className={`text-sm ${
                      plan.popular || plan.color === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
                    }`}>
                      Commission + payment processing
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
                    asChild
                    className={`w-full py-3 rounded-full font-medium ${
                      plan.popular 
                        ? 'bg-white text-primary hover:bg-gray-100'
                        : plan.color === 'dark'
                        ? 'bg-white text-gray-900 hover:bg-gray-200'
                        : ''
                    }`}
                    variant={plan.popular || plan.color === 'dark' ? 'default' : 'outline'}
                  >
                    <Link href={plan.ctaLink}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground text-sm">
              <span className="font-semibold text-destructive">Important:</span> Payment processing fees from Stripe, PayPal, etc. are separate from our commission rates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
