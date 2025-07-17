
'use server';
/**
 * @fileOverview A flow for generating a featured article with an image using AI.
 *
 * - generateFeaturedArticle - A function that generates an article title, content, and an image.
 * - GenerateFeaturedArticleInput - The input type for the function.
 * - GenerateFeaturedArticleOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFeaturedArticleInputSchema = z.object({
  topic: z.string().describe('The topic for the article, e.g., "event management tips".'),
});
export type GenerateFeaturedArticleInput = z.infer<typeof GenerateFeaturedArticleInputSchema>;

const GenerateFeaturedArticleOutputSchema = z.object({
  title: z.string().describe('A catchy, engaging title for the article.'),
  content: z.string().describe('The body of the article, written in an engaging and informative tone, formatted as Markdown.'),
  imageUrl: z.string().describe("A data URI of a generated image that visually represents the article content. Format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateFeaturedArticleOutput = z.infer<typeof GenerateFeaturedArticleOutputSchema>;

export async function generateFeaturedArticle(
  input: GenerateFeaturedArticleInput
): Promise<GenerateFeaturedArticleOutput> {
  const hasGoogleAIKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!hasGoogleAIKey) {
    // Return a fallback if AI is not configured
    return {
      title: 'The Art of Event Management',
      content: 'Discover the key strategies for hosting successful and memorable events. From planning to execution, we cover everything you need to know. (AI generation is currently unavailable)',
      imageUrl: 'https://placehold.co/1200x800.png',
    };
  }
  return generateFeaturedArticleFlow(input);
}

const articlePrompt = ai.definePrompt({
  name: 'generateArticleContentPrompt',
  input: { schema: GenerateFeaturedArticleInputSchema },
  output: {
    schema: z.object({
      title: z.string(),
      content: z.string(),
      imagePrompt: z.string().describe('A simple, descriptive prompt for an image generator to create a visually stunning and abstract image related to the article. Should be 2-3 keywords.'),
    }),
  },
  prompt: `You are an expert content creator for a blog about event management.
  
  Generate a short, catchy, and informative article about the provided topic: {{{topic}}}.

  The article should have a clear title and a body of about 3-4 paragraphs.
  Format the content in Markdown.

  Also, create a simple but powerful DALL-E style prompt for a feature image to accompany the article. The prompt should be abstract and visually interesting.
  `,
});

const generateFeaturedArticleFlow = ai.defineFlow(
  {
    name: 'generateFeaturedArticleFlow',
    inputSchema: GenerateFeaturedArticleInputSchema,
    outputSchema: GenerateFeaturedArticleOutputSchema,
  },
  async (input) => {
    // 1. Generate article content and image prompt
    const { output: contentOutput } = await articlePrompt(input);
    if (!contentOutput) {
      throw new Error('Failed to generate article content.');
    }

    const { title, content, imagePrompt } = contentOutput;

    // 2. Generate the image
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A vibrant, abstract, professional image representing: ${imagePrompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageUrl = media?.url;
    if (!imageUrl) {
      throw new Error('Failed to generate article image.');
    }

    // 3. Return the complete article
    return {
      title,
      content,
      imageUrl,
    };
  }
);
