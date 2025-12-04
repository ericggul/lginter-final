import styled, { keyframes, css } from 'styled-components';
import {
  BlobRotator as SharedBlobRotator,
  ContentRotator as SharedContentRotator,
} from '../shared/rotationStyles';

export const BlobRotator = styled(SharedBlobRotator)`
  /* SW2에서는 블롭이 회전하지 않고 고정된 위치에 머무르도록 애니메이션 제거 */
  animation: none;
  z-index: 0;
  /* 회전 중심은 화면 정중앙(50%, 50%) – 향후 필요 시를 위해 유지 */
  transform-origin: 50% 50%;
`;

export const ContentRotator = styled(SharedContentRotator)`
  /* 텍스트/내용도 함께 회전하지 않도록 별도로 애니메이션 제거 */
  animation: none;
`;

/** 상단 파동(리플) 애니메이션 – SW2 전용
 *  앨범 커버 뒤에서 얇은 흰 링이 생겨서,
 *  점점 커지면서 살짝 위쪽으로 떠오르는 느낌
 */
const topRipple = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -52%) scale(0.6);
    opacity: 0.9; /* 앨범 커버 가장자리를 막 벗어날 즈음에 가장 밝게 보이도록 */
  }
  70% {
    opacity: 0.75; /* 상당히 위까지 올라가도 링이 또렷하게 유지되도록 */
  }
  100% {
    /* 위쪽으로 더 멀리, 더 넓게 퍼지도록 최종 스케일/위치 조정 */
    transform: translate(-50%, -90%) scale(2.6);
    opacity: 0;
  }
`;

export const Root = styled.div`
  /* TV용 풀 화면 캔버스: 스크롤이 생기지 않도록 화면에 고정 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 56.25vw; /* 2160 / 3840 * 100 */
  aspect-ratio: 3840 / 2160;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

/** 화면 상단 쪽에서 퍼져 나가는 파동 레이어 (배경 전용, 상호작용 없음) */
export const TopWaveLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* CenterGlow(2) 위, AlbumCard(4) 아래에서 얇은 링들이 지나가도록 */
  z-index: 3;
  overflow: hidden;
`;

export const TopWaveCircle = styled.div`
  position: absolute;
  /* 앨범 카드와 같은 중심 위치에서 시작 */
  top: 40%;
  left: 50%;
  /* 기본 크기는 앨범 카드보다 약간 작은 원.
     실제 화면에서는 scale 애니메이션으로 크게 확장되면서
     커버 뒤에서 자연스럽게 빠져나오는 느낌이 난다. */
  width: 20vw;
  height: 20vw;
  border-radius: 50%;
  /* 모바일 ListeningOverlay 의 얇은 링 파동을 참고한 순수 흰색 링 */
  background: radial-gradient(
    closest-side,
    rgba(255, 255, 255, 0) 82%,
    rgba(255, 255, 255, 0.98) 86%,
    rgba(255, 255, 255, 0.6) 90%,
    rgba(255, 255, 255, 0.0) 100%
  );
  filter: blur(0.35vw); /* 살짝 더 얇고 선명하게 */
  opacity: 0;
  transform-origin: 50% 45%;
  mix-blend-mode: screen;
  animation: ${topRipple} 9s ease-in-out infinite;

  /* 같은 링 안에서도 위로 갈수록 더 퍼져 보이도록,
     상단 방향으로만 추가 블러/광이 번지는 오버레이 */
  &::before {
    content: '';
    position: absolute;
    inset: -12%;
    border-radius: inherit;
    background: radial-gradient(
      closest-side,
      rgba(255, 255, 255, 0) 70%,
      rgba(255, 255, 255, 0.7) 86%,
      rgba(255, 255, 255, 0.0) 100%
    );
    filter: blur(1.4vw);
    opacity: 0.85;
    transform: translateY(-10%);
    pointer-events: none;
    mix-blend-mode: screen;
  }
  animation-delay: ${({ $delay = 0 }) => `${$delay}s`};
`;

export const Container = styled.div`
  max-width: 15.625vw;
  width: 100%;
`;

export const Panel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(0.520833vw);
  border-radius: 0.651042vw;
  padding: 1.25vw 0.833333vw;
  box-shadow: 0 0.520833vw 1.5625vw rgba(147, 51, 234, 0.15);
  border: 0.026042vw solid rgba(147, 51, 234, 0.1);
`;

