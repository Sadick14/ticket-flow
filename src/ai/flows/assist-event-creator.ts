
'use server';

/**
 * @fileOverview An AI flow to assist event creators with planning.
 *
 * - assistEventCreator - A function that provides AI-powered suggestions for event planning.
 * - AssistEventCreatorInput - The input type for the assistEventCreator function.
 * - AssistEventCreatorOutput - The return type for the assistEventCreator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MediaPartSchema = z.object({
  text: z.string().optional(),
  media: z
    .object({
      url: z.string(),
      contentType: z.string().optional(),
    })
    .optional(),
});

const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(MediaPartSchema),
});

const AssistEventCreatorInputSchema = z.object({
  history: z.array(HistoryMessageSchema).optional(),
  prompt: z.string().describe('The user\'s specific question or request for assistance.'),
  attachments: z.array(z.string()).optional().describe('Data URIs of file attachments.'),
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

export async function assistEventCreator(
  input: AssistEventCreatorInput
): Promise<AssistEventCreatorOutput> {
  const hasGoogleAIKey =
    process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!hasGoogleAIKey) {
    return {
      response:
        'The AI Assistant is currently unavailable. Please ensure your environment is configured with a Google AI API key.',
    };
  }

  try {
    return await assistEventCreatorFlow(input);
  } catch (error) {
    console.warn('AI assistance flow failed:', error);
    return {
      response:
        "I'm sorry, I encountered an error while trying to help. Please try asking in a different way.",
    };
  }
}

const prompt = ai.definePrompt(
  {
    name: 'assistEventCreatorPrompt',
    input: {schema: AssistEventCreatorInputSchema},
    output: {schema: AssistEventCreatorOutputSchema},
    system: `You are an AI Event Planning Assistant for a platform called TicketFlow. Your goal is to help event organizers succeed by providing actionable advice.

You are assisting with the following event:
- Name: {{{eventDetails.name}}}
- Category: {{{eventDetails.category}}}
- Location: {{{eventDetails.location}}}
- Capacity: {{{eventDetails.capacity}}} attendees

Based on the user's request, attachments, and the event details, provide a helpful, encouraging, and well-structured response in Markdown.

Your response should address one of these key areas:
1.  **Venue Scouting**: If asked for venues, suggest 3-5 types of venues suitable for the event in the specified location. For each, provide a brief description of why it's a good fit, and a *fictional* example name with a *fictional* phone number (e.g., "The Grand Hall, (555) 123-4567"). DO NOT use real venue names or contact info.
2.  **Sponsor Outreach**: If asked for sponsors, identify 3-5 types of local or industry-specific businesses that would be a good fit. Provide a sample outreach message template they can adapt. If the user is on a pro plan, offer to send emails to them.
3.  **Event Organization Advice**: If asked for general advice, provide a checklist or bulleted list of actionable steps related to marketing, logistics, or sourcing materials for this specific type of event.
4.  **Analyze Attachments**: If the user provides an attachment (like a sponsorship PDF or venue photo), analyze it and provide feedback or answer questions about it.

Always format your response clearly using Markdown (headings, lists, bold text). Be friendly and professional.`,
  },
  async (input) => {
    const promptParts: any[] = [{text: input.prompt}];
    if (input.attachments) {
      for (const attachment of input.attachments) {
        promptParts.push({media: {url: attachment}});
      }
    }
    return {
      history: input.history,
      prompt: promptParts,
    };
  }
);


const assistEventCreatorFlow = ai.defineFlow(
  {
    name: 'assistEventCreatorFlow',
    inputSchema: AssistEventCreatorInputSchema,
    outputSchema: AssistEventCreatorOutputSchema,
  },
  async (input) => {
    const result = await ai.generate({
      prompt: input.prompt,
      history: input.history,
      model: 'googleai/gemini-pro',
      multimodal: true,
    });
    return {response: result.text};
  }
);
