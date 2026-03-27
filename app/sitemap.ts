import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lexica.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/spells`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/explore`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/explore/timeline`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/explore/families`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/dictionaries`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
