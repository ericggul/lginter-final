import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { BlobRotator as SharedBlobRotator, ContentRotator as SharedContentRotator } from '../../shared/rotationStyles';

export const MotionProps = createGlobalStyle`
  @property --p1x { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --p1y { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --cx  { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --cy  { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
  @property --holeInner { syntax: '<length>'; inherits: false; initial-value: 14vmin; }
  @property --outerFeather { syntax: '<length>'; inherits: false; initial-value: 8vmin; }
  @property --blobScale { syntax: '<number>'; inherits: false; initial-value: 1; }
  /* 중심 공전 반경 호흡용 커스텀 프로퍼티 */
  @property --orbit-radius-mod { syntax: '<number>'; inherits: false; initial-value: 1; }
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

export const BlobRotator = SharedBlobRotator;
export const ContentRotator = SharedContentRotator;

export const Root = styled.div`
  /* TV용 풀 화면 캔버스: 스크롤이 생기지 않도록 화면에 고정 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 56.25vw; /* 2160 / 3840 * 100 */
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
  /* reference size for the 중심 블롭과 오빗 블롭 크기 (한 단계 더 축소) */
  --largestBlobSize: clamp(7.5vw, 36vmin, 20vw);
`;

/* 화면 가장자리에 글라스모피즘(유리) 느낌을 주는 레이어
   - 아래에 있는 블롭/배경을 blur 해서 가장자리 쪽만 유리 뒤에 있는 것처럼 보이게 함 */
export const EdgeGlassLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4; /* 블롭 본체 위, GradientEllipse(6)보다는 아래/위는 필요에 따라 조정 가능 */

  /* 에지 쪽에만 알파가 있는 마스크 형태의 배경 */
  background:
    radial-gradient(
      circle at -5% 50%,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.14) 26%,
      rgba(255, 255, 255, 0.00) 60%
    ),
    radial-gradient(
      circle at 105% 50%,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.14) 26%,
      rgba(255, 255, 255, 0.00) 60%
    ),
    radial-gradient(
      circle at 50% -10%,
      rgba(255, 255, 255, 0.20) 0%,
      rgba(255, 255, 255, 0.12) 22%,
      rgba(255, 255, 255, 0.00) 56%
    ),
    radial-gradient(
      circle at 50% 110%,
      rgba(255, 255, 255, 0.20) 0%,
      rgba(255, 255, 255, 0.12) 22%,
      rgba(255, 255, 255, 0.00) 56%
    );

  /* backdrop-filter 로 아래 콘텐츠를 블러 → 유리 느낌 */
  backdrop-filter: ${({ $blur = 28 }) => `blur(${$blur}px) saturate(130%)`};
  -webkit-backdrop-filter: ${({ $blur = 28 }) =>
    `blur(${$blur}px) saturate(130%)`};

  opacity: ${({ $opacity = 1 }) => $opacity};
`;

/* 화면 가장자리 부근에만 추가 블러를 깔아서,
   블롭이 에지에 가까워질 때 가장자리 쪽이 더 퍼져 보이도록 하는 레이어 */
export const EdgeBlurLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3; /* 블롭 본체(1~2) 위, GradientEllipse(6) 아래에서 작동 */

  background:
    /* 왼쪽 가장자리 */
    radial-gradient(
      circle at -5% 50%,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.6) 18%,
      rgba(255, 255, 255, 0.0) 55%
    ),
    /* 오른쪽 가장자리 */
    radial-gradient(
      circle at 105% 50%,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.6) 18%,
      rgba(255, 255, 255, 0.0) 55%
    ),
    /* 위쪽 가장자리 */
    radial-gradient(
      circle at 50% -10%,
      rgba(255, 255, 255, 0.75) 0%,
      rgba(255, 255, 255, 0.55) 16%,
      rgba(255, 255, 255, 0.0) 52%
    ),
    /* 아래쪽 가장자리 */
    radial-gradient(
      circle at 50% 110%,
      rgba(255, 255, 255, 0.75) 0%,
      rgba(255, 255, 255, 0.55) 16%,
      rgba(255, 255, 255, 0.0) 52%
    );

  filter: ${({ $strength = 1.4 }) => `blur(${$strength}vw)`};
  mix-blend-mode: screen;
  opacity: ${({ $opacity = 0.8 }) => $opacity};
