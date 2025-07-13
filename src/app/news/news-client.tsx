
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { NewsCard } from '@/components/news-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/lib/types';

export default function NewsPageClient() {
  const { news, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNews = useMemo(() => {
    return news.filter((article: NewsArticle) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [news, searchTerm]);

  const renderNewsList = (newsList: NewsArticle[]) => {
    if (loading) {
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (newsList.length > 0) {
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {newsList.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No News Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search terms.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          In The News
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Discover trending events and stories curated by our team.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for news, sources, or topics..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {renderNewsList(filteredNews)}
    </div>
  );
}
