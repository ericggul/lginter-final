import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #000000;
  display: block;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
`;

export const LayerVideo = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background: #000000; /* avoid white flash during decode */
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition: opacity 600ms ease;
  will-change: opacity;
  pointer-events: none;
`;

export const CenterTip = styled.div`
  position: fixed;
  /* 화면 중앙 상단 쪽에 배치 (가로 중앙, 세로는 살짝 위) */
  left: 50%;
  top: 18vh;
  transform: translate(-50%, 0);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  /* 기본 본문 크기 전체를 조금 더 키움 (어서오세요! 는 strong으로 따로 확대) */
  font-size: clamp(16px, 3vw, 34px);
  line-height: 1.1;
  color: #FFFFFF; /* white text only */
  background: transparent; /* no modal */
  border: 0;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  text-align: center;
  white-space: pre-line; /* 줄바꿈(\n) 허용 */
  text-indent: 0;
  pointer-events: none;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transform-origin: 50% 0;
  transition: opacity 600ms ease, transform 600ms ease;
  ${(p) => p.$show ? 'transform: translate(-50%, 0) scale(1);' : 'transform: translate(-50%, 0) scale(0.98);'}

  /* 첫 줄 인사만 더 크게, 볼드로 강조 */
  strong {
    display: block;
    font-weight: 600;
    font-size: 1.2em;
    margin-bottom: 0; /* 문장 사이 간격 없이 바로 붙도록 */
  }
`;

