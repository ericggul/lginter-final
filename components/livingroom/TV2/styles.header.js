import styled, { keyframes, css } from 'styled-components';

/* 조명 컬러가 우측에서 좌측으로 밀고 들어온 뒤 멈춤 */
const headerPush = keyframes`
  /* 우측에서 좌측으로 부드럽게 밀려와 정지 */
  0%   { background-position: -130% 0; opacity: 0.75; filter: blur(1px); }
  60%  { background-position: -12% 0; opacity: 0.95; filter: blur(0.4px); }
  100% { background-position: 0% 0; opacity: 1; filter: blur(0px); }
`;

/* T4: Top gradient fade-in (3 seconds) - 위치 이동 없이, 컬러만 부드럽게 드러나도록 */
const t4HeaderSlide = keyframes`
  0%   { opacity: 0; }
  100% { opacity: 1; }
`;

// 상단 패널용 컬러 스윕 모션 (좌측 → 우측으로 부드럽게 루프)
const headerColorSweep = keyframes`
  0%   { background-position: -220% 0; }
  100% { background-position:  220% 0; }
`;

export const Header = styled.div`
  position: absolute; top: 0; left: 0; right: 0;
  /* 상단 파란 박스를 조금 더 두껍게 */
  height: 324px; min-height: 96px;
  /* 좌측 패딩과 아이콘-텍스트 간격을 좌측 패널 MusicRow 와 동일하게 맞춰
     상단 조명 텍스트와 음악 텍스트의 좌측 정렬이 정확히 일치하도록 조정 */
  display: flex; align-items: center; gap: 60px; padding: 0 115.2px;
  color: #fff;
  /* 좌→우로 흐르는 그라데이션 모션 */
  background: linear-gradient(90deg,
    ${props => props.$gradientStart || 'rgba(102,157,255,1)'} 0%,
    ${props => props.$gradientMid || 'rgba(143,168,224,1)'} ${props => props.$gradientMidPos ?? 10}%,
    ${props => props.$gradientEnd || '#ffffff'} ${props => props.$gradientEndPos ?? 90}%,
    ${props => props.$gradientEnd || '#ffffff'} 100%);
  /* 컬러 영역을 넓혀 자연스럽게 - 잘림 방지를 위해 더 크게 설정 */
  background-size: 300% 100%;
  overflow: hidden;
  /* 조명 컬러가 바뀐 뒤에는 좌측을 앨범 다크 컬러로 강하게 눌러주고,
     우측으로 갈수록 빠르게 풀리는 비네트 느낌 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background: linear-gradient(
      90deg,
      ${props => props.$sweepContrast || 'rgba(0,0,0,0.75)'} 0%,
      ${props => props.$sweepContrast || 'rgba(0,0,0,0.75)'} 24%,
      rgba(0, 0, 0, 0.00) 70%
    );
    mix-blend-mode: soft-light;
  }
  /* 모바일 인풋으로 조명 컬러가 갱신될 때,
     파스텔 메인 컬러 + 화이트 하이라이트 + 앨범 다크 톤이 양쪽에서 부드럽게 퍼지는 스윕 */
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    pointer-events: none;
    z-index: 2;
    /* 좌: 앨범 다크(0~14) → 메인(14~47) → 화이트(47~53) → 메인(53~86) → 앨범 다크(86~100) */
    background: linear-gradient(
      90deg,
      ${props => props.$sweepContrast || 'rgba(0,0,0,0.0)'} 0%,
      ${props => props.$sweepContrast || 'rgba(0,0,0,0.0)'} 14%,
      ${props => props.$sweepMain || 'rgba(120,220,255,0.0)'} 47%,
      ${props => props.$sweepWhite || 'rgba(255,255,255,0.0)'} 53%,
      ${props => props.$sweepMain || 'rgba(120,220,255,0.0)'} 86%,
      ${props => props.$sweepContrast || 'rgba(0,0,0,0.0)'} 100%
    );
    background-size: 420% 100%;
    /* 앨범 컬러 스윕이 더 진하게 드러나도록 overlay 블렌드 사용 */
    mix-blend-mode: overlay;
    /* 상단 텍스트/아이콘은 위 레이어(z-index 5)에 있기 때문에,
       애니메이션 레이어에만 더 넓은 블러를 걸어 그라디언트 경계를 부드럽게 풀어준다. */
    /* 지나가는 밴드의 윤곽을 조금 또렷하게 + 더 진하게 보이도록 조정 */
    filter: blur(36px);
    opacity: ${props => (props.$sweepActive ? 0.98 : 0)};
    transition: opacity 800ms ease-out, filter 800ms ease-out;
    ${props => props.$sweepActive && css`
      /* 더 빨리 흐르도록 조정 (45s → 18s) */
      animation: ${headerColorSweep} 18s linear infinite;
    `}
  }
  /* T4: 위치 이동 없이, 컬러가 부드럽게 드러나는 페이드 인 */
  ${props => props.$isT4 && props.$triggerT4 ? css`
    opacity: 0;
    animation: ${t4HeaderSlide} 3s ease-in-out forwards;
  ` : css`
    opacity: 1;
  `}
  /* Removed will-change to prevent potential flickering */
  box-shadow:
    0 10px 40px rgba(0,0,0,0.08) inset,
    0 14px 34px rgba(0,0,0,0.05) inset,
    0 -12px 24px rgba(255,255,255,0.15) inset;
  z-index: 3;
  /* 하단 경계 블러 효과 (별도 요소로 분리) */
  & .header-bottom-blur {
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
  position: relative;
  z-index: 5; /* 컬러 스윕/비네트 레이어보다 항상 위 */
  /* 아이콘은 언더 섀도우는 아주 살짝, 글로우는 강하게 */
  svg {
    width: 70%;
    height: 70%;
    color: #fff;
    opacity: 1;
    mix-blend-mode: normal;
    filter:
      brightness(2.4)
      saturate(0)
      drop-shadow(0 4px 14px rgba(0,0,0,0.24))
      drop-shadow(0 0 34px rgba(255,255,255,1))
      drop-shadow(0 0 82px rgba(255,255,255,0.96));
  }
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    display: block;
    opacity: 1;
    mix-blend-mode: normal;
    filter:
      brightness(2.4)
      saturate(0)
      drop-shadow(0 4px 14px rgba(0,0,0,0.24))
      drop-shadow(0 0 34px rgba(255,255,255,1))
      drop-shadow(0 0 82px rgba(255,255,255,0.96));
  }
`;

