
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { PageHero } from '@/components/page-hero';

export default function ContactClientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
          setIsSubmitted(true);
          toast({
              title: "Message Sent!",
              description: "We'll get back to you within 24 hours.",
          });
          // Reset form
          setFormData({ name: '', email: '', subject: '', category: '', message: '' });
      } else {
          throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "Could not send your message. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@ticketflow.com',
      response: 'Response within 24 hours',
      available: true
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Start Chat',
      response: 'Available now',
      available: true
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      contact: '+1 (555) 123-FLOW',
      response: 'Mon-Fri, 9AM-6PM PST',
      available: false
    }
  ];

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Billing & Payments',
    'Event Management',
    'Feature Request',
    'Bug Report',
    'Partnership',
    'Press Inquiry'
  ];

  return (
    <div className="min-h-screen bg-muted/40">
       <PageHero
        title="Contact Us"
        description="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        height="xl"
      />
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for contacting us. We'll review your message and get back to you within 24 hours.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            type="text"
                            placeholder="Brief description of your inquiry"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Please provide as much detail as possible about your inquiry..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Choose the best way to reach us
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      <method.icon className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{method.title}</h4>
                          {method.available && (
                            <Badge variant="secondary" className="text-xs">Available</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                        <p className="text-sm font-medium">{method.contact}</p>
                        <p className="text-xs text-gray-500">{method.response}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monday - Friday</span>
                      <span className="text-sm font-medium">9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Saturday</span>
                      <span className="text-sm font-medium">10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sunday</span>
                      <span className="text-sm font-medium">Closed</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Email support is available 24/7. We aim to respond to all emails within 24 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    For urgent issues during live events, please call our emergency support line:
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-600">+1 (555) 911-FLOW</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Emergency support is for critical issues affecting live events only.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
