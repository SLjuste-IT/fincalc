// The one piece of motion that is about the product rather than decoration: the
// primary figure counts to its value instead of snapping, the way a mechanical
// totaliser settles. It reads as the instrument computing.
//
// Duplicated in app.js for the standalone SPA, which loads as a classic script
// and cannot import. Keep the two in step.

const REDUCED = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Only tween when the number leads the string: "$1,798.65", "-$2,500.00",
// "6.19%", "873.43 EUR". Deliberately fails on things like "Aug 2056", where
// counting up to a year would be nonsense.
const FIGURE_RE = /^([-−]?)(\$?)([\d,]+(?:\.\d+)?)(.*)$/;

export function parseFigure(text) {
  const m = String(text).match(FIGURE_RE);
  if (!m) return null;
  const magnitude = parseFloat(m[3].replace(/,/g, ""));
  if (!isFinite(magnitude)) return null;
  return {
    value: m[1] ? -magnitude : magnitude,
    // Sign is tracked separately from the currency symbol so a tween that
    // crosses zero shows the sign of the *current* frame, not the final one.
    symbol: m[2],
    suffix: m[4],
    decimals: (m[3].split(".")[1] || "").length,
  };
}

const fmtLike = (v, f) =>
  (v < 0 ? "-" : "") +
  f.symbol +
  Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: f.decimals, maximumFractionDigits: f.decimals }) +
  f.suffix;

// Cubic ease-out: quick commitment, soft landing.
const ease = (t) => 1 - Math.pow(1 - t, 3);
const DURATION = 300;

// opts.duration / opts.delay let the hero reuse this exact motion at a slower,
// more deliberate pace. Same easing, same landing rule — the hero stats and the
// calculator figures must read as the same gesture, because they are.
export function tweenFigure(el, from, to, finalText, opts = {}) {
  const DUR = opts.duration ?? DURATION;
  const delay = opts.delay ?? 0;
  const f = parseFigure(finalText);
  if (!f || REDUCED() || from === to) {
    el.textContent = finalText;
    return;
  }
  if (delay > 0) {
    el.textContent = fmtLike(from, f);
    clearTimeout(el._delay);
    el._delay = setTimeout(() => tweenFigure(el, from, to, finalText, { ...opts, delay: 0 }), delay);
    return;
  }
  if (el._raf) cancelAnimationFrame(el._raf);
  clearTimeout(el._safety);
  // Paint the starting value synchronously. The caller has just written the
  // final string into the DOM via innerHTML, so without this the browser can
  // paint one frame of the destination before the tween's first frame runs —
  // a visible flash of the answer, then a jump back to count up to it.
  el.textContent = fmtLike(from, f);

  // Rewriting the DOM with the OLD value means the correct answer is now only
  // restored by the tween finishing. requestAnimationFrame does not fire in a
  // backgrounded or non-painting tab, which would strand a wrong figure on a
  // financial calculator. A timer — which still fires when rAF does not —
  // guarantees the true value lands regardless.
  el._safety = setTimeout(() => {
    if (el._raf) cancelAnimationFrame(el._raf);
    el._raf = null;
    el.textContent = finalText;
  }, DUR + 150);

  const t0 = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - t0) / DUR);
    if (t >= 1) {
      el.textContent = finalText; // land on the exact formatted string, never a rounded tween frame
      el._raf = null;
      clearTimeout(el._safety);
      return;
    }
    el.textContent = fmtLike(from + (to - from) * ease(t), f);
    el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}
