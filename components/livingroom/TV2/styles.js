import styled, { keyframes } from 'styled-components';

export const Viewport = styled.div`
  position: fixed; inset: 0;
  overflow: hidden;
  background: #FFFFFF;
  touch-action: none;
`;

export const Scaler = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3840px;
  height: 2160px;
  transform-origin: center center;
  will-change: transform;
`;

export const Root = styled.div`
  position: relative;
  width: 3840px;
  height: 2160px;
  overflow: hidden;
  background: #FFFFFF;
  font-family: 'Inter', 'Pretendard', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
`;

const headerGradientSlide = keyframes`
  0%   { background-position: 0% 0; }
  100% { background-position: 100% 0; }
`;

export const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0;
  /* 상단 파란 박스를 조금 더 두껍게 */
  height: 324px; min-height: 96px;
  display: flex; align-items: center; gap: 76.8px; padding: 0 115.2px;
  color: #fff;
  /* 좌→우로 흐르는 그라데이션 모션 */
  background: linear-gradient(90deg,
    ${props => props.$gradientStart || 'rgba(102,157,255,1)'} 0%,
    ${props => props.$gradientMid || 'rgba(143,168,224,1)'} ${props => props.$gradientMidPos || 45}%,
    ${props => props.$gradientEnd || 'rgba(196,201,206,1)'} 100%);
  background-size: 200% 100%;
  animation: ${headerGradientSlide} 8s ease-in-out infinite alternate;
  /* Removed will-change to prevent potential flickering */
  box-shadow: 0 10px 40px rgba(0,0,0,0.08) inset;
  z-index: 3;
  /* 하단 경계 블러 효과 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: ${props => props.$edgeBlurWidth || 20}px;
    background: linear-gradient(90deg,
      ${props => props.$gradientStart || 'rgba(102,157,255,1)'} 0%,
      ${props => props.$gradientMid || 'rgba(143,168,224,1)'} ${props => props.$gradientMidPos || 45}%,
      ${props => props.$gradientEnd || 'rgba(196,201,206,1)'} 100%);
    filter: blur(${props => props.$edgeBlurAmount || 15}px);
    pointer-events: none;
    z-index: 4;
  }
`;

export const HeaderIcon = styled.div`
  /* 아이콘 크기를 이전/현재 값의 중간 정도로 설정 */
  width: 180px;
  height: 180px;
  min-width: 180px;
  border-radius: 50%;
  display: grid; place-items: center;
  color: #fff;
  svg {
    width: 70%;
    height: 70%;
    filter:
      drop-shadow(0 0 ${props => props.$shadowBlur || 2}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 1}px ${props => props.$shadowBlur || 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'});
  }
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    display: block;
    filter:
      drop-shadow(0 0 ${props => props.$shadowBlur || 2}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 1}px ${props => props.$shadowBlur || 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'});
  }
`;

export const HeaderTitle = styled.div`
  /* 텍스트 크기도 중간 수준으로 조정 */
  font-size: 85px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: rgba(255,255,255,1);
  text-shadow: 
    0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 4}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => (props.$shadowBlur || 4) * 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.3)'};
`;

export const Content = styled.div`
  /* 헤더 높이에 맞춰 바로 아래에서 시작 */
  position: absolute; inset: 324px 0 0 0;
  /* 우측(원 영역)을 기존보다 약간만 넓게 유지 */
  display: grid; grid-template-columns: 2.7fr 2.3fr;
  height: calc(100% - 324px);
`;

