import styled, { createGlobalStyle, keyframes } from 'styled-components';

export const MotionProps = createGlobalStyle`
  @property --p1x { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --p1y { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --cx  { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --cy  { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --holeInner { syntax: '<length>'; inherits: false; initial-value: 14vmin; }
  @property --outerFeather { syntax: '<length>'; inherits: false; initial-value: 8vmin; }
  @property --blobScale { syntax: '<number>'; inherits: false; initial-value: 1; }
`;

/* BackgroundCanvas blob center swirl for D (matches SmallBlobD path/speed) */
export const BCBlobMotion = createGlobalStyle`
  @property --center-x {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 50%;
  }
  @property --center-y {
    syntax: '<percentage>';
    inherits: false;
    initial-value: 50%;
  }
  @keyframes bcSwirlD {
    0%   { --center-x: 52%; --center-y: 46%; }
    25%  { --center-x: 54%; --center-y: 52%; }
    50%  { --center-x: 48%; --center-y: 54%; }
    75%  { --center-x: 46%; --center-y: 48%; }
    100% { --center-x: 52%; --center-y: 46%; }
  }
`;

const drift = keyframes`
  0%   { --p1x: 50%; --p1y: 50%; }
  100% { --p1x: 50%; --p1y: 50%; }
`;

const pulse = keyframes`
  /* Tighter inward squeeze toward center text */
  0%   { --holeInner: 12.5vmin; }
  50%  { --holeInner: 10.8vmin; }
  100% { --holeInner: 12.5vmin; }
`;

const rimPulse = keyframes`
  /* Make outer edge spread outward at peak: smaller feather = larger visible radius */
  0%   { --outerFeather: 6vmin; }
  50%  { --outerFeather: 3.6vmin; }
  100% { --outerFeather: 6vmin; }
`;

const rimScale = keyframes`
  /* Increase global radius swell for stronger outer expansion */
  0%   { --blobScale: 1; }
  50%  { --blobScale: 1.25; }
  100% { --blobScale: 1; }
`;

export const Root = styled.div`
  position: relative;
  width: 100vw;
  /* Prefer dynamic viewport height for mobile browsers */
  height: 100dvh;
  /* Fallback */
  min-height: 100vh;
  background-color: #FAEFFA;
  background-image: ${({ $backgroundUrl }) => ($backgroundUrl ? `url(${$backgroundUrl})` : 'none')};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  font-family: Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
  /* radius from center to place small blob centers (kept inside viewport) */
  --R: 34vmin;
`;

export const TopStatus = styled.div`
  position: absolute;
  top: 5vh;
  left: 50%;
  transform: translateX(-50%);
  color: #334155;
  font-weight: 600;
  letter-spacing: -0.2px;
  text-align: center;
  font-size: clamp(28px, 3.96vmin, 47px);
  text-shadow: 0 2px 12px rgba(0,0,0,0.08);
  pointer-events: none;
  z-index: 10;
`;

export const Stage = styled.div`
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  /* reference size for the largest small blob (D) */
  --largestBlobSize: clamp(445px, 52.65vmin, 1215px);
`;

