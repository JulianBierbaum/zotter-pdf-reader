
import type { AnalyzePdfOutput } from "../ai/flows/pdf-analysis";

export type AnalysisResultItem = AnalyzePdfOutput['results'][0];

export interface HistoryItem {
  id: string;
  pdfName: string;
  timestamp: number;
  results: AnalysisResultItem[];
  checklist: string[];
}

export interface SavedChecklist {
    id: string;
    name: string;
    items: string[];
    timestamp: number;
}
