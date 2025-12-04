// HSL color utilities and temperature-driven mappings for SW1
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const invlerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;

export const hueForTemp = (tempC, { coolHue, warmHue, tMin = 20, tMax = 27 } = {}) =>
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
export function computeMiniWarmHue(tempC) {
  return Math.round(hueForTemp(tempC, { coolHue: 223, warmHue: 0 }));
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


