
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
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full touch-manipulation bg-card border-border rounded-xl">
      <Link href={`/news/${article.id}`} className="block relative h-48 w-full">
        <Image 
          src={article.imageUrl} 
          alt={article.title} 
          fill
          className="object-cover" 
          data-ai-hint="news article"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </Link>
      <CardHeader className="p-4">
        <p className="text-xs text-primary font-semibold uppercase tracking-wider">
          {article.source} &bull; {format(new Date(article.publishedDate), 'MMM dd, yyyy')}
        </p>
        <CardTitle className="font-bold text-lg line-clamp-2">
           <Link href={`/news/${article.id}`} className="hover:text-primary transition-colors">{article.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/news/${article.id}`}>
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
