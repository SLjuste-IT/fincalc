// Generated at build time rather than served from public/, because the Sitemap
// directive must be an absolute URL and the host is only known at build time
// (CF_PAGES_URL / SITE_URL). A hardcoded or relative sitemap line would be
// invalid per the robots.txt spec.
export function GET({ site }) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
