import styled, { keyframes } from 'styled-components';

export const Root = styled.div`
  width: 100vw;
  /* Use dynamic viewport units for better mobile browser compatibility */
  height: 100dvh;
  /* Fallback for older browsers */
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* Respect device safe areas (iOS notch, etc.) */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  padding: constant(safe-area-inset-top) constant(safe-area-inset-right) constant(safe-area-inset-bottom) constant(safe-area-inset-left);
  /* Reduce browser overscroll/bounce that can reveal background bars */
  overscroll-behavior: contain;
  background: linear-gradient(270deg, hsl(186, 40%, 92%) 16.83%, hsl(285, 30%, 92%) 41.83%, hsl(330, 50%, 88%) 76.92%, hsl(290, 30%, 90%) 100%);
`;

export const Canvas = styled.div`
  position: relative;
  width: 100vw;
  height: 56.25vw; /* 2160 / 3840 * 100 */
  aspect-ratio: 3840 / 2160;
  overflow-y: auto; /* 하단으로 스크롤 가능 */
  overflow-x: hidden;
  scroll-behavior: auto; /* JavaScript로 제어하므로 auto로 설정 */
  /* 스크롤바 숨기기 (크롬, 사파리, 엣지) */
  &::-webkit-scrollbar {
    display: none;
  }
  /* 스크롤바 숨기기 (파이어폭스) */
  scrollbar-width: none;
  -ms-overflow-style: none; /* IE, 엣지 */
  &::after {
    content: '';
    position: absolute;
    top: 52.083333vw; /* 2000px */
    left: 0;
    right: 0;
    bottom: 0;
    /* Blur everything behind this overlay */
    backdrop-filter: blur(0.729167vw); /* 28px */
    -webkit-backdrop-filter: blur(0.729167vw);
    /* tiny background helps ensure backdrop-filter engages consistently */
    background: rgba(255,255,255,0.0001);
    pointer-events: none;
    z-index: 1000;
  }
`;

export const LeftLineImage = styled.img.attrs({
  src: '/figma/Line 97.png',
  alt: '',
})`
  position: absolute;
  top: 0;
  left: 13.85vw;
  height: ${(p) => p.$height ? `${p.$height}vw` : '100%'};
  width: auto;
  pointer-events: none;
  z-index: 5002; /* above canvas overlay */
  user-select: none;
  object-fit: cover; /* 이미지를 늘려서 채움 */
  object-position: top; /* 상단을 기준으로 */
  transition: height 300ms ease-out;
  
  /* 상단/하단 그라데이션 fade out (mask-image 사용) */
  -webkit-mask-image: 
    linear-gradient(to bottom, 
      rgba(0,0,0,0) 0%, 
      rgba(0,0,0,1) 12%, 
      rgba(0,0,0,1) 88%, 
      rgba(0,0,0,0) 100%
    );
  mask-image: 
    linear-gradient(to bottom, 
      rgba(0,0,0,0) 0%, 
      rgba(0,0,0,1) 12%, 
      rgba(0,0,0,1) 88%, 
      rgba(0,0,0,0) 100%
    );
`;

/* subtle pulse animations */
const pulseShape = keyframes`
  0%, 100% { transform: translateX(-50%) scale(1); }
  50%      { transform: translateX(-50%) scale(1.06); }
`;

const pulseNow = keyframes`
  0%, 100% { transform: translateX(-50%) scale(1); }
  50%      { transform: translateX(-50%) scale(1.04); }
`;

/* LeftLine and LeftLineBlur removed per request */
export const LeftShape = styled.div`
  position: absolute;
  top: 25.99375vw; /* white ellipse 위치로 이동 */
  left: 13.989583vw; /* aligned to the rail, inside viewport */
  transform: translateX(-50%); /* center on the axis */
  width: 2.864583vw; /* 110px */
  height: 2.864583vw; /* 110px */
  border-radius: 50%;
  /* Pink core that softens to the edge */
  background: radial-gradient(closest-side, rgba(255, 144, 188, 1) 0%, rgba(255, 144, 188, 0.85) 70%, rgba(255, 144, 188, 0) 100%);
  /* Pink glow matching the shape color */
  filter: 
    drop-shadow(0 0 0.625vw rgba(255, 144, 188, 0.6)) /* 24px */
    drop-shadow(0 0 1.5625vw rgba(255, 144, 188, 0.35)) /* 60px */
    drop-shadow(0 0 3.125vw rgba(255, 144, 188, 0.2)); /* 120px */
  pointer-events: none;
  z-index: 500000; /* above crisp line (3) so the line doesn't overlay the shape */
  will-change: transform;
  animation: ${pulseShape} 1.6s ease-in-out infinite;
`;

