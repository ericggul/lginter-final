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
// - 초반 40% 구간은 충분히 따뜻한 핑크가 유지되도록 유지 시간을 늘림
//   → 분홍 영역에 더 오래 머무는 느낌
const fadePinkOverlay = keyframes`
  0%   { opacity: 1; }
  40%  { opacity: 1; }
  100% { opacity: 0; }
`;
 
// 공통 핑크색 초기 그라디언트 (모든 블롭이 시작하는 색상)
// - 쿨톤 마젠타(보라기) → 웜 코랄 핑크
// - 중앙은 밝은 화이트 글로우, 우측 끝에는 다시 옅은 핑크가 남도록 구성
const initialPinkGradient = `linear-gradient(189deg, hsl(345, 92%, 72%) 8%, hsl(10, 100%, 96%) 48%, hsl(350, 96%, 84%) 100%)`;

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
  font-family: ${(p) => p.$fontFamily};
  font-size: 2.4vw; /* 텍스트 크기 축소 */
  line-height: 1;
  padding: 0 0.752604vw; /* further 15% */
  width: ${(p) => p.$text ? `${calculateBlobWidth(p.$text)}vw` : '8vw'};
  min-width: 8vw; /* 최소 width 보장 */
  /* width/위치 변화 속도를 전반적으로 더 천천히 */
  transition: opacity 1600ms ease-in-out, width 800ms ease-out, top ${(p) => (p.$isAnimating ? '1800ms' : '600ms')} cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${(p) => (p.$visible ? 'auto' : 'none')};
  position: relative;
  
  /* 텍스트만 opacity 100% - 앞으로 가져오기 */
  color: rgba(0, 0, 0, 1) !important;
  /* 텍스트를 별도 레이어로 분리 */
  & > * {
    opacity: 1 !important;
    position: relative;
    z-index: 100 !important;
  }
  /* 텍스트 노드도 선명하게 */
  font-weight: 400;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 전체 블롭 색상을 은은하게만 정리 – 과한 쨍함은 줄이고, 탁해지지 않도록 채도는 거의 유지 */
  filter: ${(p) => (p.$highlighted ? 'saturate(1.15) brightness(1.12)' : 'saturate(0.95) brightness(1.03)')};
  box-shadow: ${(p) =>
    p.$highlighted
      ? '0 0 1.4vw rgba(255, 255, 255, 0.9), 0 0 2.4vw rgba(255, 190, 220, 0.9)'
      : 'none'};
  transition:
    opacity 1600ms ease-in-out,
    width 800ms ease-out,
    top ${(p) => (p.$isAnimating ? '1800ms' : '600ms')} cubic-bezier(0.4, 0, 0.2, 1),
    filter 600ms ease-out,
    box-shadow 600ms ease-out;
