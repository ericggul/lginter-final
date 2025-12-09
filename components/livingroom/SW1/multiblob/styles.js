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
  @property --orbit-radius-amp { syntax: '<number>'; inherits: false; initial-value: 0.14; }
  /* 신규 블롭 등장용 스케일 */
  @property --new-scale { syntax: '<number>'; inherits: false; initial-value: 1; }
  /* 그룹 공전 각도(모든 자식에게 상속되어 역회전 고정에 사용) */
  @property --sw1-rot-angle { syntax: '<angle>'; inherits: true; initial-value: 0deg; }
  /* 자유 회전 블롭 반경 */
  @property --free-r { syntax: '<number>'; inherits: false; initial-value: 1.0; }
  /* 미니 블롭의 화면 좌표계 기준 부유 모션 */
  @property --float-x { syntax: '<number>'; inherits: false; initial-value: 0; }
  @property --float-y { syntax: '<number>'; inherits: false; initial-value: 0; }
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
  height: 100vh;
  min-height: 100vh;
  /* 16:9 기준 비율을 유지하되, 세로가 더 넉넉한 화면에서는 높이를 우선 사용 */
  --view-base: min(100vw, 177.7778vh); /* 16 / 9 * 100 */
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
  height: 100vh;
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

/* T4: 배경 채도/광량 펄스 오버레이 (stage 기반, 화면 가장자리 위주) */
const bgPulse = keyframes`
  0%   { opacity: 0; }
  20%  { opacity: 0.85; }
  48%  { opacity: 0.55; }
  70%  { opacity: 0.78; }
  100% { opacity: 0; }
`;

export const BackgroundPulse = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* EdgeGlass(4) 위, 중앙 그라데이션(6) 아래에서 가장자리 위주로 색감만 강화 */
  z-index: 5;
  /* 중앙은 최대한 투명하게 두고, 상하좌우 가장자리 쪽만 컬러 채도/밝기를 올리는 그라데이션 */
  background:
    radial-gradient(
      circle at -10% 50%,
      hsla(18, 92%, 78%, 0.00) 0%,
      hsla(18, 92%, 78%, 0.00) 30%,
      hsla(18, 92%, 78%, 0.70) 65%,
      hsla(18, 92%, 78%, 0.00) 100%
    ),
    radial-gradient(
      circle at 110% 50%,
      hsla(18, 92%, 78%, 0.00) 0%,
      hsla(18, 92%, 78%, 0.00) 30%,
      hsla(18, 92%, 78%, 0.70) 65%,
      hsla(18, 92%, 78%, 0.00) 100%
    ),
    radial-gradient(
      circle at 50% -10%,
      hsla(190, 72%, 78%, 0.00) 0%,
      hsla(190, 72%, 78%, 0.00) 32%,
      hsla(190, 72%, 78%, 0.70) 70%,
      hsla(190, 72%, 78%, 0.00) 100%
    ),
    radial-gradient(
      circle at 50% 110%,
      hsla(190, 72%, 78%, 0.00) 0%,
      hsla(190, 72%, 78%, 0.00) 32%,
      hsla(190, 72%, 78%, 0.70) 70%,
      hsla(190, 72%, 78%, 0.00) 100%
    );
  /* 화면 가장자리 채도/밝기만 강하게 끌어올리기 */
  mix-blend-mode: screen;
  filter: saturate(1.6) brightness(1.1);
  opacity: 0;
  animation: ${bgPulse} 3.6s ease-in-out infinite;
`;

export const GradientEllipse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* 중앙 화이트 코어 영역을 살짝 더 작게 */
  width: calc(var(--view-base) * 2100 / 3840);
  height: calc(var(--view-base) * 2100 / 3840);
  transform: translate(-50%, -50%) rotate(-90deg);
  transition: transform 1200ms cubic-bezier(0.22, 1, 0.36, 1), filter 600ms ease;
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
  width: calc(var(--view-base) * 2293 / 3840);
  height: calc(var(--view-base) * 2293 / 3840);
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

/* T2 진행 중 표시: 중앙에서 작게 퍼지는 인디케이터 */
const indicatorPulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.0;
    box-shadow: 0 0 0 0 rgba(255,255,255,0.0);
  }
  25% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0.0;
    box-shadow: 0 0 0.35vw 0.10vw rgba(255,255,255,0.75);
  }
`;

export const CenterIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--largestBlobSize) * 0.10);
  height: calc(var(--largestBlobSize) * 0.10);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255,255,255,1.0) 0%,
    rgba(255,255,255,0.85) 45%,
    rgba(255,255,255,0.0) 80%
  );
  mix-blend-mode: screen;
  filter: blur(0.08vw);
  pointer-events: none;
  z-index: 8;
  animation: ${indicatorPulse} 1400ms ease-out infinite;
