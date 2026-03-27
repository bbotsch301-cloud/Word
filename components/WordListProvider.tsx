"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

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
}

const STORAGE_KEY = "lexica-word-lists";

const defaultData: WordListData = { bookmarks: [], lists: [] };

const WordListContext = createContext<WordListContextValue | undefined>(undefined);

function loadData(): WordListData {
  if (typeof window === "undefined") return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    return JSON.parse(stored) as WordListData;
  } catch {
    return defaultData;
  }
}

function saveData(data: WordListData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function WordListProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WordListData>(defaultData);

  useEffect(() => {
    setData(loadData());
  }, []);

  const persist = useCallback((updated: WordListData) => {
    setData(updated);
    saveData(updated);
  }, []);

  const isBookmarked = useCallback((word: string) => {
    return data.bookmarks.includes(word.toLowerCase());
  }, [data.bookmarks]);

  const toggleBookmark = useCallback((word: string) => {
    const w = word.toLowerCase();
    const bookmarks = data.bookmarks.includes(w)
      ? data.bookmarks.filter(b => b !== w)
      : [...data.bookmarks, w];
    persist({ ...data, bookmarks });
  }, [data, persist]);

  const createList = useCallback((name: string): string => {
    const id = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newList: WordList = { id, name, words: [] };
    persist({ ...data, lists: [...data.lists, newList] });
    return id;
  }, [data, persist]);

  const deleteList = useCallback((listId: string) => {
    persist({ ...data, lists: data.lists.filter(l => l.id !== listId) });
  }, [data, persist]);

  const addToList = useCallback((listId: string, word: string) => {
    const w = word.toLowerCase();
    const lists = data.lists.map(l =>
      l.id === listId && !l.words.includes(w)
        ? { ...l, words: [...l.words, w] }
        : l
    );
    persist({ ...data, lists });
  }, [data, persist]);

  const removeFromList = useCallback((listId: string, word: string) => {
    const w = word.toLowerCase();
    const lists = data.lists.map(l =>
      l.id === listId
        ? { ...l, words: l.words.filter(ww => ww !== w) }
        : l
    );
    persist({ ...data, lists });
  }, [data, persist]);

  return (
    <WordListContext.Provider value={{
      bookmarks: data.bookmarks,
      lists: data.lists,
      isBookmarked,
      toggleBookmark,
      createList,
      deleteList,
      addToList,
      removeFromList,
    }}>
      {children}
    </WordListContext.Provider>
  );
}

export function useWordLists(): WordListContextValue {
  const ctx = useContext(WordListContext);
  if (!ctx) throw new Error("useWordLists must be used within WordListProvider");
  return ctx;
}