export const LeftPanel = styled.div`
  position: relative;
  overflow: hidden;
  padding: 86.4px 153.6px;
  /* Base gradient and sweeping band per spec */
  /* 앨범 카드 위치 (조금 더 오른쪽 & 상단으로) */
  --album-x: 52%;
  --album-y: 46%;
  /* starting azimuth for angular sweep – 약간만 회전해서
     하얀 영역 경계가 거의 수평에 가깝게 보이도록 조정 */
  --sweep-start: 90deg;
  background: ${props => props.$color5 || '#F6E4CD'}; /* fallback */
  color: #fff;
  /* 회전하는 원형 그라데이션 레이어 (시계방향) */
  &::before{
    content:''; position:absolute;
    /* Fill whole panel including padding area */
    top: -480.4px; bottom: -480.4px; left: -480.6px; right: -480.6px;
    background: conic-gradient(from 90deg at 50.34% 56.64%, 
      ${props => props.$color1 || '#A15C2E'} ${props => props.$pos1 || 0}deg, 
      ${props => props.$color2 || '#F5813F'} ${props => props.$pos2 || 74.42}deg, 
      ${props => props.$color3 || '#F5813F'} ${props => props.$pos3 || 114.23}deg, 
      ${props => props.$color4 || '#AEAEC5'} ${props => props.$pos4 || 252}deg, 
      ${props => props.$color5 || '#F6E4CD'} 360deg);
    transform-origin: 50% 50%;
    transform: matrix(1, 0, 0, -1, 0, 0) rotate(0deg);
    animation: conicTurn 28s linear infinite;
    filter: blur(${props => props.$blur || 30}px);
    will-change: transform, filter;
    pointer-events: none;
    z-index: 0;
    transition: opacity 1.5s ease-in-out;
    opacity: 1;
  }
  @keyframes conicTurn{
    from{ transform: matrix(1, 0, 0, -1, 0, 0) rotate(0deg); }
    to  { transform: matrix(1, 0, 0, -1, 0, 0) rotate(360deg); }
  }
  /* 오른쪽 경계 블러 효과를 위한 wrapper */
  &::after{
    /* soft horizontal blur band near the bottom like the mock */
    content:''; position:absolute; left:8%; right:6%; bottom:7%;
    height: 345.6px; border-radius: 24px;
    filter: blur(18px); opacity:.25;
    background: linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.25), rgba(255,255,255,0.0));
    pointer-events: none;
    z-index: 1;
  }
`;

export const LeftPanelRightEdge = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: ${props => props.$blurWidth || 20}px;
  background: linear-gradient(180deg, 
    ${props => {
      const hex = props.$color1 || '#A15C2E';
      const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (rgb) {
        return `rgba(${parseInt(rgb[1], 16)},${parseInt(rgb[2], 16)},${parseInt(rgb[3], 16)},0.8)`;
      }
      return 'rgba(166,92,46,0.8)';
    }} 0%,
    ${props => {
      const hex = props.$color2 || '#F5813F';
      const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (rgb) {
        return `rgba(${parseInt(rgb[1], 16)},${parseInt(rgb[2], 16)},${parseInt(rgb[3], 16)},0.8)`;
      }
      return 'rgba(245,129,63,0.8)';
    }} 50%,
    ${props => {
      const hex = props.$color4 || '#AEAEC5';
      const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (rgb) {
        return `rgba(${parseInt(rgb[1], 16)},${parseInt(rgb[2], 16)},${parseInt(rgb[3], 16)},0.8)`;
      }
      return 'rgba(174,174,197,0.8)';
    }} 100%);
  filter: blur(${props => props.$blurAmount || 15}px);
  pointer-events: none;
  z-index: 2;
  transition: opacity 1.5s ease-in-out;
  opacity: 1;
