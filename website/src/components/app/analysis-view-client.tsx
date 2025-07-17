
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useHistory } from '@/hooks/use-history';
import type { HistoryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, HelpCircle, Loader2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';


function ResultItem({ item, status, uncertainty, evidence }: { item: string, status: boolean, uncertainty?: string, evidence?: string }) {
    const statusIcon = status 
        ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" /> 
        : <XCircle className="h-5 w-5 text-red-600 shrink-0" />;

    return (
        <li className="flex flex-col p-4 rounded-lg bg-card border gap-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    {statusIcon}
                    <span className="flex-grow pt-0.5">{item}</span>
                </div>
                {uncertainty && (
                    <div className="flex items-center gap-2 shrink-0">
                        <HelpCircle className="h-5 w-5 text-amber-500" />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-amber-600">Unsicherheit</span>
                        </div>
                    </div>
                )}
            </div>
             {evidence && (
                <>
                <Separator />
                <div className="pl-9">
                    <div className="p-3 rounded-md bg-muted border">
                        <p className="text-sm text-muted-foreground italic">"{evidence}"</p>
                    </div>
                </div>
                </>
            )}
            {uncertainty && (
                 <div className="pl-9 -mt-2">
                    <p className="text-xs text-muted-foreground">{uncertainty}</p>
                 </div>
            )}
        </li>
    );
}

export function AnalysisViewClient({ id }: { id: string }) {
  const { getHistoryItemById } = useHistory();
  const [item, setItem] = useState<HistoryItem | null | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setItem(getHistoryItemById(id));
  }, [id, getHistoryItemById]);

    const handleExportAsPdf = () => {
        if (!item) return;
        setIsExporting(true);

        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxLineWidth = pageWidth - margin * 2;
        let y = 20;

        // --- Helper function to handle page breaks ---
        const checkPageBreak = (requiredHeight: number) => {
            if (y + requiredHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
                addHeaderAndFooter();
            }
        };
        
        const addHeaderAndFooter = () => {
             // Header
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('PDF Analysebericht', margin, 10);

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Seite ${i} von ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
            }
        }


        // --- Title ---
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text("Analysebericht", pageWidth / 2, y, { align: 'center' });
        y += 15;

        // --- Sub-header ---
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`PDF-Datei: ${item.pdfName}`, margin, y);
        y += 7;
        doc.text(`Datum: ${format(new Date(item.timestamp), "d. MMMM yyyy 'um' HH:mm", { locale: de })}`, margin, y);
        y += 7;
        const verifiedCount = item.results.filter(r => r.present).length;
        const totalCount = item.results.length;
        doc.setFont('helvetica', 'bold');
        doc.text(`Ergebnis: ${verifiedCount} / ${totalCount} verifiziert`, margin, y);
        y += 15;

        // --- Separator Line ---
        doc.setDrawColor(200);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);

        // --- Checklist Results ---
        item.results.forEach((result, index) => {
            const itemText = `${result.item}`;
            
            // Check height needed for the item text
            const itemLines = doc.splitTextToSize(itemText, maxLineWidth - 10);
            let requiredHeight = itemLines.length * 5 + 10;
            
            if (result.evidence) {
                const evidenceLines = doc.splitTextToSize(`Beleg: "${result.evidence}"`, maxLineWidth - 10);
                requiredHeight += evidenceLines.length * 5 + 5;
            }
            if (result.uncertainty) {
                const uncertaintyLines = doc.splitTextToSize(`Unsicherheit: ${result.uncertainty}`, maxLineWidth - 10);
                requiredHeight += uncertaintyLines.length * 5 + 5;
            }

            checkPageBreak(requiredHeight);

            // Icon
            doc.setFontSize(16);
            if (result.present) {
                doc.setTextColor(34, 139, 34); // Green
                doc.text('✓', margin, y + 1);
            } else {
                doc.setTextColor(220, 20, 60); // Red
                doc.text('✗', margin, y + 1);
            }

            // Item text
            doc.setFontSize(11);
            doc.setTextColor(40);
            doc.setFont('helvetica', 'bold');
            doc.text(itemLines, margin + 8, y);
            y += itemLines.length * 5 + 5;

            // Evidence
            if (result.evidence) {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100);
                const evidenceLines = doc.splitTextToSize(`Beleg: "${result.evidence}"`, maxLineWidth - 8);
                doc.text(evidenceLines, margin + 8, y);
                y += evidenceLines.length * 5 + 3;
            }
            
            // Uncertainty
            if (result.uncertainty) {
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(234, 135, 35); // Amber/Orange
                const uncertaintyLines = doc.splitTextToSize(`Unsicherheit: ${result.uncertainty}`, maxLineWidth - 8);
                doc.text(uncertaintyLines, margin + 8, y);
                 y += uncertaintyLines.length * 5 + 3;
            }

            y += 8; // Spacing between items
        });

        addHeaderAndFooter();
        doc.save(`PDF_Analyse_${item.pdfName.replace('.pdf', '') || item.id}.pdf`);
        setIsExporting(false);
    };

  const handleExportAsTxt = () => {
      if (!item) return;

      let content = `Analysebericht für: ${item.pdfName}\n`;
      content += `Datum: ${format(new Date(item.timestamp), "d. MMMM yyyy 'um' HH:mm", { locale: de })}\n`;
      content += `Ergebnis: ${item.results.filter(r => r.present).length} / ${item.results.length} verifiziert\n\n`;
      content += '--- Ergebnisse der Checkliste ---\n\n';

      item.results.forEach(result => {
          content += `[${result.present ? '✓' : '✗'}] ${result.item}\n`;
          if (result.evidence) {
              content += `   -> Beleg: "${result.evidence}"\n`;
          }
          if (result.uncertainty) {
              content += `   -> Unsicherheit: ${result.uncertainty}\n`;
          }
          content += '\n';
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PDF_Analyse_${item.pdfName.replace('.pdf', '') || item.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  if (item === undefined) {
    return (
        <div className="max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (item === null) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Ergebnis nicht gefunden</h1>
        <p className="text-muted-foreground">Der Analyse-Eintrag mit dieser ID konnte nicht gefunden werden.</p>
        <Button asChild className="mt-4">
          <Link href="/app">Zurück zur neuen Analyse</Link>
        </Button>
      </div>
    );
  }

  const verifiedCount = item.results.filter(r => r.present).length;
  const totalCount = item.results.length;
  const percentage = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;

  const getBadgeClass = () => {
    if (percentage === 100) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex justify-end p-4 sm:p-6 sm:pb-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isExporting ? 'Exportieren...' : 'Exportieren'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportAsPdf}>Als PDF exportieren</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportAsTxt}>Als TXT exportieren</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div ref={reportRef}>
            <Card className="shadow-lg border m-4 sm:m-6 sm:mt-4">
                <CardHeader className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-1">{item.pdfName}</CardTitle>
                            <CardDescription>
                                Analysiert am {format(new Date(item.timestamp), "d. MMMM yyyy 'um' HH:mm", { locale: de })}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("py-2 px-4 text-base", getBadgeClass())}>
                                {verifiedCount} / {totalCount} verifiziert
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 pt-0">
                    <h3 className="text-lg font-semibold mb-4">Ergebnisse der Checkliste</h3>
                    <ul className="space-y-3">
                        {item.results.map((result, index) => (
                            <ResultItem key={index} item={result.item} status={result.present} uncertainty={result.uncertainty} evidence={result.evidence} />
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
