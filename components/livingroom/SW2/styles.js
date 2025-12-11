import styled, { keyframes, css } from 'styled-components';
import {
  BlobRotator as SharedBlobRotator,
  ContentRotator as SharedContentRotator,
} from '../shared/rotationStyles';
import { Sw1MiniBlobBase } from '../SW1/multiblob/styles';

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

/**
 * 상단 원형 파동 애니메이션 – Figma "SUNNY SIDE UP" 스타일
 *
 * - 앨범 커버 정중앙에서 시작해, 위쪽으로 부드럽게 퍼져 나가는 원형 파동.
 * - 중간에 멈추는 구간 없이, 처음부터 끝까지 일정하게 흐르는 모션으로 구성.
 */
const topRadialWave = keyframes`
  0% {
    /* 앨범 카드 중심에서 조금만 위로 시작
       - 중앙에 가까울 때는 또렷하게 보이도록 blur 0 유지 */
    transform: translate(-50%, -52%) scale(0.55);
    opacity: 0;
    filter: blur(0vw);
  }
  20% {
    /* 초반에만 서서히 나타난 뒤 바로 최대 밝기 도달 */
    opacity: 0.95;
    filter: blur(0vw);
  }
  70% {
    /* 화면 상단 쪽으로 멀어지면서 살짝 흐려지기 시작 */
    transform: translate(-50%, -72%) scale(1.55);
    opacity: 0.8;
    filter: blur(0.75vw);
  }
  100% {
    /* 더 위쪽에서 크게 퍼지며 사라짐 – 가장자리 근처에서는 경계를 더 부드럽게 */
    transform: translate(-50%, -86%) scale(1.9);
    opacity: 0;
    filter: blur(1.4vw);
  }
`;

export const Root = styled.div`
  /* 화면 비율(16:9)에 고정하지 않고,
     어떤 해상도/창 크기에서도 뷰포트 전체를 자연스럽게 채우도록 변경 */
  position: fixed;
  inset: 0;
  /* SW2 공통 앨범 사이즈 변수: 카드/캡션 위치에서 함께 참조하기 위해 루트에서 정의 */
  --album-size: min(60vmin, 18.5vw);
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 앨범 컬러/배경이 바뀔 때 부드럽게 전환 */
  transition: background-color 800ms ease-in-out;
`;

/** 화면 상단 쪽에서 퍼져 나가는 파동 레이어 (배경 전용, 상호작용 없음) */
export const TopWaveLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* CenterGlow(2) 위, AlbumCard(4) 아래에서 얇은 링들이 지나가도록 */
  z-index: 3;
  overflow: hidden;
  /* 상단 파동 전체를 별도 합성 레이어로 올려서
     필터/블렌드 효과가 화면 전체에 번쩍이는 느낌을 줄이는 데 도움을 준다. */
  backface-visibility: hidden;
  transform: translateZ(0);
`;

export const TopWaveCircle = styled.div`
  position: absolute;
  /* 앨범 카드보다 조금 더 위쪽에서 파동이 시작되도록 조정
     (선형 화이트 링의 중심 높이와 시각적으로 맞추기 위해 50% → 42%) */
  top: 42%;
  left: 50%;
  /* Figma 스펙 기준 비율을 뷰포트 너비에 맞춰 스케일링
     1) width: 1169.201px / 3840px ≈ 30.4vw
     2) width: 1564px    / 3840px ≈ 40.7vw
     3) width: 2833.319px/ 3840px ≈ 73.8vw */
  ${({ $variant = 1 }) => {
    if ($variant === 2) {
      return css`
        width: 40.7vw;
        height: 40.7vw;
        background: radial-gradient(
          62.72% 62.73% at 50% 50%,
          rgba(253, 255, 225, 0.05) 22.43%,
          rgba(210, 226, 244, 0.50) 87.02%,
          #FED9FF 100%
        );
      `;
    }
    if ($variant === 3) {
      return css`
        /* 가장 바깥 큰 원:
           - 살짝 더 작은 반지름으로 줄이고
           - 시작 위치를 약간 위로 올려서
             중간 원과 엑스자로 겹쳐 보이는 구간을 줄인다. */
        width: 70vw;
        height: 70vw;
        top: 40%;
        background: radial-gradient(
          62.46% 62.47% at 50% 50%,
          rgba(217, 217, 217, 0.00) 43.91%,
          #ECF5ED 100%
        );
      `;
    }
    return css`
      width: 30.4vw;
      height: 30.4vw;
      background: radial-gradient(
        51.97% 51.98% at 50% 50%,
        rgba(217, 217, 217, 0.00) 55%,
        #E6D2E4 100%
      );
    `;
  }}
  border-radius: 50%;
  opacity: 0;
  transform-origin: 50% 50%;
  mix-blend-mode: screen;
  /* transform / opacity / filter 애니메이션이 자주 일어나므로
     브라우저가 미리 별도 레이어로 올려둘 수 있게 힌트를 준다. */
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  /* 속도 변화 없이 일정한 파동 흐름을 위해 linear 타이밍 사용
     - duration 은 $duration prop 으로 조정 (기본 12초) */
  animation: ${topRadialWave} ${({ $duration = 12 }) => `${$duration}s`} linear infinite;

  /* 각 파동 인스턴스 간의 시간차를 주어 연속적인 리플 느낌을 만든다. */
  animation-delay: ${({ $delay = 0 }) => `${$delay}s`};
