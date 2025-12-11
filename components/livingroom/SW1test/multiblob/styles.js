import styled, { keyframes, css } from "styled-components";
import * as Base from "../../SW1/multiblob/styles";

// SW1 base styles re-use (no wildcard re-export)
export const MotionProps = Base.MotionProps;
export const BlobRotator = styled(Base.BlobRotator)`
  /* SW1test: 전체 궤도 블롭 그룹을 메인 블롭(그라디언트/코어/버스트)보다 위 레이어로 올림 */
  z-index: 8;
`;
export const ContentRotator = Base.ContentRotator;
export const TopStatus = Base.TopStatus;
export const Dots = Base.Dots;
export const Dot = Base.Dot;
export const Stage = Base.Stage;
export const BgFlashOverlay = Base.BgFlashOverlay;
export const BackgroundPulse = Base.BackgroundPulse;
export const Sw1SmallOrbitDot1 = Base.Sw1SmallOrbitDot1;
export const Sw1SmallOrbitDot2 = Base.Sw1SmallOrbitDot2;
export const Sw1SmallOrbitDot3 = Base.Sw1SmallOrbitDot3;
// 배경에 항상 떠다니는 연핑크/옐로우 블롭들은 더 연하고, 레이어 최하단으로 내린다.
export const FreeBlur1 = styled(Base.FreeBlur1)`
  opacity: 0.22;
  filter: blur(1.8vw);
  z-index: 0;
`;
export const FreeBlur2 = styled(Base.FreeBlur2)`
  opacity: 0.22;
  filter: blur(1.8vw);
  z-index: 0;
`;
export const FreeBlur3 = styled(Base.FreeBlur3)`
  opacity: 0.22;
  filter: blur(1.8vw);
  z-index: 0;
`;
export const FreeBlur4 = styled(Base.FreeBlur4)`
  opacity: 0.22;
  filter: blur(1.8vw);
  z-index: 0;
`;
export const DebugCenter = Base.DebugCenter;
export const DebugBottomStart = Base.DebugBottomStart;
export const CenterPulseOnce = Base.CenterPulseOnce;
export const CenterWhiteBurst = Base.CenterWhiteBurst;
export const CenterIndicator = Base.CenterIndicator;
export const CenterSaturationPulse = Base.CenterSaturationPulse;
export const CenterMark = Base.CenterMark;
export const EllipseLayer = Base.EllipseLayer;
export const Ellipse = Base.Ellipse;
export const CenterTextWrap = Base.CenterTextWrap;
export const CenterTemp = Base.CenterTemp;
export const CenterMode = Base.CenterMode;
// 미니 블롭 타이포: tier/size에 따라 스케일링할 수 있도록 래핑
export const MiniTopText = styled(Base.MiniTopText)`
  font-size: calc(0.8em * var(--label-scale, 1));
`;
export const MiniBottomText = styled(Base.MiniBottomText)`
  font-size: calc(0.65em * var(--label-scale, 1));
`;
export const LoadingDots = Base.LoadingDots;

// Root: SW1 기본 Root를 그대로 사용 (줌아웃은 내부 레이어에서만 적용)
export const Root = styled(Base.Root)``;

// 전체 씬(블롭/배경 반응 등)만 살짝 줌아웃시키는 래퍼 레이어
export const SceneScaleLayer = styled.div`
  position: absolute;
  inset: 0;
  transform: scale(var(--scene-scale, 1));
  transform-origin: 50% 50%;
  transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
`;

// ---------- Keyframes (test-only) ----------
export const edgeGlowPulse = keyframes`
  0%   { opacity: 0;   filter: saturate(1.0) brightness(1.0); }
  20%  { opacity: 1.0; filter: saturate(1.5) brightness(1.2); }
  55%  { opacity: .65; filter: saturate(1.3) brightness(1.08); }
  100% { opacity: 0;   filter: saturate(1.0) brightness(1.0); }
`;

