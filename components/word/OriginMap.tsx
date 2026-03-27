"use client";

import { motion } from "framer-motion";
import type { Stratum } from "@/types/lexica";

// Simplified region positions on a world map viewbox
const REGION_COORDS: Record<string, { x: number; y: number; label: string }> = {
  // British Isles
  Britain: { x: 220, y: 95, label: "Britain" },
  // Western Europe
  Paris: { x: 240, y: 130, label: "France" },
  Amsterdam: { x: 250, y: 105, label: "Netherlands" },
  Berlin: { x: 275, y: 108, label: "Germany" },
  Scandinavia: { x: 270, y: 70, label: "Scandinavia" },
  // Mediterranean
  Rome: { x: 270, y: 155, label: "Italy" },
  Iberia: { x: 205, y: 155, label: "Iberia" },
  Athens: { x: 305, y: 160, label: "Greece" },
  // Middle East
  Baghdad: { x: 365, y: 155, label: "Arabia" },
  Jerusalem: { x: 340, y: 160, label: "Hebrew" },
  Persia: { x: 385, y: 140, label: "Persia" },
  // South Asia
  India: { x: 430, y: 175, label: "India" },
  // East Asia
  China: { x: 490, y: 140, label: "China" },
  Japan: { x: 530, y: 125, label: "Japan" },
  // Proto-IE
  "Proto-IE": { x: 340, y: 115, label: "Proto-IE" },
};

// Map language codes/names to regions
const LANG_TO_REGION: Record<string, string> = {
  // Modern
  English: "Britain", "Modern English": "Britain",
  French: "Paris", "Old French": "Paris", "Middle French": "Paris", "Anglo-Norman": "Paris",
  German: "Berlin", "Old High German": "Berlin", "Middle High German": "Berlin",
  Dutch: "Amsterdam", "Middle Dutch": "Amsterdam",
  Italian: "Rome", Spanish: "Iberia", Portuguese: "Iberia",
  Greek: "Athens", "Ancient Greek": "Athens",
  Latin: "Rome",
  Arabic: "Baghdad",
  Hebrew: "Jerusalem",
  Persian: "Persia", "Old Persian": "Persia",
  Sanskrit: "India", Hindi: "India",
  Chinese: "China", Japanese: "Japan",
  // Old languages
  "Old English": "Britain", "Middle English": "Britain",
  "Old Norse": "Scandinavia", Norse: "Scandinavia",
  "Proto-Germanic": "Scandinavia",
  "Proto-Indo-European": "Proto-IE",
  // Codes
  eng: "Britain", enm: "Britain", ang: "Britain",
  fra: "Paris", fro: "Paris", frm: "Paris",
  lat: "Rome", ita: "Rome",
  grc: "Athens", ell: "Athens",
  deu: "Berlin", goh: "Berlin", gmh: "Berlin",
  nld: "Amsterdam", dum: "Amsterdam",
  non: "Scandinavia",
  ara: "Baghdad", heb: "Jerusalem", fas: "Persia",
  san: "India", hin: "India",
  zho: "China", jpn: "Japan",
  spa: "Iberia", por: "Iberia",
};

function getRegion(language: string): string | undefined {
  return LANG_TO_REGION[language];
}

export function OriginMap({ strata }: { strata: Stratum[] }) {
  // Build journey path from strata (reversed: oldest first)
  const journey = [...strata].reverse();
  const points: { x: number; y: number; label: string; language: string }[] = [];
  const seen = new Set<string>();

  for (const s of journey) {
    const regionKey = getRegion(s.language);
    if (!regionKey || seen.has(regionKey)) continue;
    const coords = REGION_COORDS[regionKey];
    if (!coords) continue;
    seen.add(regionKey);
    points.push({ ...coords, language: s.language });
  }

  if (points.length < 2) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">Word Journey Map</h4>
      <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
        <svg viewBox="150 50 430 160" className="w-full" role="img" aria-label="Map showing word origin path">
          {/* Simplified continent outlines */}
          {/* Europe */}
          <path d="M200,80 Q210,75 225,80 L235,85 Q245,80 260,85 L280,90 Q290,85 300,90 L305,100 Q310,110 305,120 L295,130 Q285,135 275,140 L260,145 Q250,150 240,148 L225,145 Q215,140 208,135 L200,125 Q195,115 198,105 Z"
            fill="var(--accent)" fillOpacity="0.06" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* British Isles */}
          <path d="M212,82 Q218,78 224,82 L226,90 Q224,95 218,96 L214,92 Q210,87 212,82 Z"
            fill="var(--accent)" fillOpacity="0.08" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Scandinavia */}
          <path d="M260,55 Q270,52 275,58 L278,70 Q275,78 270,80 L265,75 Q258,65 260,55 Z"
            fill="var(--accent)" fillOpacity="0.06" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Mediterranean / Africa top */}
          <path d="M200,160 L320,160 Q330,162 340,165 L370,170 Q380,175 375,180 L200,180 Z"
            fill="var(--border)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="0.3" strokeOpacity="0.1" />
          {/* Middle East */}
          <path d="M320,130 Q340,125 360,130 L385,135 Q395,140 390,150 L375,160 Q360,165 340,160 L325,150 Q315,140 320,130 Z"
            fill="var(--accent)" fillOpacity="0.04" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.15" />
          {/* South Asia */}
          <path d="M405,145 Q425,135 445,140 L455,155 Q450,175 435,185 L420,180 Q405,170 405,145 Z"
            fill="var(--accent)" fillOpacity="0.04" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.15" />
          {/* East Asia */}
          <path d="M475,100 Q500,95 520,100 L535,115 Q540,130 530,145 L510,150 Q490,148 480,140 L475,125 Q470,110 475,100 Z"
            fill="var(--accent)" fillOpacity="0.04" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.15" />

          {/* Journey path */}
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            return (
              <motion.line
                key={`path-${i}`}
                x1={prev.x} y1={prev.y}
                x2={p.x} y2={p.y}
                stroke="var(--accent)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              />
            );
          })}

          {/* Journey points */}
          {points.map((p, i) => (
            <motion.g
              key={`point-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
            >
              <circle cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 4}
                fill={i === points.length - 1 ? "var(--accent)" : "var(--bg)"}
                stroke="var(--accent)" strokeWidth={1.5}
              />
              <text x={p.x} y={p.y - 8} textAnchor="middle"
                className="fill-text-secondary" fontSize="7" fontFamily="var(--font-serif)"
              >
                {p.language}
              </text>
              {/* Step number */}
              <text x={p.x} y={p.y + 3} textAnchor="middle"
                className="fill-accent" fontSize="5" fontWeight="bold"
              >
                {i + 1}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}