`;

/** 이전 SW2 선형(화이트 링) 파동 애니메이션 복구
 *  - 앨범 커버 바로 위에서 얇은 흰색 링이 위쪽으로 떠오르며 사라지는 모션
 *  - 새로운 원형 그라디언트 파동 위에 오버레이되어, 추가적인 하이라이트 느낌을 줌
 */
const topLinearWave = keyframes`
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

export const TopLinearWaveCircle = styled.div`
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
  /* 속도가 앞뒤에서 멈칫거리지 않고, 일정한 흐름으로 위로 퍼져 나가도록 linear 이징 사용 */
  animation: ${topLinearWave} ${({ $duration = 9 }) => `${$duration}s`} linear infinite;

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
  color: #FFFFFF;
  font-weight: 600;
  letter-spacing: -0.005208vw;
  text-align: center;
  font-size: clamp(0.651042vw, 3.6vmin, 1.119792vw);
  /* TV2/SW2 캡션 계열의 화이트 + 글로우 텍스트 쉐도우 */
  text-shadow:
    0 0.26vw 0.80vw rgba(0, 0, 0, 0.7),
    0 0.52vw 1.60vw rgba(255, 255, 255, 0.85);
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
const frameSatPulseSw2 = keyframes`
  0%   { filter: saturate(1) brightness(1); }
  35%  { filter: saturate(1.45) brightness(1.06); }
  75%  { filter: saturate(1.25) brightness(1.03); }
  100% { filter: saturate(1) brightness(1); }
`;

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

  /* t5: 배경(프레임) 자체의 채도/밝기가 살짝 올라갔다가 원래 톤으로 복귀하는 펄스 */
  ${({ 'data-stage': stage }) =>
    stage === 't5' &&
    css`
      animation: ${frameSatPulseSw2} 2.2s ease-in-out forwards;
    `}
`;

/* t4 시점: 상단 원 하이라이트용 스케일/불빛 펄스 (효과를 더 강하게) */
const centerBloomOnce = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(-47.8deg) scale(1);
    opacity: 0.9;
  }
  35% {
    transform: translate(-50%, -50%) rotate(-47.8deg) scale(1.18);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(-47.8deg) scale(1.04);
    opacity: 0.96;
  }
`;

/* t5 시점: 하이라이트에서 서서히 원래 상태로 돌아가는 모션 (조금 더 밝게 유지) */
const centerRestore = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(-47.8deg) scale(1.08);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(-47.8deg) scale(1);
    opacity: 0.94;
  }
`;

