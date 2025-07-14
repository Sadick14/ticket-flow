
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, HelpCircle, MessageCircle, Book, CreditCard, Users, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export default function FaqClientPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'events', name: 'Creating Events', icon: Calendar },
    { id: 'tickets', name: 'Tickets & Sales', icon: CreditCard },
    { id: 'attendees', name: 'Managing Attendees', icon: Users },
    { id: 'technical', name: 'Technical Support', icon: Settings },
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create my first event?',
      answer: 'Creating your first event is easy! Simply click the "Create Event" button, fill in your event details including title, description, date, and venue. Add ticket types and pricing, then publish your event. You can start selling tickets immediately.'
    },
    {
      category: 'getting-started',
      question: 'Is TicketFlow free to use?',
      answer: 'TicketFlow offers a free tier that includes basic event creation and ticket sales with our standard processing fees. We also offer premium plans with advanced features like custom branding, detailed analytics, and priority support.'
    },
    {
      category: 'events',
      question: 'Can I edit my event after publishing?',
      answer: 'Yes! You can edit most event details after publishing, including description, images, and adding new ticket types. However, some details like event date and venue should only be changed if absolutely necessary, as this may affect attendees who have already purchased tickets.'
    },
    {
      category: 'events',
      question: 'How do I promote my event?',
      answer: 'TicketFlow provides several promotional tools: share your event on social media, send email invitations, create discount codes, and use our event discovery features. Premium users get access to advanced marketing tools and analytics.'
    },
    {
      category: 'events',
      question: 'Can I create recurring events?',
      answer: 'Yes! When creating an event, you can set it as a recurring event with daily, weekly, monthly, or custom recurrence patterns. Each occurrence can have its own ticket inventory and settings.'
    },
    {
      category: 'tickets',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like Apple Pay and Google Pay. Payments are processed securely through our trusted payment partners.'
    },
    {
      category: 'tickets',
      question: 'How do I issue refunds?',
      answer: 'Refunds can be processed through your event dashboard. Go to the "Sales" section, find the order, and click "Issue Refund." You can issue full or partial refunds. Refunds typically appear in the customer\'s account within 3-5 business days.'
    },
    {
      category: 'tickets',
      question: 'Can I create discount codes?',
      answer: 'Yes! You can create percentage-based or fixed-amount discount codes in your event dashboard. Set usage limits, expiration dates, and specify which ticket types the discount applies to.'
    },
    {
      category: 'tickets',
      question: 'What are the transaction fees?',
      answer: 'Our standard transaction fee is 2.9% + $0.30 per ticket sold. This covers payment processing, platform usage, and customer support. Premium users get reduced fees and volume discounts.'
    },
    {
      category: 'attendees',
      question: 'How do attendees receive their tickets?',
      answer: 'Tickets are automatically sent via email immediately after purchase. Attendees can also access their tickets through our mobile app or by logging into their account on our website.'
    },
    {
      category: 'attendees',
      question: 'Can I check in attendees at the event?',
      answer: 'Yes! Use our mobile check-in app to scan QR codes or search for attendees by name or email. You can also export attendee lists or use our web-based check-in interface.'
    },
    {
      category: 'attendees',
      question: 'How do I communicate with my attendees?',
      answer: 'Send updates through your event dashboard using our messaging system. You can send emails to all attendees, specific ticket types, or individual attendees. Messages can include event updates, reminders, or important announcements.'
    },
    {
      category: 'technical',
      question: 'Can I integrate TicketFlow with my website?',
      answer: 'Yes! We offer embeddable widgets, API access, and integration tools. You can embed ticket sales directly on your website or use our API to create custom integrations with your existing systems.'
    },
    {
      category: 'technical',
      question: 'Is my data secure?',
      answer: 'Absolutely! We use enterprise-grade security measures including SSL encryption, secure data centers, and PCI DSS compliance for payment processing. Your data and your customers\' information are fully protected.'
    },
    {
      category: 'technical',
      question: 'Do you offer customer support?',
      answer: 'Yes! We provide email support for all users, with response times typically under 24 hours. Premium users get priority support with faster response times and phone support options.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions about TicketFlow
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Still Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Can't find what you're looking for?
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link href="/help-center">Visit Help Center</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Questions' : 
                   categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {selectedCategory !== 'all' && (
                <Badge variant="secondary">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
            </div>

            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or browse different categories.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-3">
                            <HelpCircle className="h-4 w-4 mt-1 text-primary shrink-0" />
                            <span>{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="ml-7 text-gray-700">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create your first event in minutes and start selling tickets today.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/create">Create Event</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Get Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