export const Title = styled.h1`
  font-size: 1.041667vw;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  margin-bottom: 0.208333vw;
  text-align: center;
`;

export const Subtitle = styled.p`
  color: #9333EA;
  font-size: 0.416667vw;
  opacity: 0.7;
  text-align: center;
  margin-bottom: 0.833333vw;
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
  font-size: clamp(0.651042vw, 3.6vmin, 1.119792vw);
  text-shadow: 0 0.052083vw 0.3125vw rgba(0,0,0,0.08);
  pointer-events: none;
  z-index: 10;
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

/* Full-bleed background image for selected Figma frame */
export const FrameBg = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: ${({ $url }) =>
    $url ? `url(${$url}) center / cover no-repeat` : 'transparent'};
  opacity: 0.8;
  /* 전체 프레임 배경은 가장 아래 레이어 */
  z-index: -1;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: linear-gradient(162.91deg, #FFEBC3 5.4%, #EBFFDF 33.4%, #EDECEB 81.12%);
    transform: rotate(90deg);
    transform-origin: center;
  }
`;

/* 중앙 앨범 카드를 감싸는 SW1 스타일의 핑크 링/그라디언트 글로우 */
export const CenterGlow = styled.div`
  position: absolute;
  /* 더 위쪽에 중심을 두어 앨범 커버 상단 위로 감싸지도록 기본값 조정 */
  top: ${({ $topPercent = 20 }) => `${$topPercent}%`};
  left: 50%;
  /* Figma 스펙에서 살짝 축소 (더 작게). Leva에서 전달된 scale 로 추가 조절 */
  width: ${({ $scale = 1 }) => `calc(100vw * ${2200 * $scale} / 3840)`};
  height: ${({ $scale = 1 }) => `calc(100vw * ${2200 * $scale} / 3840)`};
  transform: translate(-50%, -50%) rotate(-47.8deg);
  border-radius: 50%;
  pointer-events: none;
  z-index: 2; /* FrameBg(0) 위, BlobRotator(1)와 AlbumCard(4)의 중간 레이어 */

  opacity: ${({ $opacity = 0.82 }) => $opacity};

  /* 기본값은 Figma radial-gradient 스펙, Leva에서 전달된 $background가 있으면 우선 사용 */
  background: ${({ $background }) =>
    $background ||
    'radial-gradient(71.1% 71.1% at 43.76% 55.19%, rgba(255, 63, 148, 0.82) 16.35%, rgba(246, 211, 196, 0.82) 56.73%, rgba(151, 222, 248, 0.82) 85.51%)'};

  /* 62.8px 블러를 3840px 기준으로 스케일 ≈ 1.64vw */
  filter: ${({ $blur = 1.64 }) => `blur(${$blur}vw)`};
`;

/* === Mobile blob motion (adapted) ===================================== */
export const CenterImage = styled.img`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(23.567708vw * 1.1);
  height: calc(23.567708vw * 1.1);
  object-fit: cover;
  border-radius: 2.604167vw;
  box-shadow: 0 0.78125vw 2.34375vw rgba(0, 0, 0, 0.28);
  z-index: 3;
`;

export const CaptionWrap = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  /* 앨범 커버와 더 가까워지도록 살짝 위로 당김 */
  top: calc(40% + 18vmin);
  text-align: center;
  pointer-events: none;
  z-index: 6;
`;

export const HeadText = styled.div`
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 600; /* Semi Bold */
  font-size: clamp(0.729167vw, 4.8vmin, 2.5vw);
  color: #111827;
  letter-spacing: 0.02em;
`;

export const SubText = styled.div`
  margin-top: 0.375vw; /* more space between head and sub text */
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400; /* Regular */
  font-size: clamp(0.416667vw, 2.6vmin, 1.458333vw);
  color: #374151;
  letter-spacing: 0.02em;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625vw;
`;

export const Tile = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.390625vw;
  padding: 0.833333vw;
  border: 0.052083vw solid #F3E8FF;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625vw;
  margin-bottom: 0.625vw;
`;

export const ColorBox = styled.div`
  width: 2.083333vw;
  height: 2.083333vw;
  border-radius: 0.390625vw;
  background: ${(p) => p.$color};
  box-shadow: 0 0.208333vw 0.625vw ${(p) => (p.$color ? `${p.$color}80` : '#00000000')};
  border: 0.078125vw solid white;
`;

export const Flex1 = styled.div`
  flex: 1;
`;