`;

/* 중앙 이너 블롭(작은 코어)의 호흡 애니메이션 */
const innerCoreBreath = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.98);
    opacity: 0.95;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.04);
    opacity: 1.0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.98);
    opacity: 0.95;
  }
`;

export const CenterInnerCore = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  /* 중앙 작은 코어는 가장 큰 블롭 기준의 약 22% */
  width: calc(var(--largestBlobSize) * 0.22);
  height: calc(var(--largestBlobSize) * 0.22);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 8; /* GradientEllipse(6)/SaturationPulse(7) 위, CenterMark(9) 아래 */
  background: radial-gradient(
    circle at 50% 48%,
    rgba(255,255,255,1.0) 0%,
    rgba(255,255,255,0.85) 42%,
    rgba(255,255,255,0.0) 86%
  );
  filter: blur(0.18vw);
  animation: ${innerCoreBreath} 9s ease-in-out infinite;
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

/* 결정 순간 한 번만 강하게 퍼지는 링 (T3/T4 트리거용) */
export const CenterPulseOnce = styled(CenterPulse)`
  animation: ${centerPulseWave} 1.4s ease-out 1;
  &::before, &::after { display: none; }
`;

/* 완전한 화이트 코어가 분리되어 나오는 버스트 (opacity 1로 시작) */
const whiteBurst = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
  40%  { transform: translate(-50%, -50%) scale(1.18); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.48); opacity: 0; }
`;

export const CenterWhiteBurst = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--largestBlobSize) * 0.86);
  height: calc(var(--largestBlobSize) * 0.86);
  border-radius: 50%;
  background: #FFFFFF;
  filter: blur(0.10vw);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 8; /* 코어 위, 회전 PNG 아래/위는 필요시 조정 */
  animation: ${whiteBurst} 1200ms cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;
`;

export const EllipseLayer = styled.div`
  display: none;
`;

export const Ellipse = styled.div`
  /* Fallback for narrow screens */
  width: min(var(--view-base), 100vw);
  @media (min-width: 39.583333vw) {
    width: min(var(--view-base), calc(100vw - 39.583333vw)); /* leave 19.791667vw on left and right */
    max-width: calc(100vw - 39.583333vw);
  }
  height: calc(var(--view-base) * 9 / 16); /* keep content framed without letterboxing */
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
  width: calc(var(--view-base) * 0.329);
  height: calc(var(--view-base) * 0.329);
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
    transform: translate(-50%, -50%) scale(0.94);
    filter: blur(1.00vw);
    opacity: 0.85;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.08);
    filter: blur(1.60vw);
    opacity: 1.00;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.94);
    filter: blur(1.00vw);
    opacity: 0.85;
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
  filter: blur(1.20vw);
  /* 숨쉬듯이 아주 천천히 커졌다 작아지는 루프 */
  animation: ${centerBreath} 12s ease-in-out infinite;
`;

export const CenterTextWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  /* 텍스트를 회전 PNG 위에 두어도 잘 보이도록 한 단계 위로 올림 */
  z-index: 10;
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
  /* 회전 라인 PNG를 더 강조해서 키움 */
  width: calc(var(--largestBlobSize) * 1.6);
  height: calc(var(--largestBlobSize) * 1.6);
  will-change: transform;
  animation: ${centerMarkSpin} 4s linear infinite;
  pointer-events: none;
  /* 그림자 없이 선 자체의 밝기/대비만 살려서 또렷하게 */
  filter: brightness(1.2) contrast(1.3);
  /* glow 위, 텍스트 바로 아래 레이어에 위치 */
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

/* 공전 반경이 안팎으로 호흡하듯 부드럽게 변화 */
const orbitRadiusPulse = keyframes`
  0%   { --orbit-radius-mod: 1; }
  35%  { --orbit-radius-mod: calc(1 - var(--orbit-radius-amp, 0.14)); }
  70%  { --orbit-radius-mod: calc(1 + (var(--orbit-radius-amp, 0.14) * 0.55)); }
  100% { --orbit-radius-mod: 1; }
`;

/* T5 전용: 중앙 블롭 뒤에서 바깥 궤도로 한 바퀴 그리며 서서히 퍼져 나오는 나선형 모션
   - CSS 변수 대신 transform 자체를 애니메이션해서 실제 이동 궤적이 보이도록 한다. */