`;

export const GradientEllipse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* 중앙 화이트 코어 영역을 살짝 더 작게 */
  width: calc(100vw * 2100 / 3840);
  height: calc(100vw * 2100 / 3840);
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

/* 가운데 원의 mid1Color 대역 채도가 서서히 강해졌다가 약해지는 효과용 오버레이 */
const centerSaturationPulse = keyframes`
  0%, 100% {
    opacity: 0.0;
  }
  45% {
    opacity: 0.38;
  }
  70% {
    opacity: 0.18;
  }
`;

export const CenterSaturationPulse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(100vw * 2293 / 3840);
  height: calc(100vw * 2293 / 3840);
  transform: translate(-50%, -50%) rotate(-90deg);
  border-radius: 50%;
  pointer-events: none;
  z-index: 7; /* GradientEllipse 위, CenterText/CenterMark 아래 */

  /* mid1Color (#f56a94) 영역을 한 겹 더 깔아서 채도 펄스를 표현 */
  background: radial-gradient(
    47.13% 47.13% at 50% 50%,
    rgba(245, 106, 148, 0.00) 0%,
    rgba(245, 106, 148, 0.00) 36%,
    rgba(245, 106, 148, 0.55) 55%,
    rgba(245, 106, 148, 0.00) 90%
  );

  animation: ${centerSaturationPulse} 6.2s ease-in-out infinite;
`;

/* Center wave: 중앙에서 물결처럼 천천히 번져 나가는 부드러운 파장 */
const centerPulseWave = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0.0;
  }
  18% {
    opacity: 0.75;
  }
  100% {
    /* 화면 바깥까지 한 번 더 넓게 퍼지도록 스케일을 살짝 키움 */
    transform: translate(-50%, -50%) scale(1.35);
    opacity: 0.0;
  }
`;

export const CenterPulse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* 파동 기본 크기도 줄여서 화이트 링 영역이 과하게 커지지 않도록 조정 */
  width: calc(var(--largestBlobSize) * 1.05);
  height: calc(var(--largestBlobSize) * 1.05);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 7; /* GradientEllipse 위, CenterText/CenterMark 아래 */

  /* 기본 파동 (1번 링) - 아주 얇고 은은한 링 */
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.0) 0%,
    rgba(255, 255, 255, 0.0) 64%,
    rgba(255, 255, 255, 0.95) 72%,
    rgba(255, 255, 255, 0.0) 88%,
    rgba(255, 255, 255, 0.0) 100%
  );
  /* 파동이 주인공처럼 보이도록, 경계는 유지하면서 살짝 번지는 정도의 블러 */
  filter: blur(0.14vw);
  /* 한 파동이 약 9초 동안 진행되고, 총 3개의 링이 3초 간격으로 이어지도록 설정 */
  animation: ${centerPulseWave} 9s ease-out infinite;

  /* 2, 3번 파동을 약간의 딜레이를 두고 이어서 발생시키기 위해 pseudo 사용 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: inherit;
    filter: inherit;
    animation: ${centerPulseWave} 9s ease-out infinite;
  }

  &::before {
    animation-delay: 3s;
  }

  &::after {
    animation-delay: 6s;
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
  /* 중앙 원 그룹 크기 추가 축소 */
  width: calc(56.25vw * 4.1 / 7);
  height: calc(56.25vw * 4.1 / 7);
  border-radius: 50%;
  z-index: 0;
`;

export const BaseWhite = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #FFFFFF;
`;

/* 중앙 화이트+핑크 블롭의 글로우 레이어 */
const centerBreath = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.98);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.04);
  }
  100% {
    transform: translate(-50%, -50%) scale(0.98);
  }
`;