`;

export const LeftSweep = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  z-index: 0; /* keep below content */
  transform-origin: 56% 46%;
  background:
    conic-gradient(from 0deg at 56% 46%,
      rgba(255,255,255,0.60) 0deg,
      rgba(255,255,255,0.28) 16deg,
      rgba(255,255,255,0.00) 26deg 360deg);
  filter: blur(8px);
  mix-blend-mode: normal;
  animation: spin 8s linear infinite;
  /* moving bright tip */
  &::after{
    content:''; position:absolute;
    left: 56%; top: 46%;
    width: 604.8px; height: 1px; /* invisible guide for transform */
    transform-origin: 0 50%;
    transform: rotate(0deg);
    /* the tip is a circle moved to the end of the guide using translateX */
    box-shadow: none;
  }
  &::before{
    content:''; position:absolute;
    left: 56%; top: 46%;
    width: 0; height: 0;
    transform-origin: 0 50%;
    transform: rotate(0deg) translateX(604.8px);
    border-radius: 50%;
    box-shadow:
      0 0 30px 14px rgba(255,255,255,0.28),
      0 0 80px 36px rgba(255,255,255,0.18);
  }
  @keyframes spin{
    from{ transform: rotate(0deg); }
    to  { transform: rotate(360deg); }
  }
`;

export const LeftSweepTrail = styled(LeftSweep)`
  background:
    conic-gradient(from 0deg at 56% 46%,
      rgba(255,255,255,0.35) 0deg,
      rgba(255,255,255,0.00) 28deg 360deg);
  filter: blur(16px);
  opacity: .6;
  animation: spin 8s linear infinite;
  animation-delay: -0.25s;
`;

export const LeftSweepTrail2 = styled(LeftSweep)`
  background:
    conic-gradient(from 0deg at 56% 46%,
      rgba(255,255,255,0.22) 0deg,
      rgba(255,255,255,0.00) 40deg 360deg);
  filter: blur(24px);
  opacity: .45;
  animation: spin 8s linear infinite;
  animation-delay: -0.5s;
`;

export const LeftSweepWide = styled(LeftSweep)`
  background:
    conic-gradient(from 0deg at 56% 46%,
      rgba(255,255,255,0.40) 0deg,
      rgba(255,255,255,0.16) 42deg,
      rgba(255,255,255,0.00) 70deg 360deg);
  filter: blur(28px);
  opacity: .7;
  animation: spin 8s linear infinite;
  animation-delay: -0.12s;
`;

export const MusicRow = styled.div`
  position: absolute;
  /* 상단 조명 아이콘/텍스트의 좌측 패딩(3vw)에 맞춰 정렬 */
  left: 115.2px;
  /* 사각형과 세로 중심을 맞추도록 살짝 위쪽으로 조정 */
  top: calc(var(--album-y) - 760px);
  display: flex; align-items: center; gap: 60px;
  /* 장르 텍스트도 중간 수준으로 */
  font-size: 85px;
  font-weight: 400;
  color: rgba(255,255,255,1);
  text-shadow: 
    0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 4}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => (props.$shadowBlur || 4) * 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.3)'};
  z-index: 10;
`;

export const MusicIcon = styled.div`
  width: 180px;
  height: 180px;
  display: grid; place-items: center;
  /* 음악 아이콘도 중간 크기로 */
  svg { 
    width: 90%; 
    height: 90%; 
    color: #fff; 
    filter: 
      drop-shadow(0 0 ${props => props.$shadowBlur || 2}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 1}px ${props => props.$shadowBlur || 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'});
  }
  img { 
    width: 90%; 
    height: 90%; 
    object-fit: contain; 
    display: block; 
    filter: 
      drop-shadow(0 0 ${props => props.$shadowBlur || 2}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 1}px ${props => props.$shadowBlur || 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'});
  }
`;

const spinSweep = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const SweepTrail = styled.div`
  position: absolute; inset: -50%; pointer-events: none;
  transform-origin: 50% 50%;
  z-index: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%);
  filter: blur(40px);
  mix-blend-mode: screen;
  animation: ${spinSweep} 12s linear infinite;
`;

export const SweepCore = styled(SweepTrail)`
  background: linear-gradient(90deg, rgba(255,255,255,0) 49%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 51%);
  filter: blur(12px);
  opacity: .95;
  animation: ${spinSweep} 12s linear infinite;
`;

export const AngularSweep = styled.div`
  display: none;
`;