/* 중앙 앨범 카드를 감싸는 SW1 스타일의 핑크 링/그라디언트 글로우 */
export const CenterGlow = styled.div`
  position: absolute;
  /* 더 위쪽에 중심을 두어 앨범 커버 상단 위로 감싸지도록 기본값 조정 */
  top: ${({ $topPercent = 20 }) => `${$topPercent}%`};
  left: 50%;
  /* Figma 스펙 대비 조금 더 크게 시작해서,
     상단으로 퍼져 나가는 작은/중간 원형 파동과의 경계가 시각적으로 겹치지 않도록
     기본 반지름을 살짝 키워 준다. (모션 스펙은 그대로 유지) */
  width: ${({ $scale = 1 }) => `calc(100vw * ${2400 * $scale} / 3840)`};
  height: ${({ $scale = 1 }) => `calc(100vw * ${2400 * $scale} / 3840)`};
  transform: translate(-50%, -50%) rotate(-47.8deg) scale(1);
  transform-origin: center;
  border-radius: 50%;
  pointer-events: none;
  /* 레이어 순서:
     - Blob 들(최대 1) 아래에는 두지 않고
     - TopWaveLayer(3) 보다는 아래, 앨범 카드보다도 아래에 둔다. */
  z-index: 2;

  /* 중앙 원 외곽이 조금 더 또렷하게 보이도록
     기본 투명도를 살짝 높였다. */
  opacity: ${({ $opacity = 0.9 }) => $opacity};

  /* 기본값은 Figma radial-gradient 스펙, Leva에서 전달된 $background가 있으면 우선 사용 */
  background: ${({ $background }) =>
    $background ||
    'radial-gradient(71.1% 71.1% at 43.76% 55.19%, rgba(255, 63, 148, 0.82) 16.35%, rgba(246, 211, 196, 0.82) 56.73%, rgba(151, 222, 248, 0.82) 85.51%)'};

  /* 블러 강도를 약간 줄여 외곽 링이 더 선명하게 보이도록 조정 */
  filter: ${({ $blur = 1.4 }) => `blur(${$blur}vw)`};

  /* 앨범 컬러/CenterGlow 설정이 변경될 때 자연스럽게 보이도록 트랜지션 */
  transition:
    background 900ms ease-in-out,
    filter 900ms ease-in-out,
    opacity 900ms ease-in-out,
    box-shadow 900ms ease-in-out,
    transform 1100ms cubic-bezier(0.22, 1, 0.36, 1);

  /* t4: 상단 원이 한 번 강하게 빛나며 살짝 커졌다가 되돌아오는 모션 */
  ${({ 'data-stage': stage }) =>
    stage === 't4' &&
    css`
      animation: ${centerBloomOnce} 4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      box-shadow:
        0 0 6vw rgba(255, 255, 255, 0.9),
        0 0 12vw rgba(255, 192, 220, 0.7);
    `}

  /* t5: 살짝 더 부드러운 복귀/잔광 모션 */
  ${({ 'data-stage': stage }) =>
    stage === 't5' &&
    css`
      animation: ${centerRestore} 2s ease-in-out forwards;
      box-shadow:
        0 0 5vw rgba(255, 255, 255, 0.7),
        0 0 10vw rgba(255, 192, 220, 0.5);
    `}
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
  /* 앨범 카드를 조금 더 위로 올렸으므로, 텍스트도 함께 위로 당겨
     카드 하단으로부터의 간격을 유지한다. */
  top: calc(46% + (var(--album-size) / 2) + 2vh);
  text-align: center;
  pointer-events: none;
  z-index: 6;
`;

const captionEnter = keyframes`
  0% {
    opacity: 0;
    transform: translateY(0.6vw);
    filter: blur(0.5vw);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

export const HeadText = styled.div`
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 600; /* Semi Bold */
  font-size: clamp(0.729167vw, 4.8vmin, 2.5vw);
  color: #FFFFFF;
  letter-spacing: 0.02em;
  /* TV2 TrackTitle 느낌에 맞춘 글로우 / 섀도우 */
  text-shadow:
    0 0.26vw 0.80vw rgba(0, 0, 0, 0.7),
    0 0.52vw 1.60vw rgba(255, 255, 255, 0.85);
  will-change: opacity, transform, filter;
  ${({ $state }) =>
    $state === 'enter' &&
    css`
      /* 앨범 명이 조금 더 천천히 스윽 올라오도록 duration 을 늘린다 */
      animation: ${captionEnter} 1300ms cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;
    `}
`;

export const SubText = styled.div`
  margin-top: 0.375vw; /* 제목과의 간격 */
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: clamp(0.520833vw, 3.0vmin, 1.8vw);
  color: #FFFFFF;
  letter-spacing: 0.02em;
  /* 제목과 동일 계열의 글로우/섀도우를 사용해 스타일을 맞춘다 */
  text-shadow:
    0 0.22vw 0.72vw rgba(0, 0, 0, 0.7),
    0 0.46vw 1.45vw rgba(255, 255, 255, 0.82);
  line-height: 1.2;
  will-change: opacity, transform, filter;
  ${({ $state }) =>
    $state === 'enter' &&
    css`
      /* 가수 이름도 제목과 비슷한 속도로 부드럽게 등장 */
      animation: ${captionEnter} 1200ms cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;
    `}
