
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
import { sendEmail } from '@/lib/email';
import {getAuth} from 'firebase-admin/auth';
import { UserRecord } from 'firebase-admin/auth';

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

// Define the tool for sending emails
const sendSponsorshipEmail = ai.defineTool(
    {
      name: 'sendSponsorshipEmail',
      description: 'Sends a sponsorship request email to a potential sponsor.',
      inputSchema: z.object({
        to: z.string().email().describe('The email address of the potential sponsor.'),
        subject: z.string().describe('The subject line of the email.'),
        body: z.string().describe('The HTML content of the email.'),
        creatorEmail: z.string().email().describe("The event creator's email address to use in the 'from' field."),
        creatorName: z.string().describe("The event creator's name to use in the 'from' field."),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    },
    async (input) => {
        const { to, subject, body, creatorEmail, creatorName } = input;
        const success = await sendEmail({
            to,
            subject,
            html: body,
            text: body.replace(/<[^>]+>/g, ''), // Basic text version
        });

        return {
            success,
            message: success ? `Successfully sent email to ${to}.` : `Failed to send email to ${to}.`
        };
    }
);


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
    tools: [sendSponsorshipEmail],
    system: `You are an AI Event Planning Assistant for a platform called TicketFlow. Your goal is to help event organizers succeed by providing actionable advice.

You are assisting with the following event:
- Name: {{{eventDetails.name}}}
- Category: {{{eventDetails.category}}}
- Location: {{{eventDetails.location}}}
- Capacity: {{{eventDetails.capacity}}} attendees

Based on the user's request, attachments, and the event details, provide a helpful, encouraging, and well-structured response in Markdown.

Your response should address one of these key areas:
1.  **Venue Scouting**: If asked for venues, suggest 3-5 types of venues suitable for the event in the specified location. For each, provide a brief description of why it's a good fit, and a *fictional* example name with a *fictional* phone number (e.g., "The Grand Hall, (555) 123-4567"). DO NOT use real venue names or contact info.
2.  **Sponsor Outreach**: If the user wants to contact sponsors, first guide them to create sponsorship packages. Ask them for details like package names (e.g., Gold, Silver), prices, and what benefits each package includes. Once you have this information, draft a compelling sponsorship request email. After drafting, ask for the potential sponsor's email address. Only when you have the draft, user approval, and the sponsor's email, use the 'sendSponsorshipEmail' tool to send the email. If the user is on a pro plan, you are authorized to send the email on their behalf.
3.  **Event Organization Advice**: If asked for general advice, provide a checklist or bulleted list of actionable steps related to marketing, logistics, or sourcing materials for this specific type of event.
4.  **Analyze Attachments**: If the user provides an attachment (like a sponsorship PDF or venue photo), analyze it and provide feedback or answer questions about it.

Always format your response clearly using Markdown (headings, lists, bold text). Be friendly and professional. When using tools, confirm the action with the user before executing.`,
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
    // In a real app, you would get the current logged-in user's details
    const currentUser = {
        email: 'organizer@example.com', // Placeholder
        name: 'Event Organizer' // Placeholder
    };
    
    const llmResponse = await ai.generate({
      prompt: input.prompt,
      history: input.history,
      model: 'googleai/gemini-pro',
      tools: [sendSponsorshipEmail],
      toolConfig: {
        autoToolInference: true,
      },
      context: {
          creatorEmail: currentUser.email,
          creatorName: currentUser.name,
      }
    });

    if (llmResponse.isToolRequest()) {
        const toolResponse = await llmResponse.performTools();
        const finalResponse = await ai.generate({
            history: [...input.history!, llmResponse.message, toolResponse],
            tools: [sendSponsorshipEmail],
        });
        return { response: finalResponse.text };
    }
    
    return {response: llmResponse.text};
  }
);