export const GradientBlur = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 중앙 핑크 블롭(글로우)도 한 단계 더 작게 */
  width: calc(100% * 2600 / 3104);
  height: calc(100% * 2600 / 3104);
  border-radius: 50%;
  background: radial-gradient(50.02% 50.02% at 50.02% 50.02%, #FFFFFF 34.13%, #FCCCC1 44.23%, #DDDBDD 79.81%, #FFC9E3 87.98%, #FFFFFF 100%);
  filter: blur(1.302083vw);
  /* 숨쉬듯이 아주 천천히 커졌다 작아지는 루프 */
  animation: ${centerBreath} 18s ease-in-out infinite;
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
  font-size: clamp(0.9vw, 5.5vmin, 2.3vw);
  line-height: 1.08;
  font-weight: 600;
  color: #111827;
  text-shadow: 0 0.026042vw 0 rgba(0,0,0,0.64), 0 0.078125vw 0.3125vw rgba(0,0,0,0.48);
`;

export const CenterMode = styled.div`
  margin-top: 0.6vmin;
  font-size: clamp(0.8vw, 4.8vmin, 2.0vw);
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

/* 공전 반경이 아주 살짝 안팎으로 움직이는 호흡 모션 */
const orbitRadiusPulse = keyframes`
  0% {
    --orbit-radius-mod: 1;
  }
  40% {
    --orbit-radius-mod: 0.9;
  }
  100% {
    --orbit-radius-mod: 1;
  }
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

/* z축으로 살짝 앞으로/뒤로 튀어나오는 느낌의 스케일/투명도 펄스 */
const zPulse = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%) var(--orbit-transform)
               scale(var(--z-scale-base));
    opacity: var(--z-opacity-base);
  }
  40% {
    transform: translate(-50%, -50%) var(--orbit-transform)
               scale(calc(var(--z-scale-base) * 1.2));
    opacity: calc(var(--z-opacity-base) + 0.18);
  }
  70% {
    transform: translate(-50%, -50%) var(--orbit-transform)
               scale(calc(var(--z-scale-base) * 0.9));
    opacity: calc(var(--z-opacity-base) - 0.16);
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
  /* 주변 원 크기 - 전체적으로 한 단계 더 작게 축소 */
  width: 22vw;
  height: 22vw;
  border-radius: 50%;
  /* 테두리를 제거해서 외곽 블러가 더 자연스럽게 보이도록 처리 */
  border: none;
  /* box-shadow 대신 별도 레이어에 실제 blur를 적용하기 위해 overflow를 노출 */
  box-shadow: none;
  overflow: visible;
  /* 기본 원은 투명, 실제 색/그라데이션은 ::before/::after 레이어에서만 렌더 */
  background: transparent;
  /* 전체 투명도를 조정해 주변 원이 너무 죽지 않으면서도 중앙보다 한 단계 뒤에 있도록 설정 */
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
    font-weight: 400;
    letter-spacing: 0.01em;
    color: #FFFFFF;
    mix-blend-mode: normal;
    text-shadow: none;
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
    /* 주변이 부드럽게 깔리되, 화면 전체가 새하얗게 되지 않도록 블러/투명도 조정 */
    filter: blur(4.2vw);      /* 외곽 블러 강도 */
    opacity: 0.2;             /* 은은하지만 존재감은 유지 */
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
      /* 구의 정면이 살짝 더 밝게 보이도록 하는 넓은 하이라이트 (더 낮은 알파/짧은 범위) */
      radial-gradient(
        circle at 50% 38%,
        rgba(255, 255, 255, 0.24) 0%,
        rgba(255, 255, 255, 0.0) 45%
      ),
      /* 코어 하이라이트도 영역과 알파를 줄여서 컬러가 더 잘 드러나도록 조정 */
      radial-gradient(
        circle at 26% 20%,
        rgba(255, 255, 255, 0.72) 0%,
        rgba(255, 255, 255, 0.0) 24%
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
    /* 주변 4개 원에서는 파동/물결 느낌이 나지 않도록 내부 그라데이션은 고정 (애니메이션 제거) */
    z-index: 0.5;
    pointer-events: none;
  }
`;

// 가운데 원 주변을 도는 7개의 블롭을 위한 공통 오빗 컴포넌트
// 각 슬롯별 각도는 React 쪽에서 $angleDeg prop으로 전달한다.
export const Sw1OrbitBlob = styled(BlobBase)`
  top: 50%;
  left: 50%;

  /* 각 슬롯마다 궤도 각도 정의 */
  --orbit-angle: ${({ $angleDeg = 0 }) => `${$angleDeg}deg`};
  /* 각 슬롯별 중심에서의 거리 배율 (radiusFactor) */
  --orbit-radius-factor: ${({ $radiusFactor = 1.55 }) => $radiusFactor};
  --orbit-transform: rotate(var(--orbit-angle))
                     translateX(calc(var(--R) * var(--orbit-radius-factor) * var(--orbit-radius-mod)))
                     rotate(calc(-1 * var(--orbit-angle)));

  /* 깊이 레이어별 기본 scale/blur/opacity 세팅 */
  ${({ $depthLayer = 1 }) => {
    if ($depthLayer === 0) {
      // 가장 앞 (사용자 가까이) → 크고 선명
      return `
        --z-scale-base: 1.15;
        --z-blur-base: 0.35vw;
        --z-opacity-base: 1;
        z-index: 5;
      `;
    }
    if ($depthLayer === 2) {
      // 가장 뒤 → 작고 흐림
      return `
        --z-scale-base: 0.7;
        --z-blur-base: 1.5vw;
        --z-opacity-base: 0.45;
        z-index: 1;
      `;
    }
    // 중간 레이어
    return `
      --z-scale-base: 0.9;
      --z-blur-base: 1.1vw;
      --z-opacity-base: 0.8;
      z-index: 3;
    `;
  }}

  transform: translate(-50%, -50%) var(--orbit-transform)
             scale(var(--z-scale-base));
  opacity: var(--z-opacity-base);

  /* 제공된 디자인 스펙을 반영한 컬러 그라데이션 */
  --blob-bg: radial-gradient(
    84.47% 61.21% at 66.09% 54.37%,
    #FF4D8B 0%,
    #FF8EA6 34.9%,
    #FDFFE1 80.29%,
    #DFE4EA 100%
  );

  background-size: 320% 320%;

  /* 내부 컬러 패럴럭스 + z축 펄스 + 공전 반경 호흡을 동시에 적용
     - zSeed에 따라 duration/딜레이를 달리 줘서 랜덤하게 보이게 함 */
  animation:
    /* 내부 컬러 패럴럭스는 아주 느리게 */
    ${blobInnerParallax} 48s ease-in-out infinite,
    /* z축 펄스도 전체적으로 더 느리게 (기존보다 약 1.5배) */
    ${zPulse} ${({ $zSeed = 0 }) => 16 + Math.round($zSeed * 9)}s ease-in-out infinite,
    /* 공전 반경 호흡: 천천히 안팎으로 미세하게 이동 */
    ${orbitRadiusPulse} ${({ $zSeed = 0 }) => 26 + Math.round($zSeed * 8)}s ease-in-out infinite;
  animation-delay:
    0s,
    ${({ $zSeed = 0 }) => `${Math.round($zSeed * 4)}s`},
    ${({ $zSeed = 0 }) => `${2 + Math.round($zSeed * 5)}s`};

  /* BlobBase에서 정의한 before/after를 오빗 블롭 전용 값으로 살짝 재조정:
     - 바깥 halo는 44px 정도의 블러 느낌
     - 안쪽은 코어 그라데이션을 또렷하게 유지 */
  &::before {
    inset: -1.2vw;
    /* 깊이 레이어에 따라 퍼짐 정도가 달라지도록 블러 강도를 조정 */
    filter: blur(calc(var(--z-blur-base) * 3.2)); /* ≈ 44px 기준에서 가변 */
    opacity: 0.45;
  }

  &::after {
    inset: 0.35vw;
    filter: blur(calc(var(--z-blur-base) * 1.4));
    background:
      radial-gradient(
        84.47% 61.21% at 66.09% 54.37%,
        #FF4D8B 0%,
        #FF8EA6 34.9%,
        #FDFFE1 80.29%,
        #DFE4EA 100%
      );
  }
`;

/* 가운데를 함께 도는 작은 원 3개 (데이터와 무관한 장식용) */
const SmallOrbitDotBase = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* 작은 장식 원은 주변 블롭보다 한 단계 더 작게 조정 */
  width: 8vw;
  height: 8vw;
  border-radius: 50%;
  pointer-events: none;
  /* 주변 블롭(z-index:2)과 중앙 그라데이션(6) 사이에서 또렷하게 보이도록 4로 설정 */
  z-index: 4;
  background: radial-gradient(
    circle at 32% 28%,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 214, 234, 0.65) 40%,
    rgba(255, 214, 234, 0.0) 100%
  );
  filter: blur(0.18vw);
`;

export const Sw1SmallOrbitDot1 = styled(SmallOrbitDotBase)`
  /* 큰 블롭들보다 살짝 안쪽 링에서 회전 - 좌상단 */
  transform: translate(-50%, -50%) rotate(-60deg)
             translateX(calc(var(--R) * 1.2));
`;

export const Sw1SmallOrbitDot2 = styled(SmallOrbitDotBase)`
  /* 우상단 */
  transform: translate(-50%, -50%) rotate(60deg)
             translateX(calc(var(--R) * 1.2));
`;

export const Sw1SmallOrbitDot3 = styled(SmallOrbitDotBase)`
  /* 하단 중앙 */
  transform: translate(-50%, -50%) rotate(180deg)
             translateX(calc(var(--R) * 1.18));
`;
