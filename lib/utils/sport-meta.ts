/**
 * Presentation metadata for sports. The sports list itself comes from the
 * API dynamically; this map provides accent gradient backgrounds for known ids
 * with a safe fallback for anything new the API starts returning.
 */

export interface SportMeta {
  /** Tailwind gradient classes for the sport card accent. */
  accent: string;
}

const DEFAULT_META: SportMeta = {
  accent: "from-slate-500/20 to-slate-600/5",
};

const META: Record<string, SportMeta> = {
  football: {
    accent: "from-emerald-500/25 to-emerald-600/5",
  },
  basketball: {
    accent: "from-orange-500/25 to-orange-600/5",
  },
  "american-football": {
    accent: "from-amber-600/25 to-amber-700/5",
  },
  hockey: {
    accent: "from-sky-500/25 to-sky-600/5",
  },
  baseball: {
    accent: "from-red-500/25 to-red-600/5",
  },
  "motor-sports": {
    accent: "from-rose-500/25 to-rose-600/5",
  },
  fight: {
    accent: "from-purple-500/25 to-purple-600/5",
  },
  tennis: {
    accent: "from-lime-500/25 to-lime-600/5",
  },
  rugby: {
    accent: "from-teal-500/25 to-teal-600/5",
  },
  golf: {
    accent: "from-green-500/25 to-green-600/5",
  },
  billiards: {
    accent: "from-indigo-500/25 to-indigo-600/5",
  },
  afl: {
    accent: "from-yellow-500/25 to-yellow-600/5",
  },
  darts: {
    accent: "from-pink-500/25 to-pink-600/5",
  },
  cricket: {
    accent: "from-cyan-500/25 to-cyan-600/5",
  },
  other: DEFAULT_META,
};

export function sportMeta(id: string): SportMeta {
  return META[id] ?? DEFAULT_META;
}