const spiralRadiusAppear = keyframes`
  from {
    /* 중앙 코어 바로 뒤, 안쪽 반경(≈0.26)에서 시작 */
    transform:
      translate(-50%, -50%)
      rotate(var(--orbit-angle))
      translateX(calc(var(--R) * var(--orbit-radius-factor) * 0.26))
      rotate(calc(-1 * var(--orbit-angle)))
      scale(calc(var(--z-scale-base) * var(--size-boost, 1) * var(--new-scale, 1)));
    opacity: 0;
  }
  to {
    /* 원래 궤도 반경(1.0)까지 밖으로 퍼져 나감 */
    transform:
      translate(-50%, -50%)
      rotate(var(--orbit-angle))
      translateX(calc(var(--R) * var(--orbit-radius-factor) * 1))
      rotate(calc(-1 * var(--orbit-angle)))
      scale(calc(var(--z-scale-base) * var(--size-boost, 1) * var(--new-scale, 1)));
    opacity: var(--z-opacity-base);
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

/* 항상 흐릿하게 돌아다니는 자유 블롭용 반경 펄스 */
const freeRadiusPulse = keyframes`
  0%   { --free-r: 0.9; }
  40%  { --free-r: 1.3; }
  70%  { --free-r: 1.0; }
  100% { --free-r: 0.9; }
`;

/* 자유 회전(각속도만 다른 4종) */
const freeRotateFast = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;
const freeRotateMed = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(-360deg); }
`;

/* 신규 블롭 팝-인 스케일 (transform 직접 애니메이션 대신 커스텀 프로퍼티 사용) */
const newBlobScale = keyframes`
  0%   { --new-scale: 0.90; }
  100% { --new-scale: 1.00; }
`;

/* T3: 새 블롭이 화면 밖 하단 중앙에서 화면 중앙으로 부드럽게 이동 (4초), 블러 유지 */
const newBlobRiseToOrbit = keyframes`
  0%   { 
    opacity: 0.3 !important;
    filter: blur(1.6vw) !important;
    transform: translate(-50%, calc(100vh + 20vh)) scale(0.9) !important;
  }
  50%  { 
    opacity: 0.72 !important;
    filter: blur(1.0vw) !important;
    transform: translate(-50%, 20vh) scale(0.96) !important;
  }
  100% {
    opacity: 0.9 !important;
    filter: blur(0.8vw) !important;
    transform: translate(-50%, -50%) scale(1) !important;
  }
`;

/* T4: 중앙으로 합류하며 사라지는 모션 */
const mergeToCenter = keyframes`
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) var(--orbit-transform)
               translate(calc(var(--float-x) * 1.0vw), calc(var(--float-y) * 1.0vw))
               scale(calc(var(--z-scale-base) * var(--size-boost, 1) * var(--new-scale, 1)));
  }
  60% { opacity: 0.65; }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.82);
  }
`;

