// Chrome shared by every page: theme, mobile menu, sidebar accordion, search.
// Ported from the DOM half of the original app.js. The nav itself is no longer
// built here — it is server-rendered in Base.astro so crawlers (and users
// without JS) get the full category tree and every calculator link as real HTML.
import { CALC_INDEX } from "../lib/calculators.js";
import { shortName } from "../lib/display.js";

const $ = (sel) => document.querySelector(sel);
const searchInput = $("#globalSearch");
const searchResultsEl = $("#searchResults");
const sidebar = $("#sidebar");
const scrim = $("#scrim");
const menuToggle = $("#menuToggle");

/* ============ Theme ============ */
// Dark is the default: only an explicit "light" switches away from it, so an
// unset attribute must read as dark rather than falling through to light.
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("kakoucalc-theme", theme);
  } catch (e) {}
}
$("#themeToggle")?.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

/* ============ Sidebar accordion ============ */
// The categories start expanded/collapsed from the server based on the active
// calculator; this only maintains state on click. aria-expanded is kept in step
// with the class — the chevron rotation is otherwise the only cue that a
// category is open, which a screen reader cannot perceive.
$("#nav")?.addEventListener("click", (e) => {
  const head = e.target.closest(".nav-cat-head");
  if (!head) return;
  const open = head.closest(".nav-cat").classList.toggle("open");
  head.setAttribute("aria-expanded", String(open));
});

/* ============ Mobile menu ============ */
function closeSidebarMobile() {
  sidebar?.classList.remove("open");
  scrim?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}
menuToggle?.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  scrim.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});
scrim?.addEventListener("click", closeSidebarMobile);

/* ============ Search ============ */
// Results are now real links to real URLs rather than hash assignments, so a
// middle-click or "open in new tab" behaves the way a user expects.
const ALL_CALCS = Object.values(CALC_INDEX);
function runSearch(q) {
  q = q.trim().toLowerCase();
  if (!q) {
    searchResultsEl.hidden = true;
    return;
  }
  const matches = ALL_CALCS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.catName.toLowerCase().includes(q)
  ).slice(0, 12);
  if (!matches.length) {
    searchResultsEl.innerHTML = `<div class="empty">No calculators found.</div>`;
    searchResultsEl.hidden = false;
    return;
  }
  // Matching still runs against the full name above, so typing "calculator"
  // behaves as expected even though the label below omits it.
  searchResultsEl.innerHTML = matches
    .map((c) => `<a class="res" href="/calc/${c.id}"><span>${shortName(c.name)}</span><small>${c.catName}</small></a>`)
    .join("");
  searchResultsEl.hidden = false;
}
searchInput?.addEventListener("input", (e) => runSearch(e.target.value));
searchInput?.addEventListener("focus", (e) => {
  if (e.target.value) runSearch(e.target.value);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap") && searchResultsEl) searchResultsEl.hidden = true;
});
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const first = searchResultsEl.querySelector(".res");
    if (first) window.location.href = first.getAttribute("href");
  }
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement !== searchInput &&
    !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    e.preventDefault();
    searchInput?.focus();
  }
});
