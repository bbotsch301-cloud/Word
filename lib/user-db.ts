import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const USER_DB_PATH = path.join(process.cwd(), "data", "user.db");

let userDb: Database.Database | null = null;

export function getUserDatabase(): Database.Database {
  if (!userDb) {
    try {
      userDb = new Database(USER_DB_PATH);
      userDb.pragma("journal_mode = WAL");
      userDb.pragma("foreign_keys = ON");
      initSchema(userDb);
    } catch (err) {
      throw new Error(`Cannot open user database at ${USER_DB_PATH}: ${(err as Error).message}`);
    }
  }
  return userDb;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      migrated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS oauth_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      UNIQUE(provider, provider_account_id)
    );

    CREATE TABLE IF NOT EXISTS user_bookmarks (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      word TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, word)
    );

    CREATE TABLE IF NOT EXISTS user_lists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS user_list_words (
      list_id TEXT NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
      word TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (list_id, word)
    );

    CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_lists_user ON user_lists(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_list_words_list ON user_list_words(list_id);
  `);
}

// === Types ===

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  created_at: number;
}

export interface UserList {
  id: string;
  user_id: string;
  name: string;
  created_at: number;
  words: string[];
}

// === Auth Functions ===

export function getUserByEmail(email: string): User | undefined {
  const db = getUserDatabase();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  const db = getUserDatabase();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(email: string, name?: string, passwordHash?: string): User {
  const db = getUserDatabase();
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
  ).run(id, email.toLowerCase(), name || null, passwordHash || null);
  return { id, email: email.toLowerCase(), name: name || null, password_hash: passwordHash || null, created_at: Math.floor(Date.now() / 1000) };
}

export function getUserByOAuth(provider: string, providerAccountId: string): User | undefined {
  const db = getUserDatabase();
  return db.prepare(`
    SELECT u.* FROM users u
    JOIN oauth_accounts oa ON u.id = oa.user_id
    WHERE oa.provider = ? AND oa.provider_account_id = ?
  `).get(provider, providerAccountId) as User | undefined;
}

export function linkOAuthAccount(userId: string, provider: string, providerAccountId: string): void {
  const db = getUserDatabase();
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT OR IGNORE INTO oauth_accounts (id, user_id, provider, provider_account_id) VALUES (?, ?, ?, ?)"
  ).run(id, userId, provider, providerAccountId);
}

// === Bookmark Functions ===

export function getUserBookmarks(userId: string): string[] {
  const db = getUserDatabase();
  const rows = db.prepare(
    "SELECT word FROM user_bookmarks WHERE user_id = ? ORDER BY created_at DESC"
  ).all(userId) as { word: string }[];
  return rows.map(r => r.word);
}

export function addBookmark(userId: string, word: string): void {
  const db = getUserDatabase();
  db.prepare(
    "INSERT OR IGNORE INTO user_bookmarks (user_id, word) VALUES (?, ?)"
  ).run(userId, word.toLowerCase());
}

export function removeBookmark(userId: string, word: string): void {
  const db = getUserDatabase();
  db.prepare(
    "DELETE FROM user_bookmarks WHERE user_id = ? AND word = ?"
  ).run(userId, word.toLowerCase());
}

export function isBookmarked(userId: string, word: string): boolean {
  const db = getUserDatabase();
  const row = db.prepare(
    "SELECT 1 FROM user_bookmarks WHERE user_id = ? AND word = ?"
  ).get(userId, word.toLowerCase());
  return !!row;
}

// === List Functions ===

export function getUserLists(userId: string): UserList[] {
  const db = getUserDatabase();
  const rows = db.prepare(`
    SELECT ul.*, GROUP_CONCAT(ulw.word, '||') as words_str
    FROM user_lists ul
    LEFT JOIN user_list_words ulw ON ul.id = ulw.list_id
    WHERE ul.user_id = ?
    GROUP BY ul.id
    ORDER BY ul.created_at DESC
  `).all(userId) as (Omit<UserList, "words"> & { words_str: string | null })[];

  return rows.map(r => ({
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    created_at: r.created_at,
    words: r.words_str ? r.words_str.split("||") : [],
  }));
}

export function createUserList(userId: string, name: string): string {
  const db = getUserDatabase();
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO user_lists (id, user_id, name) VALUES (?, ?, ?)"
  ).run(id, userId, name);
  return id;
}

export function deleteUserList(userId: string, listId: string): boolean {
  const db = getUserDatabase();
  // Atomic delete with ownership check
  const result = db.prepare(
    "DELETE FROM user_lists WHERE id = ? AND user_id = ?"
  ).run(listId, userId);
  return result.changes > 0;
}

export function addWordToList(listId: string, word: string): void {
  const db = getUserDatabase();
  db.prepare(
    "INSERT OR IGNORE INTO user_list_words (list_id, word) VALUES (?, ?)"
  ).run(listId, word.toLowerCase());
}

export function removeWordFromList(listId: string, word: string): void {
  const db = getUserDatabase();
  db.prepare(
    "DELETE FROM user_list_words WHERE list_id = ? AND word = ?"
  ).run(listId, word.toLowerCase());
}

// === Migration ===

export function hasAlreadyMigrated(userId: string): boolean {
  const db = getUserDatabase();
  const row = db.prepare("SELECT migrated_at FROM users WHERE id = ?").get(userId) as { migrated_at: number | null } | undefined;
  return !!row?.migrated_at;
}

export function migrateLocalData(
  userId: string,
  data: { bookmarks: string[]; lists: { name: string; words: string[] }[] }
): void {
  const db = getUserDatabase();

  // Idempotency: skip if already migrated
  if (hasAlreadyMigrated(userId)) return;

  const tx = db.transaction(() => {
    // Import bookmarks
    for (const word of data.bookmarks) {
      addBookmark(userId, word);
    }
    // Import lists
    for (const list of data.lists) {
      const listId = createUserList(userId, list.name);
      for (const word of list.words) {
        addWordToList(listId, word);
      }
    }
    // Mark as migrated
    db.prepare("UPDATE users SET migrated_at = unixepoch() WHERE id = ?").run(userId);
  });
  tx();
}