`;

/* SW2 중앙 곡명/가수 타이포 – TV2 TrackTitle / Artist 스타일을 축소해서 사용 */
export const SubTitle = styled.div`
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 500; /* TV2 TrackTitle 과 유사한 두께 */
  font-size: clamp(0.520833vw, 3.0vmin, 1.666667vw);
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 0.02em;
  text-shadow:
    0 0.20vw 0.72vw rgba(0, 0, 0, 0.7),
    0 0.42vw 1.36vw rgba(255, 255, 255, 0.82);
`;

export const SubArtist = styled.div`
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400; /* Regular */
  font-size: clamp(0.416667vw, 2.4vmin, 1.458333vw);
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.02em;
  text-shadow:
    0 0.16vw 0.60vw rgba(0, 0, 0, 0.7),
    0 0.36vw 1.22vw rgba(255, 255, 255, 0.78);
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

/* 주변 5개의 원이 화면 안에서 천천히 날아다니는 느낌을 주기 위한 드리프트 경로.
 * - 시작/끝은 항상 중앙(anchor)로 돌아오되,
 * - 중간 구간에서 더 넓은 궤적을 그리며 부드럽게 이동하도록 수정했다.
 */
const interestDrift = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); }
  20%  { transform: translate(calc(-50% + 3.4vw), calc(-50% - 1.6vw)) scale(1.22); }
  45%  { transform: translate(calc(-50% + 1.0vw), calc(-50% + 3.0vw)) scale(0.92); }
  70%  { transform: translate(calc(-50% - 3.0vw), calc(-50% - 0.6vw)) scale(1.18); }
  100% { transform: translate(-50%, -50%) scale(1); }
`;

const wonderDrift = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); }
  25%  { transform: translate(calc(-50% - 3.6vw), calc(-50% + 1.8vw)) scale(1.18); }
  55%  { transform: translate(calc(-50% + 2.8vw), calc(-50% + 3.2vw)) scale(0.9); }
  80%  { transform: translate(calc(-50% + 1.4vw), calc(-50% - 2.4vw)) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
`;

const happyDrift = keyframes`
  0%   { transform: translate(-50%, -50%) scale(1); }
  22%  { transform: translate(calc(-50% + 3.0vw), calc(-50% + 3.4vw)) scale(1.24); }
  50%  { transform: translate(calc(-50% - 3.8vw), calc(-50% + 1.2vw)) scale(0.9); }
  82%  { transform: translate(calc(-50% + 2.0vw), calc(-50% - 2.8vw)) scale(1.16); }
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

/* 새 키워드 등장: 흰 스트로크만 잠시 보였다가 사라지는 오버레이 */
const newKeywordIntro = keyframes`
  0%   { opacity: 0.95; transform: scale(0.96); }
  60%  { opacity: 0.55; transform: scale(1.02); }
  100% { opacity: 0.0;  transform: scale(1.06); }
`;

export const NewKeywordOverlay = styled.div`
  position: absolute;
  inset: -0.1vw;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
  box-shadow: inset 0 0 0 0.14vw rgba(255,255,255,0.95);
  background: radial-gradient(
    circle,
    rgba(255,255,255,0.0) 60%,
    rgba(255,255,255,0.25) 78%,
    rgba(255,255,255,0.0) 92%
  );
  mix-blend-mode: screen;
  filter: blur(0.18vw);
  animation: ${newKeywordIntro} 900ms cubic-bezier(0.22, 1, 0.36, 1) 1 forwards;
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

/* SW2 전용 미니 텍스트 플레이스홀더: '...' 에 가벼운 호흡 애니메이션 */
const ellipsisPulse = keyframes`
  0%, 100% {
    opacity: 0.25;
    transform: translateY(0.12vw);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const MiniEllipsis = styled.span`
  display: inline-block;
  letter-spacing: 0.24em;
  font-weight: 500;
  animation: ${ellipsisPulse} 1.2s ease-in-out infinite;
