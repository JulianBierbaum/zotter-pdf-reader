'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { analyzePdf } from '../ai/flows/pdf-analysis';
import { generateChecklist } from '../ai/flows/checklist-generation';
import type { HistoryItem } from './types';
import { config } from 'dotenv';
import { resolve } from 'path';

// Manually load environment variables from src/.env
config({ path: resolve(process.cwd(), 'src/.env') });


const AUTH_COOKIE_NAME = 'pdf-auth-token';
const PASSWORD = process.env.APP_PASSWORD;

const loginSchema = z.object({
  password: z.string().min(1, 'Passwort ist erforderlich.'),
});

export async function login(prevState: any, formData: FormData) {
  if (!PASSWORD) {
    console.error("APP_PASSWORD ist nicht gesetzt.");
    return { message: "Server-Fehler: Anwendung nicht korrekt konfiguriert." };
  }
  
  const validatedFields = loginSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { message: validatedFields.error.errors[0].message };
  }

  if (validatedFields.data.password === PASSWORD) {
    // AWAIT THE COOKIES() CALL HERE
    (await cookies()).set(AUTH_COOKIE_NAME, 'true', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    redirect('/app');
  } else {
    return { message: 'Ungültiges Passwort.' };
  }
}

export async function logout() {
  (await cookies()).set(AUTH_COOKIE_NAME, '', { expires: new Date(0) });
  redirect('/login');
}

export async function runAnalysis(checklist: string[], pdfDataUri: string, pdfName: string) {
    if (!pdfDataUri || checklist.length === 0) {
        throw new Error("PDF-Daten und Checkliste sind erforderlich.");
    }
    
    const analysisResult = await analyzePdf({ pdfDataUri, checklist });

    const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        pdfName: pdfName,
        timestamp: Date.now(),
        results: analysisResult.results,
        checklist,
    };
    
    return historyItem;
}


export async function generateChecklistAction(pdfDataUri: string) {
    if (!pdfDataUri) {
        throw new Error("PDF-Daten sind erforderlich.");
    }

    const result = await generateChecklist({ pdfDataUri });

    return result.checklist;
}
