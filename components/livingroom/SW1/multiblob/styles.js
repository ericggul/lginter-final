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
  0%   { --holeInner: 14.5vmin; }
  35%  { --holeInner: 7.2vmin; }
  100% { --holeInner: 14.5vmin; }
`;

const rimPulse = keyframes`
  0%   { --outerFeather: 7.5vmin; }
  35%  { --outerFeather: 1.8vmin; }
  100% { --outerFeather: 7.5vmin; }
`;

const rimScale = keyframes`
  0%   { --blobScale: 0.88; }
  35%  { --blobScale: 1.45; }
  100% { --blobScale: 0.88; }
`;

export const Root = styled.div`
  position: relative;
  width: 100vw;
  height: 56.25vw; /* 2160 / 3840 * 100 */
  min-height: 56.25vw;
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
  top: 2.8125vw;
  left: 50%;
  transform: translateX(-50%);
  color: #334155;
  font-weight: 600;
  letter-spacing: -0.005208vw;
  text-align: center;
  font-size: clamp(0.729167vw, 3.96vmin, 1.223958vw);
  text-shadow: 0 0.052083vw 0.3125vw rgba(0,0,0,0.08);
  pointer-events: none;
  z-index: 10;
`;

export const Stage = styled.div`
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 56.25vw;
  pointer-events: none;
  /* reference size for the largest small blob (D) */
  --largestBlobSize: clamp(11.588542vw, 52.65vmin, 31.640625vw);
`;

export const GradientEllipse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* Match Figma: 2293px circle on 3840px-wide canvas → ~59.7vw */
  width: calc(100vw * 2293 / 3840);
  height: calc(100vw * 2293 / 3840);
  transform: translate(-50%, -50%) rotate(-90deg);
  background: radial-gradient(
    47.13% 47.13% at 50% 50%,
    #FFFFFF 37.5%,
    rgba(224, 224, 224, 0.37) 42.79%,
    rgba(255, 218, 233, 0.48) 73.08%,
    rgba(255, 255, 255, 0.67) 100%
  );
  filter: blur(1.302083vw); /* ≈ 50px on 3840px width */
  border-radius: 50%;
  /* place above side blobs but below text/center mark */
  z-index: 6;
  pointer-events: none;
`;

/* Center pulse waves: multiple thin white rings slowly expanding outward */
const centerPulseWave = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0.6;
  }
  70% {
    opacity: 0.25;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
`;

export const CenterPulse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--largestBlobSize) * 2.1);
  height: calc(var(--largestBlobSize) * 2.1);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 7; /* GradientEllipse 위, CenterText/CenterMark 아래 */

  /* 기본 파동 (1번 링) - 아주 얇고 은은한 링 */
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.0) 0%,
    rgba(255, 255, 255, 0.0) 58%,
    rgba(255, 255, 255, 0.75) 64%,
    rgba(255, 255, 255, 0.0) 74%,
    rgba(255, 255, 255, 0.0) 100%
  );
  animation: ${centerPulseWave} 11s ease-out infinite;

  /* 2, 3번 파동을 약간의 딜레이를 두고 이어서 발생시키기 위해 pseudo 사용 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: inherit;
    animation: ${centerPulseWave} 11s ease-out infinite;
  }

  &::before {
    animation-delay: 3.7s;
  }

  &::after {
    animation-delay: 7.4s;
  }
`;

export const EllipseLayer = styled.div`
  display: none;
`;

export const Ellipse = styled.div`
  /* Fallback for narrow screens */
  width: 100vw;
  @media (min-width: 39.583333vw) {
    width: calc(100vw - 39.583333vw); /* leave 19.791667vw on left and right */
    max-width: calc(100vw - 39.583333vw);
  }
  height: 56.25vw; /* allow vertical crop */
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
  width: calc(56.25vw * 5 / 7);
  height: calc(56.25vw * 5 / 7);
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
  filter: blur(1.302083vw);
`;

export const CenterTextWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  /* text is above glow, but below rotating white line */
  z-index: 8;
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
  /* 그림자 없이 선 자체의 밝기/대비만 살려서 또렷하게 */
  filter: brightness(1.25) contrast(1.4);
  /* top-most: above text and glow */
  z-index: 9;
`;

export const CenterTemp = styled.div`
  font-size: clamp(0.651042vw, 4.5vmin, 1.692708vw);
  line-height: 1.08;
  font-weight: 600;
  color: #111827;
  text-shadow: 0 0.026042vw 0 rgba(0,0,0,0.64), 0 0.078125vw 0.3125vw rgba(0,0,0,0.48);
`;

export const CenterMode = styled.div`
  margin-top: 0.6vmin;
  font-size: clamp(0.651042vw, 4.5vmin, 1.692708vw);
  font-weight: 500;
  color: #0F172A;
  text-shadow: 0 0.026042vw 0 rgba(0,0,0,0.48), 0 0.078125vw 0.3125vw rgba(0,0,0,0.36);
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

/* Imported SW2 blob styling for SW1 */

const blobDriftGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const blobInterestDrift = keyframes`
  0%   { transform: translate(-50%, -50%); }
  25%  { transform: translate(calc(-50% + 2vw), calc(-50% - 1.2vw)); }
  50%  { transform: translate(calc(-50% + 1vw), calc(-50% - 2vw)); }
  75%  { transform: translate(calc(-50% + 2.6vw), calc(-50% - 0.6vw)); }
  100% { transform: translate(-50%, -50%); }
`;

const blobWonderDrift = keyframes`
  0%   { transform: translate(-50%, -50%); }
  25%  { transform: translate(calc(-50% - 2.4vw), calc(-50% + 1.4vw)); }
  50%  { transform: translate(calc(-50% - 1.6vw), calc(-50% + 2.6vw)); }
  75%  { transform: translate(calc(-50% - 0.9vw), calc(-50% + 1.2vw)); }
  100% { transform: translate(-50%, -50%); }
`;

const blobHappyDrift = keyframes`
  0%   { transform: translate(-50%, -50%); }
  25%  { transform: translate(calc(-50% - 2.2vw), calc(-50% - 1.2vw)); }
  50%  { transform: translate(calc(-50% - 1.2vw), calc(-50% + 1.4vw)); }
  75%  { transform: translate(calc(-50% - 0.4vw), calc(-50% - 0.4vw)); }
  100% { transform: translate(-50%, -50%); }
`;

const blobMoistureDrift = keyframes`
  0%   { transform: translate(-50%, -50%); }
  25%  { transform: translate(calc(-50% + 1.8vw), calc(-50% + 1.2vw)); }
  50%  { transform: translate(calc(-50% + 1vw), calc(-50% - 1.6vw)); }
  75%  { transform: translate(calc(-50% + 0.3vw), calc(-50% - 0.6vw)); }
  100% { transform: translate(-50%, -50%); }
`;

/* 내부 그라데이션이 살짝 흐르듯이 움직이면서 입체감이 느껴지도록 하는 패럴럭스 모션 */
const blobInnerParallax = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 50% 48%;
  }
  100% {
    background-position: 100% 52%;
  }