`;

export const MiniKeywordLine = styled.span`
  display: block;
  font-weight: 600;
  font-size: 0.72vw;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const MiniMusicLine = styled.span`
  display: block;
  margin-top: 0.04vw;
  font-weight: 400;
  font-size: 0.56vw;
  opacity: 0.9;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

/* 미니 블롭 외곽에 아주 연한 파동(halo) 애니메이션 */
const miniHaloPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.22;
  }
  45% {
    transform: scale(1.08);
    opacity: 0.33;
  }
  70% {
    transform: scale(0.97);
    opacity: 0.18;
  }
`;

/* === Compact album card (square) ========================================= */
export const AlbumCard = styled.div`
  --album-size: min(60vmin, 18.5vw);
  position: absolute;
  /* SW1 기본 위치보다 살짝 위로 올려서 상단 파동과의 중심 정렬을 맞춤 */
  top: 46%;
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

const albumImageBlurIn = keyframes`
  0% {
    opacity: 0;
    filter: blur(26px);
    transform: scale(1.04);
  }
  60% {
    opacity: 0.9;
    filter: blur(10px);
    transform: scale(1.01);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
    transform: scale(1);
  }
`;

export const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* 새 앨범 커버가 설정될 때 컨테이너 전체가 강하게 블러리했다가 2초 뒤 선명해지도록 */
  opacity: 0;
  filter: blur(26px);
  transition: opacity 1600ms cubic-bezier(0.22, 1, 0.36, 1);
  animation: ${albumImageBlurIn} 2s ease-out forwards;
  will-change: opacity, filter, transform;
`;

export const AlbumPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: white;
`;

/* ---------------------------
 * Timeline t3/t4/t5 전용 모션
 * -------------------------*/

/* t3: 화면 하단(화면 밖)에서 상단 원(interest 블롭) 위치까지 2초 동안 서서히 이동하는 엔트리 원 */
const entryMoveUp = keyframes`
  0% {
    top: 110%;
    opacity: 0;
    transform: translate(-50%, -40%) scale(0.9);
  }
  20% {
    opacity: 1;
    top: 85%;
  }
  100% {
    top: 40%;
    transform: translate(-50%, -50%) scale(1);
  }
`;

/* t3 전용: 중앙 하단에서 올라오는 엔트리 원에 잔상(트레일) 효과를 주기 위한 halo 펄스
 * - 메인 원의 모션/디자인은 그대로 두고
 * - 이미 존재하는 ::before / ::after 레이어에만 부드러운 스케일·투명도 애니메이션을 얹는다.
 */
const entryTrailInner = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  70% {
    opacity: 0;
    transform: scale(1.08);
  }
  100% {
    opacity: 0;
    transform: scale(1.12);
  }
`;

const entryTrailOuter = keyframes`
  0% {
    opacity: 0.85;
    transform: scale(1);
  }
  70% {
    opacity: 0;
    transform: scale(1.18);
  }
  100% {
    opacity: 0;
    transform: scale(1.24);
  }
`;

/* t4: 상단 근처에 도달한 원이 안쪽으로 말려 들어가며 빛나는 모션 */
const entryCollapse = keyframes`
  0% {
    top: 40%;
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    top: 38%;
    transform: translate(-50%, -50%) scale(0.05);
    opacity: 0;
  }
`;

/* t4: 화면 가장자리 위주로 배경 채도/광량을 강하게 끌어올리는 펄스 */
const bgPulseT4 = keyframes`
  0%   { opacity: 0; transform: scale(1); }
  20%  { opacity: 0.95; transform: scale(1.02); }
  55%  { opacity: 0.65; transform: scale(1.04); }
  100% { opacity: 0; transform: scale(1.0); }
`;

/* t5: 전체 배경이 한 번 더 부드럽게 빛나고 2초 동안 서서히 잦아드는 펄스 */
const bgPulseT5 = keyframes`
  0%   { opacity: 0;   transform: scale(1);    }
  25%  { opacity: 0.9; transform: scale(1.03); }
  100% { opacity: 0;   transform: scale(1.02); }
`;

