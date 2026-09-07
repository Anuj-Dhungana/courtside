import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the CourtSide team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="space-y-5 text-ink-300">
      <h1 className="text-3xl font-black tracking-tight text-ink-100">
        Contact
      </h1>
      <p>For general questions, feedback, or content concerns, reach us at:</p>
      <p className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 font-mono text-sm">
        hello@courtside.example
      </p>
      <p>
        For legal or rights-holder enquiries (including takedown requests for
        content reported by third-party sources), please write to:
      </p>
      <p className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 font-mono text-sm">
        legal@courtside.example
      </p>
      <p className="text-sm text-ink-500">
        We aim to respond to rights-holder enquiries promptly.
      </p>
    </div>
  );
}
