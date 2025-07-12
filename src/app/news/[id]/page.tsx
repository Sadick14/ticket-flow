
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, Share2, Twitter, Facebook, Linkedin, LinkIcon, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NewsArticle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const articleId = params.id;
  const articleRef = doc(db, 'news', articleId);
  const articleSnap = await getDoc(articleRef);

  if (!articleSnap.exists()) {
    return {
      title: 'Article Not Found',
    }
  }

  const article = articleSnap.data() as NewsArticle;

  return {
    title: `${article.title} | TicketFlow`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      url: `/news/${articleId}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.imageUrl],
    },
  }
}

export default function NewsDetailsPage() {
  const { id } = useParams();
  const { news, loading } = useAppContext();
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null | undefined>(undefined); // Start with undefined

  useEffect(() => {
    if (loading) return; // Wait until app context is fully loaded

    if (news.length > 0 && id) {
      const foundArticle = news.find(a => a.id === id);
      setArticle(foundArticle || null); // Set to null if not found
    } else if (!loading && news.length === 0 && id) {
      // If news is empty but we have an ID, try fetching directly (edge case)
       const fetchArticle = async () => {
         const articleRef = doc(db, 'news', id as string);
         const docSnap = await getDoc(articleRef);
         if (docSnap.exists()) {
           setArticle({ id: docSnap.id, ...docSnap.data() } as NewsArticle);
         } else {
           setArticle(null);
         }
       };
       fetchArticle();
    }
  }, [id, news, loading]);

  if (article === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (article === null) {
    notFound();
    return null;
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

  return (
    <>
      <div className="bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="space-y-8">
                <Card className="overflow-hidden">
                    <div className="relative w-full h-64 sm:h-80 md:h-96">
                        <Image 
                        src={article.imageUrl} 
                        alt={article.title} 
                        fill
                        className="object-cover"
                        data-ai-hint="news article"
                        priority
                        />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-primary font-semibold">{article.source.toUpperCase()}</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-headline mt-2">
                            {article.title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground mt-4">
                            <Calendar className="mr-2 h-4 w-4" />
                            Published on {format(new Date(article.publishedDate), 'MMMM dd, yyyy')}
                        </div>
                    </CardContent>
                </Card>

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
                                 <Button variant="outline" className="flex-1" onClick={copyLink}><LinkIcon className="mr-2" />Copy Link</Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5"/>External Link</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <a href={article.articleUrl} target="_blank" rel="noopener noreferrer">
                                        View Original Article <LinkIcon className="ml-2"/>
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
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {article.gallery.map((image, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Card className="overflow-hidden">
                                                <div className="relative aspect-square w-full">
                                                    <Image src={image.url} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
                                                </div>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="ml-12" />
                                <CarouselNext className="mr-12" />
                            </Carousel>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
      </div>
    </>
  );
}
