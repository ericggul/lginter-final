// Styles for OrchestratingScreen (mobile voice state) using styled-components

import styled, { keyframes } from 'styled-components';
import { fonts } from '../styles/tokens';
import { Overlay } from '../styles/shared/overlay';
import { CircleWrap as CircleWrapBase } from '../styles/shared/circle';

// Inspired by ReactBits gradient text animation pattern:
// https://reactbits.dev/text-animations/gradient-text
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const Container = styled(Overlay)``;
export const CircleWrap = styled(CircleWrapBase)``;

export const Text = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: ${fonts.ui};
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: clamp(1.6rem, 6.2vw, 2.2rem);
  text-transform: uppercase;
  opacity: 0;
  /* Gradient text animation (only for orchestration typo)
     ReactBits gradient-text 예제 느낌처럼,
     아주 밝은 하이라이트 밴드가 스쳐 지나가도록 컬러/사이즈 조정 */
  background-image: linear-gradient(
    90deg,
    #ffe6f7 0%,
    #ff6ec4 20%,
    #fff6d6 40%,
    #7873f5 60%,
    #ffe6f7 80%,
    #ff6ec4 100%
  );
  background-size: 320% 320%;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.65);
  /* Hold label for ~5s; 그 안에서 아주 밝은 밴드가 극도로 천천히 왕복 */
  animation:
    orchestrateLabel 5000ms ease forwards,
    ${gradientShift} 15000ms ease-in-out infinite;
`;