export const LabelSmall = styled.div`
  font-size: 0.416667vw;
  color: #9333EA;
  opacity: 0.7;
  margin-bottom: 0.208333vw;
`;

export const ValueLarge = styled.div`
  font-size: 0.625vw;
  font-weight: 700;
  color: #9333EA;
`;

export const AssignedTag = styled.div`
  font-size: 0.375vw;
  color: #EC4899;
  font-weight: 600;
  margin-top: 0.3125vw;
  padding: 0.3125vw;
  background: rgba(236, 72, 153, 0.1);
  border-radius: 0.260417vw;
`;

export const Divider = styled.div`
  border-top: 0.052083vw solid #F3E8FF;
  padding-top: 0.625vw;
`;

export const SongTitle = styled.div`
  font-size: 0.541667vw;
  font-weight: 700;
  color: #9333EA;
  line-height: 1.4;
  margin-bottom: 0.416667vw;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const driftGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* Updated drift animations: Combine translate with scale.
   Previously, size was animated via width/height which doesn't scale content.
   Now we use a separate scale animation on the container to scale everything together.
*/

const interestDrift = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); }
  30%  { transform: translate(calc(-50% + 2.5vw), calc(-50% + 1.2vw)) scale(1.375); } /* 22/16 ≈ 1.375 */
  60%  { transform: translate(calc(-50% - 1.8vw), calc(-50% + 1vw)) scale(0.875); }   /* 14/16 ≈ 0.875 */
  85%  { transform: translate(calc(-50% + 1.4vw), calc(-50% - 1.6vw)) scale(1.125); }  /* 18/16 ≈ 1.125 */
  100% { transform: translate(-50%, -50%) scale(1); }
`;

const wonderDrift = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); }
  35%  { transform: translate(calc(-50% + 2vw), calc(-50% - 1.4vw)) scale(1.375); }    /* 22/16 */
  60%  { transform: translate(calc(-50% + 2.4vw), calc(-50% + 1.5vw)) scale(0.875); }    /* 14/16 */
  85%  { transform: translate(calc(-50% - 1.6vw), calc(-50% + 1.3vw)) scale(1.1875); }   /* 19/16 */
  100% { transform: translate(-50%, -50%) scale(1); }
`;

const happyDrift = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); }
  30%  { transform: translate(calc(-50% + 2.1vw), calc(-50% + 2.6vw)) scale(1.375); }    /* 22/16 */
  60%  { transform: translate(calc(-50% - 2.4vw), calc(-50% + 1.1vw)) scale(0.875); }    /* 14/16 */
  90%  { transform: translate(calc(-50% + 1.4vw), calc(-50% - 2.2vw)) scale(1.156); }    /* 18.5/16 */
  100% { transform: translate(-50%, -50%) scale(1); }
`;

/** SW2 전용: z축이 살아있는 듯한 크기 펄스 모션
 *  depthLayer(0/1/2)에 따라 기본 스케일과 움직임 범위를 다르게 준다.
 */
const frontDepthPulse = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.98); }
  30%  { transform: translate(-50%, -54%) scale(1.32); }
  65%  { transform: translate(-50%, -51.5%) scale(1.15); }
  100% { transform: translate(-50%, -50%) scale(0.98); }
`;

const midDepthPulse = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.9); }
  40%  { transform: translate(-50%, -52%) scale(1.22); }
  85%  { transform: translate(-50%, -49.5%) scale(1.05); }
  100% { transform: translate(-50%, -50%) scale(0.9); }
`;

const backDepthPulse = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.82); }
  55%  { transform: translate(-50%, -48.5%) scale(1.15); }
  100% { transform: translate(-50%, -50%) scale(0.82); }
`;

/* Halo(테두리) 채도/선명도 펄스 – 크기 펄스와 타이밍을 맞춰서,
   커질 때는 더 선명·채도 높게, 작아질 때는 흐릿하게 보이도록 처리 */
const frontHaloPulse = keyframes`
  0%   { opacity: 0.65; filter: blur(1.4vw) saturate(1.0); }
  30%  { opacity: 1.0;  filter: blur(0.7vw) saturate(1.35); }
  65%  { opacity: 0.9;  filter: blur(0.9vw) saturate(1.15); }
  100% { opacity: 0.65; filter: blur(1.4vw) saturate(1.0); }
`;

const midHaloPulse = keyframes`
  0%   { opacity: 0.55; filter: blur(1.5vw) saturate(0.95); }
  40%  { opacity: 0.95; filter: blur(0.9vw) saturate(1.25); }
  85%  { opacity: 0.75; filter: blur(1.15vw) saturate(1.05); }
  100% { opacity: 0.55; filter: blur(1.5vw) saturate(0.95); }
