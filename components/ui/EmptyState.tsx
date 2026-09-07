import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-600/60 bg-surface-900/50 px-6 py-16 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mb-4 h-10 w-10 text-ink-600"
        fill="currentColor"
      >
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm-3 5a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 9 9Zm6 0a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 15 9Zm-6.36 6.23a1 1 0 0 1 1.41-.1 3 3 0 0 0 3.9 0 1 1 0 1 1 1.3 1.52 5 5 0 0 1-6.5 0 1 1 0 0 1-.11-1.42Z" />
      </svg>
      <h3 className="text-base font-semibold text-ink-100">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again in a moment.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-live-500/20 bg-live-500/5 px-6 py-14 text-center"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mb-4 h-10 w-10 text-live-400"
        fill="currentColor"
      >
        <path d="M12 2 1 21h22L12 2Zm0 4.5L19.5 19h-15L12 6.5ZM11 10v4h2v-4h-2Zm0 5.5v2h2v-2h-2Z" />
      </svg>
      <h3 className="text-base font-semibold text-ink-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
