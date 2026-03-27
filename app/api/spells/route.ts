import { NextRequest, NextResponse } from "next/server";
import { analyzeWord, getFeaturedSpells, getRandomSpell, buildSpellChain } from "@/lib/spells";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");
  const action = searchParams.get("action");

  try {
    if (action === "featured") {
      return NextResponse.json({ pairs: getFeaturedSpells() });
    }

    if (action === "random") {
      const spell = getRandomSpell();
      return NextResponse.json(spell || { words: [], spellType: "sonic", description: "", depthScore: 0 });
    }

    if (action === "chain" && word) {
      const chain = buildSpellChain(word);
      return NextResponse.json(chain);
    }

    if (word) {
      const analysis = analyzeWord(word);
      return NextResponse.json(analysis);
    }

    return NextResponse.json({ error: "Provide ?word= or ?action=featured|random" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