export const AngularSharp = styled.div`
  position: absolute; inset: -35%; pointer-events: none;
  transform-origin: 50% 50%;
  z-index: 1;
  background:F5813F;
  /* Conic mask creates a crisp wedge (no blur) that rotates with the element */
  -webkit-mask-image: conic-gradient(from var(--sweep-start) at 56% 46%,
    rgba(0,0,0,0) 0deg,
    rgba(0,0,0,1) 8deg,
    rgba(0,0,0,1) 18deg,
    rgba(0,0,0,0) 22deg 360deg);
  mask-image: conic-gradient(from var(--sweep-start) at 56% 46%,
    rgba(0,0,0,0) 0deg,
    rgba(0,0,0,1) 8deg,
    rgba(0,0,0,1) 18deg,
    rgba(0,0,0,0) 22deg 360deg);
  mix-blend-mode: screen;
  animation: none;
  opacity: .85;
`;

export const AlbumCard = styled.div`
  position: absolute; left: var(--album-x); top: var(--album-y);
  transform: translate(-50%, -50%);
  /* 더 작게 줄여서 텍스트와 균형 맞춤 */
  width: 640px; aspect-ratio: 1 / 1; border-radius: 90px;
  background: radial-gradient(120% 120% at 35% 25%, #c7e3ff 0%, #c9d2e8 40%, #f7efe8 100%);
  box-shadow:
    0 20px 50px rgba(0,0,0,0.25),
    inset 0 -8px 30px rgba(255,255,255,0.55),
    inset 0 12px 24px rgba(255,255,255,0.35);
  overflow: hidden;
  display: grid; place-items: center;
  z-index: 5;
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
  background: radial-gradient(120% 120% at 50% 45%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 38%, rgba(255,255,255,0.36) 100%);
  box-shadow:
    inset 0 0 60px rgba(255,255,255,0.75),
    0 0 80px rgba(255,255,255,0.35);
  filter: drop-shadow(0 14px 32px rgba(0,0,0,0.12));
  position: relative;
  overflow: hidden;
`;

// 앨범 커버 로딩 중 빛나는 효과
const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
`;

export const AlbumGlow = styled.div`
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.3) 40%,
    transparent 70%
  );
  animation: ${glowPulse} 1.5s ease-in-out infinite;
  pointer-events: none;
`;

const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(32px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const AlbumVisual = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  animation: ${fadeSlideUp} 0.8s ease;
  will-change: opacity, transform;
  position: relative;
  z-index: 1;
`;

const albumBgFade = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

export const AlbumBg = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: ${props => props.$bg};
  animation: ${albumBgFade} 0.8s ease;
  will-change: opacity;
  pointer-events: none;
  z-index: 0;
`;

// 텍스트 글로우 펄스 애니메이션 (AlbumGlow와 구분)
const textGlowPulse = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 24px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.6));
  }
`;

export const FadeSlideText = styled.div`
  animation: ${fadeSlideUp} 0.6s ease;
  will-change: opacity, transform;
  ${props => props.$shouldGlow ? `
    animation: ${fadeSlideUp} 0.6s ease, ${textGlowPulse} 1.5s ease-in-out 0.6s 3;
  ` : ''}
`;

const dots = keyframes`
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
`;

export const LoadingDots = styled.div`
  display: inline-flex;
  gap: 6px;
  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
    animation: ${dots} 1.2s infinite;
  }
  span:nth-child(2) { animation-delay: 0.2s; }
  span:nth-child(3) { animation-delay: 0.4s; }
`;

export const TrackTitle = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 카드 바로 아래쪽에 오도록 조금 위로 올림 */
  top: calc(var(--album-y) + 380px);
  transform: translateX(-50%);
  /* 음악 제목은 살짝 더 작게, medium 두께로 */
  font-size: 95px;
  font-weight: 500;
  color: rgba(255,255,255,1);
  text-shadow: 
    0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 4}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => (props.$shadowBlur || 4) * 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.3)'};
  z-index: 20;
  pointer-events: none;
