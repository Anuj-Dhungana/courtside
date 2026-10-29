export interface StreamFreeStream {
  id?: string;
  name: string;
  category: string;
  league: string | null;
  streamKey: string;
  matchTimestamp: number | null;
  sources: string[];
  liveSources?: string[];
  thumbnailUrl: string | null;
  viewers?: number;
  team1?: StreamFreeTeam | null;
  team2?: StreamFreeTeam | null;
}

export interface StreamFreeTeam {
  name: string;
  logo: string | null;
}

export interface StreamFreeMatch {
  stream: StreamFreeStream | null;
  confidence: "high" | "medium" | "low";
  reason: string;
}
