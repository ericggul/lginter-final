// HSL color utilities and temperature-driven mappings for SW1
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const invlerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;

// Broadened default temperature window to make visual spread more apparent (≈ 20° span)
export const hueForTemp = (tempC, { coolHue, warmHue, tMin = 15, tMax = 35 } = {}) =>
  lerp(coolHue, warmHue, invlerp(tMin, tMax, tempC));

// 1) Big blob: innerRingH, mid2H use same hue; S/L unchanged (taken from UI controls)
export function computeBigBlobHues(tempC) {
  const H = hueForTemp(tempC, { coolHue: 205, warmHue: 88 });
  return { innerRingH: Math.round(H), mid2H: Math.round(H) };
}

// Background: same hue, lighter/weaker S/L
export function computeBackgroundHsl(tempC, { sBase = 45, lBase = 96 } = {}) {
  const H = hueForTemp(tempC, { coolHue: 205, warmHue: 88 });
  const S = clamp(sBase * 0.6, 0, 100);
  const L = clamp(lBase + 5, 0, 100);
  return { h: Math.round(H), s: Math.round(S), l: Math.round(L) };
}

// 2) Mini blob: warmH only (S/L unchanged)
// Mini blob warm hue: tuned so that 22~23℃ ≈ yellow/apricot (≈ 48~30deg)
// We use anchored piecewise interpolation over a widened 15~35℃ band.
export function computeMiniWarmHue(tempC) {
  const t = invlerp(15, 35, tempC);
  const anchors = [
    { t: 0.00, hue: 223 }, // very cool → blue
    { t: 0.25, hue: 200 }, // cool
    { t: 0.40, hue: 24  }, // ≈22~23℃ → pinkish orange (less yellow)
    { t: 0.50, hue: 8   }, // ≈25℃ → red-leaning apricot
    { t: 1.00, hue: 0   }, // hot → red
  ];
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (t <= b.t) {
      const tt = invlerp(a.t, b.t, t);
      return Math.round(lerp(a.hue, b.hue, tt));
    }
  }
  return Math.round(anchors[anchors.length - 1].hue);
}

// 3) New input pulse: midAlpha 1 → down (default 0.24) for duration then back to 1
export function pulseMidAlpha(apply, { down = 0.24, durationMs = 1000 } = {}) {
  try {
    apply(1);
    apply(down);
    setTimeout(() => apply(1), durationMs);
  } catch {}
}

export const toHsla = (h, s, l, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;


