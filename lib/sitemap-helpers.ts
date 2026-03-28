import { queryAll, queryOne } from "./database";

const WORDS_PER_CHUNK = 50000;

export async function getWordCount(): Promise<number> {
  try {
    const row = await queryOne<{ count: number }>("SELECT COUNT(DISTINCT word) as count FROM words");
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getChunkCount(): Promise<number> {
  const count = await getWordCount();
  return Math.max(1, Math.ceil(count / WORDS_PER_CHUNK));
}

export async function getWordChunk(chunkIndex: number): Promise<string[]> {
  try {
    const offset = chunkIndex * WORDS_PER_CHUNK;
    const rows = await queryAll<{ word: string }>(
      "SELECT DISTINCT word FROM words ORDER BY word LIMIT ? OFFSET ?",
      WORDS_PER_CHUNK, offset
    );
    return rows.map(r => r.word);
  } catch {
    return [];
  }
}