`;

const blobInterestSize = keyframes`
  0%   { width: 20vw; height: 20vw; }
  40%  { width: 26vw; height: 26vw; }
  70%  { width: 18vw; height: 18vw; }
  100% { width: 22vw; height: 22vw; }
`;

const blobWonderSize = keyframes`
  0%   { width: 20vw; height: 20vw; }
  45%  { width: 26vw; height: 26vw; }
  75%  { width: 18vw; height: 18vw; }
  100% { width: 23vw; height: 23vw; }
`;

const blobHappySize = keyframes`
  0%   { width: 20vw; height: 20vw; }
  35%  { width: 26vw; height: 26vw; }
  65%  { width: 18vw; height: 18vw; }
  100% { width: 22.5vw; height: 22.5vw; }
`;

const BlobBase = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  /* 주변 원 크기 - 살짝 줄여서 중앙보다 덜 강조 */
  width: 26vw;
  height: 26vw;
  border-radius: 50%;
  /* 테두리를 제거해서 외곽 블러가 더 자연스럽게 보이도록 처리 */
  border: none;
  /* box-shadow 대신 별도 레이어에 실제 blur를 적용하기 위해 overflow를 노출 */
  box-shadow: none;
  overflow: visible;
  /* 기본 원은 투명, 실제 색/그라데이션은 ::before/::after 레이어에서만 렌더 */
  background: transparent;
  /* 전체 투명도를 살짝 낮춰 중앙 원보다 한 단계 뒤에 있는 듯한 깊이감 부여 */
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.02vw;
  text-align: center;
  color: #A1908A;
  font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: 2.083333vw;
  letter-spacing: 0.01em;
  z-index: 2;
  will-change: background-position, transform;
  isolation: isolate;
  & > * {
    position: relative;
    z-index: 1;
  }
  & strong,
  & span {
    font-size: 1.6vw;
    font-weight: 320;
    letter-spacing: 0.01em;
    color: #A1908A;
    mix-blend-mode: difference;
    text-shadow:
      0 0.052083vw 0.052083vw rgba(161, 144, 138, 0.35),
      0 0.104167vw 0.208333vw currentColor;
  }
  /* 원보다 살짝 큰 레이어에 blur를 적용해서 외곽이 부드럽게 퍼지도록 처리 (halo) */
  &::before {
    content: '';
    position: absolute;
    /* 중앙 원 주변에 아주 부드럽게 깔리는 큰 광원 느낌을 위해 더 크게 확장 */
    inset: -3.6vw;            /* 원보다 훨씬 더 크게 (halo) */
    border-radius: inherit;
    /* 각 블롭에서 정의한 --blob-bg 그라데이션을 사용해 컬러가 밖으로 퍼지게 */
    background: var(--blob-bg, transparent);
    /* 주변이 예시처럼 훨씬 더 부드럽게 퍼져 보이도록 블러 강도 대폭 상향 */
    filter: blur(4.8vw);      /* 외곽 블러 강도 */
    /* 넓은 영역에 흐리게 퍼지지만, 화면 전체가 하얗게 뜨지 않도록 투명도 더 감소 */
    opacity: 0.22;            /* 안쪽 원을 가리지 않도록 투명도 조절 */
    z-index: 0;               /* 텍스트/콘텐츠(1)보다 아래, 내부 그라데이션보다 아래 */
    pointer-events: none;
  }
  /* 내부 입체감을 위한 그라데이션 원 (가장자리는 마스크로 부드럽게 페이드) */
  &::after {
    content: '';
    position: absolute;
    inset: 0.2vw;             /* halo 안쪽을 채우는 몸통 */
    border-radius: inherit;
    /* 입체감을 주기 위해 밝은 하이라이트 레이어만 컬러 그라데이션 위에 겹쳐서 사용 (뚜렷한 그림자 레이어는 제거) */
    background:
      /* 구의 정면이 살짝 더 밝게 보이도록 하는 넓은 하이라이트 (강도/범위 축소) */
      radial-gradient(
        circle at 50% 38%,
        rgba(255, 255, 255, 0.35) 0%,
        rgba(255, 255, 255, 0.0) 55%
      ),
      /* 코어 하이라이트도 영역과 알파를 줄여서 컬러가 더 잘 드러나도록 조정 */
      radial-gradient(
        circle at 26% 20%,
        rgba(255, 255, 255, 0.82) 0%,
        rgba(255, 255, 255, 0.0) 30%
      ),
      var(--blob-bg, transparent);
    background-size: 320% 320%;
    background-position: 0% 50%;
    /* 가장자리로 갈수록 부드럽게 투명해지도록 마스크 → 외곽 경계선이 딱 끊겨 보이지 않게 처리 */
    -webkit-mask-image: radial-gradient(
      circle at 50% 45%,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 52%,
      rgba(0, 0, 0, 0.55) 76%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: radial-gradient(
      circle at 50% 45%,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 52%,
      rgba(0, 0, 0, 0.55) 76%,
      rgba(0, 0, 0, 0) 100%
    );
    /* 안쪽 색은 선명하게, 외곽은 살짝 더 퍼져 보이도록 블러 강도 상향 */
    filter: blur(0.35vw);
    /* 내부 그라데이션이 천천히 움직이면서 입체적인 볼륨감이 느껴지도록 배경 위치를 부드럽게 애니메이션 */
    animation: ${blobInnerParallax} 22s ease-in-out infinite alternate;
    z-index: 0.5;
    pointer-events: none;
  }
`;

