
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHistory } from "../../hooks/use-history";
import { generateChecklistAction, runAnalysis } from "../../lib/actions";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, ArrowUp, ArrowDown, File as FileIcon, Loader2, PlusCircle, Sparkles, Trash2, UploadCloud, Download, Save, MoreVertical, X } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { fileToDataUri } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useChecklists } from "../../hooks/useChecklists";
import { Separator } from "../ui/separator";

function ChecklistEditor({ items, setItems, disabled }: { items: string[], setItems: (items: string[]) => void, disabled: boolean }) {

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    } else {
        // If it's the last item, just clear it instead of removing the input
        const newItems = [...items];
        newItems[index] = "";
        setItems(newItems);
    }
  };
  
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    
    const newItems = [...items];
    const itemToMove = newItems[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    newItems[index] = newItems[swapIndex];
    newItems[swapIndex] = itemToMove;
    
    setItems(newItems);
  };
  
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 group">
            <Input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={`Prüfpunkt ${index + 1}`}
                disabled={disabled}
                className="flex-grow"
            />
             <div className="flex items-center">
                <Button type="button" variant="ghost" size="icon" onClick={() => moveItem(index, 'up')} disabled={disabled || index === 0} className="h-8 w-8">
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => moveItem(index, 'down')} disabled={disabled || index === items.length - 1} className="h-8 w-8">
                    <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={disabled} className="h-8 w-8 opacity-50 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addItem} disabled={disabled} className="mt-4">
        <PlusCircle className="mr-2 h-4 w-4" />
        Punkt hinzufügen
      </Button>
    </div>
  );
}