export const swirlMix = keyframes`
  0%   { transform: translate(-50%, -50%) rotate(0deg) scale(1); filter: hue-rotate(0deg) saturate(1); }
  50%  { transform: translate(-50%, -50%) rotate(180deg) scale(1.06); filter: hue-rotate(40deg) saturate(1.2); }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); filter: hue-rotate(0deg) saturate(1); }
`;

export const centerBurst = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.95); opacity: .9; }
  40%  { transform: translate(-50%, -50%) scale(1.25); opacity: .75; }
  100% { transform: translate(-50%, -50%) scale(1.45); opacity: 0; }
`;

export const flyInFromAngle = keyframes`
  0%   { opacity: 0; transform: rotate(var(--entry-angle, 0deg)) translate(0, 60vh) rotate(calc(-1 * var(--entry-angle, 0deg))) scale(.92); filter: blur(1.4vw); }
  40%  { opacity: .9; transform: rotate(var(--entry-angle, 0deg)) translate(0, 12vh) rotate(calc(-1 * var(--entry-angle, 0deg))) scale(.98); filter: blur(1vw); }
  100% { opacity: .95; transform: translate(-50%, -50%) scale(1); filter: blur(.8vw); }
`;

export const trailFade = keyframes`
  0%   { opacity: .95; filter: blur(1.6vw); }
  35%  { opacity: .6;  filter: blur(2.3vw); }
  100% { opacity: 0;   filter: blur(3.1vw); }
`;

export const zoomBreath = keyframes`
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.01); }
`;

// Outer orbit arc가 아주 연하게 나타났다 사라지는 루프용
export const outerArcPulse = keyframes`
  0% {
    opacity: 0;
    box-shadow: 0 0 0vw hsla(340, 65%, 98%, 0.0);
  }
  25% {
    opacity: 0.85;
    box-shadow: 0 0 2.6vw hsla(340, 70%, 97%, 0.95);
  }
  60% {
    opacity: 0.55;
    box-shadow: 0 0 1.9vw hsla(340, 60%, 96%, 0.7);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0vw hsla(340, 65%, 98%, 0.0);
  }
`;

// ---------- Overlays / Badges (test-only) ----------
export const EdgeGlowOverlay = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: screen;
  opacity: 0;
  background:
    radial-gradient(80% 60% at 50% -10%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 0%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.65) 70%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 100%),
    radial-gradient(80% 60% at 50% 110%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 0%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.65) 70%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 100%),
    radial-gradient(60% 80% at -10% 50%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 0%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.55) 70%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 100%),
    radial-gradient(60% 80% at 110% 50%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 0%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.55) 70%,
      hsla(var(--edge-h, 340), 80%, 80%, 0.0) 100%);
  animation: ${edgeGlowPulse} 1.6s ease-in-out 1 forwards;
`;

export const BackgroundReactOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  background:
    radial-gradient(80% 80% at 50% 48%,
      hsla(var(--bgreact-h, 340), 32%, 90%, 0.00) 0%,
      hsla(var(--bgreact-h, 340), 32%, 90%, 0.30) 68%,
      hsla(var(--bgreact-h, 340), 32%, 90%, 0.00) 100%);
  transition: opacity 600ms ease;
  &[data-active='true'] { opacity: .4; }
`;

export const OrchestrationBadge = styled.div`
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -160%);
  font-family: Pretendard, Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 600;
  font-size: clamp(0.8vw, 4.2vmin, 2.2vw);
  color: #FFFFFF;
  letter-spacing: 0.04em;
  text-shadow:
    0 0.26vw 0.8vw rgba(0,0,0,.6),
    0 0.52vw 1.6vw rgba(255,255,255,.8);
  pointer-events: none;
  opacity: 0;
  animation: ${keyframes`
    0% { opacity: 0; transform: translate(-50%, -160%) scale(.98); }
    15% { opacity: 1; transform: translate(-50%, -160%) scale(1); }
    85% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -160%) scale(.98); }
  `} 3s ease forwards;