/* t4/t5: 배경 전체를 감싸는 채도/광량 펄스 오버레이 */
export const BackgroundPulse = styled.div`
  position: absolute;
  inset: -15%;
  border-radius: 50%;
  pointer-events: none;
  /* FrameBg(0) 위, CenterGlow(2)/EntryCircle(3) 아래에서 색감/밝기만 강화 */
  z-index: 1;
  /* 중앙은 상대적으로 투명하게 두고, 상하좌우 가장자리 쪽만
     앨범 컬러 기반 채도/밝기를 올리는 그라데이션 */
  background:
    radial-gradient(
      circle at -10% 50%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 80%)), 0.0) 0%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 80%)), 0.0) 30%,
      hsla(var(--album-h, 340), var(--album-s, 70%), calc(var(--album-l, 78%)), 0.8) 65%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 80%)), 0.0) 100%
    ),
    radial-gradient(
      circle at 110% 50%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 80%)), 0.0) 0%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 80%)), 0.0) 30%,
      hsla(var(--album-h, 340), var(--album-s, 70%), calc(var(--album-l, 78%)), 0.8) 65%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 80%)), 0.0) 100%
    ),
    radial-gradient(
      circle at 50% -10%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 84%)), 0.0) 0%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 84%)), 0.0) 32%,
      hsla(var(--album-h, 340), var(--album-s, 75%), calc(var(--album-l, 82%)), 0.9) 70%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 84%)), 0.0) 100%
    ),
    radial-gradient(
      circle at 50% 110%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 84%)), 0.0) 0%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 84%)), 0.0) 32%,
      hsla(var(--album-h, 340), var(--album-s, 75%), calc(var(--album-l, 82%)), 0.9) 70%,
      hsla(var(--album-h, 340), var(--album-s, 60%), calc(var(--album-l, 84%)), 0.0) 100%
    );
  /* 화면 가장자리 채도/밝기만 강하게 끌어올리기 */
  mix-blend-mode: screen;
  opacity: 0;

  &[data-stage='t4'] {
    animation: ${bgPulseT4} 4s ease-in-out forwards;
    filter: saturate(1.6) brightness(1.1);
  }

  &[data-stage='t5'] {
    animation: ${bgPulseT5} 2s ease-in-out forwards;
    filter: saturate(1.35) brightness(1.05);
  }
`;

/* t5: 중앙 영역의 채도가 높아졌다가 서서히 원래 채도로 돌아가는 펄스 */
const centerSaturationPulseSw2 = keyframes`
  0%   { opacity: 0.0; filter: saturate(1) brightness(1); }
  35%  { opacity: 0.55; filter: saturate(1.6) brightness(1.06); }
  75%  { opacity: 0.28; filter: saturate(1.3) brightness(1.03); }
  100% { opacity: 0.0; filter: saturate(1) brightness(1); }
`;

export const Sw2CenterSaturationPulse = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  /* FrameBg(0)/BackgroundPulse(1) 위, CenterGlow(2) 아래에서 중앙 채도만 살짝 올림 */
  z-index: 2;

  /* 앨범 컬러 기반 중앙 채도 펄스 레이어 */
  background: radial-gradient(
    60% 60% at 50% 45%,
    hsla(var(--album-h, 340), var(--album-s, 80%), calc(var(--album-l, 70%)), 0.00) 0%,
    hsla(var(--album-h, 340), var(--album-s, 80%), calc(var(--album-l, 70%)), 0.00) 32%,
    hsla(var(--album-h, 340), calc(var(--album-s, 86%)), calc(var(--album-l, 72%)), 0.70) 58%,
    hsla(var(--album-h, 340), var(--album-s, 80%), calc(var(--album-l, 78%)), 0.00) 90%
  );

  opacity: 0;
  mix-blend-mode: soft-light;

  &[data-stage='t5'] {
    animation: ${centerSaturationPulseSw2} 2.2s ease-in-out forwards;
  }
