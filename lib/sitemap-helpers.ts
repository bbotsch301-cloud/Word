import { getDatabase } from "./database";

const WORDS_PER_CHUNK = 50000;

export function getWordCount(): number {
  try {
    const db = getDatabase();
    const row = db.prepare("SELECT COUNT(DISTINCT word) as count FROM words").get() as { count: number };
    return row.count;
  } catch {
    return 0;
  }
}

export function getChunkCount(): number {
  const count = getWordCount();
  return Math.max(1, Math.ceil(count / WORDS_PER_CHUNK));
}

export function getWordChunk(chunkIndex: number): string[] {
  try {
    const db = getDatabase();
    const offset = chunkIndex * WORDS_PER_CHUNK;
    const rows = db.prepare(
      "SELECT DISTINCT word FROM words ORDER BY word LIMIT ? OFFSET ?"
    ).all(WORDS_PER_CHUNK, offset) as { word: string }[];
    return rows.map(r => r.word);
  } catch {
    return [];
  }
}
