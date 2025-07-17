"use client"

import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem } from '../lib/types';

const HISTORY_KEY = 'pdf-history';

// --- Global State Management ---
type HistoryState = {
  history: HistoryItem[];
  isLoading: boolean;
};

// Listeners to notify components of state changes
const listeners: Array<(state: HistoryState) => void> = [];

// The single source of truth for history state
let memoryState: HistoryState = {
  history: [],
  isLoading: true,
};

// Function to update all subscribed components
function notifyListeners() {
  for (const listener of listeners) {
    listener(memoryState);
  }
}

// Function to update the state and notify listeners
function setState(newState: Partial<HistoryState>) {
  memoryState = { ...memoryState, ...newState };
  notifyListeners();
}

// --- Actions ---
function loadHistory() {
  if (typeof window === 'undefined') {
      return;
  }
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      const parsedHistory: HistoryItem[] = JSON.parse(storedHistory);
      setState({ history: parsedHistory.sort((a, b) => b.timestamp - a.timestamp) });
    }
  } catch (error) {
    console.error("Fehler beim Laden des Verlaufs:", error);
    setState({ history: [] });
  } finally {
    setState({ isLoading: false });
  }
}

function addHistoryItem(item: HistoryItem) {
    const newHistory = [...memoryState.history, item].sort((a, b) => b.timestamp - a.timestamp);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        setState({ history: newHistory });
    } catch (error) {
        console.error("Fehler beim Speichern des Verlaufs:", error);
    }
}

function deleteHistoryItem(id: string) {
    const newHistory = memoryState.history.filter(item => item.id !== id);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        setState({ history: newHistory });
    } catch (error) {
        console.error("Fehler beim Löschen des Verlaufseintrags:", error);
    }
}

// Load history on initial script load (client-side only)
if (typeof window !== 'undefined') {
    // We only load once
    if(memoryState.isLoading) {
        loadHistory();
    }
}

// --- The Hook ---
export function useHistory() {
  const [state, setLocalState] = useState<HistoryState>(memoryState);

  useEffect(() => {
    // Subscribe to changes
    listeners.push(setLocalState);

    // If still loading when component mounts, trigger a load.
    // This covers cases where the component mounts after the initial load.
    if (memoryState.isLoading) {
        loadHistory();
    }

    // Unsubscribe on cleanup
    return () => {
      const index = listeners.indexOf(setLocalState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const getHistoryItemById = useCallback((id: string): HistoryItem | undefined | null => {
    // Use the latest state from the hook's own state
    return state.history.find(item => item.id === id) ?? null;
  }, [state.history]);


  return { 
      history: state.history, 
      isLoading: state.isLoading, 
      addHistoryItem, 
      getHistoryItemById, 
      deleteHistoryItem 
  };
}