import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// `site` is what makes canonical URLs, og:url and the sitemap resolve to absolute
// addresses — the thing that was impossible to fill in while the project had no
// host. It is read from the environment rather than hardcoded:
//
//   CF_PAGES_URL  Cloudflare Pages injects this at build time automatically
//                 (e.g. https://kakoucalc.pages.dev). Nothing to configure.
//   SITE_URL      Set this in the Pages dashboard once a custom domain exists;
//                 it takes precedence so the canonical tag follows the real domain.
//
// The localhost fallback only applies to `astro dev`, where absolute URLs are
// irrelevant. No placeholder domain is ever baked into the output.
const site = process.env.SITE_URL || process.env.CF_PAGES_URL || "http://localhost:4321";

export default defineConfig({
  site,
  output: "static",
  // 'directory' emits /calc/tvm/index.html, which serves at the clean /calc/tvm.
  // 'file' would emit /calc/tvm.html and — more importantly — bake the .html
  // suffix into every canonical and og:url tag.
  build: { format: "directory" },
  trailingSlash: "never",
  // Generates sitemap-index.xml. The /embed/<id> widget pages are excluded: they
  // are noindex and canonical to their /calc/<id> counterparts, so listing them
  // would invite indexing of duplicate content.
  integrations: [sitemap({ filter: (page) => !/\/embed\//.test(page) })],
});
