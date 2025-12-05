// SW2 color helpers (structure aligned with SW1)
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const toHsla = (h, s, l, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;

export const computeComplementHue = (h) => ((Math.round(h) + 180) % 360);

// Build CSS variable bag for a mini-blob 3-tone (center emotion, mid yellow keep, outer pink keep)
export function buildMiniVars(entry) {
  const c = entry?.center || { h: 302, s: 100, l: 60 };
  const mid = entry?.mid || { h: 45, s: 95, l: 85 };
  const outer = entry?.outer || { h: 340, s: 90, l: 88 };
  const strokeH = computeComplementHue(c.h);
  return {
    '--mini-h': c.h,
    '--mini-s': `${c.s}%`,
    '--mini-l': `${c.l}%`,
    '--mini-mid-h': mid.h,
    '--mini-mid-s': `${mid.s}%`,
    '--mini-mid-l': `${mid.l}%`,
    '--mini-outer-h': outer.h,
    '--mini-outer-s': `${outer.s}%`,
    '--mini-outer-l': `${outer.l}%`,
    '--mini-stroke-h': strokeH,
  };
}

// Very light background tint from emotion center hue
export function backgroundFromEmotion(entry, { s = 35, l = 90, a = 0.22 } = {}) {
  const h = entry?.center?.h ?? 200;
  return toHsla(h, s, l, a);
}


