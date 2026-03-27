"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
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
  const [isReady, setIsReady] = useState(false);
  const [hasPendingMigration, setHasPendingMigration] = useState(false);

  // Track temp ID → real ID mappings and queued operations
  const tempIdMap = useRef<Map<string, string>>(new Map());
  const pendingOps = useRef<Array<{ tempId: string; op: (realId: string) => void }>>([]);

  // Resolve a list ID: if it's a temp ID that's been swapped, return the real one
  const resolveListId = useCallback((listId: string): string => {
    return tempIdMap.current.get(listId) || listId;
  }, []);

  // Flush queued operations after a temp ID is resolved
  const flushPendingOps = useCallback((tempId: string, realId: string) => {
    const toFlush = pendingOps.current.filter(op => op.tempId === tempId);
    pendingOps.current = pendingOps.current.filter(op => op.tempId !== tempId);
    for (const item of toFlush) {
      item.op(realId);
    }
  }, []);

  // Load data based on auth state
  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn) {
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
        setIsReady(true);
        setHasPendingMigration(hasLocalData());
      }).catch((err) => {
        console.error("Failed to load user data:", err);
        setData(defaultData);
        setIsReady(true);
      });
    } else {
      setData(loadLocalData());
      setIsReady(true);
      setHasPendingMigration(false);
    }
  }, [isLoggedIn, isLoading]);

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
    const prevData = data;

    if (isLoggedIn) {
      setData(prev => ({ ...prev, bookmarks }));
      const fetchOp = removing
        ? fetch(`/api/user/bookmarks?word=${encodeURIComponent(w)}`, { method: "DELETE" })
        : fetch("/api/user/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: w }),
          });
      fetchOp.then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      }).catch((err) => {
        console.error("Bookmark sync failed, reverting:", err);
        setData(prevData);
      });
    } else {
      const updated = { ...data, bookmarks };
      setData(updated);
      saveLocalData(updated);
    }
  }, [data, isLoggedIn, isReady]);

  const createList = useCallback((name: string): string => {
    if (!isReady) return "";
    const tempId = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newList: WordList = { id: tempId, name, words: [] };

    if (isLoggedIn) {
      setData(prev => ({ ...prev, lists: [...prev.lists, newList] }));
      fetch("/api/user/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }).then(res => {
        if (res.id) {
          tempIdMap.current.set(tempId, res.id);
          setData(prev => ({
            ...prev,
            lists: prev.lists.map(l => l.id === tempId ? { ...l, id: res.id } : l),
          }));
          flushPendingOps(tempId, res.id);
        }
      }).catch((err) => {
        console.error("Create list failed, reverting:", err);
        setData(prev => ({ ...prev, lists: prev.lists.filter(l => l.id !== tempId) }));
      });
    } else {
      const updated = { ...data, lists: [...data.lists, newList] };
      setData(updated);
      saveLocalData(updated);
    }
    return tempId;
  }, [data, isLoggedIn, isReady, flushPendingOps]);

  const deleteList = useCallback((listId: string) => {
    if (!isReady) return;
    const realId = resolveListId(listId);
    const prevLists = data.lists;

    if (isLoggedIn) {
      setData(prev => ({ ...prev, lists: prev.lists.filter(l => l.id !== realId) }));
      fetch(`/api/user/lists/${realId}`, { method: "DELETE" }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
      }).catch((err) => {
        console.error("Delete list failed, reverting:", err);
        setData(prev => ({ ...prev, lists: prevLists }));
      });
    } else {
      const updated = { ...data, lists: data.lists.filter(l => l.id !== listId) };
      setData(updated);
      saveLocalData(updated);
    }
  }, [data, isLoggedIn, isReady, resolveListId]);

  const addToList = useCallback((listId: string, word: string) => {
    if (!isReady) return;
    const w = word.toLowerCase();
    const realId = resolveListId(listId);
    const isTempId = listId.startsWith("list-") && !tempIdMap.current.has(listId) && realId === listId && isLoggedIn;

    // Update local state immediately
    setData(prev => ({
      ...prev,
      lists: prev.lists.map(l =>
        (l.id === listId || l.id === realId) && !l.words.includes(w)
          ? { ...l, words: [...l.words, w] }
          : l
      ),
    }));

    if (isLoggedIn) {
      // If it's a temp ID that hasn't been resolved yet, queue the API call
      if (isTempId) {
        pendingOps.current.push({
          tempId: listId,
          op: (resolvedId: string) => {
            fetch(`/api/user/lists/${resolvedId}/words`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ word: w }),
            }).catch(err => console.error("Queued addToList failed:", err));
          },
        });
      } else {
        fetch(`/api/user/lists/${realId}/words`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: w }),
        }).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        }).catch((err) => {
          console.error("Add to list failed, reverting:", err);
          setData(prev => ({
            ...prev,
            lists: prev.lists.map(l =>
              l.id === realId ? { ...l, words: l.words.filter(ww => ww !== w) } : l
            ),
          }));
        });
      }
    } else {
      saveLocalData({
        ...data,
        lists: data.lists.map(l =>
          l.id === listId && !l.words.includes(w) ? { ...l, words: [...l.words, w] } : l
        ),
      });
    }
  }, [data, isLoggedIn, isReady, resolveListId]);

  const removeFromList = useCallback((listId: string, word: string) => {
    if (!isReady) return;
    const w = word.toLowerCase();
    const realId = resolveListId(listId);
    const isTempId = listId.startsWith("list-") && !tempIdMap.current.has(listId) && realId === listId && isLoggedIn;

    setData(prev => ({
      ...prev,
      lists: prev.lists.map(l =>
        (l.id === listId || l.id === realId)
          ? { ...l, words: l.words.filter(ww => ww !== w) }
          : l
      ),
    }));

    if (isLoggedIn) {
      if (isTempId) {
        pendingOps.current.push({
          tempId: listId,
          op: (resolvedId: string) => {
            fetch(`/api/user/lists/${resolvedId}/words?word=${encodeURIComponent(w)}`, {
              method: "DELETE",
            }).catch(err => console.error("Queued removeFromList failed:", err));
          },
        });
      } else {
        fetch(`/api/user/lists/${realId}/words?word=${encodeURIComponent(w)}`, {
          method: "DELETE",
        }).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
        }).catch((err) => {
          console.error("Remove from list failed, reverting:", err);
          setData(prev => ({
            ...prev,
            lists: prev.lists.map(l =>
              l.id === realId ? { ...l, words: [...l.words, w] } : l
            ),
          }));
        });
      }
    } else {
      saveLocalData({
        ...data,
        lists: data.lists.map(l =>
          l.id === listId ? { ...l, words: l.words.filter(ww => ww !== w) } : l
        ),
      });
    }
  }, [data, isLoggedIn, isReady, resolveListId]);

  const migrateLocal = useCallback(async () => {
    if (!isLoggedIn) return;
    const localData = loadLocalData();
    if (localData.bookmarks.length === 0 && localData.lists.length === 0) return;

    try {
      const migrateRes = await fetch("/api/user/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookmarks: localData.bookmarks,
          lists: localData.lists.map(l => ({ name: l.name, words: l.words })),
        }),
      });

      if (!migrateRes.ok) throw new Error(`Migration HTTP ${migrateRes.status}`);

      // Refresh data from server BEFORE clearing localStorage
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

      // Only clear localStorage AFTER data is confirmed refreshed
      localStorage.removeItem(STORAGE_KEY);
      setHasPendingMigration(false);
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
      isReady,
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
