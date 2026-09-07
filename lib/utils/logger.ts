/**
 * Minimal structured server-side logger.
 *
 * Emits single-line JSON so logs are machine-parseable in production
 * (Vercel, Docker, etc.). Never pass secrets/tokens into `meta`.
 */
type Level = "debug" | "info" | "warn" | "error";

type Meta = Record<string, unknown>;

function emit(level: Level, message: string, meta?: Meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, meta?: Meta) => {
    if (process.env.NODE_ENV !== "production") emit("debug", msg, meta);
  },
  info: (msg: string, meta?: Meta) => emit("info", msg, meta),
  warn: (msg: string, meta?: Meta) => emit("warn", msg, meta),
  error: (msg: string, meta?: Meta) => emit("error", msg, meta),
};