/* White variant for the subsequent markers */
export const LeftWhiteShape = styled.div`
  position: absolute;
  top: ${(p) => p.$top || '25.99375vw'};
  left: 13.989583vw; /* aligned to the rail, inside viewport */
  transform: translateX(-50%); /* center on the axis */
  width: 2.34375vw; /* 90px */
  height: 2.34375vw; /* 90px */
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,0) 100%);
  filter: 
    drop-shadow(0 0 0.625vw rgba(255, 255, 255, 0.9)) /* 24px */
    drop-shadow(0 0 1.5625vw rgba(255, 255, 255, 0.7)) /* 60px */
    drop-shadow(0 0 3.125vw rgba(255, 255, 255, 0.4)); /* 120px */
  pointer-events: none;
  z-index: 2; /* between blur (1) and crisp line (3) */
  opacity: ${(p) => (p.$visible !== false ? 1 : 0)};
  transition: opacity 1600ms ease-in-out, top 300ms ease-out;
`;

export const LeftShape2 = styled(LeftWhiteShape)`
  top: 25.99375vw; /* 1290px */
`;

export const LeftShape3 = styled(LeftWhiteShape)`
  top: 35.054167vw; /* 1780px */
`;

export const LeftShape4 = styled(LeftWhiteShape)`
  top: 44.1975vw; /* 2280px */
`;

export const LeftNow = styled.div`
  position: absolute;
  top: 26.2375vw; /* 13:00 위치로 이동 */
  left: 7.817708vw; /* line (5.859375vw) - 1.041667vw offset */
  transform: translateX(-50%);
  color: #FF72A6;
  text-align: center;
  font-family: Pretendard;
  font-size: 2.083333vw; /* 80px */
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  filter: 
    drop-shadow(0 0 0.625vw rgba(255, 144, 188, 6)) /* 24px */
    drop-shadow(0 0 1.5625vw rgba(255, 144, 188, 0.35)) /* 60px */
    drop-shadow(0 0 3.125vw rgba(255, 144, 188, 0.2)); /* 120px */
  pointer-events: none;
  z-index: 4;
  will-change: transform;
  animation: ${pulseNow} 1.6s ease-in-out infinite; /* sync timing with LeftShape */
`;

export const LeftTime2 = styled.div`
  position: absolute;
  top: ${(p) => p.$top || '26.2375vw'};
  left: 7.817708vw; /* align with Now label relative to the line */
  transform: translateX(-50%);
  color: #FFF;
  text-align: center;
  font-family: Pretendard;
  font-size: 1.5625vw; /* 60px */
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  filter: 
    drop-shadow(0 0 0.625vw rgba(255, 255, 255, 0.9)) /* 24px */
    drop-shadow(0 0 1.5625vw rgba(255, 255,  255, 0.7)) /* 60px */
    drop-shadow(0 0 3.125vw rgba(255, 255, 255, 0.4)); /* 120px */
  pointer-events: none;
  z-index: 4;
  opacity: ${(p) => (p.$visible !== false ? 1 : 0)};
  transition: opacity 1600ms ease-in-out, top 300ms ease-out;
`;

export const LeftTime3 = styled(LeftTime2)`
  top: 35.354167vw; /* 1780px */
`;

export const LeftTime4 = styled(LeftTime2)`
  top: 44.4975vw; /* 2280px */
`;
export const TopText = styled.div`
  position: absolute;
  top: 5.60417vw; /* 250px */
  left: 19.610417vw; /* 630px */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 2.625vw; /* 120px */
  line-height: 1.1;
  letter-spacing: 0.03em;
  white-space: nowrap;
`;

