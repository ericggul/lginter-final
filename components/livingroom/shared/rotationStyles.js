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
  animation: ${rotateCCW} ${({ $duration }) => $duration}s linear infinite;
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
  animation: ${rotateCW} ${({ $duration }) => $duration}s linear infinite;
  will-change: transform;
`;

