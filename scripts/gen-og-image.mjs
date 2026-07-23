// Generates public/og-image.png (1200×630) — the social-share card. Re-run with
// `node scripts/gen-og-image.mjs` if the branding changes. The image is committed
// (static asset), so this is a one-off/maintenance script, not part of the build.
//
// On-brand with the "Statement, dark" system: near-black ground, a violet bloom,
// tabular wordmark, and an area-chart motif that nods to the result charts.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="16%" cy="6%" r="60%">
      <stop offset="0%" stop-color="#827ded" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#827ded" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#827ded" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#827ded" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#0a0b0d"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- area-chart motif rising to the right, nodding to the result charts -->
  <path d="M0 585 C 220 575, 320 520, 470 500 S 760 445, 900 350 S 1090 210, 1200 165 L 1200 630 L 0 630 Z" fill="url(#area)"/>
  <path d="M0 585 C 220 575, 320 520, 470 500 S 760 445, 900 350 S 1090 210, 1200 165" fill="none" stroke="#9b96f5" stroke-width="3" stroke-opacity="0.85"/>

  <!-- brand mark: violet tile with a white rising line + baseline -->
  <rect x="90" y="150" width="96" height="96" rx="22" fill="#827ded"/>
  <polyline points="112,214 132,196 152,204 172,176" fill="none" stroke="#0a0b0d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="110" y1="224" x2="176" y2="224" stroke="#0a0b0d" stroke-width="6" stroke-linecap="round"/>

  <!-- wordmark + tagline -->
  <text x="212" y="222" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#ffffff" letter-spacing="-2">Kakou<tspan fill="#9b96f5">Calc</tspan></text>
  <text x="92" y="352" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="#ffffff" letter-spacing="-1">Make smarter money decisions.</text>
  <text x="92" y="410" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="400" fill="#9ca0aa">Free financial, investment, loan &amp; retirement calculators</text>

  <!-- footer chips -->
  <text x="92" y="560" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="#827ded" letter-spacing="1">77 CALCULATORS&#160;&#160;·&#160;&#160;NO SIGN-UP&#160;&#160;·&#160;&#160;INSTANT RESULTS</text>
</svg>`;

mkdirSync(join(root, "public"), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(join(root, "public/og-image.png"));
console.log("wrote public/og-image.png (1200x630)");