export const Bold = styled.span`
  font-weight: 700;
`;

export const Dots = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 0.2em;
`;

export const Dot = styled.span`
  transition: opacity 120ms linear;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;



export const HappyBox = styled.div`
  position: absolute;
  top: 47.395833vw; /* 1820px */
  left: 57.291667vw; /* 2200px - same gap to the right of PlayfulBox */
  transform: translateY(-50%);
  width: 18.229167vw; /* 700px */
  height: 8.333333vw; /* 320px */
  border-radius: 10.416667vw; /* 400px */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  background: linear-gradient(131.16deg, rgba(255, 0, 217, 0.1855) 17.16%, rgba(104, 255, 182, 0.07) 72.86%, rgba(234, 255, 127, 0.182) 94.13%);
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 3.90625vw; /* 150px */
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.078125vw); /* 3px */
    -webkit-backdrop-filter: blur(0.078125vw);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }
`;

export const AnnoyedBox = styled.div`
  position: absolute;
  top: 59.791667vw; /* 2296px */
  left: 6.510417vw; /* 250px */
  transform: translateY(-50%);
  width: 16.145833vw; /* 620px */
  height: 8.333333vw; /* 320px */
  border-radius: 10.416667vw; /* 400px */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  background: linear-gradient(98.92deg, rgba(91, 76, 255, 0.092) 23.61%, rgba(55, 255, 252, 0.046) 73.24%, rgba(66, 255, 142, 0.069) 92.2%);
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  opacity: 0.3;
  overflow: hidden; /* clip blur overlays to rounded shape */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 3.90625vw; /* 150px */
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  /* Base soft blur across the whole box */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.078125vw); /* 3px */
    -webkit-backdrop-filter: blur(0.078125vw);
    background: rgba(255,255,255,0.0001);
    z-index: 1;
  }
  /* Stronger blur near the bottom that fades upward */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.15625vw);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

export const HungryBox = styled.div`
  position: absolute;
  top: 59.791667vw; /* 2296px */
  left: 25.78125vw; /* 990px - 250 + 620 + 120 */
  transform: translateY(-50%);
  width: 16.145833vw; /* 620px */
  height: 8.333333vw; /* 320px */
  border-radius: 10.416667vw; /* 400px */
  border: 0.026042vw solid #FFFFFF; /* 1px */
  background: linear-gradient(243.46deg, rgba(255, 120, 37, 0.1932) 3.42%, rgba(255, 254, 172, 0.168) 65.14%, rgba(127, 225, 255, 0.1344) 88.72%);
  box-shadow: inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38), inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 3.90625vw; /* 150px */
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  /* Base soft blur across the whole box */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.078125vw); /* 3px */
    -webkit-backdrop-filter: blur(0.078125vw);
    background: rgba(255,255,255,0.0001);
    z-index: 1;
  }
  /* Stronger blur near the bottom that fades upward */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw); /* 6px */
    -webkit-backdrop-filter: blur(0.15625vw);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;
export const PillWrap = styled.div`
  position: absolute;
  left: 10.15625vw; /* 390px */
  right: 10.15625vw; /* 390px */
  top: 22.395833vw; /* 860px */
  bottom: 13.541667vw; /* 520px - leave room for ContentBox */
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.729167vw; /* 28px */
  flex-wrap: wrap;
  overflow: hidden; /* avoid accidental scroll within canvas */
`;

export const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.729167vw 1.145833vw; /* 28px 44px */
  border-radius: 26.036458vw; /* 999px */
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0.208333vw 0.572917vw rgba(0,0,0,0.06); /* 0 8px 22px */
  color: #000;
  font-family: ${(p) => p.$fontFamily};
  font-weight: ${(p) => p.$fontWeight || 800};
  font-style: ${(p) => p.$fontStyle || 'normal'};
  font-size: ${(p) => p.$fontSize || '1.2rem'};
  white-space: nowrap;
  user-select: none;
`;

export const PillText = styled.span`
  display: inline-block;
  line-height: 1;
`;


