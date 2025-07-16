'use server';

/**
 * @fileOverview An AI flow to assist event creators with planning.
 *
 * - assistEventCreator - A function that provides AI-powered suggestions for event planning.
 * - AssistEventCreatorInput - The input type for the assistEventCreator function.
 * - AssistEventCreatorOutput - The return type for the assistEventCreator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssistEventCreatorInputSchema = z.object({
  query: z.string().describe('The user\'s specific question or request for assistance.'),
  eventDetails: z.object({
    name: z.string().describe('The name of the event.'),
    category: z.string().describe('The category of the event (e.g., Music, Tech).'),
    location: z.string().describe('The city or area for the event.'),
    capacity: z.number().describe('The estimated number of attendees.'),
  }),
});
export type AssistEventCreatorInput = z.infer<typeof AssistEventCreatorInputSchema>;

const AssistEventCreatorOutputSchema = z.object({
  response: z.string().describe('The AI-generated helpful response, formatted in Markdown.'),
});
export type AssistEventCreatorOutput = z.infer<typeof AssistEventCreatorOutputSchema>;

export async function assistEventCreator(input: AssistEventCreatorInput): Promise<AssistEventCreatorOutput> {
  const hasGoogleAIKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!hasGoogleAIKey) {
    return {
      response: "The AI Assistant is currently unavailable. Please ensure your environment is configured with a Google AI API key."
    };
  }

  try {
    return await assistEventCreatorFlow(input);
  } catch (error) {
    console.warn('AI assistance flow failed:', error);
    return {
      response: "I'm sorry, I encountered an error while trying to help. Please try asking in a different way."
    };
  }
}

const prompt = ai.definePrompt({
  name: 'assistEventCreatorPrompt',
  input: { schema: AssistEventCreatorInputSchema },
  output: { schema: AssistEventCreatorOutputSchema },
  prompt: `You are an AI Event Planning Assistant for a platform called TicketFlow. Your goal is to help event organizers succeed by providing actionable advice.

You are assisting with the following event:
- Name: {{{eventDetails.name}}}
- Category: {{{eventDetails.category}}}
- Location: {{{eventDetails.location}}}
- Capacity: {{{eventDetails.capacity}}} attendees

The user's request is:
"{{{query}}}"

Based on the user's request and the event details, provide a helpful, encouraging, and well-structured response in Markdown.

Your response should address one of these key areas:
1.  **Venue Scouting**: If asked for venues, suggest 3-5 types of venues suitable for the event in the specified location. For each, provide a brief description of why it's a good fit, and a *fictional* example name with a *fictional* phone number (e.g., "The Grand Hall, (555) 123-4567"). DO NOT use real venue names or contact info.
2.  **Sponsor Outreach**: If asked for sponsors, identify 3-5 types of local or industry-specific businesses that would be a good fit. Provide a sample outreach message template they can adapt.
3.  **Event Organization Advice**: If asked for general advice, provide a checklist or bulleted list of actionable steps related to marketing, logistics, or sourcing materials for this specific type of event.

Always format your response clearly using Markdown (headings, lists, bold text). Be friendly and professional.`,
});

const assistEventCreatorFlow = ai.defineFlow(
  {
    name: 'assistEventCreatorFlow',
    inputSchema: AssistEventCreatorInputSchema,
    outputSchema: AssistEventCreatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return { response: output!.response! };
  }
);
