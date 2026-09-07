/* eslint-disable @next/next/no-img-element */
import type { Team } from "@/types";

/**
 * Team badge image with an initials fallback.
 * Uses a plain <img> (through our same-origin proxy which already serves
 * long-cached WebP) — next/image would add no value for these tiny badges
 * and cannot optimize the opaque upstream ids further.
 */
export function TeamBadge({
  team,
  size = 40,
  className = "",
}: {
  team: Team;
  size?: number;
  className?: string;
}) {
  const initials = team.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  if (!team.badgeUrl) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: size * 0.34 }}
        className={`flex shrink-0 items-center justify-center rounded-full bg-surface-700 font-semibold text-ink-300 ring-1 ring-surface-600 ${className}`}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={team.badgeUrl}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`shrink-0 rounded-full object-contain ${className}`}
    />
  );
}