`;

export const Artist = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 트랙 타이틀과의 간격을 조금 줄여 더 가깝게 배치 */
  top: calc(var(--album-y) + 520px);
  transform: translateX(-50%);
  /* 하단 아티스트 텍스트는 한 단계 더 작게 */
  font-size: 70px;
  color: rgba(255,255,255,1);
  text-shadow: 
    0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 4}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => (props.$shadowBlur || 4) * 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.3)'};
  z-index: 20;
  pointer-events: none;
`;

// 음악 파형 인디케이터 (실제 오디오 파형 반영)
export const WaveformIndicator = styled.div`
  position: absolute;
  left: var(--album-x);
  top: calc(var(--album-y) + 680px);
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  height: 80px;
  z-index: 20;
  pointer-events: none;
`;

export const WaveformBar = styled.div`
  width: 6px;
  height: ${props => props.$height || 4}px;
  min-height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  transform-origin: bottom;
  transition: height 0.1s ease-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const RightPanel = styled.div`
  position: relative;
  overflow: hidden;
  display: grid; place-items: center;
  background: linear-gradient(135deg,
    ${props => props.$bgColor1 || 'rgba(255,235,235,0.95)'},
    ${props => props.$bgColor2 || 'rgba(253,210,210,0.78)'} ${props => props.$bgColor2Pos || 55}%,
    ${props => props.$bgColor3 || 'rgba(250,250,250,0.90)'} 100%);
  /* 왼쪽 경계 블러 효과 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${props => props.$edgeBlurWidth || 20}px;
    background: linear-gradient(180deg,
      ${props => props.$bgColor1 || 'rgba(255,235,235,0.95)'} 0%,
      ${props => props.$bgColor2 || 'rgba(253,210,210,0.78)'} 50%,
      ${props => props.$bgColor3 || 'rgba(250,250,250,0.90)'} 100%);
    filter: blur(${props => props.$edgeBlurAmount || 15}px);
    pointer-events: none;
    z-index: 2;
  }
`;

/* SW1 GradientEllipse (L105-L114) 포팅: 우측 패널 기존 블롭 위치에 배치 */
export const RightSw1Ellipse = styled.div`
  position: absolute;
  right: ${props => props.$right || -2}%;
  top: ${props => props.$top || 18}%;
  width: ${props => props.$width || 2000}px;
  height: ${props => props.$height || 2000}px;
  transform: rotate(-90deg);
  background: radial-gradient(
    47.13% 47.13% at 50% 50%,
    ${props => props.$color1 || '#FFFFFF'} ${props => props.$pos1 || 37.5}%,
    ${props => props.$color2 || 'rgba(224, 224, 224, 0.37)'} ${props => props.$pos2 || 42.79}%,
    ${props => props.$color3 || 'rgba(255, 218, 233, 0.48)'} ${props => props.$pos3 || 73.08}%,
    ${props => props.$color4 || 'rgba(255, 255, 255, 0.67)'} 100%
  );
  filter: blur(20px) saturate(1.8);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
  opacity: ${props => props.$opacity || 1};
`;

/* 우측 블롭은 중앙 글로우만 사용 (파동 제거) */

/* 우측 패널 회전 엘립스 마크 (SW1 CenterMark와 동일한 스핀) */
const rightEllipseSpin = keyframes`
  0%   { transform: translate(-300px, 300px) rotate(0deg); }
  100% { transform: translate(-300px, 300px) rotate(360deg); }
`;

export const RightEllipseMark = styled.img`
  position: absolute;
  right: ${props => props.$right || -2}%;
  top: ${props => props.$top || 18}%;
  width: 1400px;
  height: 1400px;
  transform-origin: 50% 50%;
  animation: ${rightEllipseSpin} 6s linear infinite;
  pointer-events: none;
  z-index: 2;
  filter: brightness(1.1) contrast(1.12);
  opacity: 0.95;
`;

