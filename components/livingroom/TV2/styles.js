import styled, { keyframes } from 'styled-components';

export const Viewport = styled.div`
  position: fixed; inset: 0;
  overflow: hidden;
  display: grid; place-items: center;
  background: #FFFFFF;
  touch-action: none;
`;

export const Scaler = styled.div`
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

export const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0;
  /* 상단 파란 박스를 조금 더 두껍게 */
  height: 324px; min-height: 96px;
  display: flex; align-items: center; gap: 76.8px; padding: 0 115.2px;
  color: #fff;
  /* 좌→우로 흐르는 그라데이션 모션 */
  background: linear-gradient(90deg,
    rgba(102,157,255,1) 0%,
    rgba(143,168,224,1) 45%,
    rgba(196,201,206,1) 100%);
  background-size: 400% 100%;
  animation: headerGradientSlide 8s ease-in-out infinite alternate;
  will-change: background-position;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08) inset;
  z-index: 3;
  @keyframes headerGradientSlide{
    0%   { background-position: 0% 0; }
    100% { background-position: 100% 0; }
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
      drop-shadow(0 0 8px #ffffff)
      drop-shadow(0 0 12px rgba(0,0,0,0.25));
  }
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    display: block;
    filter:
      drop-shadow(0 0 8px #ffffff)
      drop-shadow(0 0 12px rgba(0,0,0,0.25));
  }
`;

export const HeaderTitle = styled.div`
  /* 텍스트 크기도 중간 수준으로 조정 */
  font-size: 100px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-shadow:
    0 0 8px #ffffff,
    0 0 12px rgba(0,0,0,0.25);
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
  background: #F6E4CD; /* fallback */
  color: #fff;
  /* 회전하는 원형 그라데이션 레이어 (시계방향) */
  &::before{
    content:''; position:absolute;
    /* Fill whole panel including padding area */
    top: -480.4px; bottom: -480.4px; left: -480.6px; right: -480.6px;
    background: conic-gradient(from 0deg at 50% 50%, #A15C2E 0deg, #F5813F 74.42deg, #F5813F 114.23deg, #AEAEC5 252deg, #F6E4CD 360deg);
    transform-origin: 50% 50%;
    transform: matrix(1, 0, 0, -1, 0, 0) rotate(0deg);
    animation: conicTurn 28s linear infinite;
    filter: blur(30px);
    will-change: transform, filter;
    pointer-events: none;
    z-index: 0;
  }
  @keyframes conicTurn{
    from{ transform: matrix(1, 0, 0, -1, 0, 0) rotate(0deg); }
    to  { transform: matrix(1, 0, 0, -1, 0, 0) rotate(360deg); }
  }
  &::after{
    /* soft horizontal blur band near the bottom like the mock */
    content:''; position:absolute; left:8%; right:6%; bottom:7%;
    height: 345.6px; border-radius: 24px;
    filter: blur(18px); opacity:.25;
    background: linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.25), rgba(255,255,255,0.0));
    pointer-events: none;
  }
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
  font-size: 100px;
  font-weight: 400;
  opacity: .95;
  text-shadow: 0 0 18px #ffffff;
`;

export const MusicIcon = styled.div`
  width: 180px;
  height: 180px;
  display: grid; place-items: center;
  /* 음악 아이콘도 중간 크기로 */
  svg { width: 90%; height: 90%; color: #fff; filter: drop-shadow(0 0 18px #ffffff); }
  img { width: 90%; height: 90%; object-fit: contain; display: block; filter: drop-shadow(0 0 18px #ffffff); }
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
  z-index: 0;
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
  width: 710.4px; aspect-ratio: 1 / 1; border-radius: 40px;
  background: radial-gradient(120% 120% at 35% 25%, #c7e3ff 0%, #c9d2e8 40%, #f7efe8 100%);
  box-shadow:
    0 20px 50px rgba(0,0,0,0.25),
    inset 0 -8px 30px rgba(255,255,255,0.55),
    inset 0 12px 24px rgba(255,255,255,0.35);
  overflow: hidden;
  display: grid; place-items: center;
`;

export const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const TrackTitle = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 카드 바로 아래쪽에 오도록 조금 위로 올림 */
  top: calc(var(--album-y) + 420px);
  transform: translateX(-50%);
  /* 음악 제목은 살짝 더 작게, medium 두께로 */
  font-size: 110px;
  font-weight: 500;
  color: rgba(255,255,255,0.98);
  text-shadow: 0 8px 20px rgba(0,0,0,0.2);
`;

export const Artist = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 트랙 타이틀과의 간격을 조금 줄여 더 가깝게 배치 */
  top: calc(var(--album-y) + 570px);
  transform: translateX(-50%);
  /* 하단 아티스트 텍스트는 한 단계 더 작게 */
  font-size: 80px;
  color: rgba(255,255,255,0.9);
`;

export const RightPanel = styled.div`
  position: relative;
  overflow: hidden;
  display: grid; place-items: center;
  background: linear-gradient(135deg,
    rgba(255,235,235,0.95),
    rgba(253,210,210,0.78) 55%,
    rgba(250,250,250,0.90) 100%);
`;

/* SW1 GradientEllipse (L105-L114) 포팅: 우측 패널 기존 블롭 위치에 배치 */
export const RightSw1Ellipse = styled.div`
  position: absolute;
  right: -2%;
  top: 18%;
  width: 2000px;
  height: 2000px;
  transform: rotate(-90deg);
  background: radial-gradient(
    47.13% 47.13% at 50% 50%,
    #FFFFFF 37.5%,
    rgba(224, 224, 224, 0.37) 42.79%,
    rgba(255, 218, 233, 0.48) 73.08%,
    rgba(255, 255, 255, 0.67) 100%
  );
  filter: blur(20px) saturate(1.8);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
`;

/* 우측 블롭은 중앙 글로우만 사용 (파동 제거) */

/* 우측 패널 회전 엘립스 마크 (SW1 CenterMark와 동일한 스핀) */
const rightEllipseSpin = keyframes`
  0%   { transform: translate(-300px, 300px) rotate(0deg); }
  100% { transform: translate(-300px, 300px) rotate(360deg); }
`;

export const RightEllipseMark = styled.img`
  position: absolute;
  right: -2%;
  top: 18%;
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
  font-size: 100px;
  text-shadow: 0 0 18px #ffffff;
`;

export const ClimateIcon = styled.div`
  /* 온도/습도 아이콘도 중간 크기로 */
  svg { width: 126px; height: 126px; color: #fff; filter: drop-shadow(0 0 18px #ffffff); }
  img { width: 126px; height: 126px; object-fit: contain; display: block; filter: drop-shadow(0 0 18px #ffffff); }
`;

export const BlobSpot = styled.div`
  /* 원 영역을 약간 왼쪽으로 끌어와 화면 중앙 쪽으로 배치 */
  position: absolute; right: -2%; top: 18%;
  width: 2000px; height: 2000px;
  display: grid; place-items: center;
  pointer-events:none;
  z-index: 1;
`;


