import { NextRequest, NextResponse } from "next/server";
import { analyzeWord, getFeaturedSpells, getRandomSpell, buildSpellChain } from "@/lib/spells";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");
  const action = searchParams.get("action");

  try {
    if (action === "featured") {
      return NextResponse.json({ pairs: await getFeaturedSpells() });
    }

    if (action === "random") {
      const spell = await getRandomSpell();
      return NextResponse.json(spell || { words: [], spellType: "sonic", description: "", depthScore: 0 });
    }

    if (action === "chain" && word) {
      const chain = await buildSpellChain(word);
      return NextResponse.json(chain);
    }

    if (word) {
      if (word.length > 40) {
        return NextResponse.json({ error: "Word too long" }, { status: 400 });
      }
      const analysis = await analyzeWord(word);
      return NextResponse.json(analysis, {
        headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
      });
    }

    return NextResponse.json({ error: "Provide ?word= or ?action=featured|random" }, { status: 400 });
  } catch (e) {
    console.error("Spells API error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
