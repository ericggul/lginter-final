import styled, { keyframes, css } from 'styled-components';

// 세부 스타일 모듈 re-export
export * from './styles.header';
export * from './styles.left';
export * from './styles.right';

/* 레이아웃 / 루트 컨테이너 */

export const Viewport = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  /* 상단 조명 패널과 채도/명도를 맞춰주는 보정 레이어 */
  & .header-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      ${props => props.$gradientStart || 'rgba(102,157,255,1)'} 0%,
      ${props => props.$gradientMid || 'rgba(143,168,224,1)'} ${props => props.$gradientMidPos ?? 10}%,
      ${props => props.$gradientEnd || '#ffffff'} ${props => props.$gradientEndPos ?? 90}%,
      ${props => props.$gradientEnd || '#ffffff'} 100%
    );
    background-size: 300% 100%;
    filter: saturate(0.9) brightness(1.08);
    opacity: 0.9;
  }
  background: #ffffff;
  touch-action: none;
`;

export const Scaler = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3840px;
  height: 2160px;
  transform-origin: center center;
  will-change: transform;
  transform: translate(-50%, -50%) scale(var(--tv2-scale, 1));
`;

export const Root = styled.div`
  position: relative;
  width: 3840px;
  height: 2160px;
  overflow: hidden;
  background: #ffffff;
  /* TV2 전체 기본 폰트: Noto/BrandKorean 제거, 기본 Pretendard 스택으로 통일 */
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;

  /* 언어별 분기에서도 Noto/BrandKorean 을 사용하지 않고 Pretendard 로 유지 */
  & :lang(ko) {
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    font-weight: 400;
    font-synthesis-weight: none;
  }
  & :lang(en) {
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  }
`;

/* TV2 전체 페이지용 전역 트랜지션 레이어 */

const pageDecisionSweep = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.02);
    backdrop-filter: blur(0px);
  }
  25% {
    opacity: 0.85;
    transform: scale(1.01);
    backdrop-filter: blur(8px);
  }
  60% {
    opacity: 0.55;
    transform: scale(1);
    backdrop-filter: blur(4px);
  }
  100% {
    opacity: 0;
    transform: scale(1);
    backdrop-filter: blur(0px);
  }
`;

const pageIdleBreath = keyframes`
  0%,
  100% {
    opacity: 0.0;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(1.02);
  }
`;

export const PageOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  mix-blend-mode: soft-light;
  background: radial-gradient(
    140% 120% at 50% 0%,
    rgba(255, 255, 255, 0.0) 0%,
    rgba(255, 255, 255, 0.55) 40%,
    rgba(255, 255, 255, 0.0) 80%
  );
  opacity: 0;
  will-change: opacity, transform, backdrop-filter;

  /* Idle(T3) 상태에서 아주 약한 숨쉬기 모션 */
  ${props =>
    props.$isIdle &&
    css`
    animation: ${pageIdleBreath} 3.4s ease-in-out infinite;
  `}

  /* 새로운 결정(T4) 도착 시, 1회성 스윕 트랜지션 */
  ${props =>
    props.$triggerT4 &&
    css`
    animation: ${pageDecisionSweep} 0.9s ease-in-out;
  `}
`;

/* Idle thinking overlay */

const dotPulse = keyframes`
  0%,
  80%,
    100% {
    transform: scale(0.8);
    opacity: 0.45;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const ThinkingOverlay = styled.div`
  position: absolute;
  inset: 324px 0 0 0; /* header 아래 영역만 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  pointer-events: none;
`;

export const ThinkingDot = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin: 0 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  animation: ${dotPulse} 1.2s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.15s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
`;

/* 값 변경 메시지 (좌측 그라디언트 하단) */

const changeMessageFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  20% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

export const ChangeMessage = styled.div`
  position: absolute;
  bottom: 80px;
  left: 58%;
  transform: translateX(-5%);
  font-size: 44px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  pointer-events: none;
  z-index: 15;
  animation: ${changeMessageFade} 3s ease-in-out forwards;
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.3);
`;

/* White border flash for new decisions */

const borderFlash = keyframes`
  0% {
    opacity: 0;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
  20% {
    opacity: 1;
    box-shadow:
      0 0 0 8px rgba(255, 255, 255, 0.6),
      0 0 0 16px rgba(255, 255, 255, 0.3);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

export const BorderFlash = styled.div`
  position: absolute;
  inset: 0;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-radius: 0;
  pointer-events: none;
  z-index: 100;
  animation: ${borderFlash} 0.4s ease-out forwards;
  mix-blend-mode: screen;
`;


