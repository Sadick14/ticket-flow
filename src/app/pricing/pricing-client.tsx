
'use client';

import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    commission: '0%',
    description: 'Create and share events for free. No ticketing fees.',
    features: [
      'Event Creation & Management',
      'Attendee Registration', 
      'Basic event analytics',
      'Export Free Registrations',
      'SMS Notifications'
    ],
    cta: 'GET STARTED FOR FREE',
    color: 'orange'
  },
  {
    name: 'Essential',
    commission: '3%',
    description: 'Affordable ticketing for small events with essential tools.',
    features: [
      'Paid Ticketing',
      'Multiple Ticket Types',
      'Promotional Codes',
      'Waitlisted Payment Methods',
      'Self service checkout'
    ],
    cta: 'GET STARTED',
    color: 'blue'
  },
  {
    name: 'Pro',
    commission: '2%',
    description: 'Advanced features to grow your business and manage events effectively.',
    features: [
      'Advanced ticketing + check-in',
      'Advanced Social Sharing',
      'Embedded Ticket Widget',
      'Multiple Payment Gateways',
      'Advanced Event Controls'
    ],
    cta: 'GET STARTED',
    color: 'purple',
    popular: true
  },
  {
    name: 'Custom',
    commission: 'Contact Us',
    description: 'Top-tier features for large events with priority support.',
    features: [
      'Advanced ticketing',
      'Advanced Integration',
      'Developed Support',
      'Personalised onboarding Liaison',
      'API Access Support',
      'No Ticket Limits'
    ],
    cta: 'CONTACT US',
    color: 'slate'
  }
];

export default function PricingClientPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Free event publishing with unbeatable pricing"
        description="Get the most value with powerful features—list your events for free and enjoy the lowest fees in the market, delivering everything you need at the best price point."
        ctaText="GET STARTED FOR FREE"
        ctaLink="/create"
        secondaryCtaText="View Features"
        secondaryCtaLink="#pricing"
        height="md"
        overlay="gradient"
      />

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              <span className="block">Choose Your Plan</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Pay Only When You Earn
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Select the plan that fits your event needs—pay only when you earn from ticket sales.
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-4 mt-16">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105 hover:scale-110'
                    : plan.color === 'slate'
                    ? 'bg-slate-900 text-white hover:shadow-2xl'
                    : 'bg-white border border-slate-200 hover:shadow-2xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-400 text-white px-6 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <div className={`text-7xl font-bold mb-2 ${
                      plan.popular ? 'text-white' : 
                      plan.color === 'orange' ? 'text-orange-500' :
                      plan.color === 'blue' ? 'text-blue-500' :
                      plan.color === 'slate' ? 'text-orange-400' : 'text-slate-900'
                    }`}>
                      {plan.commission}
                    </div>
                    <div className={`text-sm ${
                      plan.popular ? 'text-purple-200' :
                      plan.color === 'slate' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {plan.name === 'Custom' ? 'Top-tier features for large events' : 'Commission + payment processing'}
                    </div>
                  </div>
                  <p className={`mb-8 ${
                    plan.popular ? 'text-purple-200' :
                    plan.color === 'slate' ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-4 text-left mb-8 text-sm">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className={`w-4 h-4 mr-3 flex-shrink-0 ${
                          plan.popular ? 'text-green-300' :
                          plan.color === 'slate' ? 'text-green-400' : 'text-green-500'
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full py-4 rounded-2xl font-medium ${
                      plan.popular 
                        ? 'bg-white text-purple-600 hover:bg-purple-50'
                        : plan.color === 'orange'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : plan.color === 'blue'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : plan.color === 'slate'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="text-center mt-16">
            <p className="text-slate-600 text-sm">
              <span className="font-semibold text-red-500">Important:</span> Booking and payment processing fees are separate from plan pricing
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Removed duplicate plans and PricingClientPage definition to fix errors */