export const GradientEllipse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* Scale with viewport min-dimension; cap for large displays */
  width: clamp(1100px, 135vmin, 3000px);
  height: clamp(1100px, 135vmin, 3000px);
  transform: translate(-50%, -50%) rotate(90deg) scale(var(--blobScale));
  background: radial-gradient(50.02% 50.02% at 50.02% 50.02%, #FFC7C1 21.15%, rgba(255, 218, 246, 0.76) 63.46%, rgba(234, 213, 255, 0.3) 85.58%, rgba(255, 255, 255, 0) 100%);
  filter: blur(50px);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
  /* Create a soft transparent hole in the center and feather the outer edge */
  --holeInner: 11vmin; /* radius where fully transparent begins (tighter to center text) */
  --holeFeather: 5vmin; /* slightly crisper inner edge */
  --outerFeather: 8vmin; /* softness of the outer edge */
  -webkit-mask-image: radial-gradient(circle closest-side at 50% 50%,
    rgba(255,255,255,0) var(--holeInner),
    rgba(255,255,255,1) calc(var(--holeInner) + var(--holeFeather)),
    rgba(255,255,255,1) calc(100% - var(--outerFeather)),
    rgba(255,255,255,0) 100%
  );
  mask-image: radial-gradient(circle closest-side at 50% 50%,
    rgba(255,255,255,0) var(--holeInner),
    rgba(255,255,255,1) calc(var(--holeInner) + var(--holeFeather)),
    rgba(255,255,255,1) calc(100% - var(--outerFeather)),
    rgba(255,255,255,0) 100%
  );
  /* Center locked; slow down by 300% (durations ×3) and updated amplitudes */
  animation: ${pulse} 4.5s ease-in-out infinite alternate,
             ${rimPulse} 4.5s ease-in-out infinite alternate,
             ${rimScale} 4.5s ease-in-out infinite alternate;
`;

export const EllipseLayer = styled.div`
  display: none;
`;

export const Ellipse = styled.div`
  /* Fallback for narrow screens */
  width: 100vw;
  @media (min-width: 1520px) {
    width: calc(100vw - 1520px); /* leave 760px on left and right */
    max-width: calc(100vw - 1520px);
  }
  height: 100vh; /* allow vertical crop */
  background-image: ${({ $ellipseUrl }) => ($ellipseUrl ? `url(${$ellipseUrl})` : 'none')};
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 50% auto; /* reduce to 50% of previous width */
`;

export const CircleContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100vh * 5 / 7);
  height: calc(100vh * 5 / 7);
  border-radius: 50%;
  z-index: 0;
`;

export const BaseWhite = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #FFFFFF;
`;

export const GradientBlur = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% * 3012 / 3104);
  height: calc(100% * 3012 / 3104);
  border-radius: 50%;
  background: radial-gradient(50.02% 50.02% at 50.02% 50.02%, #FFFFFF 34.13%, #FCCCC1 44.23%, #DDDBDD 79.81%, #FFC9E3 87.98%, #FFFFFF 100%);
  filter: blur(50px);
`;

export const CenterTextWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 5;
`;

/* spin for the center mark image */
const centerMarkSpin = keyframes`
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

export const CenterMark = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 50% of the largest small blob diameter */
  width: calc(var(--largestBlobSize) * 1.2);
  height: calc(var(--largestBlobSize) * 1.2);
  will-change: transform;
  animation: ${centerMarkSpin} 4s linear infinite;
  pointer-events: none;
  z-index: 4; /* behind text, above background */
`;

export const CenterTemp = styled.div`
  font-size: clamp(25px, 4.5vmin, 65px);
  line-height: 1.08;
  font-weight: 600;
  color: #111827;
  text-shadow: 0 1px 0 rgba(0,0,0,0.64), 0 3px 12px rgba(0,0,0,0.48);
`;

export const CenterMode = styled.div`
  margin-top: 0.6vmin;
  font-size: clamp(25px, 4.5vmin, 65px);
  font-weight: 500;
  color: #0F172A;
  text-shadow: 0 1px 0 rgba(0,0,0,0.48), 0 3px 12px rgba(0,0,0,0.36);
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

/* Small peripheral blobs (no motion) */
export const SmallBlobsLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2; /* above bg ellipse, below center text (z=5) */
`;

/* Wrapper to place a BackgroundCanvas-style blob at the exact D position/size */
export const BCBlobDWrap = styled.div`
  position: absolute;
  --top: 72%;
  --left: 74%;
  --size: clamp(445px, 52.65vmin, 1215px);
  top: var(--top);
  left: var(--left);
  transform: translate(-50%, -50%);
  width: var(--size);
  height: var(--size);
  pointer-events: none;
  z-index: 1; /* under labels */
`;

/* Four quadrant wrappers for BackgroundCanvas blobs (smaller than CenterMark) */
const BCBlobQuadBase = styled.div`
  position: absolute;
  top: ${(p) => p.$top || '25%'};
  left: ${(p) => p.$left || '25%'};
  transform: translate(-50%, -50%);
  width: calc(var(--largestBlobSize) * 0.36);
  height: calc(var(--largestBlobSize) * 0.36);
  pointer-events: none;
  z-index: 1;
`;

export const BCBlobTL = styled(BCBlobQuadBase)`
  top: 25%;
  left: 25%;
`;
export const BCBlobTR = styled(BCBlobQuadBase)`
  top: 25%;
  left: 75%;
`;
export const BCBlobBL = styled(BCBlobQuadBase)`
  top: 75%;
  left: 25%;
`;
export const BCBlobBR = styled(BCBlobQuadBase)`
  top: 75%;
  left: 75%;
`;

/* swirl by animating radial-gradient center (scales with element size) */
const gCenterSwirl = keyframes`
  0%   { --cx: 50%; --cy: 46%; }
  25%  { --cx: 54%; --cy: 50%; }
  50%  { --cx: 50%; --cy: 54%; }
  75%  { --cx: 46%; --cy: 50%; }
  100% { --cx: 50%; --cy: 46%; }
`;
const gCenterSwirlDiag1 = keyframes`
  0%   { --cx: 48%; --cy: 46%; }
  25%  { --cx: 54%; --cy: 48%; }
  50%  { --cx: 52%; --cy: 54%; }
  75%  { --cx: 46%; --cy: 52%; }
  100% { --cx: 48%; --cy: 46%; }
`;
const gCenterSwirlDiag2 = keyframes`
  0%   { --cx: 52%; --cy: 46%; }
  25%  { --cx: 54%; --cy: 52%; }
  50%  { --cx: 48%; --cy: 54%; }
  75%  { --cx: 46%; --cy: 48%; }
  100% { --cx: 52%; --cy: 46%; }
`;

export const SectionCell = styled.div`
  position: relative;
  overflow: hidden; /* softly clips blur near edges to 'hint' crossing */
`;

/* Shared blob base */
const SectionBlob = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(var(--rot));
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  filter: blur(43.4px);
  opacity: 0.95;
  pointer-events: none;
  will-change: transform;
`;

/* Scale between 25% and 100% of own max (min = 25% of largest rule satisfied) */
const scalePulse = keyframes`
  0%   { transform: translate(-50%, -50%) rotate(var(--rot)) scale(0.25); }
  50%  { transform: translate(-50%, -50%) rotate(var(--rot)) scale(1); }
  100% { transform: translate(-50%, -50%) rotate(var(--rot)) scale(0.25); }
`;





