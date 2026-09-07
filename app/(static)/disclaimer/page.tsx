import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Content and streaming disclaimer for CourtSide.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="space-y-5 text-ink-300">
      <h1 className="text-3xl font-black tracking-tight text-ink-100">
        Disclaimer
      </h1>
      <p>
        CourtSide is an event information aggregator. All event data, imagery
        and reported viewing sources are provided by third-party services.
      </p>
      <p>
        CourtSide does <strong className="text-ink-100">not</strong> host,
        upload, re-broadcast, or store any video content. Any streams listed on
        event pages are links reported by an external API and lead to
        independent third-party websites over which we have no control. We make
        no representation that such sources are licensed or lawful in your
        region, and we do not endorse them.
      </p>
      <p>
        Where an event is available from an official broadcaster in your
        country, we encourage you to use that broadcaster.
      </p>
      <p>
        Rights holders who believe content reported through third-party sources
        infringes their rights can contact us via the{" "}
        <a href="/contact" className="text-brand-400 hover:text-brand-500">
          contact page
        </a>{" "}
        and we will act promptly, including removing the relevant listing from
        our interface.
      </p>
    </div>
  );
}