/* 미니 블롭이 화면 좌표계에서 둥둥 떠다니는 자연스러운 부유 모션 */
const floatDrift = keyframes`
  0%   { --float-x:  0.00; --float-y:  0.00; }
  20%  { --float-x:  0.35; --float-y: -0.25; }
  40%  { --float-x: -0.30; --float-y:  0.42; }
  60%  { --float-x:  0.28; --float-y:  0.18; }
  80%  { --float-x: -0.24; --float-y: -0.32; }
  100% { --float-x:  0.00; --float-y:  0.00; }
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

/* 신규 블롭 전용: 동일한 스케일 펄스지만 opacity는 고정 → 알파 튐 방지 */
const zPulseNew = keyframes`
  0%, 100% {
    transform: translate(-50%, -50%) var(--orbit-transform)
               scale(var(--z-scale-base));
    opacity: var(--z-opacity-base);
  }
  40% {
    transform: translate(-50%, -50%) var(--orbit-transform)
               scale(calc(var(--z-scale-base) * 1.2));
    opacity: var(--z-opacity-base);
  }
  70% {
    transform: translate(-50%, -50%) var(--orbit-transform)
               scale(calc(var(--z-scale-base) * 0.9));
    opacity: var(--z-opacity-base);
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

/* 신규 엔트리 블롭: 회전/오빗과 무관하게 화면 기준으로 등장 */
const newEntryRise = keyframes`
  0% {
    opacity: 0;
    top: 100vh;
    transform: translate(-50%, 12vh) scale(0.9);
  }
  30% {
    opacity: 0.85;
    top: 75vh;
    transform: translate(-50%, -50%) scale(0.93);
  }
  100% {
    opacity: 1;
    top: 50vh;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const entryRingGlow = keyframes`
  0% {
    transform: scale(0.98);
    opacity: 0.70;
    filter: blur(1.4vw);
  }
  45% {
    transform: scale(1.10);
    opacity: 1;
    filter: blur(2.3vw);
  }
  100% {
    transform: scale(0.98);
    opacity: 0.70;
    filter: blur(1.4vw);
  }
`;

/* T4: 중앙 합류 이후, 은은하게 퍼지며 사라지는 엔트리 블롭 페이드 아웃 */
const newEntryFadeOut = keyframes`
  0% {
    opacity: 0.9;
    filter: blur(0.8vw);
    transform: translate(-50%, -50%) scale(1);
  }
  45% {
    opacity: 0.8;
    filter: blur(1.1vw);
    transform: translate(-50%, -50%) scale(1.12);
  }
  100% {
    opacity: 0;
    filter: blur(2.1vw);
    transform: translate(-50%, -50%) scale(1.38);
  }
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
    mix-blend-mode: screen;
    /* 약하게 번지는 글로우 느낌 (bloom) */
    text-shadow:
      0 0.10vw 0.25vw rgba(255, 255, 255, 0.9),
      0 0.35vw 0.75vw rgba(255, 193, 218, 0.85),
      0 0.70vw 1.40vw rgba(255, 193, 218, 0.55);
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
  /* stage 기반 당김용 스케일/투명도/블러 보정 */
  --pull-scale: 1;
  --pull-opacity: 1;
  --pull-blur: 1;

  /* 깊이 레이어별 기본 scale/blur/opacity 세팅 */
  ${({ $depthLayer = 1 }) => {
    if ($depthLayer === 0) {
      // 가장 앞 (사용자 가까이) → 크고 선명
      return `
        --z-scale-base: 1.15;
        --z-blur-base: 0.3vw;
        --z-opacity-base: 1;
        z-index: 5;
      `;
    }
    if ($depthLayer === 2) {
      // 가장 뒤 → 작고 흐림
      return `
        --z-scale-base: 0.72;
        --z-blur-base: 1.0vw;
        --z-opacity-base: 0.62;
        z-index: 1;
      `;
    }
    // 중간 레이어
    return `
      --z-scale-base: 0.95;
      --z-blur-base: 0.85vw;
      --z-opacity-base: 0.9;
      z-index: 3;
    `;
  }}

  /* 기본 transform/opacity/transition
     - T3 신규 블롭에는 적용하지 않음
     - T5에서는 별도의 나선형 등장 애니메이션(spiralRadiusAppear)을 사용하므로 제외 */
  &:not([data-stage='t3'][data-new='true']):not([data-stage='t5']) {
    transform: translate(-50%, -50%) var(--orbit-transform)
               translate(calc(var(--float-x) * 1.0vw), calc(var(--float-y) * 1.0vw))
               scale(calc(var(--z-scale-base) * var(--size-boost, 1) * var(--new-scale, 1) * var(--pull-scale)));
    opacity: calc(var(--z-opacity-base) * var(--pull-opacity));
    transition:
      transform 2400ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 2200ms ease,
      filter 2200ms ease;
  }

  /* 제공된 디자인 스펙을 반영한 컬러 그라데이션 */
  --blob-bg: radial-gradient(
    84.47% 61.21% at 66.09% 54.37%,
    hsla(var(--blob-h, 340), var(--blob-s, 100%), var(--blob-l, 70%), 1.0) 0%,
    hsla(var(--blob-h, 340), var(--blob-s, 90%),  calc( min( var(--blob-l, 70%), 90% ) ), 0.95) 34.9%,
    /* 외곽 쪽은 은은한 웜톤(노란 빛)으로 투톤 느낌 복원 */
    hsla(var(--blob-warm-h, 45), var(--blob-warm-s1, 92%), var(--blob-warm-l1, 94%), 0.80) var(--blob-warm-start, 72%),
    hsla(var(--blob-warm-h, 45), var(--blob-warm-s2, 96%), var(--blob-warm-l2, 90%), 1.00) 100%
  );

  background-size: 320% 320%;

  /* 내부 컬러 패럴럭스 + z축 펄스 + 공전 반경 호흡을 동시에 적용
     - zSeed에 따라 duration/딜레이를 달리 줘서 랜덤하게 보이게 함
     - T3에서는 적용 안 함 (T3 규칙에서 오버라이드)
     - T5에서는 spiralRadiusAppear로 transform을 직접 애니메이션하므로 제외 */
  &:not([data-stage='t3'][data-new='true']):not([data-stage='t5']) {
    animation:
      /* 내부 컬러 패럴럭스는 아주 느리게 */
      ${blobInnerParallax} 48s ease-in-out infinite,
      /* z축 펄스도 전체적으로 더 느리게 (기존보다 약 1.5배) */
      ${zPulse} ${({ $zSeed = 0 }) => 16 + Math.round($zSeed * 9)}s ease-in-out infinite,
      /* 공전 반경 호흡: 천천히 안팎으로 미세하게 이동 */
      ${orbitRadiusPulse} ${({ $zSeed = 0 }) => 26 + Math.round($zSeed * 8)}s ease-in-out infinite,
      /* 화면 좌표계 기준 부유 모션 */
      ${floatDrift} ${({ $zSeed = 0 }) => 38 + Math.round($zSeed * 18)}s ease-in-out infinite;
    animation-delay:
      0s,
      ${({ $zSeed = 0 }) => `${Math.round($zSeed * 4)}s`},
      ${({ $zSeed = 0 }) => `${2 + Math.round($zSeed * 5)}s`},
      ${({ $zSeed = 0 }) => `${1 + Math.round($zSeed * 7)}s`};
  }

  /* T3~T4 동안 기존 오빗 블롭은 점점 중앙으로 모였다가 사라지고,
     T5에서 다시 바깥으로 퍼지면서 순차적으로 등장하는 느낌을 준다. */
  &[data-stage='t3']:not([data-new='true']) {
    opacity: calc(var(--z-opacity-base) * 0.6);
  }
  &[data-stage='t4']:not([data-new='true']) {
    --orbit-radius-mod: 0.26;
    --pull-scale: 0.62;
    /* T4에서는 거의 보이지 않도록 완전히 투명하게 */
    --pull-opacity: 0;
    --pull-blur: 1.6;
  }

  /* T5에서 나선형 순차 등장:
     - T4에서 중앙 근처(반경 0.26) + opacity 0 상태로 숨어 있다가
     - 각 블롭 index($order)에 따라 animation-delay를 주어
       중앙 블롭 뒤에서 바깥 궤도까지 한 바퀴 그리며 차례대로 퍼져 나오는 모션 */
  &[data-stage='t5'] {
    --pull-scale: 1;
    --pull-opacity: 1;
    --pull-blur: 1;
    opacity: calc(var(--z-opacity-base) * var(--pull-opacity));

    /* T5에서는 orbitRadiusPulse / zPulse / floatDrift 대신
       transform 자체를 애니메이션하는 spiralRadiusAppear만 사용한다.
       BlobRotator가 계속 회전하고 있기 때문에,
       반경이 커지는 동안 실제 궤도는 나선형으로 보인다. */
    animation:
      ${blobInnerParallax} 48s ease-in-out infinite,
      ${spiralRadiusAppear} 3200ms cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;

    animation-delay:
      0s,
      ${({ $order = 0 }) => `${0.6 * $order}s`};
  }

  /* BlobBase에서 정의한 before/after를 오빗 블롭 전용 값으로 살짝 재조정:
     - 바깥 halo는 44px 정도의 블러 느낌
     - 안쪽은 코어 그라데이션을 또렷하게 유지 */
  &::before {
    inset: -1.2vw;
    /* 깊이 레이어에 따라 퍼짐 정도가 달라지도록 블러 강도를 조정 */
    filter: blur(calc(var(--z-blur-base) * 3.2 * var(--pull-blur))); /* ≈ 44px 기준에서 가변 */
    opacity: 0.45;
    transition: filter 2200ms ease, opacity 2200ms ease;
  }

  /* 신규 블롭은 첫 0.9 -> 1.0로 부드럽게 스케일 인 (T3 제외) */
  &[data-new='true']:not([data-stage='t3']) {
    animation-name: ${blobInnerParallax}, ${zPulseNew}, ${orbitRadiusPulse}, ${newBlobScale};
    animation-duration:
      48s,
      ${({ $zSeed = 0 }) => 16 + Math.round($zSeed * 9)}s,
      ${({ $zSeed = 0 }) => 26 + Math.round($zSeed * 8)}s,
      900ms;
    animation-timing-function:
      ease-in-out,
      ease-in-out,
      ease-in-out,
      cubic-bezier(0.16, 1, 0.3, 1);
    animation-iteration-count:
      infinite,
      infinite,
      infinite,
      1;
    animation-fill-mode:
      none,
      none,
      none,
      forwards;
  }

  /* T3: 새 블롭 입장 (화면 밖 하단 중앙 → 화면 중앙 → 오빗 위치) */
  &[data-stage='t3'][data-new='true'] {
    position: absolute !important;
    left: 50% !important;
    top: calc(100vh + 11vw) !important; /* 블롭 중심이 화면 하단 중앙에 오도록 (블롭 높이 22vw의 절반) */
    transform-origin: center center !important;
    z-index: 6 !important;
    /* 기본 transform 완전히 오버라이드 - 오빗 적용 안 함 */
    transform: rotate(calc(-1 * var(--sw1-rot-angle, 0deg))) translate(-50%, -50%) scale(0.85) !important;
    opacity: 0 !important;
    /* 오빗 변환을 초기에는 무효화 */
    --orbit-transform: translate3d(0, 0, 0) !important;
    --float-x: 0 !important;
    --float-y: 0 !important;
    --orbit-radius-mod: 1 !important;
    --z-scale-base: 1 !important;
    --size-boost: 1 !important;
    --new-scale: 0.85 !important;
    /* 기본 transition도 무효화 */
    transition: none !important;
    /* 기본 animation 완전히 무효화 */
    animation: none !important;
    /* 화면 밖 하단 중앙에서 시작 → 화면 중앙으로 들어온 후 오빗 위치로 (4초 동안 부드럽게) */
    animation: ${newBlobRiseToOrbit} 4s cubic-bezier(0.19, 1, 0.22, 1) 0s 1 forwards !important;
    animation-fill-mode: forwards !important;
    will-change: transform, opacity !important;
  }

  /* T4: 중앙 합류 */
  &[data-stage='t4'][data-new='true'] {
    animation:
      ${blobInnerParallax} 48s ease-in-out infinite,
      ${zPulseNew} ${({ $zSeed = 0 }) => 16 + Math.round($zSeed * 9)}s ease-in-out infinite,
      ${orbitRadiusPulse} ${({ $zSeed = 0 }) => 26 + Math.round($zSeed * 8)}s ease-in-out infinite,
      ${floatDrift} ${({ $zSeed = 0 }) => 38 + Math.round($zSeed * 18)}s ease-in-out infinite,
      ${newBlobScale} 900ms cubic-bezier(0.16, 1, 0.3, 1) 1 forwards,
      ${mergeToCenter} 2s cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;
  }

  &::after {
    inset: 0.35vw;
    filter: blur(calc(var(--z-blur-base) * 1.4 * var(--pull-blur)));
    /* 내부 코어 그라데이션도 HSL 변수 기반으로 */
    background: var(--blob-bg, transparent);
    transition: filter 2200ms ease, opacity 2200ms ease;
  }
`;

/* T4: 새 미니 블롭이 처음 등장할 때의 흰색 본체 + 핑크 스트로크 오버레이 */
const sw1NewFade = keyframes`
  0%   { opacity: 0.0; }
  35%  { opacity: 0.75; }
  100% { opacity: 0.0; }
`;

export const NewBlobOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255,255,255,0.98) 0%,
    rgba(255,255,255,0.96) 52%,
    rgba(255,255,255,0.90) 66%,
    rgba(255,255,255,0.0) 86%
  );
  box-shadow: 0 0 0 0.08vw rgba(245, 106, 148, 0.70), inset 0 0 0 0.08vw rgba(245, 106, 148, 0.62);
  filter: blur(0.10vw);
  mix-blend-mode: screen;
  opacity: 0;
  will-change: opacity;
  animation: ${sw1NewFade} 1400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

/* T3~T4 동안 유지되는 순백 상태 (페이드 없음, 컬러 위에 얹힘) */
export const NewBlobWhite = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255,255,255,1.0) 0%,
    rgba(255,255,255,0.98) 50%,
    rgba(255,255,255,0.92) 66%,
    rgba(255,255,255,0.0) 86%
  );
  box-shadow: 0 0 0 0.10vw rgba(245, 106, 148, 0.92), inset 0 0 0 0.10vw rgba(245, 106, 148, 0.85);
  filter: blur(0.10vw);
  mix-blend-mode: screen;
  opacity: 1;
`;
/* 가운데를 함께 도는 작은 원 3개 (데이터와 무관한 장식용) */
const SmallOrbitDotBase = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  --small-r: 1.2;
  --small-scale: 1;
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
  transform: translate(-50%, -50%)
             rotate(var(--small-angle, 0deg))
             translateX(calc(var(--R) * var(--small-r)))
             scale(var(--small-scale));
  transition:
    transform 2.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 2s ease,
    filter 2s ease;

  /* T4: 중심 뒤로 빨려들어가듯 숨김 */
  &[data-stage='t4'] {
    --small-r: 0.16;
    --small-scale: 0.22;
    opacity: 0;
    filter: blur(1.4vw);
    z-index: 1;
  }

  /* T5: 서서히 다시 밖으로 등장하며 회전 복귀 */
  &[data-stage='t5'] {
    --small-r: 1.2;
    --small-scale: 1;
    opacity: 0.78;
    filter: blur(0.24vw);
    z-index: 4;
    /* 작은 원들도 꽤 느리게 바깥으로 퍼져 나오도록 */
    transition-duration: 3.2s, 2.6s, 2.6s;
  }
`;

export const Sw1SmallOrbitDot1 = styled(SmallOrbitDotBase)`
  /* 큰 블롭들보다 살짝 안쪽 링에서 회전 - 좌상단 */
  --small-angle: -60deg;
  /* T5: 가장 먼저 등장 */
  &[data-stage='t5'] {
    transition-delay: 0.0s;
  }
`;

export const Sw1SmallOrbitDot2 = styled(SmallOrbitDotBase)`
  /* 우상단 */
  --small-angle: 60deg;
  /* T5: 두 번째로 등장 (약간 느리게) */
  &[data-stage='t5'] {
    transition-delay: 0.7s;
  }
`;

export const Sw1SmallOrbitDot3 = styled(SmallOrbitDotBase)`
  /* 하단 중앙 */
  --small-angle: 180deg;
  --small-r: 1.18;
  /* T5: 세 번째로 등장 (가장 늦게) */
  &[data-stage='t5'] {
    transition-delay: 1.4s;
  }
`;
/* Read-only display for center glow colors in RGB */
export const ColorDebug = styled.div`
  position: absolute;
  left: 2vw;
  bottom: 2vw;
  padding: 0.35vw 0.6vw;
  border-radius: 0.3vw;
  background: rgba(255, 255, 255, 0.72);
  color: #0F172A;
  font-size: 0.52vw;
  line-height: 1.4;
  letter-spacing: 0.01em;
  box-shadow: 0 0.25vw 0.8vw rgba(0,0,0,0.08);
  pointer-events: none;
  z-index: 11;
`;


/* ===========================
   항상 흐릿하게 돌아다니는 자유 블롭 4개
   =========================== */
const FreeBlurBase = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16vw;
  height: 16vw;
  border-radius: 50%;
  pointer-events: none;
  /* 매우 흐릿하고 은은한 존재감 */
  background: radial-gradient(
    circle at 50% 40%,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 187, 216, 0.45) 40%,
    rgba(255, 187, 216, 0.00) 82%
  );
  filter: blur(2.4vw);
  opacity: 0.55;
  mix-blend-mode: screen;
  z-index: 2;
  transition: opacity 2.4s ease-in-out;

  /* T4: 중앙 집중 연출을 위해 자유 블롭은 잠시 완전히 숨김 */
  &[data-stage='t4'] {
    opacity: 0;
  }
`;

/* transform-chain: 중심 기준 회전 → 반경 이동(펄스) */
const freeTransform = `
  translate(-50%, -50%)
  rotate(var(--free-angle, 0deg))
  translateX(calc(var(--R) * var(--free-r)))
`;

export const FreeBlur1 = styled(FreeBlurBase)`
  --free-angle: -30deg;
  animation:
    ${freeRotateFast} 36s linear infinite,
    ${freeRadiusPulse} 9s ease-in-out infinite;
  transform: ${freeTransform};
`;
export const FreeBlur2 = styled(FreeBlurBase)`
  --free-angle: 60deg;
  animation:
    ${freeRotateMed} 44s linear infinite,
    ${freeRadiusPulse} 12s ease-in-out infinite;
  transform: ${freeTransform};
`;
export const FreeBlur3 = styled(FreeBlurBase)`
  --free-angle: 150deg;
  animation:
    ${freeRotateFast} 52s linear infinite,
    ${freeRadiusPulse} 10s ease-in-out infinite;
  transform: ${freeTransform};
`;
export const FreeBlur4 = styled(FreeBlurBase)`
  --free-angle: -140deg;
  animation:
    ${freeRotateMed} 40s linear infinite,
    ${freeRadiusPulse} 11s ease-in-out infinite;
  transform: ${freeTransform};
`;

/* 회전/오빗과 독립적으로 등장하는 신규 엔트리 블롭 */
export const NewEntryBlob = styled.div`
  position: fixed;
  left: 50%;
  top: 100vh; /* 화면 하단 기준 */
  width: 22vw;
  height: 22vw;
  transform-origin: center center;
  border-radius: 50%;
  pointer-events: none;
  z-index: 8;
  isolation: isolate; /* 텍스트는 선명 유지 */
  /* 초기 상태: 화면 밖 하단 중앙 (키프레임 0%와 동일) */
  opacity: 0;
  transform: translate(-50%, 12vh) scale(0.9);
  /* 본체: 중심 선명, 외곽은 알파를 낮춰 자연 감쇠 */
  background: radial-gradient(
    84.47% 61.21% at 66.09% 54.37%,
    hsla(var(--blob-h, 340), var(--blob-s, 100%), var(--blob-l, 70%), 0.78) 0%,
    hsla(var(--blob-h, 340), var(--blob-s, 90%), calc(min(var(--blob-l, 70%), 90%)), 0.54) 40%,
    hsla(var(--blob-warm-h, 45), var(--blob-warm-s1, 92%), var(--blob-warm-l1, 94%), 0.38) 70%,
    hsla(var(--blob-warm-h, 45), var(--blob-warm-s2, 96%), var(--blob-warm-l2, 90%), 0.14) 100%
  );
  /* 단일 퍼짐 블러 레이어 (텍스트에 영향 없음) */
  box-shadow:
    0 0 7vw 2vw hsla(var(--blob-h, 340), var(--blob-s, 90%), var(--blob-l, 70%), 0.32),
    0 0 10vw 4vw hsla(var(--blob-warm-h, 45), var(--blob-warm-s1, 92%), var(--blob-warm-l1, 94%), 0.24);
  /* 얇은 발광 링: 중심은 비우고 외곽에만 빛을 얹는다 */
  &::after {
    content: '';
    position: absolute;
    inset: 0.35vw;
    border-radius: 50%;
    background: radial-gradient(
      64% 64% at 50% 50%,
      rgba(255, 255, 255, 0.00) 54%,
      rgba(255, 255, 255, 0.98) 72%,
      rgba(255, 255, 255, 0.00) 100%
    );
    box-shadow:
      0 0 4.8vw 2.0vw rgba(255, 255, 255, 0.62),
      0 0 8.4vw 4.4vw rgba(255, 255, 255, 0.46),
      0 0 12vw 6vw rgba(255, 255, 255, 0.32);
    filter: blur(2vw);
    opacity: 1;
    pointer-events: none;
    mix-blend-mode: screen;
    transform-origin: center;
    animation: ${entryRingGlow} 2.2s ease-in-out infinite;
    will-change: transform, filter, opacity, box-shadow;
  }
  /* 외곽에 한 겹 더 깔리는 연무형 빛 */
  &::before {
    content: '';
    position: absolute;
    inset: -2.2vw;
    border-radius: 50%;
    background: radial-gradient(
      72% 72% at 50% 50%,
      rgba(255, 255, 255, 0.00) 40%,
      rgba(255, 255, 255, 0.55) 70%,
      rgba(255, 255, 255, 0.00) 100%
    );
    box-shadow:
      0 0 8vw 4vw rgba(255, 255, 255, 0.32);
    filter: blur(3.6vw);
    opacity: 0.88;
    mix-blend-mode: screen;
    animation: ${entryRingGlow} 2.8s ease-in-out infinite;
    will-change: transform, filter, opacity;
  }
  animation: ${newEntryRise} 4s cubic-bezier(0.19, 1, 0.22, 1) forwards;

  /* T4: 중앙에서 잠시 머물렀다가, 은은하게 퍼지며 투명해지면서 사라지는 모션 */
  &[data-stage='t4'] {
    /* T3의 up-rise 애니메이션을 멈추고, 페이드 아웃 전용 애니메이션만 적용 */
    animation: ${newEntryFadeOut} 2.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s 1 forwards !important;
    top: 50vh !important;
    transform: translate(-50%, -50%) scale(1) !important;
    will-change: transform, opacity, filter !important;
  }
  &[data-stage='t5'] {
    display: none !important;
  }
`;

/* Debug markers: center and intended entry line */
export const DebugCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.75);
  box-shadow: 0 0 12px rgba(255, 0, 0, 0.35);
  z-index: 20;
  pointer-events: none;
`;

export const DebugBottomStart = styled.div`
  position: absolute;
  left: 50%;
  bottom: 6vh;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 100, 255, 0.75);
  box-shadow: 0 0 12px rgba(0, 100, 255, 0.35);
  z-index: 20;
  pointer-events: none;
  &::after {
    content: 'entry target';
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: rgba(0, 60, 150, 0.8);
    white-space: nowrap;
    text-shadow: 0 1px 3px rgba(255, 255, 255, 0.5);
  }
`;

