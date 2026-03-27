import { NextRequest, NextResponse } from "next/server";
import { advancedSearch, getOriginLanguages, getFirstUseCenturies, getPartsOfSpeech, getRandomWord, getTimelineData, getLanguageFamilyData, getWordsByOrigin, getWordsByCentury, getEtymologyTree } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "filters": {
        const languages = getOriginLanguages();
        const centuries = getFirstUseCenturies();
        const partsOfSpeech = getPartsOfSpeech();
        return NextResponse.json({ languages, centuries, partsOfSpeech });
      }
      case "random": {
        const word = getRandomWord();
        return NextResponse.json(word || { word: "serendipity", definition: "The faculty of making happy discoveries by accident." });
      }
      case "timeline": {
        const data = getTimelineData();
        return NextResponse.json(data);
      }
      case "families": {
        const data = getLanguageFamilyData();
        return NextResponse.json(data);
      }
      case "by-origin": {
        const lang = searchParams.get("lang") || "";
        const page = parseInt(searchParams.get("page") || "1");
        return NextResponse.json(getWordsByOrigin(lang, page));
      }
      case "by-century": {
        const century = searchParams.get("century") || "";
        const page = parseInt(searchParams.get("page") || "1");
        return NextResponse.json(getWordsByCentury(century, page));
      }
      case "tree": {
        const word = searchParams.get("word") || "";
        const tree = getEtymologyTree(word);
        return NextResponse.json(tree || null);
      }
      default: {
        // Advanced search
        const pattern = searchParams.get("pattern") || undefined;
        const originLang = searchParams.get("originLang") || undefined;
        const century = searchParams.get("century") || undefined;
        const pos = searchParams.get("pos") || undefined;
        const cefrLevel = searchParams.get("cefrLevel") || undefined;
        const page = parseInt(searchParams.get("page") || "1");

        if (!pattern && !originLang && !century && !pos && !cefrLevel) {
          return NextResponse.json({ results: [], total: 0, page: 1, pageSize: 50 });
        }

        const results = advancedSearch({ pattern, originLang, century, pos, cefrLevel }, page);
        return NextResponse.json(results);
      }
    }
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
