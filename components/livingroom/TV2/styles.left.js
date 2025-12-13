import styled, { keyframes, css } from 'styled-components';

/* 좌측 패널 + 앨범/텍스트 관련 스타일 모듈 */

/* T4: Left gradient fade-in */
const t4LeftFadeIn = keyframes`
  0%   { opacity: 0; }
  100% { opacity: 1; }
`;

export const LeftPanel = styled.div`
  position: relative;
  overflow: hidden;
  padding: 86.4px 153.6px;
  /* Base gradient and sweeping band per spec */
  /* 앨범 카드 위치 (그라디언트 중심에 배치) */
  --album-x: 50%;
  --album-y: 46%;
  /* starting azimuth for angular sweep – 약간만 회전해서
     하얀 영역 경계가 거의 수평에 가깝게 보이도록 조정 */
  --sweep-start: 90deg;
  background: ${props => props.$color5 || '#F6E4CD'}; /* fallback */
  color: #fff;
  /* 회전하는 원형 그라디언트 레이어 (시계방향) */
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
    animation: conicTurn 18s linear infinite;
    /* 좌측 패널 메인 그라디언트: 더 강한 블러 + 파스텔 경향 유지 */
    filter: blur(160px) saturate(0.9) brightness(1.08);
    opacity: 0.96;
    will-change: transform, filter;
    pointer-events: none;
    z-index: 0;
    /* T4: Fade-in animation (3 seconds) */
    ${props => props.$isT4 && props.$triggerT4 ? css`
      animation: conicTurn 18s linear infinite, ${t4LeftFadeIn} 3s ease-in-out forwards;
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
    /* soft horizontal blur band near the bottom – 범위를 더 넓게 확장 */
    content:''; position:absolute; left:6%; right:4%; bottom:6%;
    height: 480px; border-radius: 32px;
    filter: blur(22px); opacity:.28;
    background: linear-gradient(
      180deg,
      rgba(255,255,255,0.00) 0%,
      rgba(255,255,255,0.30) 40%,
      rgba(255,255,255,0.00) 100%
    );
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
  /* 살짝만 아래로 내려 정렬 보정 */
  top: calc(var(--album-y) - 760px);
  display: flex; align-items: center; gap: 60px;
  /* 장르 텍스트도 중간 수준으로 */
  font-size: 85px;
  font-weight: 300;
  text-transform: uppercase;
  color: #000;
  mix-blend-mode: soft-light;
  /* 쉐도우 제거 */
  text-shadow: none;
  z-index: 10;

  /* 행 내부 텍스트(첫번째 div: FadeSlideText)에 언더레이 주입 */
  & > div{
    position: relative; display: inline-block;
  }
  & > div::before{
    content:''; position:absolute; inset:-14% -16%;
    border-radius:22px;
    background: radial-gradient(
      circle at 50% 55%,
      rgba(0,0,0,0.42) 0%,
      rgba(0,0,0,0.22) 44%,
      rgba(0,0,0,0.00) 80%
    );
    filter: blur(26px);
    mix-blend-mode: soft-light;
    z-index:-1; pointer-events:none;
  }
  & > div::after{
    content:''; position:absolute; inset:-12% -14%;
    border-radius:22px;
    background: radial-gradient(
      circle at 50% 55%,
      rgba(0,0,0,0.42) 0%,
      rgba(0,0,0,0.42) 40%,
      rgba(0,0,0,0.00) 60%
    );
    filter: blur(36px);
    mix-blend-mode: color-burn;
    z-index:-1; pointer-events:none; opacity:.86;
  }
`;

export const MusicIcon = styled.div`
  width: 180px;
  height: 180px;
  display: grid; place-items: center;
  /* 음악 아이콘도 텍스트와 동일 계열의 그림자 사용 */
  svg { 
    width: 90%; 
    height: 90%; 
    color: #fff; 
    mix-blend-mode: normal;
    opacity: 1;
    filter:
      drop-shadow(0 8px 24px rgba(0,0,0,0.45))
      drop-shadow(0 16px 48px rgba(0,0,0,0.25))
      drop-shadow(0 0 28px rgba(255,255,255,0.85));
  }
  img { 
    width: 90%; 
    height: 90%; 
    object-fit: contain; 
    display: block; 
    mix-blend-mode: normal;
    opacity: 1;
    filter:
      drop-shadow(0 8px 24px rgba(0,0,0,0.45))
      drop-shadow(0 16px 48px rgba(0,0,0,0.25))
      drop-shadow(0 0 28px rgba(255,255,255,0.85));
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

  /* 테두리가 딱 끊기지 않도록 아주 미세한 외곽 블러 레이어 추가 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    /* 가장자리만 살짝 밝아지며 퍼지는 얕은 페더 */
    background: radial-gradient(120% 120% at 50% 50%,
      rgba(255,255,255,0.0) 74%,
      rgba(255,255,255,0.16) 86%,
      rgba(255,255,255,0.0) 100%);
    filter: blur(8px);
    opacity: 0.16;
    pointer-events: none;
    z-index: 0;
  }

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

