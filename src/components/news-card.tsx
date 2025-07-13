
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import type { NewsArticle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function NewsCard({ article }: { article: NewsArticle }) {
  const { toast } = useToast();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article: ${article.title}`,
        url: `${window.location.origin}/news/${article.id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/news/${article.id}`);
      toast({
        title: "Link Copied",
        description: "Article link copied to clipboard.",
      });
    }
  }
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full">
      <Link href={`/news/${article.id}`} className="block relative h-48 w-full">
        <Image src={article.imageUrl} alt={article.title} layout="fill" objectFit="cover" data-ai-hint="news article" />
      </Link>
      <CardHeader>
        <CardTitle className="font-headline text-lg line-clamp-2">
           <Link href={`/news/${article.id}`} className="hover:text-primary transition-colors">{article.title}</Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground pt-1">{article.source} &bull; {format(new Date(article.publishedDate), 'MMM dd, yyyy')}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/news/${article.id}`}>
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
