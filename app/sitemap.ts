import type { MetadataRoute } from "next";

import { env } from "@/config/env";
import { getSports } from "@/server/services/catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL.replace(/\/$/, "");
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/live`, changeFrequency: "always", priority: 0.9 },
    { url: `${base}/sports`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: "monthly", priority: 0.2 },
  ];

  try {
    const sports = await getSports();
    const sportEntries: MetadataRoute.Sitemap = sports.map((s) => ({
      url: `${base}/sports/${encodeURIComponent(s.id)}`,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    }));
    return [...staticEntries, ...sportEntries];
  } catch {
    return staticEntries;
  }
}
