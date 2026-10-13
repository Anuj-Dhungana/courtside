export interface StreamFreeStream {
  name: string;
  category: string;
  league: string | null;
  streamKey: string;
  matchTimestamp: number | null;
  sources: string[];
  thumbnailUrl: string | null;
}

export interface StreamFreeMatch {
  stream: StreamFreeStream | null;
  confidence: "high" | "medium" | "low";
  reason: string;
}
