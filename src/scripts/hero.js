// The hero's arrival sequence — the one place on the site with real animation,
// because it is the one screen where someone is arriving rather than working.
//
// Driven from JS on purpose. A CSS entrance would need `animation-fill-mode:
// both` with an opacity:0 start, which leaves the headline permanently invisible
// if the animation never runs. Here the markup is visible by default and this
// script opts INTO the motion, so the worst case is a static hero, not a blank
// one.
//
// The stats reuse the calculator's own figure tween (lib/animate.js) rather than
// a bespoke counter: the hero should demonstrate the product's signature gesture,
// not decorate around it.
import { parseFigure, tweenFigure } from "../lib/animate.js";

const EASE = "cubic-bezier(.16,1,.3,1)"; // long, soft settle — expensive-feeling
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Wrap each word in a masked span so it can rise from behind its own baseline.
// Splitting text breaks screen-reader phrasing, so the accessible name is pinned
// to the original string and the fragments are hidden from assistive tech.
function splitWords(h1) {
  const text = h1.textContent.replace(/\s+/g, " ").trim();
  h1.setAttribute("aria-label", text);
  h1.innerHTML = text
    .split(" ")
    .map((w) => `<span class="hw" aria-hidden="true"><span class="hw-i">${w}</span></span>`)
    .join(" ");
  h1.classList.add("is-split");
  return [...h1.querySelectorAll(".hw-i")];
}

const rise = (el, { delay = 0, distance = 14, duration = 620 } = {}) =>
  el.animate(
    [
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration, delay, easing: EASE, fill: "both" }
  );

function run() {
  const hero = document.querySelector(".hero");
  if (!hero || hero.dataset.animated) return;
  hero.dataset.animated = "1";

  const h1 = hero.querySelector("h1");
  const sub = hero.querySelector("p");
  const pills = [...hero.querySelectorAll(".stat-pill")];
  const figures = pills.map((p) => p.querySelector("strong")).filter(Boolean);

  // Reduced motion: the figures still need their real values, but nothing moves.
  if (reduced()) return;

  // 1 — the accent bloom swells in behind everything.
  hero.classList.add("is-lit");

  // 2 — headline rises word by word out of its own mask.
  if (h1) {
    splitWords(h1).forEach((w, i) => {
      w.animate([{ transform: "translateY(108%)" }, { transform: "translateY(0)" }], {
        duration: 780,
        delay: 90 + i * 70,
        easing: EASE,
        fill: "both",
      });
    });
  }

  // 3 — the claim follows once the headline has committed.
  if (sub) rise(sub, { delay: 430 });

  // 4 — the stat pills arrive, then their figures count. Same gesture as a
  //     calculator settling on its answer, just slower.
  pills.forEach((p, i) => rise(p, { delay: 560 + i * 90, distance: 10 }));
  figures.forEach((el, i) => {
    const f = parseFigure(el.textContent);
    if (!f) return;
    tweenFigure(el, 0, f.value, el.textContent, { duration: 1100, delay: 620 + i * 90 });
  });
}

// The hero markup is server-rendered, so this can run as soon as the script does.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
else run();