function SaveChecklistPopover({ onSave, disabled, children, onOpenChange }: { onSave: (name: string) => void, disabled?: boolean, children: React.ReactNode, onOpenChange?: (open: boolean) => void }) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (onOpenChange) {
            onOpenChange(open);
        }
    }, [open, onOpenChange]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            setName("");
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Checkliste speichern</h4>
                        <p className="text-sm text-muted-foreground">
                            Geben Sie dieser Checkliste einen Namen, um sie später wiederzuverwenden.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="checklist-name">Name</Label>
                        <Input
                            id="checklist-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="z.B. Standard Mietvertrag"
                        />
                    </div>
                    <Button onClick={handleSave} disabled={!name.trim()}>Speichern</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function NewAnalysisClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMoreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [isSavePopoverOpen, setSavePopoverOpen] = useState(false);

  const router = useRouter();
  const { addHistoryItem } = useHistory();
  const { savedChecklists, saveChecklist, deleteChecklist } = useChecklists();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importChecklistInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError(null);
      const dataUri = await fileToDataUri(file);
      setPdfDataUri(dataUri);
    } else {
      setPdfFile(null);
      setPdfDataUri(null);
      setError("Bitte wählen Sie eine gültige PDF-Datei aus.");
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setPdfDataUri(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleGenerateChecklist = async () => {
      if (!pdfDataUri) {
          setError("Bitte laden Sie zuerst ein PDF hoch, um eine Checkliste zu erstellen.");
          return;
      }
      setIsGenerating(true);
      setError(null);
      try {
          const generatedItems = await generateChecklistAction(pdfDataUri);
          setChecklist(generatedItems.length > 0 ? generatedItems : [""]);
          toast({ title: "Checkliste erstellt", description: "Die KI hat eine Checkliste aus Ihrem PDF generiert." });
      } catch (e) {
          const error = e instanceof Error ? e.message : "Unbekannter Fehler";
          setError(`Fehler beim Erstellen der Checkliste: ${error}`);
          toast({ variant: "destructive", title: "Fehler", description: `Konnte Checkliste nicht erstellen: ${error}` });
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pdfFile || !pdfDataUri || checklist.every(item => item.trim() === '')) {
      setError("Bitte laden Sie eine PDF-Datei hoch und füllen Sie mindestens einen Prüfpunkt aus.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nonEmptyChecklist = checklist.filter(item => item.trim() !== '');
      const historyItem = await runAnalysis(nonEmptyChecklist, pdfDataUri, pdfFile.name);
      addHistoryItem(historyItem);
      toast({ title: "Analyse erfolgreich", description: `Die Analyse für ${pdfFile.name} wurde abgeschlossen.` });
      router.push(`/app/history/${historyItem.id}`);
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unbekannter Fehler";
      setError(`Analyse fehlgeschlagen: ${error}`);
      toast({ variant: "destructive", title: "Analysefehler", description: error });
      setIsLoading(false);
    }
  };
  
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isLoading || isGenerating || pdfFile) return;

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        setPdfFile(file);
        setError(null);
        const dataUri = await fileToDataUri(file);
        setPdfDataUri(dataUri);
      } else {
        setPdfFile(null);
        setPdfDataUri(null);
        setError("Bitte wählen Sie eine gültige PDF-Datei aus.");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
    const handleChecklistFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                setChecklist(lines.length > 0 ? lines : [""]);
                toast({ title: "Checkliste importiert", description: `Checkliste aus ${file.name} wurde geladen.` });
            };
            reader.readAsText(file);
        } else {
            toast({ variant: "destructive", title: "Fehler", description: "Bitte wählen Sie eine gültige .txt-Datei." });
        }
        // Reset file input
        if (event.target) event.target.value = '';
        setMoreOptionsOpen(false);
    };

    const handleChecklistExport = () => {
        const content = checklist.filter(item => item.trim() !== '').join('\n');
        if (!content) {
            toast({ variant: "destructive", title: "Leere Checkliste", description: "Es gibt nichts zu exportieren." });
            return;
        }
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'checklist.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Checkliste exportiert", description: "Ihre Checkliste wurde als checklist.txt heruntergeladen." });
        setMoreOptionsOpen(false);
    };

    const handleSaveCurrentChecklist = (name: string) => {
        const items = checklist.filter(item => item.trim() !== '');
        if (items.length === 0) {
            toast({ variant: "destructive", title: "Leere Checkliste", description: "Kann keine leere Checkliste speichern." });
            return;
        }
        saveChecklist(name, items);
        toast({ title: "Checkliste gespeichert", description: `"${name}" wurde erfolgreich gespeichert.` });
        setMoreOptionsOpen(false);
    };

    const handleLoadChecklist = (id: string) => {
        const loaded = savedChecklists.find(c => c.id === id);
        if (loaded) {
            setChecklist(loaded.items);
            toast({ title: "Checkliste geladen", description: `"${loaded.name}" wurde geladen.` });
        }
    };

    const handleDeleteChecklist = (id: string, name: string) => {
        deleteChecklist(id);
        toast({ title: "Checkliste gelöscht", description: `"${name}" wurde gelöscht.` });
    };

    const isChecklistEmpty = checklist.every(item => item.trim() === '');
    
    useEffect(() => {
        // This closes the main popover unless the save popover has just been opened.
        if (!isSavePopoverOpen) {
            setMoreOptionsOpen(false);
        }
    }, [isSavePopoverOpen]);

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <Label htmlFor="pdf-upload">1. PDF hochladen</Label>
            
            {!pdfFile ? (
              <div 
                  className="flex items-center justify-center w-full"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
              >
                  <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Klicken zum Hochladen</span> oder Datei hierher ziehen</p>
                          <p className="text-xs text-muted-foreground">Nur PDF</p>
                      </div>
                      <Input id="pdf-upload" type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="application/pdf" disabled={isLoading || isGenerating} />
                  </label>
              </div>
            ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-foreground p-3 border rounded-md">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileIcon className="h-6 w-6 text-primary shrink-0" />
                        <span className="truncate font-medium">{pdfFile.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} disabled={isLoading || isGenerating}>
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Entfernen
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <Label>2. Checkliste definieren</Label>
                    <p className="text-sm text-muted-foreground">Erstellen Sie Ihre Prüfpunkte oder laden Sie eine vorhandene Liste.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateChecklist} disabled={!pdfFile || isLoading || isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Mit KI erstellen
                    </Button>
                    
                    <Popover open={isMoreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Weitere Optionen</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-2">
                            <div className="flex flex-col gap-1">
                                <Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Aktuelle Liste</Label>
                                <SaveChecklistPopover onSave={handleSaveCurrentChecklist} disabled={isChecklistEmpty} onOpenChange={setSavePopoverOpen}>
                                    <Button type="button" variant="ghost" className="w-full justify-start" disabled={isChecklistEmpty}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Checkliste speichern...
                                    </Button>
                                </SaveChecklistPopover>
                                <Button type="button" variant="ghost" className="w-full justify-start" onClick={handleChecklistExport} disabled={isChecklistEmpty}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Als TXT exportieren
                                </Button>
                                <Separator className="my-1" />
                                <Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Neue Liste</Label>
                                <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => importChecklistInputRef.current?.click()}>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Aus TXT importieren
                                </Button>
                                <input type="file" ref={importChecklistInputRef} onChange={handleChecklistFileImport} accept=".txt" className="hidden" />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
              </div>

              {savedChecklists.length > 0 && (
                <div className="pt-2">
                     <Select onValueChange={handleLoadChecklist} disabled={isLoading || isGenerating}>
                        <SelectTrigger>
                            <SelectValue placeholder="Gespeicherte Checkliste laden..." />
                        </SelectTrigger>
                        <SelectContent>
                            {savedChecklists.map((list) => (
                                <div key={list.id} className="relative group">
                                    <SelectItem value={list.id} className="pr-8">
                                        {list.name}
                                    </SelectItem>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:inline-flex" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteChecklist(list.id, list.name);
                                        }}>
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Delete checklist</span>
                                    </Button>
                                </div>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              )}

            <ChecklistEditor items={checklist} setItems={setChecklist} disabled={isLoading || isGenerating} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={!pdfFile || isLoading || isGenerating || isChecklistEmpty}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Analysiere...' : 'Analyse starten'}
        </Button>
      </div>
    </form>
  );
}
