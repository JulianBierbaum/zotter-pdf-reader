'use server';

import { z } from 'zod';
import { callModel } from '../ollama-client';

const GenerateChecklistInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateChecklistInput = z.infer<typeof GenerateChecklistInputSchema>;

const GenerateChecklistOutputSchema = z.object({
  checklist: z.array(z.string()).describe('A checklist generated from the PDF document.'),
});
export type GenerateChecklistOutput = z.infer<typeof GenerateChecklistOutputSchema>;

export async function generateChecklist(input: GenerateChecklistInput): Promise<GenerateChecklistOutput> {
  // Validate input
  const validatedInput = GenerateChecklistInputSchema.parse(input);
  
  const prompt = `Sie sind Experte für Dokumentenanalyse und Checklistenerstellung.

Sie analysieren das bereitgestellte PDF-Dokument und erstellen eine Checkliste mit Punkten, die überprüft werden müssen.
Die Checklistenpunkte sollten klar, prägnant und umsetzbar sein. Die Ausgabe muss auf Deutsch sein.

Bitte antworten Sie im folgenden JSON-Format:
{
  "checklist": ["Punkt 1", "Punkt 2", "Punkt 3", ...]
}

PDF Document: ${validatedInput.pdfDataUri}

Generate checklist in German:`;

  const responseText = await callModel(prompt);
  
  try {
    const parsed = JSON.parse(responseText);
    const result = GenerateChecklistOutputSchema.parse(parsed);
    return result;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    // Fallback: extract checklist items from text response
    const lines = responseText.split('\n').filter(line => 
      line.trim().startsWith('-') || line.trim().startsWith('•')
    );
    return {
      checklist: lines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
    };
  }
}
