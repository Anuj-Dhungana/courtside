import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CourtSide handles your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="space-y-5 text-ink-300">
      <h1 className="text-3xl font-black tracking-tight text-ink-100">
        Privacy Policy
      </h1>
      <p className="text-sm text-ink-500">Last updated: September 2026</p>
      <h2 className="text-xl font-bold text-ink-100">What we collect</h2>
      <p>
        CourtSide can be browsed without an account. We do not collect personal
        information for anonymous browsing. Standard server logs (IP address,
        user agent, requested pages) are kept briefly for security and
        rate-limiting purposes.
      </p>
      <h2 className="text-xl font-bold text-ink-100">Cookies</h2>
      <p>
        We do not set tracking cookies for anonymous visitors. If optional
        account features are enabled in the future, strictly necessary session
        cookies would be used and documented here.
      </p>
      <h2 className="text-xl font-bold text-ink-100">Third-party sites</h2>
      <p>
        Links to external, third-party websites are governed by those
        sites&apos; own privacy policies. We encourage you to review them.
      </p>
      <h2 className="text-xl font-bold text-ink-100">Contact</h2>
      <p>
        Privacy questions:{" "}
        <span className="font-mono text-sm">privacy@courtside.example</span>
      </p>
    </div>
  );
}
