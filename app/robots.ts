import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/register", "/lists"],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/api/sitemap-index`],
  };
}
