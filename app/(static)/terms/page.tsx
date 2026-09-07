import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for using CourtSide.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="space-y-5 text-ink-300">
      <h1 className="text-3xl font-black tracking-tight text-ink-100">
        Terms of Service
      </h1>
      <p className="text-sm text-ink-500">Last updated: September 2026</p>
      <h2 className="text-xl font-bold text-ink-100">1. The service</h2>
      <p>
        CourtSide provides sports event information — schedules, teams and
        reported viewing options — aggregated from third-party data sources. The
        service is provided “as is” without warranties of accuracy or
        availability.
      </p>
      <h2 className="text-xl font-bold text-ink-100">2. Third-party content</h2>
      <p>
        CourtSide does not host, control, or license any video streams. Links
        reported by external services lead to independent websites for which we
        bear no responsibility. Accessing third-party content is at your own
        discretion and must comply with the laws of your jurisdiction and the
        terms of the relevant rights holders.
      </p>
      <h2 className="text-xl font-bold text-ink-100">3. Acceptable use</h2>
      <p>
        You agree not to abuse the service, including automated scraping at
        disruptive rates, attempts to circumvent rate limits, or any unlawful
        activity.
      </p>
      <h2 className="text-xl font-bold text-ink-100">4. Changes</h2>
      <p>
        We may update these terms; continued use after changes constitutes
        acceptance.
      </p>
    </div>
  );
}
