import { AlertTriangle, CalendarX } from "lucide-react";
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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-800/80 ring-1 ring-surface-700/60">
        <CalendarX className="h-6 w-6 text-ink-500" aria-hidden="true" />
      </div>
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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-live-500/10 ring-1 ring-live-500/20">
        <AlertTriangle className="h-6 w-6 text-live-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
