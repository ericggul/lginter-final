import styled, { keyframes, css } from 'styled-components';

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
  transform: translate(-50%, -50%) scale(var(--tv2-scale, 1));
`;

export const Root = styled.div`
  position: relative;
  width: 3840px;
  height: 2160px;
  overflow: hidden;
  background: #FFFFFF;
  font-family: 'Inter', 'Pretendard', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;
`;

/* 조명 컬러가 우측에서 좌측으로 밀고 들어온 뒤 멈춤 */
const headerPush = keyframes`
  /* 우측에서 좌측으로 부드럽게 밀려와 정지 */
  0%   { background-position: -130% 0; opacity: 0.75; filter: blur(1px); }
  60%  { background-position: -12% 0; opacity: 0.95; filter: blur(0.4px); }
  100% { background-position: 0% 0; opacity: 1; filter: blur(0px); }
`;

/* T4: Top gradient left-to-right animation (3 seconds) - 좌에서 우로 들어옴 */
const t4HeaderSlide = keyframes`
  0%   { background-position: -100% 0; opacity: 0.6; }
  100% { background-position: 0% 0; opacity: 1; }
`;

/* T4: Left gradient fade-in */
const t4LeftFadeIn = keyframes`
  0%   { opacity: 0; }
  100% { opacity: 1; }
`;

/* T4: Right blob slide right-to-left */
const t4RightBlobSlide = keyframes`
  0%   { transform: translateX(40%) rotate(-90deg); opacity: 0.4; }
  100% { transform: translateX(0) rotate(-90deg); opacity: 1; }
