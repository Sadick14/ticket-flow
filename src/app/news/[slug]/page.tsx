import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateNewsMetadata, generateArticleStructuredData } from '@/lib/metadata';

// Mock function to get article data - replace with your actual data fetching
async function getArticleData(slug: string) {
  // This would typically fetch from your database or CMS
  // For now, return mock data structure
  return {
    id: slug,
    title: 'Sample Article',
    content: 'This is a sample article content...',
    image: '/uploads/sample-article.jpg',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'TicketFlow Team',
    tags: ['events', 'tips', 'guide'],
  };
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const article = await getArticleData(params.slug);
    
    if (!article) {
      return {
        title: 'Article Not Found | TicketFlow News',
        description: 'The requested article could not be found.',
      };
    }

    return generateNewsMetadata(article);
  } catch (error) {
    return {
      title: 'News | TicketFlow',
      description: 'Latest news and updates from TicketFlow.',
    };
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const article = await getArticleData(params.slug);
    
    if (!article) {
      notFound();
    }

    // Generate structured data for SEO
    const structuredData = generateArticleStructuredData(article);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article>
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>By {article.author}</span>
                <span>•</span>
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </time>
              </div>
            </header>
            
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-8"
              />
            )}
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>
      </>
    );
  } catch (error) {
    notFound();
  }
}