`;

const backHaloPulse = keyframes`
  0%   { opacity: 0.45; filter: blur(1.8vw) saturate(0.9); }
  55%  { opacity: 0.9;  filter: blur(1.1vw) saturate(1.2); }
  100% { opacity: 0.45; filter: blur(1.8vw) saturate(0.9); }
`;

export const LoadingBlock = styled.div`
  text-align: center;
  padding: 0.833333vw;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 0.3125vw;
`;

export const Spinner = styled.div`
  width: 1.041667vw;
  height: 1.041667vw;
  border: 0.078125vw solid #F3E8FF;
  border-top: 0.078125vw solid #9333EA;
  border-radius: 50%;
  margin: 0 auto;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingNote = styled.p`
  color: #9333EA;
  font-size: 0.375vw;
  margin-top: 0.416667vw;
  opacity: 0.7;
`;

export const PlayerWrap = styled.div`
  border-radius: 0.3125vw;
  overflow: hidden;
  box-shadow: 0 0.208333vw 0.625vw rgba(147, 51, 234, 0.15);
`;

export const PlayerNote = styled.p`
  font-size: 0.354167vw;
  color: #9333EA;
  margin-top: 0.208333vw;
  text-align: center;
  opacity: 0.7;
`;

export const SearchBlock = styled.div`
  padding: 0.416667vw;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 0.3125vw;
  text-align: center;
`;

export const SearchTitle = styled.p`
  color: #9333EA;
  font-size: 0.375vw;
  margin-bottom: 0.3125vw;
  opacity: 0.7;
`;

export const SearchLink = styled.a`
  display: inline-block;
  padding: 0.3125vw 0.625vw;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  color: white;
  text-decoration: none;
  border-radius: 0.260417vw;
  font-size: 0.395833vw;
  font-weight: 600;
  box-shadow: 0 0.104167vw 0.3125vw rgba(147, 51, 234, 0.3);
  transition: transform 0.2s;
  &:hover { transform: scale(1.05); }
`;

export const StatusCard = styled.div`
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  border-radius: 0.390625vw;
  padding: 0.625vw;
  text-align: center;
  color: white;
`;

export const StatusCaption = styled.div`
  font-size: 0.416667vw;
  opacity: 0.9;
  margin-bottom: 0.208333vw;
`;

export const StatusText = styled.div`
  font-size: 0.541667vw;
  font-weight: 700;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 1.25vw 0.833333vw;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.390625vw;
  border: 0.052083vw dashed rgba(147, 51, 234, 0.3);
`;

export const EmptyIcon = styled.div`
  font-size: 1.666667vw;
  margin-bottom: 0.416667vw;
  opacity: 0.5;
`;

export const EmptyText = styled.p`
  color: #9333EA;
  font-size: 0.5vw;
  opacity: 0.6;
`;

/* === Compact album card (square) ========================================= */
export const AlbumCard = styled.div`
  --album-size: min(60vmin, 18.5vw);
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--album-size);
  height: var(--album-size);
  border-radius: 1.929167vw;
  background: white;
  box-shadow: 0 0.625vw 1.822917vw rgba(0, 0, 0, 0.18);
  z-index: 4;
  overflow: hidden;
`;

export const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const AlbumPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: white;
`;

/* 공통 SW2 블롭 베이스: SW2 회전 원을 Figma 스펙 느낌으로 단순화한 버전 */
/* 중앙에서 밖으로 퍼지는 링 파동용 keyframes (미니 블롭 전용) */
const miniRingPulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0.0;
  }
  25% {
    opacity: 0.55;
  }
  55% {
    transform: translate(-50%, -50%) scale(1.25);
    opacity: 0.32;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.45);
    opacity: 0.0;
  }
`;

