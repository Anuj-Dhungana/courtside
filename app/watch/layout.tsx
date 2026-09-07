import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch Live — CourtSide",
  description: "Live sports stream player and broadcast hub.",
  robots: { index: false, follow: false },
};

/**
 * Standalone immersive layout for /watch.
 * Inherits the root html/body cleanly without nesting illegal tags.
 */
export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#06080F] text-ink-100 selection:bg-brand-500 selection:text-surface-950">
      {children}
    </div>
  );
}
