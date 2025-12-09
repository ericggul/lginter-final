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

  // SW2 미니 블롭도 SW1 메인/미니 블롭처럼 안쪽이 꽉 찬 그라디언트로 보이도록 공통 배경 생성
  const core = toHsla(c.h, c.s, c.l, 1);
  const midCol = toHsla(mid.h, mid.s, mid.l, 0.95);
  const outerCol = toHsla(outer.h, outer.s, outer.l, 1);
  const blobBg = `radial-gradient(
    84.47% 61.21% at 66.09% 54.37%,
    ${core} 0%,
    ${midCol} 65%,
    ${outerCol} 100%
  )`;

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
    // SW1 BlobBase 스타일에서 그대로 사용하는 메인 그라디언트
    '--blob-bg': blobBg,
  };
}

// Very light background tint from emotion center hue
export function backgroundFromEmotion(entry, { s = 35, l = 90, a = 0.22 } = {}) {
  const h = entry?.center?.h ?? 200;
  return toHsla(h, s, l, a);
}


