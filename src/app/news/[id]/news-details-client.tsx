'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Globe, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { NewsArticle } from '@/lib/types';
import { generateArticleStructuredData } from '@/lib/metadata';
import { PageHero } from '@/components/page-hero';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface NewsDetailsClientProps {
    article: NewsArticle | null;
}

export default function NewsDetailsClient({ article }: NewsDetailsClientProps) {
    const { toast } = useToast();

    if (!article) {
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Article not found...</p>
          </div>
        );
    }


  const getShareUrl = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (typeof window === 'undefined') return '#';
    const url = window.location.href;
    const text = `Check out this article: ${article.title}!`;
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
  };

  const copyLink = () => {
    if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link Copied!', description: 'Article link copied to clipboard.' });
    }
  }
  
  const structuredData = generateArticleStructuredData(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        title={article.source}
        description={`Published on ${format(new Date(article.publishedDate), 'MMMM dd, yyyy')}`}
        backgroundImage={article.imageUrl}
        height="xl"
        overlay="dark"
      />
      <div className="bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="space-y-8">
                <div className="bg-background p-6 rounded-lg shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-headline mt-2">
                        {article.title}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <main className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>About this story</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <article className="prose prose-lg max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    <p>{article.description}</p>
                                </article>
                            </CardContent>
                        </Card>
                    </main>
                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Share2 className="h-5 w-5"/>Share this</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                <Button variant="outline" size="icon" asChild>
                                    <a href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer"><Twitter /></a>
                                </Button>
                                  <Button variant="outline" size="icon" asChild>
                                    <a href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer"><Facebook /></a>
                                </Button>
                                  <Button variant="outline" size="icon" asChild>
                                    <a href={getShareUrl('linkedin')} target="_blank" rel="noopener noreferrer"><Linkedin /></a>
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={copyLink}><LinkIcon className="mr-2 h-4 w-4" />Copy Link</Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5"/>External Link</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <a href={article.articleUrl} target="_blank" rel="noopener noreferrer">
                                        View Original Article <LinkIcon className="ml-2 h-4 w-4"/>
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>
                </div>


                {article.gallery && article.gallery.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {article.gallery.map((image, index) => (
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
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
      </div>
    </>
  );
}
