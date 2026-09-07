import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About CourtSide — the sports event information platform.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="space-y-5 text-ink-300">
      <h1 className="text-3xl font-black tracking-tight text-ink-100">
        About CourtSide
      </h1>
      <p>
        CourtSide brings live sports schedules, event details and viewing
        information into one fast, clean interface. We cover football,
        basketball, tennis, cricket, motorsports, combat sports and more —
        updated continuously throughout the day.
      </p>
      <p>
        Event data is aggregated from third-party sources. CourtSide is an
        information service: we do not host or broadcast any video content
        ourselves.
      </p>
      <p>
        Have feedback? We&apos;d love to hear it — see the{" "}
        <a href="/contact" className="text-brand-400 hover:text-brand-500">
          contact page
        </a>
        .
      </p>
    </div>
  );
}
