
'use server';

/**
 * @fileOverview A flow for generating email content using AI.
 * - generateEmailContent - Generates email body text based on a topic.
 * - GenerateEmailContentInput - Input type for the generation function.
 * - GenerateEmailContentOutput - Output type for the generation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateEmailContentInputSchema = z.object({
  topic: z.string().describe('The subject or topic for the email.'),
  audience: z.string().describe('The target audience, e.g., "Event Creators", "All Users".'),
});
export type GenerateEmailContentInput = z.infer<typeof GenerateEmailContentInputSchema>;

const GenerateEmailContentOutputSchema = z.object({
  emailBody: z.string().describe('The AI-generated email body content in Markdown format.'),
});
export type GenerateEmailContentOutput = z.infer<typeof GenerateEmailContentOutputSchema>;


export async function generateEmailContent(
  input: GenerateEmailContentInput
): Promise<GenerateEmailContentOutput> {
  const hasGoogleAIKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!hasGoogleAIKey) {
    return {
      emailBody: `AI is not configured. Could not generate content for topic: ${input.topic}`,
    };
  }

  try {
    return await generateEmailContentFlow(input);
  } catch (error) {
    console.error('Email content generation flow failed:', error);
    return {
      emailBody: 'Sorry, I was unable to generate content for this topic. Please try again.',
    };
  }
}

const prompt = ai.definePrompt({
  name: 'generateEmailContentPrompt',
  input: { schema: GenerateEmailContentInputSchema },
  output: { schema: GenerateEmailContentOutputSchema },
  system: `You are an expert email copywriter for an event platform called TicketFlow. Your task is to write a compelling email body based on a given topic for a specific audience.

The response should be:
- Formatted in simple Markdown.
- Engaging, clear, and concise.
- Professional, yet friendly and approachable.
- Do NOT include a subject line, as that is handled separately.
- Start directly with the greeting, like "Hi Everyone,".`,
  prompt: `Generate an email body for the topic "{{topic}}" targeted at "{{audience}}".`,
});


const generateEmailContentFlow = ai.defineFlow(
  {
    name: 'generateEmailContentFlow',
    inputSchema: GenerateEmailContentInputSchema,
    outputSchema: GenerateEmailContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate email content.');
    }
    return { emailBody: output.emailBody };
  }
);