`;

export const CenterBurstWave = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--largestBlobSize, 20vw) * 0.9);
  height: calc(var(--largestBlobSize, 20vw) * 0.9);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 7;
  background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.0) 70%);
  mix-blend-mode: screen;
  animation: ${centerBurst} 1.6s cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;
`;

// Entry blob with angle-based fly-in (to be wired in JSX)
export const Sw1TestEntryBlob = styled(Base.NewEntryBlob)`
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform-origin: center center !important;
  animation: ${flyInFromAngle} 1.6s cubic-bezier(0.19, 1, 0.22, 1) forwards !important;
`;

// Central gradient ellipse with orchestrate swirl
export const Sw1TestGradientEllipse = styled(Base.GradientEllipse)`
  /* SW1 대비 약간 더 작은 링으로 조정 */
  width: calc(var(--view-base) * 1900 / 3840);
  height: calc(var(--view-base) * 1900 / 3840);
  filter: blur(1.1vw);
  /* SW1test에서는 메인 블롭을 궤도 블롭 뒤쪽 레이어로 배치 */
  z-index: 0;
  /* 메인 블롭 테두리를 더 강하게 보이도록, 기존보다 대비를 높인 핑크 그래디언트 적용 */
  background: radial-gradient(
    47.13% 47.13% at 50% 50%,
    #FFFFFF 32%,
    rgba(255, 180, 210, 0.9) 40%,
    rgba(255, 120, 170, 0.95) 48%,
    rgba(255, 150, 190, 0.65) 60%,
    rgba(255, 255, 255, 0.0) 100%
  );
  &[data-orchestrate='true'] {
    animation: ${swirlMix} 3s ease;
  }
`;

// Smaller, brighter inner core
export const Sw1TestCenterInnerCore = styled(Base.CenterInnerCore)`
  width: calc(var(--largestBlobSize) * 0.18);
  height: calc(var(--largestBlobSize) * 0.18);
  filter: blur(0.14vw);
  /* 중앙 코어도 궤도 블롭(최대 z=5)보다 뒤에 오도록 한 단계 낮춤 */
  z-index: 2;
`;

// Top overlay blob: 메인 블롭 핑크 컬러를 살짝 씌워서 아래 블롭/배경에 색이 묻도록 하는 레이어
export const Sw1TestMainOverlayBlob = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--largestBlobSize) * 1.15);
  height: calc(var(--largestBlobSize) * 1.15);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9; /* BlobRotator(8) 위, CenterTextWrap(10) 아래 */
  background: radial-gradient(
    circle at 50% 45%,
    hsla(var(--overlay-h, 340), 96%, 78%, 1.0) 0%,
    hsla(var(--overlay-h, 340), 90%, 72%, 0.9) 32%,
    hsla(var(--overlay-h, 340), 78%, 68%, 0.55) 64%,
    hsla(var(--overlay-h, 340), 72%, 66%, 0.00) 100%
  );
  mix-blend-mode: screen;
  filter: blur(1.2vw);
  opacity: 1.0;
`;

// 빅 블롭이 도는 궤도를 아주 연한 라인/블룸 스트로크로 표시
export const Sw1TestOuterOrbitArc = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  border-radius: 50%;
  /* radiusFactor(outer=2.30)를 반영한 궤도 반지름: 2 * R * factor */
  width: calc(var(--R) * 2 * 2.30);
  height: calc(var(--R) * 2 * 2.30);
  /* 거의 화이트에 가까운 연핑크 라인 */
  border: 0.09vw solid hsla(340, 55%, 97%, 0.3);
  mix-blend-mode: screen;
  opacity: 0;
  z-index: 2; /* 배경 위, 메인 블롭/오빗보다는 한 단계 아래 */
  animation: ${outerArcPulse} 7.4s ease-in-out infinite;
`;

// Center saturation pulse override (behind mini blobs)
export const Sw1TestCenterSaturationPulse = styled(Base.CenterSaturationPulse)`
  z-index: 1;
`;