`;

/* 공통 SW2 블롭 베이스: SW2 전용 미니 블롭 (이전 버전으로 복원) */
const Sw2BlobBase = styled.div`
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
  will-change: background-position, transform, background;
  isolation: isolate;
  /* 색이 바뀔 때 기존 블롭 위에서 부드럽게 그라디언트만 변경되는 느낌을 위해 */
  transition: background 900ms ease-in-out;
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
  /* 원보다 살짝 큰 레이어에 blur를 적용해서 외곽이 부드럽게 퍼지도록 처리 (halo)
     앨범 컬러와 무관하게 항상 같은 따뜻한 오프화이트 톤을 사용한다. */
  &::before {
    content: '';
    position: absolute;
    inset: -2.2vw;            /* 원보다 약간만 크게 (halo) */
    border-radius: inherit;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.0) 0%,
      rgba(255, 230, 220, 0.85) 55%,
      rgba(255, 245, 240, 0.0) 96%
    );
    filter: blur(2.2vw);
    opacity: 0.4;
    z-index: 0;
    pointer-events: none;
    animation: ${miniHaloPulse} 9s ease-in-out infinite;
  }
  /* 내부 입체감을 위한 그라데이션 원 (가장자리는 마스크로 부드럽게 페이드) */
  &::after {
    content: '';
    position: absolute;
    inset: 0.2vw;             /* halo 안쪽을 채우는 몸통 */
    border-radius: inherit;
    background:
      radial-gradient(
        circle at 50% 38%,
        rgba(255, 255, 255, 0.24) 0%,
        rgba(255, 255, 255, 0.0) 45%
      ),
      radial-gradient(
        circle at 26% 20%,
        rgba(255, 255, 255, 0.72) 0%,
        rgba(255, 255, 255, 0.0) 24%
      ),
      var(--blob-bg, transparent);
    background-size: 320% 320%;
    background-position: 0% 50%;
    filter: blur(0.85vw);
    z-index: 0.5;
    pointer-events: none;
  }
`;

export const Sw2InterestBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 18vw);
  left: var(--blob-left, 84vw);
  background-size: 320% 320%;
  /* 상단 interest 원: 부드럽게 궤도를 돌면서 크기가 바뀌어
     다른 두 원과 자리를 주고받는 듯한 깊이감을 만든다. */
  animation: ${interestDrift} 22s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  /* 중앙 상단 메인 원은 다른 블롭보다 조금 더 선명하게 보이도록
     기본 투명도를 살짝 올려 준다. */
  opacity: 0.95;
`;

export const Sw2WonderBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 40vw);
  left: var(--blob-left, 32vw);
  background-size: 320% 320%;
  /* 좌측 wonder 원: interest / happy 와 타이밍을 어긋나게 해
     서로가 앞뒤로 교차하며 도는 느낌을 강화한다. */
  animation: ${wonderDrift} 26s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-delay: -6s;
`;

export const Sw2HappyBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 8vw);
  left: var(--blob-left, 18vw);
  background-size: 320% 320%;
  /* 우측 happy 원: 세 원 중 가장 긴 주기로 움직여
     전체가 느리게 회전하는 삼각 궤도처럼 보이게 한다. */
  animation: ${happyDrift} 30s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-delay: -12s;
`;

/* 추가 블롭 2개: calm / vivid
 * 기존 3개의 궤도와 위상을 어긋나게 해서
 * 항상 5개의 원이 서로 다른 크기/깊이로 떠 있는 느낌을 만든다.
 */
export const Sw2CalmBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 26vw);
  left: var(--blob-left, 30vw);
  background-size: 320% 320%;
  animation: ${wonderDrift} 24s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-delay: -3s;
`;

export const Sw2VividBox = styled(Sw2BlobBase)`
  top: var(--blob-top, 26vw);
  left: var(--blob-left, 70vw);
  background-size: 320% 320%;
  animation: ${interestDrift} 28s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-delay: -9s;
