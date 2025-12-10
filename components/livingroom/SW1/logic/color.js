// HSL color utilities and temperature-driven mappings for SW1
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const invlerp = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;

// Broadened default temperature window to make visual spread more apparent (≈ 20° span)
export const hueForTemp = (tempC, { coolHue, warmHue, tMin = 15, tMax = 35 } = {}) =>
  lerp(coolHue, warmHue, invlerp(tMin, tMax, tempC));

// 1) Big blob: innerRingH, mid2H use same hue; S/L은 UI 컨트롤에서 고정.
//    - 온도 범위 18–30℃를 205°(시원) → 333°(더움) 사이로 선형 매핑.
export function computeBigBlobHues(tempC) {
  const t = invlerp(18, 30, tempC);
  const H = lerp(205, 333, t);
  return { innerRingH: Math.round(H), mid2H: Math.round(H) };
}

// Background: big blob과 동일한 H를 공유하고, S/L은 훨씬 연한 톤으로 고정
// - s 기본값: 47
// - l 기본값: 90 (기존보다 더 밝게)
export function computeBackgroundHsl(tempC, { sBase = 47, lBase = 90 } = {}) {
  const { mid2H } = computeBigBlobHues(tempC);
  const S = clamp(sBase, 0, 100);
  const L = clamp(lBase, 0, 100);
  return { h: mid2H, s: Math.round(S), l: Math.round(L) };
}

// 2) Mini blob: warmH
//    - L은 현재 값 유지, S는 83으로 맞추고
//    - H는 큰 블롭 midH 와 동일한 로직(18~30℃ → 205°~333°)을 사용
export function computeMiniWarmHue(tempC) {
  const H = hueForTemp(tempC, { coolHue: 205, warmHue: 333, tMin: 18, tMax: 30 });
  return Math.round(H);
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


