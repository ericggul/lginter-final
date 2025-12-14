import styled, { keyframes, css } from 'styled-components';

const tipEnter = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, 8px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
`;

const tipExitUp = keyframes`
  0% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -18px) scale(0.96);
  }
`;

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
  top: 24vh;
  transform: translate(-50%, 0);
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 700;
  filter: blur(.3px);
  /* 기본 본문 크기 전체를 조금 더 키움 (레퍼런스 대비 크게) */
  font-size: clamp(16px, 2.8vw, 30px);
  line-height: 1.3;
  color: #FFFFFF; /* white text only */
  /* glass box behind text */
  background: rgba(0, 0, 0, 0.001);
  /* 레퍼런스처럼 좀 더 크고 안정적인 둥근 사각형 */
  border-radius: 38px;
  width: clamp(360px, 54vw, 640px);
  max-width: calc(100vw - 12vw);
  padding: clamp(26px, 3.4vw, 38px) clamp(32px, 4vw, 52px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px) saturate(60%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  /* 아래로 떨어지는 그림자 대신, 뒤에서 퍼지는 흰빛 글로우 */
  box-shadow:
    0 0 28px rgba(255, 255, 255, 0.65),
    0 0 68px rgba(255, 235, 250, 0.9);
  /* 텍스트 주변에 은은한 분홍빛 글로우 */
  text-shadow:
    0 0 10px rgba(255, 207, 239, 0.8),
    0 0 22px rgba(255, 183, 230, 0.9),
    0 0 40px rgba(255, 160, 220, 0.9),
    0 3px 14px rgba(0, 0, 0, 0.55);
  text-align: center;
  white-space: pre-line; /* 줄바꿈(\n) 허용 */
  text-indent: 0;
  pointer-events: none;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transform-origin: 50% 0;
  transition: opacity 300ms ease, transform 300ms ease;

  /* 단계별 애니메이션 상태 */
  ${(p) =>
    p.$state === 'enter' &&
    css`
      animation: ${tipEnter} 700ms cubic-bezier(0.16, 0.84, 0.37, 1) forwards;
    `}

  ${(p) =>
    p.$state === 'exit' &&
    css`
      animation: ${tipExitUp} 900ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
    `}

  /* 첫 줄 인사만 더 크게, 볼드로 강조 */
  strong {
    display: block;
    font-weight: 600;
    font-size: 1.18em;
    line-height: 1.0;
    margin-bottom: -0.12em; /* 줄 간격을 더 타이트하게 */
    /* 인사 문구는 살짝 더 강한 분홍빛 포인트 */
    text-shadow:
      0 0 16px rgba(255, 212, 241, 0.9),
      0 0 38px rgba(255, 174, 226, 0.95),
      0 3px 16px rgba(0, 0, 0, 0.65);
  }
`;

