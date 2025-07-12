'use server';

/**
 * @fileOverview A flow for generating event descriptions using AI.
 *
 * - generateEventDescription - A function that generates an event description based on input.
 * - GenerateEventDescriptionInput - The input type for the generateEventDescription function.
 * - GenerateEventDescriptionOutput - The return type for the generateEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventDescriptionInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventCategory: z.string().describe('The category of the event (e.g., Music, Sports, Technology).'),
  eventDate: z.string().describe('The date of the event (e.g., 2024-03-15).'),
  eventTime: z.string().describe('The time of the event (e.g., 19:00).'),
  eventLocation: z.string().describe('The location of the event (e.g., Central Park, New York).'),
  eventDescription: z.string().describe('A brief description of the event.'),
  ticketPrice: z.number().describe('The price of a ticket to the event.'),
  eventCapacity: z.number().describe('The maximum capacity of the event.'),
});
export type GenerateEventDescriptionInput = z.infer<typeof GenerateEventDescriptionInputSchema>;

const GenerateEventDescriptionOutputSchema = z.object({
  generatedDescription: z.string().describe('The AI-generated event description.'),
});
export type GenerateEventDescriptionOutput = z.infer<typeof GenerateEventDescriptionOutputSchema>;

export async function generateEventDescription(input: GenerateEventDescriptionInput): Promise<GenerateEventDescriptionOutput> {
  // Check if AI is available (environment variables set)
  const hasGoogleAIKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  
  if (!hasGoogleAIKey) {
    // Fallback: Generate a simple description without AI
    const fallbackDescription = generateFallbackDescription(input);
    return { generatedDescription: fallbackDescription };
  }

  try {
    return await generateEventDescriptionFlow(input);
  } catch (error) {
    console.warn('AI generation failed, using fallback:', error);
    // Fallback to simple description if AI fails
    const fallbackDescription = generateFallbackDescription(input);
    return { generatedDescription: fallbackDescription };
  }
}

function generateFallbackDescription(input: GenerateEventDescriptionInput): string {
  const { eventName, eventCategory, eventDate, eventTime, eventLocation, eventDescription, ticketPrice, eventCapacity } = input;
  
  return `Join us for ${eventName}, an exciting ${eventCategory.toLowerCase()} event taking place on ${eventDate} at ${eventTime}. 
  
Located at ${eventLocation}, this event promises to be an unforgettable experience. ${eventDescription}

Event Details:
📅 Date: ${eventDate}
🕐 Time: ${eventTime}  
📍 Location: ${eventLocation}
🎟️ Tickets: $${ticketPrice}
👥 Capacity: ${eventCapacity} attendees

Don't miss out on this amazing opportunity! Secure your spot today.

*Generated description - AI enhancement unavailable in current environment*`;
}

const prompt = ai.definePrompt({
  name: 'generateEventDescriptionPrompt',
  input: {schema: GenerateEventDescriptionInputSchema},
  output: {schema: GenerateEventDescriptionOutputSchema},
  prompt: `You are an AI assistant helping event organizers create engaging event descriptions.

  Based on the following details, generate an appealing and informative event description that will attract potential attendees. Use a tone that is enthusiastic and highlights the key aspects of the event.

  Event Name: {{{eventName}}}
  Category: {{{eventCategory}}}
  Date: {{{eventDate}}}
  Time: {{{eventTime}}}
  Location: {{{eventLocation}}}
  Brief Description: {{{eventDescription}}}
  Ticket Price: {{{ticketPrice}}}
  Capacity: {{{eventCapacity}}}

  Generated Description:`,
});

const generateEventDescriptionFlow = ai.defineFlow(
  {
    name: 'generateEventDescriptionFlow',
    inputSchema: GenerateEventDescriptionInputSchema,
    outputSchema: GenerateEventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {generatedDescription: output!.generatedDescription!};
  }
);
