"use client";

import { useState, useEffect } from "react";
import type { LexicaResult } from "@/types/lexica";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import TabBar from "@/components/ui/TabBar";
import OverviewTab from "@/components/word/OverviewTab";
import EtymologyTab from "@/components/word/EtymologyTab";
import DefinitionsTab from "@/components/word/DefinitionsTab";
import RelatedTab from "@/components/word/RelatedTab";

export default function WordDisplay({ result }: { result: LexicaResult }) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lexica-recent");
      const recent: string[] = stored ? JSON.parse(stored) : [];
      const updated = [result.word, ...recent.filter((w) => w !== result.word)].slice(0, 8);
      localStorage.setItem("lexica-recent", JSON.stringify(updated));
    } catch {}
  }, [result.word]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "etymology", label: "Etymology", count: result.strata.length },
    { id: "definitions", label: "Definitions", count: result.definitions.length },
    { id: "related", label: "Related" },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-6">
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Word" },
        { label: result.word },
      ]} />

      <div className="mt-4">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">
          {result.word}
        </h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {result.phonetic && (
            <span className="font-mono text-sm text-text-muted">{result.phonetic}</span>
          )}
          {result.definitions[0]?.pos && (
            <Badge variant="accent">{result.definitions[0].pos}</Badge>
          )}
          {result.frequency && (
            <Badge variant="muted">
              {result.frequency.label} &middot; #{result.frequency.rank.toLocaleString()}
            </Badge>
          )}
        </div>
        <p className="text-text-secondary mt-3 leading-relaxed">
          {result.modern_meaning}
        </p>
      </div>

      <div className="mt-6">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-6 animate-fade-in">
        {activeTab === "overview" && <OverviewTab result={result} />}
        {activeTab === "etymology" && <EtymologyTab result={result} />}
        {activeTab === "definitions" && <DefinitionsTab definitions={result.definitions} />}
        {activeTab === "related" && (
          <RelatedTab taxonomy={result.taxonomy} constellation={result.constellation} />
        )}
      </div>
    </main>
  );
}
