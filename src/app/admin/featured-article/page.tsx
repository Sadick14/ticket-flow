
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { Loader2, Wand2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { generateFeaturedArticle } from '@/ai/flows/generate-featured-article';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface ArticleData {
  title: string;
  content: string;
  imageUrl: string;
}

export default function FeaturedArticleAdminPage() {
  const { featuredArticle, setFeaturedArticle, loading: contextLoading } = useAppContext();
  const { toast } = useToast();

  const [topic, setTopic] = useState('Tips for successful event management');
  const [generatedArticle, setGeneratedArticle] = useState<ArticleData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      toast({ variant: 'destructive', title: 'Topic is required' });
      return;
    }
    setIsGenerating(true);
    setGeneratedArticle(null);
    try {
      const result = await generateFeaturedArticle({ topic });
      setGeneratedArticle(result);
      toast({ title: 'Article Generated!', description: 'Review the new article below.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate the article. Please try again.' });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSetAsFeatured = async () => {
    if (!generatedArticle) return;
    setIsSaving(true);
    try {
      await setFeaturedArticle(generatedArticle);
      toast({ title: 'Featured Article Updated!', description: 'The new article is now live on the homepage.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save the new article.' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentArticle = generatedArticle || featuredArticle;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Article Generator</CardTitle>
          <CardDescription>Generate and manage the featured article displayed on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Article Topic</Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The future of hybrid events"
              />
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Article Preview</CardTitle>
          <CardDescription>This is the article that will be displayed. Review and save.</CardDescription>
        </CardHeader>
        <CardContent>
          {contextLoading || isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : currentArticle ? (
            <div className="space-y-6">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                <Image src={currentArticle.imageUrl} alt={currentArticle.title} layout="fill" objectFit="cover" />
              </div>
              <h2 className="text-3xl font-bold">{currentArticle.title}</h2>
              <div className="prose max-w-none">
                <ReactMarkdown>{currentArticle.content}</ReactMarkdown>
              </div>
              {generatedArticle && (
                <Button onClick={handleSetAsFeatured} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Set as Featured Article
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No article to display</h3>
                <p className="mt-1 text-sm text-muted-foreground">Generate a new article to see a preview.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
