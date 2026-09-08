import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CourtSide — Live Sports",
    short_name: "CourtSide",
    description:
      "Follow live sports events, upcoming fixtures, scores and schedules across world sports.",
    start_url: "/",
    id: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#07090f",
    theme_color: "#07090f",
    orientation: "portrait-primary",
    categories: ["sports", "news", "entertainment"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Live Matches",
        short_name: "Live",
        description: "Check active live sports events and streams",
        url: "/live",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Upcoming Schedule",
        short_name: "Schedule",
        description: "View today and tomorrow match schedule",
        url: "/schedule",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Sports Directory",
        short_name: "Sports",
        description: "Browse sports and leagues",
        url: "/sports",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Search Events",
        short_name: "Search",
        description: "Search teams, competitions and matches",
        url: "/search",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
