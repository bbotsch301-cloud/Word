// Shared visualization utilities for SVG components

export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function truncateLabel(text: string, maxLen: number = 12): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "\u2026" : text;
}

export function getFamilyColor(family: string): string {
  const map: Record<string, string> = {
    Germanic: "#2563EB",
    Romance: "#DC2626",
    Hellenic: "#7C3AED",
    Celtic: "#059669",
    "Indo-Iranian": "#D97706",
    Semitic: "#92400E",
    "Proto-IE": "#6B21A8",
    Italic: "#E11D48",
    Slavic: "#0891B2",
    Turkic: "#CA8A04",
    Uralic: "#4F46E5",
    Other: "#6B7280",
  };
  return map[family] || "#6B7280";
}

export function parseEraToYear(era: string): number {
  if (!era) return 0;
  const bceMatch = era.match(/(\d+)\s*BCE/i);
  if (bceMatch) return -parseInt(bceMatch[1]);
  const ceMatch = era.match(/(\d+)\s*CE/i);
  if (ceMatch) return parseInt(ceMatch[1]);
  const centuryMatch = era.match(/(\d+)(?:st|nd|rd|th)\s*century/i);
  if (centuryMatch) return (parseInt(centuryMatch[1]) - 1) * 100 + 50;
  if (/proto-indo-european|PIE/i.test(era)) return -3500;
  if (/proto-germanic/i.test(era)) return -500;
  if (/old english/i.test(era)) return 700;
  if (/middle english/i.test(era)) return 1200;
  if (/early modern/i.test(era)) return 1500;
  if (/modern/i.test(era)) return 1800;
  if (/ancient/i.test(era)) return -1000;
  if (/medieval/i.test(era)) return 1000;
  if (/classical/i.test(era)) return -300;
  return 0;
}

// Geographic positions for language regions (simplified)
export const LANGUAGE_POSITIONS: Record<string, { x: number; y: number }> = {
  "English": { x: 220, y: 120 },
  "Modern English": { x: 220, y: 120 },
  "Middle English": { x: 230, y: 130 },
  "Old English": { x: 240, y: 125 },
  "French": { x: 280, y: 170 },
  "Old French": { x: 280, y: 175 },
  "Anglo-Norman": { x: 260, y: 155 },
  "Latin": { x: 330, y: 200 },
  "Vulgar Latin": { x: 320, y: 210 },
  "Greek": { x: 400, y: 220 },
  "Ancient Greek": { x: 400, y: 225 },
  "Arabic": { x: 450, y: 280 },
  "Sanskrit": { x: 560, y: 250 },
  "Proto-Indo-European": { x: 420, y: 180 },
  "Germanic": { x: 300, y: 110 },
  "Proto-Germanic": { x: 310, y: 100 },
  "Proto-West Germanic": { x: 290, y: 110 },
  "Old Norse": { x: 280, y: 60 },
  "Celtic": { x: 200, y: 150 },
  "Persian": { x: 500, y: 240 },
  "Old Persian": { x: 510, y: 250 },
  "Spanish": { x: 230, y: 220 },
  "Italian": { x: 340, y: 210 },
  "Dutch": { x: 300, y: 130 },
  "Portuguese": { x: 200, y: 230 },
  "Hebrew": { x: 430, y: 270 },
  "Japanese": { x: 620, y: 170 },
  "Chinese": { x: 580, y: 200 },
  "Old High German": { x: 320, y: 120 },
  "Frankish": { x: 300, y: 140 },
};

// Color palette for visualization variety
export const VIZ_PALETTE = [
  "#2563EB", "#DC2626", "#7C3AED", "#059669", "#D97706",
  "#E11D48", "#0891B2", "#CA8A04", "#4F46E5", "#16A34A",
  "#9333EA", "#EA580C",
];

export function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return VIZ_PALETTE[Math.abs(hash) % VIZ_PALETTE.length];
}
