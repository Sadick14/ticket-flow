
'use client';

import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import { useState } from 'react';

export const metadata: Metadata = generatePageMetadata({
  slug: 'help-center',
  title: 'Help Center - TicketFlow Support & Resources',
  description: 'Get help with TicketFlow! Access guides, tutorials, and support resources for event creation, ticket sales, and platform features.',
  image: '/og-help.jpg',
});
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, MessageCircle, Mail, Phone, Book, Users, CreditCard, Settings, Ticket, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqSections = {
    'Getting Started': [
      {
        question: 'How do I create my first event?',
        answer: 'To create your first event, sign up for an account, click "Create Event" from the dashboard, and fill out the event details including name, date, location, and ticket information.'
      },
      {
        question: 'What types of events can I create?',
        answer: 'You can create any type of event including concerts, conferences, workshops, meetups, sports events, and more. Both free and paid events are supported.'
      },
      {
        question: 'How do I set up my payment information?',
        answer: 'Payment processing is handled automatically through our secure system. You can set your payout preferences in your account settings.'
      }
    ],
    'Managing Events': [
      {
        question: 'How do I edit an event after publishing?',
        answer: 'Go to your dashboard, find the event you want to edit, and click the edit button. You can modify most details, but some changes may require notifying attendees.'
      },
      {
        question: 'Can I cancel an event?',
        answer: 'Yes, you can cancel an event from your dashboard. Attendees will be automatically notified and refunds will be processed according to your refund policy.'
      },
      {
        question: 'How do I check in attendees?',
        answer: 'Use the attendee management section in your dashboard. You can manually check in attendees or use our mobile-friendly check-in system.'
      }
    ],
    'Tickets & Payments': [
      {
        question: 'How do attendees receive their tickets?',
        answer: 'Tickets are automatically sent via email after purchase. They can also access tickets from their account dashboard.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, and digital payment methods through our secure payment processor.'
      },
      {
        question: 'How do refunds work?',
        answer: 'Refunds are processed according to the refund policy set by the event organizer. Most refunds are processed within 3-5 business days.'
      }
    ],
    'Technical Support': [
      {
        question: 'The website is not loading properly',
        answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. If issues persist, contact our support team.'
      },
      {
        question: 'I forgot my password',
        answer: 'Use the "Forgot Password" link on the login page. You\'ll receive an email with instructions to reset your password.'
      },
      {
        question: 'How do I update my account information?',
        answer: 'Log into your account and go to Settings. You can update your profile information, email preferences, and payment details.'
      }
    ]
  };

  const quickLinks = [
    { title: 'Create Your First Event', icon: Calendar, href: '/create', description: 'Step-by-step guide to creating events' },
    { title: 'Manage Attendees', icon: Users, href: '/dashboard/attendees', description: 'Check-in and manage your attendees' },
    { title: 'Payment & Billing', icon: CreditCard, href: '/dashboard/sales', description: 'View sales and manage payouts' },
    { title: 'Account Settings', icon: Settings, href: '/dashboard/settings', description: 'Update your profile and preferences' },
  ];

  const filteredFAQ = Object.entries(faqSections).reduce((acc, [section, questions]) => {
    const filtered = questions.filter(
      qa => 
        qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[section] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof faqSections[keyof typeof faqSections]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to your questions and get the help you need</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for help topics, features, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <link.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="mt-8">
            <div className="space-y-6">
              {Object.entries(filteredFAQ).map(([section, questions]) => (
                <Card key={section}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      {section}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {questions.map((qa, index) => (
                        <AccordionItem key={index} value={`${section}-${index}`}>
                          <AccordionTrigger className="text-left">{qa.question}</AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {qa.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="guides" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started Guide</CardTitle>
                  <CardDescription>Complete walkthrough for new users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Learn how to create your first event, set up tickets, and manage attendees.</p>
                  <Link href="/create">
                    <Button>Start Creating Events</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Event Marketing Tips</CardTitle>
                  <CardDescription>Promote your events effectively</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Best practices for marketing your events and reaching your target audience.</p>
                  <Link href="/dashboard/marketing">
                    <Button variant="outline">View Marketing Tools</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Reporting</CardTitle>
                  <CardDescription>Track your event performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Understand your audience and measure event success with detailed analytics.</p>
                  <Link href="/dashboard/analytics">
                    <Button variant="outline">View Analytics</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Troubleshooting</CardTitle>
                  <CardDescription>Common issues and solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Quick fixes for common problems and technical issues.</p>
                  <Button variant="outline">View Troubleshooting</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Our Support Team</CardTitle>
                  <CardDescription>Get personalized help from our experts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">support@ticketflow.com</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-gray-600">Available during business hours</p>
                      <p className="text-xs text-gray-500">Monday - Friday, 9AM - 6PM PST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">+1 (555) 123-FLOW</p>
                      <p className="text-xs text-gray-500">For urgent issues only</p>
                    </div>
                  </div>
                  
                  <Link href="/contact">
                    <Button className="w-full mt-4">Contact Support</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Community Resources</CardTitle>
                  <CardDescription>Connect with other event organizers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Community Forum</h4>
                      <p className="text-sm text-gray-600">Share tips and get advice from other organizers</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Video Tutorials</h4>
                      <p className="text-sm text-gray-600">Step-by-step video guides for all features</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Feature Requests</h4>
                      <p className="text-sm text-gray-600">Suggest new features and improvements</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Status Page</h4>
                      <p className="text-sm text-gray-600">Check system status and maintenance updates</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">Join Community</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
