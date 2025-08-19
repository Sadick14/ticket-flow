
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCard } from '@/components/event-card';
import { NewsCard } from '@/components/news-card';
import { Globe, Twitter, Facebook, Instagram, Linkedin, Rss, Loader2, Check } from 'lucide-react';
import type { Organization, Event, NewsArticle } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface OrganizationDetailsClientProps {
  initialData: {
    organization: Organization;
    events: Event[];
    news: NewsArticle[];
  };
}

export default function OrganizationDetailsClient({ initialData }: OrganizationDetailsClientProps) {
  const { organization, events, news } = initialData;
  const { user, signInWithGoogle } = useAuth();
  const { followOrganization, unfollowOrganization } = useAppContext();
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(user ? organization.followerIds?.includes(user.uid) : false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowOrganization(organization.id, user.uid);
        toast({ title: "Unfollowed", description: `You are no longer following ${organization.name}.`});
        setIsFollowing(false);
      } else {
        await followOrganization(organization.id, user.uid);
        toast({ title: "Followed!", description: `You are now following ${organization.name}.`});
        setIsFollowing(true);
      }
    } catch {
      toast({ variant: 'destructive', title: "Error", description: "Something went wrong. Please try again."});
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const socialLinks = [
    { platform: 'twitter', icon: Twitter, url: organization.socialLinks?.twitter },
    { platform: 'facebook', icon: Facebook, url: organization.socialLinks?.facebook },
    { platform: 'instagram', icon: Instagram, url: organization.socialLinks?.instagram },
    { platform: 'linkedin', icon: Linkedin, url: organization.socialLinks?.linkedin },
  ].filter(link => link.url);


  return (
    <div className="bg-muted/40">
        <div className="max-w-7xl mx-auto">
            <Card className="rounded-none sm:rounded-b-xl border-x-0 sm:border-x border-b">
                <CardHeader className="text-center p-8 md:p-12 items-center">
                    <Image src={organization.logoUrl || 'https://placehold.co/128x128.png'} alt={`${organization.name} logo`} width={128} height={128} className="rounded-full mb-4 border-4 border-background shadow-lg"/>
                    <CardTitle className="text-4xl font-bold">{organization.name}</CardTitle>
                    <CardDescription className="text-lg max-w-2xl mx-auto">{organization.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center items-center gap-4">
                    <Button onClick={handleFollow} disabled={isLoadingFollow}>
                        {isLoadingFollow ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <Check className="mr-2 h-4 w-4"/> : <Rss className="mr-2 h-4 w-4" />}
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    {socialLinks.map(link => (
                        <Button key={link.platform} variant="outline" size="icon" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer"><link.icon className="h-5 w-5"/></a>
                        </Button>
                    ))}
                </CardContent>
            </Card>

             {organization.gallery && organization.gallery.length > 0 && (
                <section className="py-12 px-4 sm:px-6 lg:px-8">
                     <h2 className="text-2xl font-bold text-center mb-6">Gallery</h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {organization.gallery.map((image, index) => (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg group">
                                    <Image 
                                        src={image.url} 
                                        alt={`Gallery image ${index + 1}`} 
                                        fill 
                                        className="object-cover transition-transform duration-300 group-hover:scale-110" 
                                    />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[80vh]">
                                    <Image src={image.url} alt={`Gallery image ${index + 1}`} fill className="object-contain" />
                            </DialogContent>
                        </Dialog>
                        ))}
                    </div>
                </section>
            )}

            <div className="py-12 px-4 sm:px-6 lg:px-8">
              <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
                  <TabsTrigger value="news">News ({news.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="events" className="mt-8">
                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">This organization has no upcoming events.</p>
                  )}
                </TabsContent>
                 <TabsContent value="news" className="mt-8">
                  {news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {news.map(article => <NewsCard key={article.id} article={article} />)}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">This organization has not published any news yet.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
        </div>
    </div>
  );
}
