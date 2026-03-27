"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWordLists } from "@/components/WordListProvider";

export default function ListsPage() {
  const {
    bookmarks, lists, toggleBookmark, createList, deleteList, removeFromList,
    isLoggedIn, hasPendingMigration, migrateLocalData,
  } = useWordLists();
  const [newListName, setNewListName] = useState("");
  const [migrating, setMigrating] = useState(false);

  const handleCreateList = () => {
    const name = newListName.trim();
    if (!name) return;
    createList(name);
    setNewListName("");
  };

  const handleMigrate = async () => {
    setMigrating(true);
    await migrateLocalData();
    setMigrating(false);
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">My Words</h1>
        <p className="text-text-muted mb-10">
          {isLoggedIn
            ? "Your bookmarked words and custom lists, synced to your account."
            : "Your bookmarked words and custom lists, saved locally in your browser."}
        </p>

        {/* Sign-in banner for anonymous users */}
        {!isLoggedIn && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Save across devices</p>
              <p className="text-xs text-text-muted mt-0.5">Sign in to sync your words and lists everywhere.</p>
            </div>
            <Link
              href="/login"
              className="shrink-0 bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {/* Migration banner */}
        {isLoggedIn && hasPendingMigration && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Import local data</p>
              <p className="text-xs text-text-muted mt-0.5">You have bookmarks and lists saved in this browser. Import them to your account?</p>
            </div>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="shrink-0 bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {migrating ? "Importing..." : "Import"}
            </button>
          </div>
        )}

        {/* Bookmarks */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-text-primary mb-4">
            Bookmarks
            {bookmarks.length > 0 && (
              <span className="text-sm font-mono text-text-muted ml-2">({bookmarks.length})</span>
            )}
          </h2>

          {bookmarks.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-text-muted/40 mb-3">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-text-muted mb-2">No bookmarked words yet.</p>
              <p className="text-sm text-text-muted">
                Click the bookmark icon on any word page to save it here.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((word) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group flex items-center gap-1 bg-surface border border-border rounded-full pl-4 pr-1 py-1 hover:border-accent/40 transition-colors"
                >
                  <Link
                    href={`/word/${encodeURIComponent(word)}`}
                    className="font-serif text-sm text-text-primary hover:text-accent transition-colors"
                  >
                    {word}
                  </Link>
                  <button
                    onClick={() => toggleBookmark(word)}
                    className="p-2 rounded-full text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remove bookmark"
                    aria-label={`Remove bookmark for ${word}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Custom Lists */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-text-primary mb-4">Custom Lists</h2>

          {/* Create new list */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
              placeholder="New list name..."
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] transition-colors"
            />
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>

          {lists.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-10 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-text-muted/40 mb-3">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-text-muted mb-2">No custom lists yet.</p>
              <p className="text-sm text-text-muted">Create one above, then add words from any word page using the list menu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface border border-border rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-lg font-semibold text-text-primary">
                      {list.name}
                      <span className="text-sm font-mono text-text-muted ml-2">({list.words.length})</span>
                    </h3>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${list.name}"? This cannot be undone.`)) {
                          deleteList(list.id);
                        }
                      }}
                      className="text-xs text-text-muted hover:text-red-500 transition-colors px-2 py-1.5 -mr-2 rounded"
                    >
                      Delete list
                    </button>
                  </div>

                  {list.words.length === 0 ? (
                    <p className="text-sm text-text-muted">Empty list. Add words from word pages.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {list.words.map((word) => (
                        <div
                          key={word}
                          className="group flex items-center gap-1 bg-bg border border-border rounded-full pl-3 pr-1 py-0.5"
                        >
                          <Link
                            href={`/word/${encodeURIComponent(word)}`}
                            className="font-serif text-sm text-text-primary hover:text-accent transition-colors"
                          >
                            {word}
                          </Link>
                          <button
                            onClick={() => removeFromList(list.id, word)}
                            className="p-1.5 rounded-full text-text-muted hover:text-red-500 transition-colors"
                            aria-label={`Remove ${word} from list`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
