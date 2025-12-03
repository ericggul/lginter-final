import styled, { keyframes } from 'styled-components';

const driftX = keyframes`
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
`;
const driftY = keyframes`
  0%   { background-position: 50%   0%; }
  50%  { background-position: 50% 100%; }
  100% { background-position: 50%   0%; }
`;
const driftDiag1 = keyframes`
  0%   { background-position:   0%   0%; }
  50%  { background-position: 100% 100%; }
  100% { background-position:   0%   0%; }
`;
const driftDiag2 = keyframes`
  0%   { background-position: 100%   0%; }
  50%  { background-position:   0% 100%; }
  100% { background-position: 100%   0%; }
`;
const driftDiag3 = keyframes`
  0%   { background-position:  20% -20%; }
  50%  { background-position: 120% 120%; }
  100% { background-position:  20% -20%; }
`;

// 핑크색에서 고유 색상으로 전환되는 애니메이션
const fadePinkOverlay = keyframes`
  0%   { opacity: 1; }
  100% { opacity: 0; }
`;

// 공통 핑크색 초기 그라디언트 (모든 블롭이 시작하는 색상)
const initialPinkGradient = `linear-gradient(189deg, hsl(328, 95%, 60%) 21%, hsl(328, 95%, 77%) 69%, hsl(328, 95%, 97%) 95%)`;

// 텍스트 길이에 따라 동적 width 계산 함수 (vw 단위 숫자 반환)
export function calculateBlobWidth(text) {
  if (!text || text.length === 0) return 8; // 최소 width (vw)
  
  const textLength = String(text).length;
  const fontSize = 2.4; // vw 단위 (실제 font-size와 동일하게)
  const charWidth = fontSize * 0.95; // 한글 글자당 대략적인 너비 (font-size의 95%)
  const horizontalPadding = 0.752604 * 2; // 좌우 padding 합계
  const minWidth = 8; // 최소 width (vw)
  let calculatedWidth = (textLength * charWidth) + horizontalPadding;
  
  // 3글자 이상일 때 비례에 맞게 추가 width 부여
  if (textLength >= 3) {
    calculatedWidth += 1.5; // 3글자 이상일 때 추가 1.5vw
  }
  
  return Math.max(calculatedWidth, minWidth);
}

// Shared base for all blob boxes to unify text style and padding
export const BlobBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 2.4vw; /* 텍스트 크기 축소 */
  line-height: 1;
  padding: 0 0.752604vw; /* further 15% */
  width: ${(p) => p.$text ? `${calculateBlobWidth(p.$text)}vw` : '8vw'};
  min-width: 8vw; /* 최소 width 보장 */
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 1600ms ease-in-out, width 300ms ease-out;
  pointer-events: ${(p) => (p.$visible ? 'auto' : 'none')};
  position: relative;
`;

// 흥미로움
const defaultInterestGradient = `linear-gradient(
    110deg,
    rgba(91, 76, 255, 0.42) 10%,
    rgba(255, 255, 255, 0.88) 28%,
    rgba(255, 132, 94, 0.42) 52%,
    rgba(55, 255, 252, 0.32) 74%,
    rgba(66, 255, 142, 0.38) 92%
  )`;
export const InterestBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '43.960364vw'};
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 5.549986vw; /* +15% */
  border: 0.026042vw solid #FFF; /* 1px */
  transition: opacity 1600ms ease-in-out, width 300ms ease-out, left 300ms ease-out, top 300ms ease-out;
  /* Boost contrast by introducing complementary warm hues and bright whites */
  background: ${(p) => p.$gradient || defaultInterestGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: 0 0.416667vw 0.268229vw 0 rgba(255, 255, 255, 0.38) inset, 0 -0.729167vw 0.804688vw 0 rgba(255, 255, 255, 0.69) inset;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: ${initialPinkGradient};
    background-size: 320% 320%;
    opacity: 1;
    animation: ${fadePinkOverlay} 4s ease-in-out 0.5s both, ${driftX} 10.4s ease-in-out 0s infinite;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.078125vw); /* 3px */
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

// 장난스러움
const defaultPlayfulGradient = `linear-gradient(
    240deg,
    rgba(255, 255, 255, 0.92) 10%,
    rgba(255, 148, 41, 0.58) 28%,
    rgba(255, 255, 255, 0.88) 48%,
    rgba(127, 225, 255, 0.52) 72%,
    rgba(255, 233, 110, 0.62) 92%
  )`;
export const PlayfulBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '75.340316vw'};
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 5.549986vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition: opacity 1600ms ease-in-out, width 300ms ease-out, left 300ms ease-out, top 300ms ease-out;
  /* Increase contrast with bright whites and deeper oranges/sky */
  background: ${(p) => p.$gradient || defaultPlayfulGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: ${initialPinkGradient};
    background-size: 320% 320%;
    opacity: 1;
    animation: ${fadePinkOverlay} 4s ease-in-out 0.5s both, ${driftX} 10.4s ease-in-out 0s infinite;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.078125vw); /* 3px */
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

// 언짢음
const defaultUpsetGradient = `linear-gradient(
    151.58deg,
    rgba(152, 195, 231, 0.34) 8%,
    rgba(115, 75, 180, 0.38) 38%,
    rgba(255, 166, 102, 0.44) 66%,
    rgba(223, 141, 255, 0.36) 92%
  )`;
export const UpsetBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */ 
  left: ${(p) => p.$left || '19.610417vw'}; /* 630px */ 
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  /* Add warm amber to contrast the cool purples/blues */
  background: ${(p) => p.$gradient || defaultUpsetGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
`;

