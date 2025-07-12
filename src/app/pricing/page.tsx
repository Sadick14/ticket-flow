
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { SubscriptionPlan } from '@/lib/types';

const plans: {name: SubscriptionPlan, price: string, priceFrequency: string, description: string, features: string[], cta: string, isCurrent: (plan: SubscriptionPlan) => boolean, popular?: boolean}[] = [
    {
        name: 'Free',
        price: '$0',
        priceFrequency: '/ month',
        description: 'For hobbyists and new organizers getting started.',
        features: [
            'Create up to 5 events',
            'Basic event page',
            'Standard support'
        ],
        cta: 'Get Started',
        isCurrent: (plan: SubscriptionPlan) => plan === 'Free'
    },
    {
        name: 'Starter',
        price: '$29',
        priceFrequency: '/ month',
        description: 'For growing organizers who need more capacity.',
        features: [
            'Create up to 20 events',
            'Customizable event pages',
            'Priority email support'
        ],
        cta: 'Coming Soon',
        isCurrent: (plan: SubscriptionPlan) => plan === 'Starter',
        popular: true,
    },
    {
        name: 'Pro',
        price: '$79',
        priceFrequency: '/ month',
        description: 'For professional organizers at scale.',
        features: [
            'Unlimited events',
            'Advanced analytics & reporting',
            'Dedicated phone support'
        ],
        cta: 'Coming Soon',
        isCurrent: (plan: SubscriptionPlan) => plan === 'Pro'
    }
]

export default function PricingPage() {
    const { user, updateSubscriptionPlan } = useAuth();
    const router = useRouter();
    const currentPlan = user?.subscriptionPlan || 'Free';

    const handleUpgrade = (planName: SubscriptionPlan) => {
        if (!user) {
            router.push('/create'); // Prompt sign-in on create page
            return;
        }
        // This simulates the upgrade.
        updateSubscriptionPlan(planName);
        router.push('/dashboard');
    }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          Find the perfect plan
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Start for free and scale up as you grow. All plans include unlimited ticket sales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="font-headline">{plan.name}</CardTitle>
                {plan.popular && <div className="flex items-center gap-2 text-primary font-semibold"><Star className="h-5 w-5" /> Most Popular</div>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="ml-1 text-muted-foreground">{plan.priceFrequency}</span>
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={plan.isCurrent(currentPlan) || plan.name !== 'Free'}
                    onClick={() => handleUpgrade(plan.name)}
                >
                    {plan.isCurrent(currentPlan) ? 'Current Plan' : plan.cta}
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
