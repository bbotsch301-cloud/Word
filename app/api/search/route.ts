import { NextRequest, NextResponse } from "next/server";
import { advancedSearch, getOriginLanguages, getFirstUseCenturies, getPartsOfSpeech, getRandomWord, getTimelineData, getLanguageFamilyData, getWordsByOrigin, getWordsByCentury, getEtymologyTree } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "filters": {
        const languages = await getOriginLanguages();
        const centuries = await getFirstUseCenturies();
        const partsOfSpeech = await getPartsOfSpeech();
        return NextResponse.json({ languages, centuries, partsOfSpeech });
      }
      case "random": {
        const word = await getRandomWord();
        return NextResponse.json(word || { word: "serendipity", definition: "The faculty of making happy discoveries by accident." });
      }
      case "timeline": {
        const data = await getTimelineData();
        return NextResponse.json(data);
      }
      case "families": {
        const data = await getLanguageFamilyData();
        return NextResponse.json(data);
      }
      case "by-origin": {
        const lang = searchParams.get("lang") || "";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
        return NextResponse.json(await getWordsByOrigin(lang, page), {
          headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
        });
      }
      case "by-century": {
        const century = searchParams.get("century") || "";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
        return NextResponse.json(await getWordsByCentury(century, page), {
          headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
        });
      }
      case "tree": {
        const word = searchParams.get("word") || "";
        const tree = await getEtymologyTree(word);
        return NextResponse.json(tree || null);
      }
      default: {
        // Advanced search
        const pattern = searchParams.get("pattern") || undefined;
        const originLang = searchParams.get("originLang") || undefined;
        const century = searchParams.get("century") || undefined;
        const pos = searchParams.get("pos") || undefined;
        const cefrLevel = searchParams.get("cefrLevel") || undefined;
        const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);

        if (!pattern && !originLang && !century && !pos && !cefrLevel) {
          return NextResponse.json({ results: [], total: 0, page: 1, pageSize: 50 });
        }

        if (pattern && pattern.length > 100) {
          return NextResponse.json({ error: "Pattern too long" }, { status: 400 });
        }

        const sortParam = searchParams.get("sort");
        const sort = (sortParam === "length" || sortParam === "frequency") ? sortParam : "alpha";
        const results = await advancedSearch({ pattern, originLang, century, pos, cefrLevel }, page, 50, sort);
        return NextResponse.json(results, {
          headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" },
        });
      }
    }
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
