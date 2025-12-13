// TV2 전용 스케일 계산 유틸리티
// - 3840x2160 기준 캔버스를 현재 뷰포트에 맞게 contain 스케일링

export function computeCoverScale() {
  if (typeof window === 'undefined') return 1;
  const baseWidth = 3840;
  const baseHeight = 2160;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Math.min(vw / baseWidth, vh / baseHeight);
}


