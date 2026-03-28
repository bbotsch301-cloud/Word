"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";

interface WordList {
  id: string;
  name: string;
  words: string[];
}

interface WordListData {
  bookmarks: string[];
  lists: WordList[];
}

interface WordListContextValue {
  bookmarks: string[];
  lists: WordList[];
  isBookmarked: (word: string) => boolean;
  toggleBookmark: (word: string) => void;
  createList: (name: string) => string;
  deleteList: (listId: string) => void;
  addToList: (listId: string, word: string) => void;
  removeFromList: (listId: string, word: string) => void;
  isLoggedIn: boolean;
  isReady: boolean;
  hasPendingMigration: boolean;
  migrateLocalData: () => Promise<void>;
}

const STORAGE_KEY = "lexica-word-lists";
const defaultData: WordListData = { bookmarks: [], lists: [] };
const WordListContext = createContext<WordListContextValue | undefined>(undefined);

function loadLocalData(): WordListData {
  if (typeof window === "undefined") return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WordListData) : defaultData;
  } catch {
    return defaultData;
  }
}

function saveLocalData(data: WordListData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function WordListProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WordListData>(defaultData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setData(loadLocalData());
    setIsReady(true);
  }, []);

  const isBookmarked = useCallback((word: string) => {
    return data.bookmarks.includes(word.toLowerCase());
  }, [data.bookmarks]);

  const toggleBookmark = useCallback((word: string) => {
    if (!isReady) return;
    const w = word.toLowerCase();
    const removing = data.bookmarks.includes(w);
    const bookmarks = removing
      ? data.bookmarks.filter(b => b !== w)
      : [...data.bookmarks, w];
    const updated = { ...data, bookmarks };
    setData(updated);
    saveLocalData(updated);
  }, [data, isReady]);

  const createList = useCallback((name: string): string => {
    if (!isReady) return "";
    const id = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const updated = { ...data, lists: [...data.lists, { id, name, words: [] }] };
    setData(updated);
    saveLocalData(updated);
    return id;
  }, [data, isReady]);

  const deleteList = useCallback((listId: string) => {
    if (!isReady) return;
    const updated = { ...data, lists: data.lists.filter(l => l.id !== listId) };
    setData(updated);
    saveLocalData(updated);
  }, [data, isReady]);

  const addToList = useCallback((listId: string, word: string) => {
    if (!isReady) return;
    const w = word.toLowerCase();
    const updated = {
      ...data,
      lists: data.lists.map(l =>
        l.id === listId && !l.words.includes(w) ? { ...l, words: [...l.words, w] } : l
      ),
    };
    setData(updated);
    saveLocalData(updated);
  }, [data, isReady]);

  const removeFromList = useCallback((listId: string, word: string) => {
    if (!isReady) return;
    const w = word.toLowerCase();
    const updated = {
      ...data,
      lists: data.lists.map(l =>
        l.id === listId ? { ...l, words: l.words.filter(ww => ww !== w) } : l
      ),
    };
    setData(updated);
    saveLocalData(updated);
  }, [data, isReady]);

  const contextValue = useMemo(() => ({
    bookmarks: data.bookmarks,
    lists: data.lists,
    isBookmarked,
    toggleBookmark,
    createList,
    deleteList,
    addToList,
    removeFromList,
    isLoggedIn: false,
    isReady,
    hasPendingMigration: false,
    migrateLocalData: async () => {},
  }), [data.bookmarks, data.lists, isBookmarked, toggleBookmark, createList, deleteList, addToList, removeFromList, isReady]);

  return (
    <WordListContext.Provider value={contextValue}>
      {children}
    </WordListContext.Provider>
  );
}

export function useWordLists(): WordListContextValue {
  const ctx = useContext(WordListContext);
  if (!ctx) throw new Error("useWordLists must be used within WordListProvider");
  return ctx;
}
