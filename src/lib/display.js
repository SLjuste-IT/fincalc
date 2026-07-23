// Display-only label helpers. These never touch calc.name itself — that string is
// the page <title>, <h1> and breadcrumb, where "APR Calculator" is the phrase
// people actually search for and must stay intact.

// 84% of the 77 names end in " Calculator". Inside a list, under a category
// heading, on a site called KakouCalc, that word identifies nothing — it just
// forces every label to wrap to two or three lines and makes the cards tall.
// Dropping it shortens the average label from 25.6 to 16.4 characters, so most
// fit on one line and the list becomes scannable.
export function shortName(name) {
  return name.replace(/\s+Calculator$/, "");
}