const Sw2BlobBase = styled.div`
  position: absolute;
  /* 중앙 기준 위치만 맞추고, 회전 각도는 halo(::before)에만 적용.
     depthLayer(0: 앞, 1: 중간, 2: 뒤)에 따라 크기 펄스 애니메이션을 다르게 준다. */
  transform: translate(-50%, -50%);

  /**
   * 크기: 백엔드에서 내려오는 blob.size.base 를 그대로 활용하되,
   *      SW1 대비 한 단계 더 작은 미니 블롭 느낌으로 축소
   */
  width: calc(var(--blob-size, 16vw) * 0.45);
  height: calc(var(--blob-size, 16vw) * 0.45);
  border-radius: 50%;
  border: none;
  box-shadow: none;
  overflow: visible;
  background: transparent;
  /* 기본 radial-gradient (Figma 스펙) */
  --blob-bg: radial-gradient(
    /* 원래 디자인의 기본 핑크 → 화이트 그라디언트로 복원 */
    84.47% 61.21% at 66.09% 54.37%,
    #FF4D8B 0%,
    #FF8EA6 34.9%,
    #FDFFE1 80.29%,
    #DFE4EA 100%
  );
  opacity: ${({ $depthLayer = 1 }) =>
    $depthLayer === 0 ? 0.98 : $depthLayer === 1 ? 0.9 : 0.78};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.1vw;
  text-align: center;
  font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: 2.083333vw;
  letter-spacing: 0.01em;
  z-index: ${({ $depthLayer = 1 }) =>
    $depthLayer === 0 ? 5 : $depthLayer === 1 ? 4 : 3};
  will-change: background-position, transform, opacity;
  isolation: isolate;

  /* z축이 살아 움직이는 것처럼 보이는 크기/깊이 펄스 */
  animation: ${({ $depthLayer = 1 }) => {
    if ($depthLayer === 0) {
      return css`${frontDepthPulse} 7s ease-in-out infinite`;
    }
    if ($depthLayer === 1) {
      return css`${midDepthPulse} 9s ease-in-out infinite`;
    }
    return css`${backDepthPulse} 11s ease-in-out infinite`;
  }};

  /* 키워드 텍스트는 항상 선명한 흰색으로 */
  & span {
    position: relative;
    z-index: 1;
    font-size: 1.6vw;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: #ffffff;
    /* SW1과 톤을 맞춘 은은한 bloom 효과 */
    mix-blend-mode: screen;
    text-shadow:
      0 0.10vw 0.25vw rgba(255, 255, 255, 0.95),
      0 0.32vw 0.70vw rgba(255, 192, 220, 0.85),
      0 0.68vw 1.35vw rgba(255, 192, 220, 0.5);
  }

  /* 바깥 halo: 실제 색과 blur는 ::before 에서만 처리해서 텍스트는 선명하게 유지 */
  &::before {
    content: '';
  position: absolute;
    inset: -3.2vw;
    border-radius: inherit;
    background: var(--blob-bg, transparent);
    /* 제공받은 Figma 회전 각도는 halo에만 적용 (내용 텍스트는 회전하지 않도록 분리) */
    transform: rotate(-66.216deg);
    transform-origin: center;
    z-index: 0;
    pointer-events: none;
    will-change: filter, opacity;

    /* depthLayer 에 따라 서로 다른 강도로 채도/블러 펄스 (메인보다 살짝 더 부드럽게) */
    animation: ${({ $depthLayer = 1 }) => {
      if ($depthLayer === 0) {
        return css`${frontHaloPulse} 9s ease-in-out infinite`;
      }
      if ($depthLayer === 1) {
        return css`${midHaloPulse} 11s ease-in-out infinite`;
      }
      return css`${backHaloPulse} 13s ease-in-out infinite`;
    }};
  }

  /* ::after: 중앙에서 밖으로 퍼지는 얇은 링 파동 (메인보다 연하고 부드럽게) */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      closest-side,
      rgba(255, 255, 255, 0.0) 72%,
      rgba(255, 255, 255, 0.45) 84%,
      rgba(255, 255, 255, 0.0) 100%
    );
    transform-origin: center;
    /* 링이 중앙에서 바깥으로 퍼져 나가는 느낌 (조금 더 명확하게 보이도록 속도/강도 조정) */
    animation: ${({ $depthLayer = 1 }) => {
      if ($depthLayer === 0) {
        return css`${miniRingPulse} 8s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`;
      }
      if ($depthLayer === 1) {
        return css`${miniRingPulse} 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`;
      }
      return css`${miniRingPulse} 12s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`;
    }};
  }
`;

export const Sw2InterestBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 18vw);
  left: var(--blob-left, 84vw);
  background-size: 320% 320%;
`;

export const Sw2WonderBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 40vw);
  left: var(--blob-left, 32vw);
  background-size: 320% 320%;
`;

export const Sw2HappyBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 8vw);
  left: var(--blob-left, 18vw);
  background-size: 320% 320%;
`;