/* 중앙 파동(얇은 링) - SW1 CenterPulse 참고, 위치/크기는 기존 블롭과 동일 */
const tv2RightPulseWave = keyframes`
  0%   { transform: scale(0.9); opacity: 0.0; }
  18%  { opacity: 0.75; }
  100% { transform: scale(1.35); opacity: 0.0; }
`;

export const RightCenterPulse = styled.div`
  position: absolute;
  right: -2%;
  top: 18%;
  width: 2000px;
  height: 2000px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.0) 0%,
    rgba(255, 255, 255, 0.0) 64%,
    rgba(255, 255, 255, 0.95) 72%,
    rgba(255, 255, 255, 0.0) 88%,
    rgba(255, 255, 255, 0.0) 100%
  );
  filter: blur(6px);
  transform-origin: 50% 50%;
  animation: ${tv2RightPulseWave} 9s ease-out infinite;
  &::before,
  &::after {
    content: '';
    position: absolute; inset: 0;
    border-radius: inherit;
    background: inherit;
    filter: inherit;
    transform-origin: inherit;
    animation: ${tv2RightPulseWave} 9s ease-out infinite;
  }
  &::before { animation-delay: 3s; }
  &::after  { animation-delay: 6s; }
`;
export const ClimateGroup = styled.div`
  /* 우측 범위가 넓어진 만큼 살짝 왼쪽으로 이동 + 전체를 조금 위로 */
  position: absolute; left: 6%; top: 110px;
  /* 블러 처리된 블롭보다 항상 위 레이어로 */
  z-index: 3;
  display: grid; gap: 86.4px;
  color: #fff;
  filter: drop-shadow(0 10px 40px rgba(0,0,0,0.15));
`;

export const ClimateRow = styled.div`
  /* 아이콘과 텍스트 사이 간격을 조금 좁힘 */
  display: flex; align-items: center; gap: 40px;
  /* 온도/습도 텍스트도 중간 수준으로 */
  font-size: 85px;
  color: rgba(255,255,255,1);
  text-shadow: 
    0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 4}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => (props.$shadowBlur || 4) * 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.3)'};
`;

export const ClimateIcon = styled.div`
  /* 온도/습도 아이콘도 중간 크기로 */
  svg { 
    width: 126px; 
    height: 126px; 
    color: #fff; 
    filter: 
      drop-shadow(0 0 ${props => props.$shadowBlur || 2}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 1}px ${props => props.$shadowBlur || 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'});
  }
  img { 
    width: 126px; 
    height: 126px; 
    object-fit: contain; 
    display: block; 
    filter: 
      drop-shadow(0 0 ${props => props.$shadowBlur || 2}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 1}px ${props => props.$shadowBlur || 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'});
  }
`;

export const BlobSpot = styled.div`
  /* 원 영역을 약간 왼쪽으로 끌어와 화면 중앙 쪽으로 배치 */
  position: absolute; right: -2%; top: 18%;
  width: 2000px; height: 2000px;
  display: grid; place-items: center;
  pointer-events:none;
  z-index: 1;
`;

/* Idle thinking overlay */
const dotPulse = keyframes`
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.45; }
  40% { transform: scale(1); opacity: 1; }
`;
export const ThinkingOverlay = styled.div`
  position: absolute; inset: 324px 0 0 0; /* below header */
  display: flex; align-items: center; justify-content: center;
  z-index: 6; pointer-events: none;
`;

// 값 변경 메시지 (좌측 그라디언트 하단)
const changeMessageFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  20% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

export const ChangeMessage = styled.div`
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 60px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  pointer-events: none;
  z-index: 15;
  animation: ${changeMessageFade} 3s ease-in-out forwards;
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.3);
`;
export const ThinkingDot = styled.span`
  width: 28px; height: 28px; border-radius: 50%;
  margin: 0 16px; background: rgba(255,255,255,0.95);
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
  animation: ${dotPulse} 1.2s ease-in-out infinite;
  &:nth-child(2) { animation-delay: .15s; }
  &:nth-child(3) { animation-delay: .30s; }
`;


