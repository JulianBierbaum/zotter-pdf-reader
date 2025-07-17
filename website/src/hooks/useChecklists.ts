
"use client"

import { useState, useEffect, useCallback } from 'react';
import type { SavedChecklist } from '../lib/types';

const CHECKLISTS_KEY = 'pdf-checklists';

export function useChecklists() {
  const [savedChecklists, setSavedChecklists] = useState<SavedChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHECKLISTS_KEY);
      if (stored) {
        setSavedChecklists(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Fehler beim Laden der Checklisten:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const updateStorage = (checklists: SavedChecklist[]) => {
      try {
          localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(checklists));
      } catch (error) {
          console.error("Fehler beim Speichern der Checklisten:", error);
      }
  };

  const saveChecklist = useCallback((name: string, items: string[]) => {
    const newChecklist: SavedChecklist = {
      id: crypto.randomUUID(),
      name,
      items,
      timestamp: Date.now(),
    };
    
    setSavedChecklists(prev => {
        const updated = [...prev, newChecklist].sort((a,b) => b.timestamp - a.timestamp);
        updateStorage(updated);
        return updated;
    });

  }, []);

  const deleteChecklist = useCallback((id: string) => {
    setSavedChecklists(prev => {
        const updated = prev.filter(c => c.id !== id);
        updateStorage(updated);
        return updated;
    });
  }, []);

  return { 
      savedChecklists, 
      isLoading, 
      saveChecklist,
      deleteChecklist
  };
}