`;

// 흥미로움
const defaultInterestGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(156, 75%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const InterestBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '43.960364vw'};
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 5.549986vw; /* +15% */
  border: 0.026042vw solid #FFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Boost contrast by introducing complementary warm hues and bright whites */
  background: ${(p) => p.$gradient || defaultInterestGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45), 0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  /* 하단 외곽 뚜렷하게 */
  border-bottom: 0.104167vw solid rgba(255, 255, 255, 1);
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.28),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.5),
    0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.12),
    0 0.364583vw 0.78125vw rgba(255, 255, 255, 0.7),
    0 0 1.822917vw rgba(255, 190, 220, 0.9);
  
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
const defaultPlayfulGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(242, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const PlayfulBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '75.340316vw'};
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 5.549986vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Increase contrast with bright whites and deeper oranges/sky */
  background: ${(p) => p.$gradient || defaultPlayfulGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.28),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.5),
    0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.12),
    0 0.364583vw 0.78125vw rgba(255, 255, 255, 0.7),
    0 0 1.822917vw rgba(255, 190, 220, 0.9);
  overflow: hidden;
  
  /* 하단 외곽 뚜렷하게 */
  border-bottom: 0.104167vw solid rgba(255, 255, 255, 1);
  
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
const defaultUpsetGradient = `linear-gradient(200deg, hsl(345, 92%, 72%) 0%, hsl(240, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const UpsetBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */ 
  left: ${(p) => p.$left || '19.610417vw'}; /* 630px */ 
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Add warm amber to contrast the cool purples/blues */
  background: ${(p) => p.$gradient || defaultUpsetGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45);
`;

// 뿌듯함
const defaultProudGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(72, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const ProudBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '33.610417vw'}; /* 1519px - uniform 100px gap from UpsetBox */
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Stronger light/dark interplay with a magenta accent */
  background: ${(p) => p.$gradient || defaultProudGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45);
`;

// 부끄러움
const defaultShyGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(42, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const ShyBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '47.610417vw'}; /* equal gap from Upset (first + 28vw) */
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Gentle whites with playful pink against greens for contrast */
  background: ${(p) => p.$gradient || defaultShyGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45);
`;

// 정신없음
const defaultChaoticGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(191, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const ChaoticBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '18.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '63.610417vw'}; /* equal gap from Upset (first + 42vw) */
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* High-contrast teal, violet, and salmon with white flashes */
  background: ${(p) => p.$gradient || defaultChaoticGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45);
`;

// 행복함
const defaultHappyGradient = `linear-gradient(249deg, hsl(345, 92%, 72%) 0%, hsl(302, 100%, 60%) 10%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const HappyBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '60.391327vw'};
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Increase white vs pink contrast in the moving gradient */
  background: ${(p) => p.$gradient || defaultHappyGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.28),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.5),
    0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.12),
    0 0.364583vw 0.78125vw rgba(255, 255, 255, 0.7),
    0 0 1.822917vw rgba(255, 190, 220, 0.9);
  overflow: hidden;
  
  /* 하단 외곽 뚜렷하게 */
  border-bottom: 0.104167vw solid rgba(255, 255, 255, 1);
  
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
const defaultAnnoyedGradient = `linear-gradient(220deg, hsl(345, 92%, 72%) 0%, hsl(0, 100%, 60%) 10%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const AnnoyedBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '19.610417vw'};
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  z-index: 1001;
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Sharper contrast with white flashes and warm tension */
  background: ${(p) => p.$gradient || defaultAnnoyedGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.28),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.5),
    0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.12),
    0 0.364583vw 0.78125vw rgba(255, 255, 255, 0.7),
    0 0 1.822917vw rgba(255, 190, 220, 0.9);
  overflow: hidden; /* clip blur overlays to rounded shape */
  
  /* 하단 외곽 뚜렷하게 */
  border-bottom: 0.052083vw solid rgba(255, 255, 255, 1);
  
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
const defaultHungryGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(317, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const HungryBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '45.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '34.110417vw'}; /* equal gap from Annoyed (first + 14vw) */
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  z-index: 1001;
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* More contrast for playful energy with white flashes */
  background: ${(p) => p.$gradient || defaultHungryGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45);
  overflow: hidden; /* clip blur overlays to rounded shape */
`;

// 슬픔
const defaultSadGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(242, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const SadBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '33.080387vw'};
  transform: translateY(-50%)
    translateY(${(p) => p.$focusOffset || 0}vw)
    translateX(${(p) => p.$gapOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Add bright whites and deeper blues for stronger emotional contrast */
  background: ${(p) => p.$gradient || defaultSadGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.28),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.5),
    0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.12),
    0 0.364583vw 0.78125vw rgba(255, 255, 255, 0.7),
    0 0 1.822917vw rgba(190, 205, 255, 0.85);
  overflow: hidden;
  
  /* 하단 외곽 뚜렷하게 */
  border-bottom: 0.104167vw solid rgba(255, 255, 255, 1);
  
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
const defaultWonderGradient = `linear-gradient(258deg, hsl(345, 92%, 72%) 0%, hsl(18, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const WonderBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '27.135417vw'}; /* moved down by 2vw */
  left: ${(p) => p.$left || '31.610417vw'}; /* equal gap from Sad (first + 14vw) */
  /* focus 모드에서 전달되는 $focusOffset 을 반영해서 Now 라인과 같이 이동하도록 수정 */
  transform: translateY(-50%) translateY(${(p) => p.$focusOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 7.400981vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  /* Add white shine and vivid blue/cyan for curiosity */
  background: ${(p) => p.$gradient || defaultWonderGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.25), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.45);
`;

// 자기확신
const defaultSelfConfidentGradient = `linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(86, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)`;
export const SelfConfidentBox = styled(BlobBase)`
  position: absolute;
  top: ${(p) => p.$top || '16.572917vw'}; /* aligned with Now text */
  left: ${(p) => p.$left || '75.340316vw'};
  transform: translateY(-50%) translateY(${(p) => p.$focusOffset || 0}vw)
    scale(${(p) => (p.$highlighted ? 1.18 : 1)});
  height: 5.920985vw; /* +15% */
  border-radius: 5.549986vw; /* +15% */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  transition:
    opacity 1200ms ease-in-out,
    width 800ms ease-out,
    left 300ms ease-out,
    top ${(p) => (p.$isAnimating ? '1400ms' : '500ms')} cubic-bezier(0.4, 0, 0.2, 1),
    transform 1200ms cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(p) => (p.$visible ? (p.$dimmed ? 0.2 : 0.7) : 0)};
  background: ${(p) => p.$gradient || defaultSelfConfidentGradient};
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.28),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.5),
    0 0.208333vw 0.520833vw rgba(0, 0, 0, 0.12),
    0 0.364583vw 0.78125vw rgba(255, 255, 255, 0.7),
    0 0 1.822917vw rgba(210, 245, 190, 0.9);
  overflow: hidden;
  
  /* 하단 외곽 뚜렷하게 */
  border-bottom: 0.104167vw solid rgba(255, 255, 255, 1);
  
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