// Orbit blob override with tier-based saturation and trail
export const Sw1TestOrbitBlob = styled(Base.Sw1OrbitBlob)`
  /* Tier-based color emphasis */
  filter: saturate(var(--tier-sat, 1)) brightness(1);

  /* Size tiers (small/medium/large) */
  width: calc(22vw * var(--tier-size, 1));
  height: calc(22vw * var(--tier-size, 1));

  /* Add lightweight trail using ::before */
  &::before {
    content: '';
    position: absolute;
    inset: 0.2vw;
    border-radius: inherit;
    background: var(--blob-bg, transparent);
    mix-blend-mode: screen;
    /* 항상 남아 있는 잔상 느낌: 애니메이션 없이 고정된 블러로 유지 */
    opacity: var(--trail-opacity, 0.55);
    filter: blur(var(--trail-blur, 1.6vw));
  }

  /* 내부 하이라이트가 항상 중앙을 바라보는 느낌을 위해,
     SW1test에서는 after 레이어만 궤도 각도에 따라 회전시킨다. */
  &::after {
    transform-origin: 50% 50%;
    /* 궤도 각도 + 180deg 방향(센터 쪽)을 향하도록 회전시켜
       밝은 쪽이 항상 중앙을 바라보는 느낌을 주도록 정렬 */
    transform: rotate(calc(180deg + var(--orbit-angle, 0deg)));
  }

  /* Tier별 기본 불투명도 조정: 안쪽일수록 덜 투명 */
  &[data-tier='inner'] {
    --z-opacity-base: 0.9;
  }
  &[data-tier='mid'] {
    --z-opacity-base: 0.75;
    /* mid 블롭에는 메인 컬러 기반의 핑키시 스트로크를 둘러서 테두리를 살짝 강조 */
    box-shadow:
      0 0 0 0.08vw hsla(var(--stroke-h, 340), 80%, 78%, 0.30),
      0 0 0.32vw hsla(var(--stroke-h, 340), 70%, 74%, 0.18);
    /* 스트로크가 블롭 테두리에 딱 붙어 있으면서도 부드럽게 퍼지도록, inset/blur를 줄여 가장자리 근처에 밀착 */
    &::before {
      inset: -0.15vw;
      opacity: 0.22;
      filter: blur(1.4vw);
    }
  }
  &[data-tier='outer'] {
    /* 큰 블롭은 전체적으로 더 또렷하고 핑키쉬하게 보이도록 조정 */
    --z-opacity-base: 1;
    --z-blur-base: 0.6vw;
    /* 빅 블롭만 warm 파트가 더 강하게 보이도록 채도/밝기 보정 */
    filter: saturate(calc(var(--tier-sat, 1) * 1.4)) brightness(1.08);
    /* 빅 블롭의 하이라이트가 중앙을 향하도록 방향 보정 */
    &::after {
      transform: rotate(var(--orbit-angle, 0deg));
    }
    /* 빅 블롭 잔상은 더 강하고 넓게 보이도록 오버라이드 */
    &::before {
      inset: -0.35vw;
      opacity: 0.9;
      filter: blur(2.6vw);
    }
  }

  /* Orchestration burst: 잠시 더 밝고 선명하게 */
  &[data-stage='t4'],
  &[data-stage='t5'] {
    filter: saturate(calc(var(--tier-sat, 1) * 1.15)) brightness(1.06);
  }

  /* Soften durations per tier using CSS vars; fall back to base values */
  &:not([data-stage='t3'][data-new='true']):not([data-stage='t5']) {
    animation-duration:
      var(--parallaxDur, 48s),
      var(--zPulseDur, 18s),
      var(--radiusDur, 28s),
      var(--floatDur, 40s);
  }
`;

// SW1test에서는 화면 전체를 흐리게 만드는 edge glass/blur 필터 제거
export const EdgeGlassLayer = styled(Base.EdgeGlassLayer)`
  background: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 0 !important;
`;

export const EdgeBlurLayer = styled(Base.EdgeBlurLayer)`
  background: none !important;
  opacity: 0 !important;
`;

