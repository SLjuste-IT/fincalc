// ============================================================================
// Site-wide identity and editorial constants — the E-E-A-T signals (who stands
// behind the numbers, when they were last reviewed, how to make contact) that
// money-topic (YMYL) pages need to rank, surfaced consistently on every page and
// in the methodology/about pages.
//
// HONESTY NOTE: nothing here invents a person or a credential. The publisher is
// the site itself; the trust claims that ARE made (standard formulas,
// independent automated verification, cited data sources) are all real and
// checkable in the repo. Where a real human identity or contact belongs, there
// is a clearly-marked TODO for the owner to fill in — do not fabricate it.
// ============================================================================

export const SITE = {
  org: "KakouCalc",
  editorial: "the KakouCalc editorial team",
  // Last full review of the calculators and their content. Bump when reviewed.
  updated: "July 2026",
  updatedISO: "2026-07-20",

  // The owner's real, reachable address (set 23 July 2026 at the owner's request —
  // AdSense requires a genuinely working contact). Swap for a domain address
  // (e.g. contact@kakoucalc.com) here in one line once one exists.
  contactEmail: "lejuste.s09@gmail.com",
  // TODO(owner): e.g. "Reviewed by Jane Doe, CFP®" — a named, credentialed
  // reviewer is a strong E-E-A-T signal for financial content, but it must be
  // genuine, so it stays empty rather than invented.
  reviewer: "",
};