`;

/* 중앙 하단 → 상단으로 이동하는 엔트리 원 (t3, t4에서만 노출)
 * 디자인은 상단에 있는 SW2 블롭(Sw2InterestBox)과 동일하게, Sw2BlobBase를 재사용한다.
 */
export const EntryCircle = styled(Sw2BlobBase)`
  top: var(--entry-top, 78%);
  left: 50%;
  /* 3D 변환 힌트를 줘서 GPU 합성 레이어로 올려, t3 구간의 강한 블러/밝기 변화에도
     화면 전체가 하얗게 깜빡이지 않도록 안정성을 높인다. */
  transform: translate3d(-50%, -50%, 0);
  /* 앨범 카드(4), 캡션(6)보다 뒤에 위치시키기 위해 z-index를 낮춘다. */
  z-index: 3;
  /* EntryCircle 자체를 하나의 페인트 컨테이너로 만들어
     잔상/halo 가 주변 레이어까지 번져서 영향을 주는 것을 줄인다. */
  contain: paint;
  will-change: transform, opacity;
  backface-visibility: hidden;
  /* 엔트리 전용 모션을 쓰기 위해 기본 depth 펄스 애니메이션은 제거 */
  animation: none;
  /* 상단 interest 블롭보다 더 크게 – 중앙 메인 원처럼 보이도록 스케일 업 */
  width: calc(var(--blob-size, 24vw) * 1.55);
  height: calc(var(--blob-size, 24vw) * 1.55);

  /* 엔트리 블롭은 중앙은 선명하고, 외곽으로 갈수록 부드럽게 블러링되는 그라디언트를 사용한다. */
  background:
    radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.88) 28%,
      rgba(255, 255, 255, 0.52) 55%,
      rgba(255, 255, 255, 0.00) 88%
    ),
    var(--blob-bg, transparent);

  /* 외곽 halo: 바깥쪽으로만 더 크게 퍼지는 블러를 얹어서
     중심은 그대로 두고, 경계가 자연스럽게 흐려지도록 조정.
     Sw2BlobBase 의 conic-gradient / pulse 애니메이션은 사용하지 않기 위해
     background/animation 을 완전히 덮어쓴다. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.0) 58%,
      rgba(255, 255, 255, 0.82) 72%,
      rgba(255, 255, 255, 0.0) 90%
    );
    filter: blur(1.6vw);
    opacity: 1;
    mix-blend-mode: screen;
    pointer-events: none;
    transform: none;
    animation: none;
    will-change: opacity, transform, filter;
    backface-visibility: hidden;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -3.5vw;
    border-radius: inherit;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.0) 40%,
      rgba(255, 255, 255, 0.55) 72%,
      rgba(255, 255, 255, 0.0) 100%
    );
    filter: blur(4vw);
    opacity: 0.85;
    mix-blend-mode: screen;
    pointer-events: none;
    transform: none;
    animation: none;
    will-change: opacity, transform, filter;
    backface-visibility: hidden;
  }

  &[data-stage='t3'] {
    animation: ${entryMoveUp} 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    /* t3 구간에서만, 기존 halo 레이어에 잔상 펄스를 얹어서
       하단에서 상단으로 올라오는 동안 자연스러운 트레일이 남도록 한다. */
    &::before {
      animation: ${entryTrailInner} 1.1s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    }
    &::after {
      animation: ${entryTrailOuter} 1.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    }
  }

  &[data-stage='t4'] {
    animation: ${entryCollapse} 4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
`;

/* t3 전용: 엔트리 서클의 지난 경로에 잔상처럼 남는 트레일 원
 * - EntryCircle 과 동일한 모션(entryMoveUp)을 사용하되
 *   약간의 animation-delay, 더 옅은 불투명도, 강한 blur 를 적용한다.
 * - 여러 개를 서로 다른 delay/blur 로 겹쳐서 실제 잔상이 남는 듯한 느낌을 만든다.
 */
export const EntryCircleTrail = styled(EntryCircle)`
  z-index: 2; /* 메인 EntryCircle(3) 뒤쪽에 위치 */
  pointer-events: none;
  opacity: ${({ $opacity = 0.55 }) => $opacity};
  filter: ${({ $blur = 2.4 }) => `blur(${$blur}vw)`};
  /* 트레일도 transform/opacity/filter 를 계속 변경하므로
     별도 합성 레이어에 올려 번쩍이는 아티팩트를 줄인다. */
  will-change: transform, opacity, filter;
  backface-visibility: hidden;

  &[data-stage='t3'] {
    /* t3 구간에서만, 메인 원보다 약간 뒤에 오도록 딜레이를 준다. */
    animation-delay: ${({ $delay = 0.18 }) => `${$delay}s`};
  }
`;

/* SW2 하단 중앙 오디오 비주얼라이저 (TV2 WaveformIndicator를 재배치한 버전) */
// TV2 WaveformIndicator 그대로 가져와서, SW2는 중앙 하단에만 위치만 변경
export const Sw2Waveform = styled.div`
  position: absolute;
  left: 50%;
  bottom: 7vh;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  /* TV2 인디케이터 가로폭의 1/2 정도로 축소 */
  width: 300px;
  height: 120px;
  z-index: 20;
  pointer-events: none;
`;

export const Sw2WaveformBar = styled.div`
  width: 6px;
  height: ${({ $height }) => $height || 4}px;
  min-height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  transform-origin: bottom;
  transition: height 0.1s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;
