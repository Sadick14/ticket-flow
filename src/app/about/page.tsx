'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, Zap, Heart, Award, Globe, Lightbulb, Shield } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = generatePageMetadata({
  slug: 'about',
  title: 'About Us - Learn About TicketFlow',
  description: 'Discover the story behind TicketFlow, our mission to democratize event creation, and meet the passionate team building the future of event management.',
  image: '/og-about.jpg',
});

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of bringing people together through meaningful events and experiences.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We constantly innovate to provide the best tools and features for event organizers and attendees.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data and payments are protected with enterprise-grade security measures.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'We are passionate about events and helping organizers create unforgettable experiences.'
    }
  ];

  const stats = [
    { label: 'Events Created', value: '50,000+' },
    { label: 'Tickets Sold', value: '2M+' },
    { label: 'Happy Organizers', value: '10,000+' },
    { label: 'Countries Served', value: '25+' }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former event director with 10+ years of experience in the industry.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b412?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Mike Chen',
      role: 'CTO & Co-Founder',
      bio: 'Software engineer passionate about building scalable solutions.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Head of Design',
      bio: 'UX designer focused on creating intuitive and beautiful experiences.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'David Kim',
      role: 'Head of Customer Success',
      bio: 'Dedicated to helping our customers succeed with their events.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About TicketFlow
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're on a mission to democratize event creation and make it easy for anyone to bring people together through memorable experiences.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/create">Start Creating Events</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-gray-700">
              <p>
                TicketFlow was born from a simple frustration: organizing events shouldn't be complicated. 
                Our founders, Sarah and Mike, were organizing a local tech meetup when they realized how 
                fragmented and expensive the existing solutions were.
              </p>
              
              <p>
                After struggling with multiple platforms for ticketing, promotion, and attendee management, 
                they decided to build the solution they wished existed. They wanted a platform that was 
                intuitive for organizers, affordable for small events, and delightful for attendees.
              </p>
              
              <p>
                Today, TicketFlow powers events of all sizes - from intimate workshops to large conferences. 
                We're proud to serve a community of passionate event organizers who are bringing people 
                together and creating meaningful connections.
              </p>
              
              <p>
                Our journey is just beginning. We continue to innovate and improve our platform based on 
                feedback from our amazing community of organizers and attendees.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  To democratize event creation and make it accessible for everyone to bring 
                  communities together through meaningful experiences.
                </p>
                <p>
                  We believe that every person should have the tools and resources to create 
                  events that matter - whether it's a small workshop, a community gathering, 
                  or a large-scale conference.
                </p>
                <p>
                  By removing barriers and simplifying the event creation process, we empower 
                  organizers to focus on what truly matters: creating amazing experiences for 
                  their attendees.
                </p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Our Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Serve event organizers worldwide</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span>Continuously innovate our platform</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Build stronger communities</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Set the standard for event platforms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people behind TicketFlow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{member.role}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card>
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Journey</h2>
              <p className="text-xl text-gray-600 mb-8">
                Ready to create amazing events? We're here to help you every step of the way.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/create">Create Your Event</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/help-center">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
