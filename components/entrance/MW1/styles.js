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
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 700;
  filter: blur(.3px);
  /* 기본 본문 크기 전체를 조금 더 키움 (어서오세요! 는 strong으로 따로 확대) */
  font-size: clamp(13px, 2.4vw, 28px);
  line-height: 1.0;
  color: #FFFFFF; /* white text only */
  /* glass box behind text */
  background: rgba(0, 0, 0, 0.001);
  border-radius: 55px;
  /* make only the box wider (text styles unchanged) */
  width: clamp(320px, 70vw, 605px);
  max-width: calc(100vw - 8vw);
  padding: clamp(14px, 2.2vw, 28px) clamp(18px, 3vw, 44px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px) saturate(60%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
  box-shadow:
    0px 10px 30.7px rgba(255, 255, 255, 0.5),
    0px 18px 40px rgba(0, 0, 0, 0.35);
  text-shadow: 0 3px 14px rgba(0, 0, 0, 0.55);
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
    font-size: 1.18em;
    line-height: 1.0;
    margin-bottom: -0.12em; /* 줄 간격을 더 타이트하게 */
  }
`;

