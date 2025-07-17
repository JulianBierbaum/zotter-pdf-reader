'use server';

import { z } from 'zod';
import { callModel } from '../ollama-client';

const AnalyzePdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  checklist: z.array(z.string()).describe('A checklist of conditions to verify in the PDF.'),
});
export type AnalyzePdfInput = z.infer<typeof AnalyzePdfInputSchema>;

const AnalyzePdfOutputSchema = z.object({
  results: z.array(z.object({
    item: z.string().describe('The checklist item.'),
    present: z.boolean().describe('Whether the item is present in the PDF.'),
    evidence: z.string().optional().describe('The text snippet from the PDF that confirms the finding. If not present, this should be empty.'),
    uncertainty: z.string().optional().describe('Reason for uncertainty, if any')
  })).describe('The analysis results for each checklist item.'),
});
export type AnalyzePdfOutput = z.infer<typeof AnalyzePdfOutputSchema>;

export async function analyzePdf(input: AnalyzePdfInput): Promise<AnalyzePdfOutput> {
  // Validate input
  const validatedInput = AnalyzePdfInputSchema.parse(input);
  
  const checklistItems = validatedInput.checklist.map(item => `- ${item}`).join('\n');
  
  const prompt = `Sie sind ein Experte für die Analyse von PDF-Dokumenten. Ihre Aufgabe ist es, das bereitgestellte PDF-Dokument anhand der gegebenen Checkliste zu überprüfen.

Für jeden Punkt in der Checkliste:
1. Stellen Sie fest, ob die Bedingung im PDF erfüllt ist ('present' ist true) oder nicht ('present' ist false).
2. Extrahieren Sie den genauen Textausschnitt aus dem PDF, der Ihre Feststellung belegt. Fügen Sie diesen Text in das 'evidence'-Feld ein. Wenn kein direkter Beleg gefunden wird, lassen Sie das Feld leer.
3. Wenn Sie sich bei einer Feststellung unsicher sind, geben Sie einen kurzen Grund dafür im 'uncertainty'-Feld an.
4. Stellen Sie sicher, dass Ihre gesamte Analyse auf Deutsch ist.

Antworten Sie im folgenden JSON-Format:
{
  "results": [
    {
      "item": "Checklistenpunkt",
      "present": true,
      "evidence": "Textausschnitt aus PDF",
      "uncertainty": "Grund für Unsicherheit (optional)"
    }
  ]
}

PDF Document: ${validatedInput.pdfDataUri}

Checklist: 
${checklistItems}`;

  const responseText = await callModel(prompt);
  
  try {
    const parsed = JSON.parse(responseText);
    const result = AnalyzePdfOutputSchema.parse(parsed);
    return result;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    // Fallback: create basic results
    return {
      results: validatedInput.checklist.map(item => ({
        item,
        present: false,
        evidence: '',
        uncertainty: 'Failed to parse model response'
      }))
    };
  }
}
