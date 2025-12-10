// SW2 color helpers (structure aligned with SW1)
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const toHsla = (h, s, l, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;

export const computeComplementHue = (h) => ((Math.round(h) + 180) % 360);

// Build CSS variable bag for a mini-blob.
// - 외곽: 앨범 커버 컬러(루트 CSS 변수 --album-h/s/l)에서 결정 (styles 쪽에서 직접 사용)
// - 내부: 감정 파라미터에서 온 hue 하나만 사용하고, S/L 은 고정된 값으로 통일
export function buildMiniVars(entry) {
  const center = entry?.center || { h: 302, s: 100, l: 60 };
  const h = center.h ?? 302;
  // 내부/중간/외곽의 대비를 더 키워서 두 겹이 확실히 느껴지도록 조정
  // - inner: 살짝 더 진한 코어
  // - mid: inner 와 outer 사이 브릿지
  // - outer: 훨씬 밝은 링
  const inner   = toHsla(h, 68, 70, 1);
  const midCol  = toHsla(h, 58, 78, 0.96);
  const outerCol= toHsla(h, 46, 90, 0.92);
  const blobBg = `radial-gradient(
    84.47% 61.21% at 66.09% 54.37%,
    ${inner} 0%,
    ${inner} 40%,
    ${midCol} 68%,
    ${outerCol} 100%
  )`;

  return {
    '--mini-h': h,
    '--mini-s': '78%',
    '--mini-l': '66%',
    // SW1 BlobBase 스타일에서 그대로 사용하는 메인 그라디언트
    '--blob-bg': blobBg,
  };
}

// Very light background tint from emotion center hue
export function backgroundFromEmotion(entry, { s = 35, l = 90, a = 0.22 } = {}) {
  const h = entry?.center?.h ?? 200;
  return toHsla(h, s, l, a);
}


