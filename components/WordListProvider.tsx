"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useSession } from "next-auth/react";

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
    if (!stored) return defaultData;
    return JSON.parse(stored) as WordListData;
  } catch {
    return defaultData;
  }
}

function saveLocalData(data: WordListData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function hasLocalData(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored) as WordListData;
    return data.bookmarks.length > 0 || data.lists.length > 0;
  } catch {
    return false;
  }
}

export function WordListProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const isLoading = status === "loading";

  const [data, setData] = useState<WordListData>(defaultData);
  const [initialized, setInitialized] = useState(false);
  const [hasPendingMigration, setHasPendingMigration] = useState(false);

  // Load data based on auth state
  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn) {
      // Fetch from API
      Promise.all([
        fetch("/api/user/bookmarks").then(r => r.json()),
        fetch("/api/user/lists").then(r => r.json()),
      ]).then(([bookmarkRes, listRes]) => {
        setData({
          bookmarks: bookmarkRes.bookmarks || [],
          lists: (listRes.lists || []).map((l: { id: string; name: string; words: string[] }) => ({
            id: l.id,
            name: l.name,
            words: l.words || [],
          })),
        });
        setInitialized(true);
        // Check if there's local data to migrate
        setHasPendingMigration(hasLocalData());
      }).catch(() => {
        setData(defaultData);
        setInitialized(true);
      });
    } else {
      // Anonymous: use localStorage
      setData(loadLocalData());
      setInitialized(true);
      setHasPendingMigration(false);
    }
  }, [isLoggedIn, isLoading]);

  // localStorage persistence for anonymous users
  const persistLocal = useCallback((updated: WordListData) => {
    setData(updated);
    saveLocalData(updated);
  }, []);

  // API-backed mutations for logged-in users
  const persistApi = useCallback((updated: WordListData) => {
    setData(updated);
  }, []);

  const isBookmarked = useCallback((word: string) => {
    return data.bookmarks.includes(word.toLowerCase());
  }, [data.bookmarks]);

  const toggleBookmark = useCallback((word: string) => {
    const w = word.toLowerCase();
    const removing = data.bookmarks.includes(w);
    const bookmarks = removing
      ? data.bookmarks.filter(b => b !== w)
      : [...data.bookmarks, w];

    if (isLoggedIn) {
      persistApi({ ...data, bookmarks });
      if (removing) {
        fetch("/api/user/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: w }),
        });
      } else {
        fetch("/api/user/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: w }),
        });
      }
    } else {
      persistLocal({ ...data, bookmarks });
    }
  }, [data, isLoggedIn, persistApi, persistLocal]);

  const createList = useCallback((name: string): string => {
    const tempId = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (isLoggedIn) {
      const newList: WordList = { id: tempId, name, words: [] };
      persistApi({ ...data, lists: [...data.lists, newList] });
      // Create on server, then update ID
      fetch("/api/user/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then(r => r.json()).then(res => {
        if (res.id) {
          setData(prev => ({
            ...prev,
            lists: prev.lists.map(l => l.id === tempId ? { ...l, id: res.id } : l),
          }));
        }
      });
    } else {
      const newList: WordList = { id: tempId, name, words: [] };
      persistLocal({ ...data, lists: [...data.lists, newList] });
    }
    return tempId;
  }, [data, isLoggedIn, persistApi, persistLocal]);

  const deleteList = useCallback((listId: string) => {
    if (isLoggedIn) {
      persistApi({ ...data, lists: data.lists.filter(l => l.id !== listId) });
      fetch(`/api/user/lists/${listId}`, { method: "DELETE" });
    } else {
      persistLocal({ ...data, lists: data.lists.filter(l => l.id !== listId) });
    }
  }, [data, isLoggedIn, persistApi, persistLocal]);

  const addToList = useCallback((listId: string, word: string) => {
    const w = word.toLowerCase();
    const lists = data.lists.map(l =>
      l.id === listId && !l.words.includes(w)
        ? { ...l, words: [...l.words, w] }
        : l
    );

    if (isLoggedIn) {
      persistApi({ ...data, lists });
      fetch(`/api/user/lists/${listId}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w }),
      });
    } else {
      persistLocal({ ...data, lists });
    }
  }, [data, isLoggedIn, persistApi, persistLocal]);

  const removeFromList = useCallback((listId: string, word: string) => {
    const w = word.toLowerCase();
    const lists = data.lists.map(l =>
      l.id === listId
        ? { ...l, words: l.words.filter(ww => ww !== w) }
        : l
    );

    if (isLoggedIn) {
      persistApi({ ...data, lists });
      fetch(`/api/user/lists/${listId}/words`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w }),
      });
    } else {
      persistLocal({ ...data, lists });
    }
  }, [data, isLoggedIn, persistApi, persistLocal]);

  const migrateLocal = useCallback(async () => {
    if (!isLoggedIn) return;
    const localData = loadLocalData();
    if (localData.bookmarks.length === 0 && localData.lists.length === 0) return;

    try {
      await fetch("/api/user/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookmarks: localData.bookmarks,
          lists: localData.lists.map(l => ({ name: l.name, words: l.words })),
        }),
      });

      // Clear localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY);
      setHasPendingMigration(false);

      // Refresh data from server
      const [bookmarkRes, listRes] = await Promise.all([
        fetch("/api/user/bookmarks").then(r => r.json()),
        fetch("/api/user/lists").then(r => r.json()),
      ]);
      setData({
        bookmarks: bookmarkRes.bookmarks || [],
        lists: (listRes.lists || []).map((l: { id: string; name: string; words: string[] }) => ({
          id: l.id,
          name: l.name,
          words: l.words || [],
        })),
      });
    } catch (err) {
      console.error("Migration failed:", err);
    }
  }, [isLoggedIn]);

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
      isLoggedIn,
      hasPendingMigration,
      migrateLocalData: migrateLocal,
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