`;

/* T5: Typography roulette slide left-to-right */
const t5RouletteSlide = keyframes`
  0%   { opacity: 0; transform: translateX(-80px) scale(0.95); }
  40%  { opacity: 0.8; transform: translateX(8px) scale(1.02); }
  70%  { opacity: 1; transform: translateX(-4px) scale(0.98); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
`;

/* T5: Album appearance */
const t5AlbumAppear = keyframes`
  0%   { opacity: 0; transform: translateY(20px) scale(0.96); filter: blur(8px); }
  50%  { opacity: 0.9; transform: translateY(-4px) scale(1.01); filter: blur(2px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
`;

/* T5: Music indicator strong pulse */
const t5WaveformPulse = keyframes`
  0%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0.85; }
  25% { transform: translateX(-50%) scaleY(1.4); opacity: 1; }
  50% { transform: translateX(-50%) scaleY(1.2); opacity: 0.95; }
  75% { transform: translateX(-50%) scaleY(1.35); opacity: 1; }
`;

/* White border flash */
const borderFlash = keyframes`
  0%   { opacity: 0; box-shadow: 0 0 0 0 rgba(255,255,255,0); }
  20%  { opacity: 1; box-shadow: 0 0 0 8px rgba(255,255,255,0.6), 0 0 0 16px rgba(255,255,255,0.3); }
  100% { opacity: 0; box-shadow: 0 0 0 0 rgba(255,255,255,0); }
`;

const emotionFlow = keyframes`
  0%   { transform: translateX(40%); opacity: 0; }
  15%  { opacity: 0.75; }
  50%  { opacity: 0.9; }
  100% { transform: translateX(-120%); opacity: 0; }
`;

const climatePush = keyframes`
  0%   { transform: translateX(60%) rotateX(20deg); opacity: 0; }
  60%  { transform: translateX(-6%) rotateX(-8deg); opacity: 1; }
  100% { transform: translateX(0) rotateX(0deg); opacity: 1; }
`;

const noticeTyping = keyframes`
  0%   { width: 0; opacity: 0; }
  8%   { width: 0; opacity: 1; }
  55%  { width: 100%; opacity: 1; }
  80%  { width: 100%; opacity: 0.9; }
  100% { width: 100%; opacity: 0; }
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
    ${props => props.$gradientMid || 'rgba(143,168,224,1)'} ${props => props.$gradientMidPos ?? 10}%,
    ${props => props.$gradientEnd || '#ffffff'} ${props => props.$gradientEndPos ?? 90}%,
    ${props => props.$gradientEnd || '#ffffff'} 100%);
  /* 컬러 영역을 넓혀 자연스럽게 - 잘림 방지를 위해 더 크게 설정 */
  background-size: 300% 100%;
  /* T4: Left-to-right slide animation (3 seconds) - 좌에서 우로 들어옴 */
  ${props => props.$isT4 && props.$triggerT4 ? css`
    background-position: -100% 0;
    animation: ${t4HeaderSlide} 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  ` : css`
    /* 기본 상태: T5 이후 위치 유지 또는 초기 위치 (왼쪽 밖) */
    background-position: ${props => props.$isT5 ? '0% 0' : '-100% 0'};
  `}
  /* Removed will-change to prevent potential flickering */
  box-shadow:
    0 10px 40px rgba(0,0,0,0.08) inset,
    0 14px 34px rgba(0,0,0,0.05) inset,
    0 -12px 24px rgba(255,255,255,0.15) inset;
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
  /* 상단 경계 블러 보조 (얇은 라인) */
  & .header-edge-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${props => (props.$edgeBlurWidth || 20) * 0.5}px;
    background: linear-gradient(90deg,
      ${props => props.$gradientStart || 'rgba(102,157,255,1)'} 0%,
      ${props => props.$gradientMid || 'rgba(143,168,224,1)'} ${props => props.$gradientMidPos || 45}%,
      ${props => props.$gradientEnd || 'rgba(196,201,206,1)'} 100%);
    filter: blur(${props => (props.$edgeBlurAmount || 15) * 0.8}px);
    opacity: 0.7;
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
      drop-shadow(0 0 ${props => (props.$shadowBlur || 6)}px ${props => props.$glowColor || 'rgba(255,255,255,0.7)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 3}px ${props => (props.$shadowBlur || 6)}px ${props => props.$shadowColor || 'rgba(0,0,0,0.55)'});
  }
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    display: block;
    filter:
      drop-shadow(0 0 ${props => (props.$shadowBlur || 6)}px ${props => props.$glowColor || 'rgba(255,255,255,0.7)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 3}px ${props => (props.$shadowBlur || 6)}px ${props => props.$shadowColor || 'rgba(0,0,0,0.55)'});
  }
`;

export const HeaderTitle = styled.div`
  /* 텍스트 크기도 중간 수준으로 조정 */
  font-size: 80px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-align: left;
  color: rgba(255,255,255,0.9);
  text-shadow:
    0 0 10px rgba(0,0,0,0.18),
    0 0 16px rgba(255,255,255,0.32);
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
  /* 앨범 카드 위치 (그라디언트 중심에 배치) */
  --album-x: 50%;
  --album-y: 50%;
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
    /* 블러를 10~200 사이로 클램프 */
    filter: blur(${props => {
      const v = props.$blur ?? 30;
      return Math.min(200, Math.max(10, v));
    }}px);
    will-change: transform, filter;
    pointer-events: none;
    z-index: 0;
    /* T4: Fade-in animation (3 seconds) */
    ${props => props.$isT4 && props.$triggerT4 ? css`
      animation: conicTurn 28s linear infinite, ${t4LeftFadeIn} 3s ease-in-out forwards;
      opacity: 0;
    ` : css`
      transition: opacity 1.5s ease-in-out;
      opacity: 1;
    `}
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
  /* 더 상단으로 올려 감정명 노출 */
  top: calc(var(--album-y) - 900px);
  display: flex; align-items: center; gap: 60px;
  /* 장르 텍스트도 중간 수준으로 */
  font-size: 85px;
  font-weight: 400;
  text-transform: uppercase;
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
      drop-shadow(0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.6)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 3}px ${props => props.$shadowColor || 'rgba(0,0,0,0.45)'})
      drop-shadow(0 0 12px rgba(255,255,255,0.7));
  }
  img { 
    width: 90%; 
    height: 90%; 
    object-fit: contain; 
    display: block; 
    filter: 
      drop-shadow(0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.6)'})
      drop-shadow(${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 3}px ${props => props.$shadowColor || 'rgba(0,0,0,0.45)'})
      drop-shadow(0 0 12px rgba(255,255,255,0.7));
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
  width: 640px; aspect-ratio: 1 / 1; border-radius: 110px;
  background: radial-gradient(120% 120% at 35% 25%, #c7e3ff 0%, #c9d2e8 40%, #f7efe8 100%);
  box-shadow:
    0 20px 50px rgba(0,0,0,0.25),
    inset 0 -8px 30px rgba(255,255,255,0.55),
    inset 0 12px 24px rgba(255,255,255,0.35);
  overflow: hidden;
  display: grid; place-items: center;
  z-index: 5;
  /* 컨테이너 전체가 블러리하게 들어왔다가 선명해지는 느낌 */
  animation: ${keyframes`
    0% {
      opacity: 0.3;
      filter: blur(24px);
    }
    60% {
      opacity: 0.85;
      filter: blur(12px);
    }
    100% {
      opacity: 1;
      filter: blur(0px);
    }
  `} 2s ease-in-out;

  /* 부드러운 글로우 추가 */
  &::after {
    content: '';
    position: absolute;
    inset: -14%;
    border-radius: inherit;
    background: radial-gradient(120% 120% at 50% 45%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 65%, rgba(255,255,255,0) 100%);
    filter: blur(24px);
    z-index: 0;
    pointer-events: none;
  }
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

const albumBlurIn = keyframes`
  0% {
    opacity: 0;
    filter: blur(18px);
    transform: translateY(26px) scale(0.97);
  }
  60% {
    opacity: 1;
    filter: blur(6px);
    transform: translateY(6px) scale(0.995);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0) scale(1);
  }
`;

const rouletteIn = keyframes`
  0%   { opacity: 0; transform: translateY(24px) scale(0.96); }
  55%  { opacity: 1; transform: translateY(-6px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const slideInLR = keyframes`
  0%   { opacity: 0; transform: translateX(-48px); }
  60%  { opacity: 1; transform: translateX(6px); }
  100% { opacity: 1; transform: translateX(0); }
`;

export const AlbumVisual = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  /* 커버는 제자리에 고정된 채 블러만 점점 줄어들도록 */
  animation: ${albumBlurIn} 2s ease-in-out;
  will-change: opacity, transform, filter;
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
  opacity: 0;
  animation: ${albumBgFade} 1s ease 0.6s forwards;
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
  /* T5: Roulette slide right-to-left animation */
  ${props => props.$isT5 && props.$triggerT5 ? css`
    animation: ${t5RouletteSlide} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  ` : props.$slideLR ? css`
    animation: ${slideInLR} 0.6s ease;
  ` : props.$roulette ? css`
    animation: ${rouletteIn} 0.6s ease;
  ` : css`
    animation: ${fadeSlideUp} 0.6s ease;
  `}
  will-change: opacity, transform;
  ${props => props.$shouldGlow ? css`
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
  gap: 10px;
  span {
    width: 18px;
    height: 18px;
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
  /* 앨범 위로 띄워 간격 확보 */
  top: calc(var(--album-y) - 640px);
  transform: translateX(-50%);
  /* 음악 제목 폰트 약간 더 키움 */
  font-size: 80px;
  text-transform: uppercase;
  font-weight: 500;
  color: ${props => props.$color || 'rgba(255,255,255,1)'};
  mix-blend-mode: normal;
  /* 실제 텍스트는 FadeSlideText에서 애니메이션 처리 (좌→우) */
  will-change: opacity;
  text-shadow:
    0 0 10px rgba(0,0,0,0.18),
    0 0 16px rgba(255,255,255,0.32);
  z-index: 20;
  pointer-events: none;
`;

export const Artist = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 트랙 타이틀 아래, 앨범 상단 위쪽 */
  top: calc(var(--album-y) - 510px);
  transform: translateX(-50%);
  /* 아티스트 텍스트 폰트 키움 */
  font-size: 64px;
  font-weight: 500;
  color: ${props => props.$color || 'rgba(255,255,255,1)'};
  mix-blend-mode: normal;
  /* 실제 텍스트는 FadeSlideText에서 애니메이션 처리 (좌→우) */
  will-change: opacity;
  text-shadow:
    0 0 10px rgba(0,0,0,0.18),
    0 0 16px rgba(255,255,255,0.32);
  z-index: 20;
  pointer-events: none;
`;

// 음악 파형 인디케이터 (실제 오디오 파형 반영)
export const WaveformIndicator = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 이름들 아래, 앨범 하단 근처 */
  top: calc(var(--album-y) + 430px);
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  width: 600px;
  height: 120px;
  z-index: 20;
  pointer-events: none;
`;

export const EmotionFlow = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 48px;
  height: 64px;
  overflow: hidden;
  pointer-events: none;
  z-index: 6;
  mix-blend-mode: screen;
  opacity: 0.75;
  & > span {
    position: absolute;
    left: -40%;
    bottom: 0;
    font-size: 58px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.9);
    text-shadow:
      0 0 10px rgba(255,255,255,0.5),
      0 0 22px rgba(255,255,255,0.35),
      0 2px 10px rgba(0,0,0,0.35);
    animation: ${emotionFlow} 10s linear infinite;
    white-space: nowrap;
  }
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
  /* T4: Fade-in animation for right panel background */
  ${props => props.$isT4 && props.$triggerT4 ? css`
    animation: ${t4LeftFadeIn} 3s ease-in-out forwards;
    opacity: 0;
  ` : css`
    opacity: 1;
  `}
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
  /* 좌측 경계와 유사한 부드러운 블러를 오른쪽에도 추가 */
  &::after {
    content: '';
    position: absolute;
    left: -40px;
    top: 0;
    bottom: 0;
    width: ${props => (props.$edgeBlurWidth || 20) * 2}px;
    background: linear-gradient(180deg,
      ${props => props.$bgColor1 || 'rgba(255,235,235,0.95)'} 0%,
      ${props => props.$bgColor2 || 'rgba(253,210,210,0.78)'} 50%,
      ${props => props.$bgColor3 || 'rgba(250,250,250,0.90)'} 100%);
    filter: blur(${props => (props.$edgeBlurAmount || 15) * 1.4}px);
    opacity: 0.45;
    pointer-events: none;
    z-index: 1;
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
  /* T4: Right-to-left slide animation (3 seconds) */
  ${props => props.$isT4 && props.$triggerT4 ? css`
    animation: ${t4RightBlobSlide} 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  ` : ''}
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
  font-weight: 400;
  color: rgba(255,255,255,1);
  animation: ${climatePush} 0.8s ease-out;
  will-change: transform, opacity;
  text-shadow: 
    0 0 ${props => props.$shadowBlur || 4}px ${props => props.$glowColor || 'rgba(255,255,255,0.5)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => props.$shadowBlur || 4}px ${props => props.$shadowColor || 'rgba(0,0,0,0.4)'},
    ${props => props.$shadowOffsetX || 0}px ${props => props.$shadowOffsetY || 2}px ${props => (props.$shadowBlur || 4) * 2}px ${props => props.$shadowColor || 'rgba(0,0,0,0.3)'};
`;

export const NoticeTyping = styled.div`
  margin-top: 8px;
  font-size: 32px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: rgba(255,255,255,0.9);
  overflow: hidden;
  white-space: nowrap;
  animation: ${noticeTyping} 5s steps(32, end) infinite;
  pointer-events: none;
  text-shadow:
    0 0 10px rgba(0,0,0,0.28),
    0 0 18px rgba(255,255,255,0.45);
`;

// 선택 이유(감정 설명) 인라인 키워드 (값 우측에 작게 배치)
export const ReasonCaption = styled.span`
  display: inline-block;
  margin-left: 20px;
  padding-top: 6px;
  font-size: 34px;
  line-height: 1.2;
  color: rgba(255,255,255,0.92);
  opacity: 0.96;
  text-shadow:
    0 0 10px rgba(0,0,0,0.28),
    0 0 18px rgba(255,255,255,0.35);
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
  bottom: 80px;
  left: 58%;
  transform: translateX(-5%);
  font-size: 44px;
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

/* White border flash for new decisions */
export const BorderFlash = styled.div`
  position: absolute;
  inset: 0;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-radius: 0;
  pointer-events: none;
  z-index: 100;
  animation: ${borderFlash} 0.4s ease-out forwards;
  mix-blend-mode: screen;
`;


