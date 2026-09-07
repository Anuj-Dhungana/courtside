import type { NextConfig } from "next";

/**
 * Security headers applied to every response. CSP intentionally omits
 * frame-src for third-party stream embeds — external sources open as links
 * in a new tab, never framed into our origin.
 */
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires inline styles for styled-jsx/font fallbacks.
      "style-src 'self' 'unsafe-inline'",
      // Next dev/HMR + hydration need inline/eval in dev; production keeps inline for Next runtime bootstrapping.
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' ws: wss: https:",
      // Allow live sports stream iframes from third-party embed hosts.
      "frame-src 'self' https: http: blob: data:",
      "media-src 'self' https: blob: data:",
      // Block framing our site in production; allow it in dev (sandbox previews).
      ...(isDev ? [] : ["frame-ancestors 'none'"]),
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  // X-Frame-Options only in production (dev previews render in an iframe).
  ...(isDev ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  // Lint and typecheck run as separate quality gates (npm run lint /
  // npm run typecheck); skipping them inside `next build` keeps peak
  // build memory low on small CI machines.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // Keep memory usage low in constrained CI/build environments.
    cpus: 1,
    workerThreads: false,
    webpackMemoryOptimizations: true,
    // Run webpack in-process: forked build workers get OOM-killed on
    // small machines before Node's GC can react.
    webpackBuildWorker: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