/* SW2의 captionEnter 스타일을 TV2에 맞게 적용: 업 + 블러 + 오퍼시티 */
const fadeSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
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

export const AlbumVisual = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  position: relative;
  z-index: 1;
  /* 커버는 제자리에 고정된 채 블러만 점점 줄어들도록 */
  animation: ${albumBlurIn} 2s ease-in-out;
  will-change: opacity, transform, filter;
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

/* 좌측 패널 앨범 뒤쪽을 살짝 눌러주는 블롭 (센터가 어둡고 바깥으로 갈수록 소거) */
export const AlbumBackdropBlob = styled.div`
  position: absolute;
  left: var(--album-x);
  top: var(--album-y);
  transform: translate(-50%, -50%);
  width: 1200px;
  height: 1200px;
  border-radius: 50%;
  /* 바깥 레이어: 부드럽게 깔리는 기본 눌림 (overlay) */
  background: radial-gradient(
    circle at 50% 50%,
    ${props => props.$dark || 'rgba(0,0,0,0.28)'} 0%,
    ${props => props.$dark || 'rgba(0,0,0,0.22)'} 60%,
    rgba(0,0,0,0.00) 100%
  );
  filter: blur(88px);
  mix-blend-mode: soft-light;
  opacity: 0.8;
  pointer-events: none;
  z-index: 2; /* LeftPanel::before(0), ::after(1) 아래와 앨범 카드(5) 사이 */

  /* 중심 레이어: 또렷한 눌림 (color-burn), 중앙만 강하게 0~45% */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      circle at 50% 50%,
      ${props => props.$dark || 'rgba(0,0,0,0.45)'} 0%,
      ${props => props.$dark || 'rgba(0,0,0,0.45)'} 45%,
      rgba(0,0,0,0.0) 60%,
      rgba(0,0,0,0.0) 100%
    );
    filter: blur(72px);
    mix-blend-mode: color-burn;
    opacity: 0.9;
    pointer-events: none;
  }
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
  /* 모든 텍스트 변경 시: SW2 앨범명과 동일한 업 + 블러 + 오퍼시티 트랜지션 적용 */
  animation: ${fadeSlideUp} 0.78s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: opacity, transform, filter;
  mix-blend-mode: ${props => props.$blend || 'soft-light'};
  position: relative;
  ${props => props.$shouldGlow ? css`
    animation:
      ${fadeSlideUp} 0.78s cubic-bezier(0.22, 1, 0.36, 1) forwards,
      ${textGlowPulse} 1.5s ease-in-out 0.6s 3;
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
  /* 앨범 커버 바로 아래에 위치하도록 하단으로 이동 */
  top: calc(var(--album-y) + 400px);
  transform: translateX(-50%);
  /* 긴 제목도 앨범을 기준으로 중앙 정렬되도록 폭/정렬 지정 */
  width: 70%;
  max-width: 1600px;
  text-align: center;
  white-space: normal;
  line-height: 1.16;
  /* 음악 제목 폰트 약간 더 키움 */
  font-size: 80px;
  text-transform: uppercase;
  font-weight: 300;
  color: ${props => props.$color || '#000'};
  mix-blend-mode: ${props => props.$blend || 'soft-light'};
  /* 밝은 배경에서 시인성 확보용 얇은 스트로크 */
  -webkit-text-stroke: 1px rgba(0,0,0,0.18);
  /* 실제 텍스트는 FadeSlideText에서 애니메이션 처리 (좌→우) */
  will-change: opacity;
  /* 쉐도우 제거 */
  text-shadow: none;
  z-index: 20;
  pointer-events: none;

  &::before, &::after { content: none !important; }
`;

export const Artist = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 트랙 타이틀 바로 아래, 간격을 약간 더 좁혀 배치 */
  top: calc(var(--album-y) + 484px);
  transform: translateX(-50%);
  /* 아티스트 이름도 항상 중앙 정렬 */
  width: 60%;
  max-width: 1400px;
  text-align: center;
  white-space: normal;
  line-height: 1.2;
  /* 아티스트 텍스트 폰트 키움 */
  font-size: 64px;
  font-weight: 200;
  color: ${props => props.$color || '#000'};
  mix-blend-mode: soft-light;
  /* 실제 텍스트는 FadeSlideText에서 애니메이션 처리 (좌→우) */
  will-change: opacity;
  text-shadow: none;
  z-index: 20;
  pointer-events: none;
  -webkit-text-stroke: 0.8px rgba(0,0,0,0.16);

  &::before, &::after { content: none !important; }
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

const emotionFlow = keyframes`
  0%   { transform: translateX(40%); opacity: 0; }
  15%  { opacity: 0.75; }
  50%  { opacity: 0.9; }
  100% { transform: translateX(-120%); opacity: 0; }
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
    font-weight: 300;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #000;
    mix-blend-mode: soft-light;
    text-shadow: none;
    animation: ${emotionFlow} 10s linear infinite;
    white-space: nowrap;
  }
`;