export const Sw1InterestBlob = styled(BlobBase)`
  top: 12vw;
  left: 78vw;
  /* 입체감을 위한 구형(원형) 그라데이션 - ::before에서 blur와 함께 사용 */
  --blob-bg: radial-gradient(
    circle at 32% 28%,
    rgba(255, 255, 255, 0.98) 0%,
    /* 중앙의 강한 하이라이트는 유지하되, 순수 흰색이 차지하는 반경을 줄여서 가장자리 컬러가 더 빨리 드러나도록 조정 */
    rgba(255, 255, 255, 0.9) 16%,
    rgba(255, 132, 94, 0.32) 52%,
    rgba(55, 255, 252, 0.24) 74%,
    rgba(66, 255, 142, 0.26) 100%
  );
  background-size: 320% 320%;
  /* 위치와 색만 천천히 움직이고, 크기는 고정 */
  animation:
    ${blobDriftGradient} 9.3s ease-in-out infinite,
    ${blobInterestDrift} 18s ease-in-out infinite;
`;

export const Sw1WonderBlob = styled(BlobBase)`
  top: 44vw;
  left: 24vw;
  --blob-bg: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.88) 18%,
    rgba(0, 0, 255, 0.28) 56%,
    rgba(170, 0, 255, 0.26) 80%,
    rgba(0, 255, 179, 0.34) 100%
  );
  background-size: 320% 320%;
  animation:
    ${blobDriftGradient} 9.8s ease-in-out infinite,
    ${blobWonderDrift} 19s ease-in-out infinite;
`;

export const Sw1HappyBlob = styled(BlobBase)`
  top: 10vw;
  left: 22vw;
  --blob-bg: radial-gradient(
    circle at 34% 26%,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.88) 18%,
    rgba(255, 74, 158, 0.34) 58%,
    rgba(255, 60, 120, 0.28) 82%,
    /* 가장 바깥쪽 흰색 림도 살짝 줄여서 주변이 과하게 새하얗게 보이지 않도록 조정 */
    rgba(255, 255, 255, 0.65) 100%
  );
  background-size: 320% 320%;
  animation:
    ${blobDriftGradient} 8.9s ease-in-out infinite,
    ${blobHappyDrift} 17s ease-in-out infinite;
`;

export const Sw1MoistureBlob = styled(BlobBase)`
  top: 46vw;
  left: 74vw;
  --blob-bg: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.88) 18%,
    rgba(30, 72, 255, 0.3) 56%,
    rgba(208, 136, 168, 0.3) 80%,
    rgba(129, 198, 255, 0.34) 100%
  );
  background-size: 320% 320%;
  animation:
    ${blobDriftGradient} 9.5s ease-in-out infinite,
    ${blobMoistureDrift} 20s ease-in-out infinite;
`;
