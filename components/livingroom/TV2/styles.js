import styled, { keyframes } from 'styled-components';

export const Root = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif;
`;

export const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0;
  /* 상단 파란 박스를 조금 더 두껍게 */
  height: 15vh; min-height: 96px;
  display: flex; align-items: center; gap: 2vw; padding: 0 3vw;
  color: #fff;
  background: linear-gradient(90deg, rgba(102,157,255,1) 0%, rgba(143,168,224,1) 45%, rgba(196,201,206,1) 100%);
  box-shadow: 0 10px 40px rgba(0,0,0,0.08) inset;
  z-index: 3;
`;

export const HeaderIcon = styled.div`
  /* 아이콘 크기를 이전/현재 값의 중간 정도로 설정 */
  width: clamp(72px, 11vmin, 180px);
  height: clamp(72px, 11vmin, 180px);
  min-width: clamp(72px, 11vmin, 180px);
  border-radius: 50%;
  display: grid; place-items: center;
  color: #fff;
  svg {
    width: 70%;
    height: 70%;
  }
`;

export const HeaderTitle = styled.div`
  /* 텍스트 크기도 중간 수준으로 조정 */
  font-size: clamp(37px, 5.5vmin, 100px);
  font-weight: 500;
  letter-spacing: 0.02em;
`;

export const Content = styled.div`
  /* 헤더 높이에 맞춰 바로 아래에서 시작 */
  position: absolute; inset: 15vh 0 0 0;
  /* 우측(원 영역)을 기존보다 약간만 넓게 유지 */
  display: grid; grid-template-columns: 2.7fr 2.3fr;
  height: calc(100vh - 15vh);
`;

export const LeftPanel = styled.div`
  position: relative;
  overflow: hidden;
  padding: 4vh 4vw;
  /* Base gradient and sweeping band per spec */
  /* 앨범 카드 위치 (조금 더 오른쪽 & 상단으로) */
  --album-x: 64%;
  --album-y: 46%;
  /* starting azimuth for angular sweep to align with orange→white seam */
  --sweep-start: 110deg;
  background: linear-gradient(180deg, #F28A3A 0%, #F28A3A 40%, #B0B7E8 100%);
  color: #fff;
  &::after{
    /* soft horizontal blur band near the bottom like the mock */
    content:''; position:absolute; left:8%; right:6%; bottom:7%;
    height: 16vh; border-radius: 24px;
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
    width: 28vmin; height: 1px; /* invisible guide for transform */
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
    transform: rotate(0deg) translateX(28vmin);
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
  left: 3vw;
  /* 사각형과 세로 중심을 맞추도록 살짝 위쪽으로 조정 */
  top: calc(var(--album-y) - 4vh);
  display: flex; align-items: center; gap: 1.4vw;
  /* 장르 텍스트도 중간 수준으로 */
  font-size: clamp(37px, 5.5vmin, 100px);
  font-weight: 500;
  opacity: .95;
`;

export const MusicIcon = styled.div`
  /* 음악 아이콘도 중간 크기로 */
  svg { width: clamp(72px, 11vmin, 180px); height: clamp(72px, 11vmin, 180px); color: #fff; }
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
  position: absolute; inset: -35%; pointer-events: none;
  transform-origin: 50% 50%;
  z-index: 0;
  background: conic-gradient(from var(--sweep-start) at 56% 46%,
    /* 0~21deg 구간의 갈색을 제거하고 완전히 흰색으로 유지 */
#fefaf4  0%,
    #F5813F 0%,
    /* 나머지 각도/컬러 범위는 그대로 유지 */
    #F5813F 21%,
    #F5813F 32%,
    #AEAEC5 70%,
rgb(255, 251, 245) 100%);
  filter: blur(0px) saturate(1.05);
  mix-blend-mode: normal;
  opacity: .9;
  animation: ${spinSweep} 12s linear infinite;
`;

export const AngularSharp = styled.div`
  position: absolute; inset: -35%; pointer-events: none;
  transform-origin: 50% 50%;
  z-index: 0;
  background: F6E4CD ;
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
  animation: ${spinSweep} 12s linear infinite;
  opacity: .85;
`;

export const AlbumCard = styled.div`
  position: absolute; left: var(--album-x); top: var(--album-y);
  transform: translate(-50%, -50%);
  /* 더 작게 줄여서 텍스트와 균형 맞춤 */
  width: min(24vh, 20vw); aspect-ratio: 1 / 1; border-radius: 20px;
  background: radial-gradient(120% 120% at 35% 25%, #c7e3ff 0%, #c9d2e8 40%, #f7efe8 100%);
  box-shadow:
    0 20px 50px rgba(0,0,0,0.25),
    inset 0 -8px 30px rgba(255,255,255,0.55),
    inset 0 12px 24px rgba(255,255,255,0.35);
  overflow: hidden;
  display: grid; place-items: center;
`;

export const TrackTitle = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 카드 바로 아래쪽에 오도록 조금 위로 올림 */
  top: calc(var(--album-y) + min(24vh, 20vw) * 0.6);
  transform: translateX(-50%);
  /* 음악 제목은 살짝 더 작게, medium 두께로 */
  font-size: clamp(34px, 5.1vmin, 92px);
  font-weight: 500;
  color: rgba(255,255,255,0.98);
  text-shadow: 0 8px 20px rgba(0,0,0,0.2);
`;

export const Artist = styled.div`
  position: absolute;
  left: var(--album-x);
  /* 트랙 타이틀과의 간격을 조금 줄여 더 가깝게 배치 */
  top: calc(var(--album-y) + min(24vh, 20vw) * 0.7 + 2.5vh);
  transform: translateX(-50%);
  /* 하단 아티스트 텍스트는 한 단계 더 작게 */
  font-size: clamp(24px, 3.8vmin, 68px);
  color: rgba(255,255,255,0.9);
`;

export const RightPanel = styled.div`
  position: relative;
  overflow: hidden;
  display: grid; place-items: center;
  background: linear-gradient(135deg, rgba(255,241,241,0.95), rgba(253,222,222,0.75) 55%, rgba(255,255,255,0.9) 100%);
`;

export const ClimateGroup = styled.div`
  /* 우측 범위가 넓어진 만큼 살짝 왼쪽으로 이동 + 전체를 조금 위로 */
  position: absolute; left: 3%; top: 36%;
  display: grid; gap: 4vh;
  color: #fff;
  filter: drop-shadow(0 10px 40px rgba(0,0,0,0.15));
`;

export const ClimateRow = styled.div`
  /* 아이콘과 텍스트 사이 간격을 조금 좁힘 */
  display: flex; align-items: center; gap: 0.9vw;
  /* 온도/습도 텍스트도 중간 수준으로 */
  font-size: clamp(37px, 5.6vmin, 103px);
`;

export const ClimateIcon = styled.div`
  /* 온도/습도 아이콘도 중간 크기로 */
  svg { width: clamp(72px, 11.0vmin, 180px); height: clamp(72px, 11.0vmin, 180px); color: #fff; }
`;

export const BlobSpot = styled.div`
  /* 원 영역을 약간 왼쪽으로 끌어와 화면 중앙 쪽으로 배치 */
  position: absolute; right: -2%; top: 18%;
  width: 84vmin; height: 84vmin; display: grid; place-items: center; pointer-events:none;
`;


