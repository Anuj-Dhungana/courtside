import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function makeSvg({
  size,
  padding = 0.18,
  cornerRadius = 0.22,
  isMaskable = false,
}) {
  const contentSize = size * (1 - padding * 2);
  const offset = size * padding;
  const radius = isMaskable ? 0 : size * cornerRadius;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#07090f" />
    </linearGradient>
    <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#059669" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#07090f" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="50%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  ${
    isMaskable
      ? `<rect width="${size}" height="${size}" fill="url(#bgGrad)" />`
      : `<rect width="${size}" height="${size}" rx="${radius}" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="${Math.max(1, size * 0.012)}" />`
  }

  <!-- Radial Glow Behind Logo -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.4}" fill="url(#emeraldGlow)" />

  <!-- Logo Group -->
  <g transform="translate(${offset}, ${offset}) scale(${contentSize / 24})" filter="url(#subtleShadow)">
    <path
      fill="url(#iconGrad)"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 7.75 6H16.9a5 5 0 0 0-9.8 0H4.25A8 8 0 0 1 12 4Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm-7.75-1h2.85a5 5 0 0 0 3.4 3.9v2.85A8 8 0 0 1 4.25 14Zm9.25 6.75V17.9a5 5 0 0 0 3.4-3.9h2.85a8 8 0 0 1-6.25 6.75Z"
    />
  </g>
</svg>`;
}

async function run() {
  const iconSvg = makeSvg({ size: 512, padding: 0.2, cornerRadius: 0.22 });
  fs.writeFileSync(path.join(outDir, "icon.svg"), iconSvg, "utf8");

  // 192x192 PNG
  const svg192 = makeSvg({ size: 192, padding: 0.2, cornerRadius: 0.22 });
  await sharp(Buffer.from(svg192))
    .png()
    .toFile(path.join(outDir, "icon-192x192.png"));

  // 512x512 PNG
  const svg512 = makeSvg({ size: 512, padding: 0.2, cornerRadius: 0.22 });
  await sharp(Buffer.from(svg512))
    .png()
    .toFile(path.join(outDir, "icon-512x512.png"));

  // 512x512 Maskable PNG
  const svgMaskable = makeSvg({ size: 512, padding: 0.25, isMaskable: true });
  await sharp(Buffer.from(svgMaskable))
    .png()
    .toFile(path.join(outDir, "icon-maskable-512x512.png"));

  // 180x180 Apple Touch Icon
  const svgApple = makeSvg({ size: 180, padding: 0.2, isMaskable: true });
  await sharp(Buffer.from(svgApple))
    .png()
    .toFile(path.join(outDir, "apple-touch-icon.png"));

  // Also write apple-touch-icon to public/apple-touch-icon.png
  await sharp(Buffer.from(svgApple))
    .png()
    .toFile(path.join(__dirname, "..", "public", "apple-touch-icon.png"));

  console.log("Successfully generated all PWA icons in public/icons and public/");
}

run().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
