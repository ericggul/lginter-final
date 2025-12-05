import styled, { keyframes } from 'styled-components';

/* 커스텀 프로퍼티로 각도를 애니메이션 → 자식이 동일 각도로 역회전하여 항상 정방향 유지 */
const rotVar = keyframes`
  0%   { --sw1-rot-angle: 0deg; }
  100% { --sw1-rot-angle: -360deg; }
`;

export const BlobRotator = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* 공전과 역회전의 duration을 전역 CSS 변수로 통일해 싱크 문제 방지 */
  --sw1-rot-duration: ${({ $duration }) => `${$duration}s`};
  animation: ${rotVar} var(--sw1-rot-duration) linear infinite;
  transform: rotate(var(--sw1-rot-angle));
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
  /* 부모 공전 각도를 상속받아 정확히 반대로 회전 → 늦게 마운트돼도 위상 불일치 없음 */
  transform-origin: 50% 50%;
  transform: rotate(calc(-1 * var(--sw1-rot-angle))) translateZ(0);
  backface-visibility: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  will-change: transform;
`;

