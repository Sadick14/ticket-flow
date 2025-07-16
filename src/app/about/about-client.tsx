
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, Zap, Heart, Award, Globe, Lightbulb, Shield } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { useAppContext } from '@/context/app-context';

export default function AboutClientPage() {
  const { events, tickets, users } = useAppContext();
  
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
    { label: 'Events Created', value: `${events.length.toLocaleString()}+` },
    { label: 'Tickets Sold', value: `${tickets.length.toLocaleString()}+` },
    { label: 'Happy Organizers', value: `${users.length.toLocaleString()}+` },
    { label: 'Countries Served', value: '25+' }
  ];

  const team = [
    {
      name: 'Sadick Issaka',
      role: 'CEO & Founder',
      bio: 'A passionate developer and entrepreneur dedicated to building tools that empower creators.',
      image: 'https://placehold.co/150x150.png',
      "data-ai-hint": "man portrait"
    },
    // {
    //   name: 'Mike Chen',
    //   role: 'CTO & Co-Founder',
    //   bio: 'Software engineer passionate about building scalable solutions.',
    //   image: 'https://placehold.co/150x150.png',
    //   "data-ai-hint": "man portrait"
    // },
    // {
    //   name: 'Lisa Rodriguez',
    //   role: 'Head of Design',
    //   bio: 'UX designer focused on creating intuitive and beautiful experiences.',
    //   image: 'https://placehold.co/150x150.png',
    //   "data-ai-hint": "woman portrait"
    // },
    // {
    //   name: 'David Kim',
    //   role: 'Head of Customer Success',
    //   bio: 'Dedicated to helping our customers succeed with their events.',
    //   image: 'https://placehold.co/150x150.png',
    //   "data-ai-hint": "man portrait"
    // }
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Hero Section */}
      <PageHero 
        title="About TicketFlow"
        description="We're on a mission to democratize event creation and make it easy for anyone to bring people together through memorable experiences."
        ctaText="Start Creating Events"
        ctaLink="/create"
        secondaryCtaText="Get in Touch"
        secondaryCtaLink="/contact"
        height="xl"
        overlay="dark"
      />

      <div className="bg-background">
        {/* Stats Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
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
                  TicketFlow was founded on a simple, yet powerful idea: event management should be accessible, intuitive, and affordable for everyone. 
                  Our founder, Sadick Issaka, envisioned a platform that would empower creators of all sizes—from local community organizers to large-scale conference planners—to bring their visions to life without the barriers of complex and costly software.
                </p>
                
                <p>
                  The journey began with a commitment to build a tool that wasn't just functional, but truly empowering. The team focused on creating a seamless experience, from crafting a beautiful event page to managing attendees and analyzing sales. The goal was to handle the technical complexities so that organizers could focus on what they do best: creating unforgettable experiences.
                </p>
                
                <p>
                  Today, TicketFlow is a testament to that vision. It stands as a robust, user-friendly platform that serves a growing community of passionate event organizers around the world. We believe that when you give people the right tools, they can create amazing things. Our story is just beginning, and we are excited to continue building the future of event management, one event at a time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-20 bg-muted/40">
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
        <div className="py-20 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">The passionate people behind TicketFlow</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      data-ai-hint={member['data-ai-hint']}
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
    </div>
  );
}
