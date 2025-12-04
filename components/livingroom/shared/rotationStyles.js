import styled, { keyframes } from 'styled-components';

const rotateCCW = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const rotateCW = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const BlobRotator = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* 공전과 역회전의 duration을 전역 CSS 변수로 통일해 싱크 문제 방지 */
  --sw1-rot-duration: ${({ $duration }) => `${$duration}s`};
  animation: ${rotateCCW} var(--sw1-rot-duration) linear infinite;
  will-change: transform;
  z-index: 0; /* Keep it separate from center elements */
`;

export const ContentRotator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.02vw;
  width: 100%;
  height: 100%;
  /* 부모 공전과 정확히 반대 방향/동일 시간으로 회전 취소 */
  animation: ${rotateCW} var(--sw1-rot-duration) linear infinite;
  transform-origin: 50% 50%;
  transform: rotate(0deg) translateZ(0);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  will-change: transform;
`;

