import { NextRequest, NextResponse } from "next/server";
import { findWordsByPhonemeKey, findAnagrams, lookupPhonemeKey } from "@/lib/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word")?.toLowerCase().trim();

  if (!word || word.length < 1 || word.length > 40) {
    return NextResponse.json({ rhymes: [], anagrams: [] });
  }

  try {
    // Get rhymes via phoneme key
    let rhymes: string[] = [];
    const phonemeKey = lookupPhonemeKey(word);
    if (phonemeKey) {
      rhymes = findWordsByPhonemeKey(phonemeKey, word, 8);
    }

    // Get anagrams
    const anagrams = findAnagrams(word, 8);

    return NextResponse.json(
      { rhymes, anagrams },
      {
        headers: {
          "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000",
        },
      }
    );
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("Word properties error:", err);
    return NextResponse.json({ rhymes: [], anagrams: [] });
  }
}
