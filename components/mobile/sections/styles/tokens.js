// Mobile design tokens (exact values from current inline styles)
// Note: Do NOT change values here unless the design intentionally changes.

export const fonts = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ui: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif'
};

export const spacing = {
  container: {
    // 상단 질문 텍스트를 실제 기기에서 더 위쪽으로 배치하기 위해
    // 전체 상단 패딩을 한 번 더 줄여서 화면 상단에 더 가깝게 보이도록 조정
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + clamp(56px, 9vh, 120px))',
    paddingRight: 'clamp(28px,7vw,72px)',
    paddingBottom: 'clamp(40px,8vh,96px)',
    paddingLeft: 'clamp(28px,7vw,72px)'
  },
  hero: {
    blockMarginBottom: '1.5rem',
    subtextMarginTop: '0.6rem'
  },
  press: {
    // 터치용 하얀 원이 항상 메인 블롭 안쪽에 위치하도록
    // 전체 위치를 조금 더 위로 끌어올린다.
    // (safe-area를 고려해 충분한 여유 여백을 남기되, 뷰포트 높이에 따라 12~18vh 범위에서 보정)
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(80px, 14vh, 160px))'
  }
};

export const typography = {
  heroTitleSize: '2.5rem',
  heroTitleWeight: 550,
  heroTitleLineHeight: 1.22,
  heroSubtextSize: '1.3rem',
  pressLabelSize: 'clamp(2.6rem, 8.5vw, 3.4rem)',
  progressSize: 'clamp(1.6rem, 6.5vw, 2.8rem)'
};

export const colors = {
  textPrimary: '#000000',
  textSecondary: '#818181',
  pressLabel: '#565656',
  accentPrimary: '#9333EA',
  listening: '#EC4899'
};

export const layers = {
  pressZIndex: 1000
};