// 뿌듯함
const defaultProudGradient = `linear-gradient(
    223.05deg,
    rgba(255, 255, 255, 0.92) 10%,
    rgba(88, 197, 255, 0.55) 28%,
    rgba(255, 130, 234, 0.42) 52%,
    rgba(198, 255, 141, 0.58) 76%,
    rgba(255, 255, 255, 0.88) 92%
  )`;
export const ProudBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '33.610417vw'}; /* 1519px - uniform 100px gap from UpsetBox */
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  /* Stronger light/dark interplay with a magenta accent */
  background: ${(p) => p.$gradient || defaultProudGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
`;

// 부끄러움
const defaultShyGradient = `linear-gradient(
    223.05deg,
    rgba(255, 255, 255, 0.92) 14%,
    rgba(249, 255, 162, 0.62) 30%,
    rgba(255, 125, 170, 0.45) 58%,
    rgba(140, 255, 215, 0.58) 82%
  )`;
export const ShyBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '47.610417vw'}; /* equal gap from Upset (first + 28vw) */
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  /* Gentle whites with playful pink against greens for contrast */
  background: ${(p) => p.$gradient || defaultShyGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
`;

// 정신없음
const defaultChaoticGradient = `linear-gradient(
    223.05deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(140, 255, 215, 0.58) 32%,
    rgba(166, 120, 255, 0.45) 56%,
    rgba(255, 160, 141, 0.62) 82%
  )`;
export const ChaoticBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '63.610417vw'}; /* equal gap from Upset (first + 42vw) */
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  /* High-contrast teal, violet, and salmon with white flashes */
  background: ${(p) => p.$gradient || defaultChaoticGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
`;

// 행복함
const defaultHappyGradient = `linear-gradient(
    131.16deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(255, 74, 158, 0.58) 34%,
    rgba(255, 255, 255, 0.88) 62%,
    rgba(255, 60, 120, 0.52) 88%
  )`;
export const HappyBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '60.391327vw'};
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition: opacity 1600ms ease-in-out, width 300ms ease-out, left 300ms ease-out, top 300ms ease-out;
  /* Increase white vs pink contrast in the moving gradient */
  background: ${(p) => p.$gradient || defaultHappyGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: ${initialPinkGradient};
    background-size: 320% 320%;
    opacity: 1;
    animation: ${fadePinkOverlay} 4s ease-in-out 0.5s both, ${driftX} 10.4s ease-in-out 0s infinite;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.078125vw); /* 3px */
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

// 짜증남
const defaultAnnoyedGradient = `linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.88) 12%,
    rgba(91, 76, 255, 0.42) 36%,
    rgba(255, 80, 80, 0.35) 62%,
    rgba(55, 255, 252, 0.38) 84%,
    rgba(66, 255, 142, 0.42) 96%
  )`;
export const AnnoyedBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '19.610417vw'};
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  z-index: 1001;
  transition: opacity 1600ms ease-in-out, width 300ms ease-out, left 300ms ease-out, top 300ms ease-out;
  /* Sharper contrast with white flashes and warm tension */
  background: ${(p) => p.$gradient || defaultAnnoyedGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  overflow: hidden; /* clip blur overlays to rounded shape */
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: ${initialPinkGradient};
    background-size: 320% 320%;
    opacity: 1;
    animation: ${fadePinkOverlay} 4s ease-in-out 0.5s both, ${driftX} 10.4s ease-in-out 0s infinite;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.078125vw); /* 3px */
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

// 배고픔
const defaultHungryGradient = `linear-gradient(
    243.46deg,
    rgba(255, 255, 255, 0.92) 8%,
    rgba(255, 120, 37, 0.6) 30%,
    rgba(255, 254, 172, 0.62) 56%,
    rgba(255, 72, 90, 0.45) 78%,
    rgba(127, 225, 255, 0.55) 94%
  )`;
export const HungryBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '45.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '34.110417vw'}; /* equal gap from Annoyed (first + 14vw) */
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  z-index: 1001;
  /* More contrast for playful energy with white flashes */
  background: ${(p) => p.$gradient || defaultHungryGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  overflow: hidden; /* clip blur overlays to rounded shape */
`;

// 슬픔
const defaultSadGradient = `linear-gradient(
    243.46deg,
    rgba(255, 255, 255, 0.92) 10%,
    rgba(30, 72, 255, 0.55) 34%,
    rgba(208, 136, 168, 0.55) 58%,
    rgba(129, 198, 255, 0.55) 82%
  )`;
export const SadBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '33.080387vw'};
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition: opacity 1600ms ease-in-out, width 300ms ease-out, left 300ms ease-out, top 300ms ease-out;
  /* Add bright whites and deeper blues for stronger emotional contrast */
  background: ${(p) => p.$gradient || defaultSadGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: ${initialPinkGradient};
    background-size: 320% 320%;
    opacity: 1;
    animation: ${fadePinkOverlay} 4s ease-in-out 0.5s both, ${driftX} 10.4s ease-in-out 0s infinite;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.078125vw); /* 3px */
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

// 신기함
const defaultWonderGradient = `linear-gradient(
    259.38deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(0, 0, 255, 0.5) 32%,
    rgba(170, 0, 255, 0.38) 56%,
    rgba(0, 255, 179, 0.52) 82%
  )`;
export const WonderBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '27.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '31.610417vw'}; /* equal gap from Sad (first + 14vw) */
  transform: translateY(-50%);
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  /* Add white shine and vivid blue/cyan for curiosity */
  background: ${(p) => p.$gradient || defaultWonderGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
`;

