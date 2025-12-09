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
  /* 화면 완전 중앙이 아니라 좌측 상단 쪽으로 살짝 이동 */
  left: 8vw;
  top: 8vh;
  transform: translate(0, 0);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  /* 폰트 살짝 더 작게 (기본은 레귤러, 일부만 <strong>으로 강조) */
  font-size: clamp(14px, 2.6vw, 30px);
  color: #FFFFFF; /* white text only */
  background: transparent; /* no modal */
  border: 0;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  text-align: left;
  white-space: pre-line; /* 줄바꿈(\n) 허용 */
  text-indent: 0;
  pointer-events: none;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transform-origin: 0 0;
  transition: opacity 600ms ease, transform 600ms ease;
  ${(p) => p.$show ? 'transform: translate(0, 0) scale(1);' : 'transform: translate(0, 0) scale(0.98);'}
`;