export const HeaderTitle = styled.div`
  /* 텍스트 크기 살짝 축소 */
  font-size: 70px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: left;
  /* 상단 타이틀 컬러: 중립 다크 그레이(#545454) */
  color: #545454;
  /* 상단 텍스트는 항상 또렷하게 보이도록 기본 렌더링 */
  mix-blend-mode: normal;
  position: relative;
  z-index: 5; /* 상단 컬러 스윕보다 텍스트가 항상 위에 보이도록 */
  /* 쉐도우 제거 */
  text-shadow: none;

  /* 상단 조명 텍스트 뒤에도 다른 텍스트와 동일하게
     앨범에서 뽑은 가장 밝은 컬러 기반 soft-light 언더레이를 깔아 아주 연하게 눌러준다 */
  &::before {
    content: '';
    position: absolute;
    /* 텍스트 주변을 크게 감싸도록 inset 범위 설정 */
    inset: -28% -20%;
    border-radius: 40px;
    background: radial-gradient(
      circle at 50% 50%,
      ${props => props.$backdrop || 'rgba(255,255,255,0.55)'} 0%,
      ${props => props.$backdrop || 'rgba(255,255,255,0.26)'} 46%,
      rgba(255,255,255,0.0) 88%
    );
    filter: blur(32px);
    mix-blend-mode: soft-light;
    z-index: -1;
    pointer-events: none;
    opacity: 0.12;
  }
  &::after { content: none; }
`;

export const Content = styled.div`
  /* 헤더 높이에 맞춰 바로 아래에서 시작 */
  position: absolute; inset: 324px 0 0 0;
  /* 우측(원 영역)을 기존보다 약간만 넓게 유지 */
  display: grid; grid-template-columns: 2.7fr 2.3fr;
  height: calc(100% - 324px);
  /* 좌/우 박스 간 경계가 너무 딱 갈리지 않도록 부드러운 수직 그라디언트 복원 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 54%;
    transform: translateX(-50%);
    width: 220px;
    pointer-events: none;
    z-index: 2;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.00) 0%,
      rgba(255,255,255,0.32) 50%,
      rgba(255,255,255,0.00) 100%
    );
    filter: blur(26px);
    mix-blend-mode: soft-light;
    opacity: 0.85;
  }
`;


