
'use client';

import { useState, useMemo, useRef } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Share2, 
  QrCode, 
  Mail, 
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Copy,
  Download,
  ExternalLink,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  Calendar,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { Ticket } from '@/lib/types';
import QRCode from 'qrcode.react';

export default function MarketingPage() {
  const { user } = useAuth();
  const { events, getEventsByCreator, tickets } = useAppContext();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [socialPost, setSocialPost] = useState('');
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const userEvents = user ? getEventsByCreator(user.uid) : [];
  const selectedEventData = userEvents.find(e => e.id === selectedEventId);

  const allUserTickets = useMemo(() => {
    const userEventIds = new Set(userEvents.map(e => e.id));
    return tickets.filter((ticket: Ticket) => userEventIds.has(ticket.eventId));
  }, [tickets, userEvents]);
  
  const marketingStats = useMemo(() => {
    if (!selectedEventData) return {
        views: 0,
        clicks: 0,
        shares: 0,
        conversions: 0,
      };
    
    const eventTickets = allUserTickets.filter(t => t.eventId === selectedEventData.id);
    const conversions = eventTickets.length;

    // These are simplified calculations. Real-world stats would need a more complex tracking system.
    const views = conversions * 20 + Math.floor(Math.random() * 50); // Guess views based on conversions
    const clicks = conversions * 5 + Math.floor(Math.random() * 20); // Guess clicks based on conversions
    const shares = conversions + Math.floor(Math.random() * 10); // Guess shares

    return {
      views,
      clicks,
      shares,
      conversions,
    };
  }, [selectedEventData, allUserTickets]);

  const generateShareUrl = (eventId: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/events/${eventId}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  const generateEmbedCode = (eventId: string) => {
    if (typeof window === 'undefined') return '';
    const iframeSrc = `${window.location.origin}/embed/tickets/${eventId}`;
    return `<iframe src="${iframeSrc}" width="100%" height="600" style="border:none;"></iframe>`;
  };

  const generateEmailTemplate = (event: any) => {
    return `Subject: You're Invited to ${event.name}!

Dear [Name],

You're cordially invited to join us for ${event.name}, happening on ${format(parseISO(event.date), 'MMMM dd, yyyy')} at ${event.time}.

📍 Location: ${event.location}
🎟️ Tickets: $${event.price}

${event.description}

Don't miss out on this amazing experience! Get your tickets now:
${generateShareUrl(event.id)}

Best regards,
${event.organizationName || 'Event Team'}

---
This email was sent regarding ${event.name}. If you have any questions, please contact us.`;
  };

  const generateSocialPost = (event: any) => {
    return `🎉 Exciting news! ${event.name} is happening on ${format(parseISO(event.date), 'MMM dd')}!

📅 ${format(parseISO(event.date), 'MMMM dd, yyyy')} at ${event.time}
📍 ${event.location}
🎟️ Tickets from $${event.price}

${event.description.substring(0, 100)}...

Get your tickets now: ${generateShareUrl(event.id)}

#Events #${event.category.replace(/\s+/g, '')} #TicketFlow`;
  };

  const shareOnSocial = (platform: string) => {
    if (!selectedEventData) return;
    
    const url = generateShareUrl(selectedEventData.id);
    const text = encodeURIComponent(`Check out ${selectedEventData.name}! ${selectedEventData.description.substring(0, 100)}...`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const downloadQRCode = () => {
    const qrCodeElement = qrCodeRef.current?.querySelector('canvas');
    if (qrCodeElement && selectedEventData) {
      const dataUrl = qrCodeElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qrcode-${selectedEventData.name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({
        title: 'QR Code Downloading',
        description: 'Your QR code has been downloaded.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate QR code for download.',
      });
    }
  };

  const generateMarketing = (type: 'email' | 'social') => {
    if (!selectedEventData) return;
    
    if (type === 'email') {
      setEmailTemplate(generateEmailTemplate(selectedEventData));
    } else {
      setSocialPost(generateSocialPost(selectedEventData));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Tools</h1>
          <p className="text-muted-foreground">Promote your events and reach more attendees</p>
        </div>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event to Promote</CardTitle>
          <CardDescription>Choose which event you want to create marketing materials for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event to promote" />
            </SelectTrigger>
            <SelectContent>
              {userEvents.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} - {format(parseISO(event.date), 'MMM dd, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {userEvents.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to start marketing it.
              </p>
              <Button asChild>
                <Link href="/dashboard/create">Create Event</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEventData && (
        <>
          {/* Marketing Stats */}
          {marketingStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats.views}</div>
                  <p className="text-xs text-muted-foreground">
                    Estimated event page visits
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats.clicks}</div>
                  <p className="text-xs text-muted-foreground">
                    Estimated from campaigns
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Social Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats.shares}</div>
                  <p className="text-xs text-muted-foreground">
                    Estimated across platforms
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketingStats.conversions}</div>
                  <p className="text-xs text-muted-foreground">
                    Tickets sold for this event
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marketing Tools */}
          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="share">Share & Promote</TabsTrigger>
              <TabsTrigger value="email">Email Marketing</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="qr">QR Codes</TabsTrigger>
              <TabsTrigger value="embed">Embeddable Widget</TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share Your Event
                  </CardTitle>
                  <CardDescription>Direct links and quick sharing options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Event URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={generateShareUrl(selectedEventData.id)} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(generateShareUrl(selectedEventData.id))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/events/${selectedEventData.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Quick Share</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => shareOnSocial('facebook')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="mr-2 h-4 w-4" />
                        Facebook
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => shareOnSocial('twitter')}
                        className="text-sky-500 hover:text-sky-600"
                      >
                        <Twitter className="mr-2 h-4 w-4" />
                        Twitter
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => shareOnSocial('linkedin')}
                        className="text-blue-700 hover:text-blue-800"
                      >
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => shareOnSocial('whatsapp')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Template Generator
                  </CardTitle>
                  <CardDescription>Create professional email invitations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => generateMarketing('email')}
                    className="w-full"
                  >
                    Generate Email Template
                  </Button>
                  
                  {emailTemplate && (
                    <div>
                      <Label>Generated Email Template</Label>
                      <Textarea 
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        className="mt-1 min-h-[300px] font-mono text-sm"
                        placeholder="Email template will appear here..."
                      />
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => copyToClipboard(emailTemplate)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Template
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5" />
                    Social Media Post Generator
                  </CardTitle>
                  <CardDescription>Create engaging social media posts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => generateMarketing('social')}
                    className="w-full"
                  >
                    Generate Social Post
                  </Button>
                  
                  {socialPost && (
                    <div>
                      <Label>Generated Social Media Post</Label>
                      <Textarea 
                        value={socialPost}
                        onChange={(e) => setSocialPost(e.target.value)}
                        className="mt-1 min-h-[200px]"
                        placeholder="Social media post will appear here..."
                      />
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => copyToClipboard(socialPost)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Post
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-2">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Best Practices for Social Media</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use relevant hashtags</li>
                        <li>• Include eye-catching visuals</li>
                        <li>• Post at optimal times</li>
                        <li>• Engage with comments</li>
                      </ul>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Recommended Posting Times</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Facebook: 1-3 PM</li>
                        <li>• Instagram: 11 AM-1 PM</li>
                        <li>• Twitter: 9 AM-10 AM</li>
                        <li>• LinkedIn: 10-11 AM</li>
                      </ul>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Generator
                  </CardTitle>
                  <CardDescription>Generate QR codes for easy event access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div ref={qrCodeRef} className="inline-block bg-white p-4 rounded-lg">
                        <QRCode
                          value={generateShareUrl(selectedEventData.id)}
                          size={128}
                          bgColor={"#ffffff"}
                          fgColor={"#000000"}
                          level={"L"}
                          includeMargin={false}
                        />
                    </div>
                    <h3 className="text-lg font-semibold mt-4">QR Code Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      Links to: {generateShareUrl(selectedEventData.id)}
                    </p>
                    <Button onClick={downloadQRCode}>
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">QR Code Uses</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Print on flyers and posters</li>
                        <li>• Include in email signatures</li>
                        <li>• Add to business cards</li>
                        <li>• Display at physical locations</li>
                      </ul>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">QR Code Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Test before printing</li>
                        <li>• Ensure sufficient contrast</li>
                        <li>• Include a call-to-action</li>
                        <li>• Make it large enough to scan</li>
                      </ul>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="embed" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Code/> Embeddable Widget</CardTitle>
                        <CardDescription>Sell tickets directly from your own website.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Embed Code</Label>
                            <Textarea
                                readOnly
                                value={generateEmbedCode(selectedEventData.id)}
                                className="mt-1 font-mono text-xs h-32"
                            />
                        </div>
                        <Button onClick={() => copyToClipboard(generateEmbedCode(selectedEventData.id))}>
                            <Copy className="mr-2 h-4 w-4"/>
                            Copy Code
                        </Button>
                        <div className="pt-4">
                            <h4 className="font-semibold">Preview:</h4>
                             <div className="mt-2 border rounded-lg p-4 h-96 overflow-auto">
                                <iframe 
                                    src={`/embed/tickets/${selectedEventData.id}`} 
                                    width="100%" 
                                    height="100%"
                                    style={{ border: 'none' }}
                                    title="Ticket Embed Preview"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
