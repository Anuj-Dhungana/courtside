"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "courtside:favorites";
const EVENT_KEY = "courtside:favorites-updated";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({
  eventId,
  title,
  className = "",
}: {
  eventId: string;
  title?: string;
  className?: string;
}) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const list = getFavorites();
    setIsFavorited(list.includes(eventId));

    const onUpdate = (e: Event) => {
      const custom = e as CustomEvent<string[]>;
      if (Array.isArray(custom.detail)) {
        setIsFavorited(custom.detail.includes(eventId));
      } else {
        setIsFavorited(getFavorites().includes(eventId));
      }
    };

    window.addEventListener(EVENT_KEY, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [eventId]);

  const toggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const list = getFavorites();
        let next: string[];
        if (list.includes(eventId)) {
          next = list.filter((id) => id !== eventId);
        } else {
          next = [...list, eventId];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setIsFavorited(next.includes(eventId));

        window.dispatchEvent(
          new CustomEvent<string[]>(EVENT_KEY, { detail: next }),
        );
      } catch {
        // Ignore storage write errors (e.g. private mode quota)
      }
    },
    [eventId],
  );

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={
        isFavorited
          ? `Remove ${title ?? "event"} from favorites`
          : `Add ${title ?? "event"} to favorites`
      }
      aria-pressed={isFavorited}
      title={isFavorited ? "Favorited" : "Add to favorites"}
      className={`relative z-20 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#e58a00] hover:bg-[#f59a10] active:scale-95 text-white shadow-md transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${className}`}
    >
      <Star
        className={`h-4 w-4 transition-transform ${
          isFavorited ? "fill-white text-white scale-110" : "fill-none text-white stroke-[2.4]"
        }`}
      />
    </button>
  );
}
