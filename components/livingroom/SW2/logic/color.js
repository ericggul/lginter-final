// SW2 color helpers (structure aligned with SW1)
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const toHsla = (h, s, l, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;

export const computeComplementHue = (h) => ((Math.round(h) + 180) % 360);

// Build CSS variable bag for a mini-blob.
// NOTE: SW2 컬러 로직 임시 비활성화
//  - 감정/앨범 컬러와 무관하게, 모든 미니 블롭을 동일한 고정 그라디언트로 렌더한다.
//  - 나중에 다시 감정 기반 색을 살릴 때는 entry.center.h 를 사용하는 이전 버전으로 되돌리면 된다.
export function buildMiniVars(entry) {
  // entry는 현재 사용하지 않음 (고정 색상)
  const h = 302; // SW1 기본 설렘 계열 핑크톤
  const inner   = toHsla(h, 62, 72, 1);
  const midCol  = toHsla(h, 52, 80, 0.94);
  const outerCol= toHsla(h, 40, 90, 0.88);
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


