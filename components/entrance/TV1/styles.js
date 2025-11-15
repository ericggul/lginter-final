import styled from 'styled-components';

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
  background: linear-gradient(290deg, #FFEAEB 4.45%, #FCE1FF 55.49%, #C8CDFF 100.96%);
`;

export const Canvas = styled.div`
  position: relative;
  width: 3840px;
  height: 2160px;
  transform-origin: top center;
  /* Hint to the browser that transform scaling is frequent */
  will-change: transform;
  /* Maintain the design aspect-ratio for layout tools and future CSS sizing */
  aspect-ratio: 3840 / 2160;
  &::after {
    content: '';
    position: absolute;
    top: 2000px;
    left: 0;
    right: 0;
    bottom: 0;
    /* Blur everything behind this overlay */
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    /* tiny background helps ensure backdrop-filter engages consistently */
    background: rgba(255,255,255,0.0001);
    pointer-events: none;
    z-index: 1000;
  }
`;

export const LeftLine = styled.div`
  position: absolute;
  top: 0px;
  left: -240px;
  width: 10px;
  height: 3000px;
  background: linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, #FFF 47.12%, rgba(255, 255, 255, 0.00) 100%);
  pointer-events: none;
  z-index: 3;
  /* Taper the line near the top and bottom */
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.5) 8%,
    rgba(0,0,0,1) 20%,
    rgba(0,0,0,1) 80%,
    rgba(0,0,0,0.5) 92%,
    rgba(0,0,0,0) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.5) 8%,
    rgba(0,0,0,1) 20%,
    rgba(0,0,0,1) 80%,
    rgba(0,0,0,0.5) 92%,
    rgba(0,0,0,0) 100%
  );
`;

export const LeftLineBlur = styled.div`
  position: absolute;
  top: 0px;
  left: -240px;
  width: 10px;
  height: 3000px;
  background: linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, #FFF 47.12%, rgba(255, 255, 255, 0.00) 100%);
  filter: blur(28px);
  pointer-events: none;
  z-index: 1;
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 25%,
    rgba(0,0,0,0.35) 50%,
    rgba(0,0,0,0.65) 75%,
    rgba(0,0,0,1) 100%
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 25%,
    rgba(0,0,0,0.35) 50%,
    rgba(0,0,0,0.65) 75%,
    rgba(0,0,0,1) 100%
  );
`;
export const LeftShape = styled.img`
  position: absolute;
  top: 800px;
  left: -235px; /* match LeftLine x-position */
  transform: translateX(-50%); /* center on the axis */
  width: 90px;
  height: 90px;
  filter: 
    drop-shadow(0 0 24px rgba(255, 255, 255, 0.9))
    drop-shadow(0 0 60px rgba(255, 255, 255, 0.7))
    drop-shadow(0 0 120px rgba(255, 255, 255, 0.4));
  pointer-events: none;
  z-index: 2; /* between blur (1) and crisp line (3) */
`;

export const LeftShape2 = styled(LeftShape)`
  top: 1310px;
    left: -235px; /* match LeftLine x-position */
  transform: translateX(-50%); /* center on the axis */
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 2; /* between blur (1) and crisp line (3) */
`;

export const LeftShape3 = styled(LeftShape)`
  top: 1800px;
    left: -235px; /* match LeftLine x-position */
  transform: translateX(-50%); /* center on the axis */
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 2; /* between blur (1) and crisp line (3) */
`;

export const LeftShape4 = styled(LeftShape)`
  top: 2300px;
    left: -235px; /* match LeftLine x-position */
  transform: translateX(-50%); /* center on the axis */
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 2; /* between blur (1) and crisp line (3) */
`;

export const LeftNow = styled.div`
  position: absolute;
  top: 810px;
  left: -50px; 
  transform: translateX(-50%);
  color: #FFF;
  text-align: center;
  font-family: Pretendard;
  font-size: 60px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  filter: 
    drop-shadow(0 0 24px rgba(255, 255, 255, 0.9))
    drop-shadow(0 0 60px rgba(255, 255,  255, 0.7))
    drop-shadow(0 0 120px rgba(255, 255, 255, 0.4));
  pointer-events: none;
  z-index: 4;
`;

export const LeftTime2 = styled.div`
  position: absolute;
  top: 1306px;
  left: -55px;
  transform: translateX(-50%);
  color: #FFF;
  text-align: center;
  font-family: Pretendard;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  filter: 
    drop-shadow(0 0 24px rgba(255, 255, 255, 0.9))
    drop-shadow(0 0 60px rgba(255, 255,  255, 0.7))
    drop-shadow(0 0 120px rgba(255, 255, 255, 0.4));
  pointer-events: none;
  z-index: 4;
`;

export const LeftTime3 = styled(LeftTime2)`
  top: 1796px;
`;

export const LeftTime4 = styled(LeftTime2)`
  top: 2296px;
`;
export const TopText = styled.div`
  position: absolute;
  top: 250px;
  left: 250px;
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
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
  top: 1820px;
  left: 2200px; /* same gap to the right of PlayfulBox */
  transform: translateY(-50%);
  width: 700px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(131.16deg, rgba(255, 0, 217, 0.1855) 17.16%, rgba(104, 255, 182, 0.07) 72.86%, rgba(234, 255, 127, 0.182) 94.13%);
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
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
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }
`;

export const AnnoyedBox = styled.div`
  position: absolute;
  top: 2296px;
  left: 250px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(98.92deg, rgba(91, 76, 255, 0.092) 23.61%, rgba(55, 255, 252, 0.046) 73.24%, rgba(66, 255, 142, 0.069) 92.2%);
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
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
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
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
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

export const HungryBox = styled.div`
  position: absolute;
  top: 2296px;
  left: 990px; /* 250 + 620 + 120 */
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(243.46deg, rgba(255, 120, 37, 0.1932) 3.42%, rgba(255, 254, 172, 0.168) 65.14%, rgba(127, 225, 255, 0.1344) 88.72%);
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
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
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
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
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;
export const PillWrap = styled.div`
  position: absolute;
  left: 390px;
  right: 390px;
  top: 860px;
  bottom: 520px; /* leave room for ContentBox */
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 28px;
  flex-wrap: wrap;
  overflow: hidden; /* avoid accidental scroll within canvas */
`;

export const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 28px 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 8px 22px rgba(0,0,0,0.06);
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


