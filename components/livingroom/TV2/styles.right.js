import styled, { keyframes, css } from 'styled-components';
import { HeaderIcon as BaseHeaderIcon } from './styles.header';

/* 우측 패널 + 기후/파동 관련 스타일 모듈 */

/* T4: Left gradient fade-in (우측 패널에도 재사용) */
const t4LeftFadeIn = keyframes`
  0%   { opacity: 0; }
  100% { opacity: 1; }
`;

/* T4: Right blob slide right-to-left */
const t4RightBlobSlide = keyframes`
  0%   { transform: translateX(40%) rotate(-90deg); opacity: 0.4; }
  100% { transform: translateX(0) rotate(-90deg); opacity: 1; }
`;

/* 기후 정보 트랜지션: 아래에서 위로 + 블러 → 선명 + 오퍼시티 페이드인 */
const climatePush = keyframes`
  0% {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(12px);
  }
  60% {
    opacity: 1;
    transform: translateY(4px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }
`;

/* 온습도 타이핑 애니메이션 */
const noticeTyping = keyframes`
  0%   { width: 0; opacity: 0; }
  8%   { width: 0; opacity: 1; }
  55%  { width: 100%; opacity: 1; }
  80%  { width: 100%; opacity: 0.9; }
  100% { width: 100%; opacity: 0; }
`;

/* 안내 텍스트: 6초 주기
   - 0~3초: 보이지 않음
   - 3~6초: 보이면서 살짝 위로 떠오르다 마지막에 사라짐 (좌/우 패널 공통) */
const setupHintPulse = keyframes`
  0%, 49% {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(6px);
  }
  50% {
    opacity: 0.6;
    transform: translateY(0);
    filter: blur(0px);
  }
  90% {
    opacity: 0.6;
    transform: translateY(-10px);
    filter: blur(0px);
  }
  100% {
    opacity: 0;
    transform: translateY(-18px);
    filter: blur(4px);
  }
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

/* SW1 GradientEllipse 포팅: 우측 패널 블롭 */
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
  /* 원래 비주얼로 복원: 블롭 자체에 부드러운 블러 + 채도 강화 */
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

/* 우측 회전 엘립스 마크 */
const rightEllipseSpin = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const RightEllipseMark = styled.img`
  position: absolute;
  right: ${props => props.$right || -2}%;
  top: ${props => props.$top || 18}%;
  /* 우측 원 크기에 맞춰 링 크기 조정 (기본 1400 유지) */
  width: ${props => props.$size || 1400}px;
  height: ${props => props.$size || 1400}px;
  transform-origin: 50% 50%;
  animation: ${rightEllipseSpin} 6s linear infinite;
  pointer-events: none;
  z-index: 2;
  filter: brightness(1.1) contrast(1.12);
  opacity: 0.95;
`;

/* 중앙 파동(얇은 링) */
const tv2RightPulseWave = keyframes`
  0% {
    transform: scale(0.85);
    opacity: 0.25;
  }
  18% {
    opacity: 1.0;
  }
  55% {
    transform: scale(1.6);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.9);
    opacity: 0.0;
  }
`;

export const RightCenterPulse = styled.div`
  position: absolute;
  right: ${props => props.$right ?? -2}%;
  top: ${props => props.$top ?? 18}%;
  width: ${props => props.$width || 2000}px;
  height: ${props => props.$height || 2000}px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.0) 0%,
    rgba(255, 255, 255, 0.0) 58%,
    /* 링 두께/밝기 강화 */
    rgba(255, 255, 255, 1.0) 68%,
    rgba(255, 255, 255, 0.8) 84%,
    rgba(255, 255, 255, 0.0) 98%
  );
  /* 퍼짐 강화를 위해 블러 강도 증가 */
  filter: blur(14px);
  transform-origin: 50% 50%;
  animation: ${tv2RightPulseWave} ${props => `${props.$duration || 9}s`} ease-out infinite;
  animation-delay: ${props => `${props.$delay1 || 0}s`};
  &::before,
  &::after {
    content: '';
    position: absolute; inset: 0;
    border-radius: inherit;
    background: inherit;
    filter: inherit;
    transform-origin: inherit;
    animation: ${tv2RightPulseWave} ${props => `${props.$duration || 9}s`} ease-out infinite;
  }
  &::before { animation-delay: ${props => `${props.$delay2 ?? (props.$duration || 9) / 3}s`}; }
  &::after  { animation-delay: ${props => `${props.$delay3 ?? (props.$duration || 9) * 2 / 3}s`}; }
`;

export const ClimateGroup = styled.div`
  /* 우측 범위가 넓어진 만큼 살짝 왼쪽으로 이동 + 전체를 조금 위로 */
  position: absolute; left: 6%; top: 100px;
  /* 블러 처리된 블롭보다 항상 위 레이어로 */
  z-index: 3;
  display: grid; gap: 86.4px;
  /* 우측 온습도 텍스트도 불투명 블랙 */
  color: #000;
  /* 그룹 자체는 블렌드 없이, 언더레이만 soft-light/color-burn 사용 */
  mix-blend-mode: normal;
  /* blend-mode가 배경과 상호작용하도록 드롭섀도우 필터 제거 */
  filter: none;
`;

export const ClimateRow = styled.div`
  /* 아이콘과 텍스트 사이 간격을 조금 좁힘 */
  display: flex; align-items: center; gap: 40px;
  /* 온도/습도 값 로테이팅이 더 입체감 있게 보이도록 3D 컨텍스트 부여 */
  perspective: 1200px;
  transform-style: preserve-3d;
  /* 온도/습도 텍스트도 중간 수준으로 (살짝 축소) */
  font-size: 76px;
  font-weight: 500;
  color: #000;
  /* 실제 글립은 FadeSlideText에서 hard-light 블렌드를 사용 */
  mix-blend-mode: normal;
  animation: ${climatePush} 2s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
  text-shadow: none;

  /* 값 텍스트(FadeSlideText)에 동일 언더레이 적용
     - 텍스트는 블렌드 없이 기본 렌더링
     - 언더레이는 앨범 뒤 블롭과 동일한 다크 컬러 + overlay 로 강하게 눌림 */
  & > div{
    position: relative; display: inline-block;
  }
  /* 두 번째 div(FadeSlideText 컨테이너)만 살짝 위로 올려 아이콘과 높이를 맞춘다 */
  & > div:last-of-type {
    transform: translateY(-6px);
  }
  & > div::before{
    content:''; position:absolute; inset:-26% -26%;
    border-radius:26px;
    background: radial-gradient(
      circle at 50% 55%,
      ${props => props.$dark || 'rgba(0,0,0,0.55)'} 0%,
      ${props => props.$dark || 'rgba(0,0,0,0.40)'} 52%,
      rgba(0,0,0,0.00) 100%
    );
    filter: blur(40px);
    mix-blend-mode: color-burn;
    z-index:-1; pointer-events:none;
    opacity: 0.12;
  }
  & > div::after{
    content:''; position:absolute; inset:-24% -24%;
    border-radius:26px;
    background: radial-gradient(
      circle at 50% 50%,
      ${props => props.$dark || 'rgba(0,0,0,0.70)'} 0%,
      ${props => props.$dark || 'rgba(0,0,0,0.70)'} 46%,
      rgba(0,0,0,0.0) 78%
    );
    filter: blur(36px);
    mix-blend-mode: color-burn;
    z-index:-1; pointer-events:none;
    opacity: 0.18;
  }
`;

export const NoticeTyping = styled.div`
  margin-top: 8px;
  /* 안내 텍스트도 살짝 축소 */
  font-size: 46px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: #000;
  mix-blend-mode: normal;
  overflow: hidden;
  white-space: nowrap;
  animation: ${noticeTyping} 5s steps(32, end) infinite;
  pointer-events: none;
  text-shadow: none;
`;

// 선택 이유(감정 설명) 인라인 키워드 (값 우측에 작게 배치)
export const ReasonCaption = styled.span`
  display: inline-block;
  margin-left: 20px;
  padding-top: 6px;
  font-size: 34px;
  line-height: 1.2;
  color: #000;
  opacity: 1;
  text-shadow: none;
`;

/* 온도/습도 옆 라벨(예: Fresh, Humid)은 아래에서 위로 천천히 떠올랐다
   약 5초 정도 머물렀다가 다시 사라지는 애니메이션 */
const climateLabelPulse = keyframes`
  0%, 35% {
    opacity: 0;
    transform: translateY(14px);
    filter: blur(8px);
  }
  45%, 90% {
    opacity: 0.9;
    transform: translateY(0);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
    filter: blur(4px);
  }
`;

export const ClimateLabel = styled.span`
  display: inline-block;
  /* 값과는 dots 뒤에서 살짝 떨어져 보이도록 간격/위치 조정 */
  margin-left: 12px;
  padding-top: 6px;
  font-size: 46px;
  line-height: 1.2;
  /* 조금 더 연한 오버레이 느낌을 위해 투명도 조정 */
  color: rgba(0,0,0,0.55);
  text-shadow: none;
  /* 라벨만 overlay 블렌드로 살짝 눌려 보이게 */
  mix-blend-mode: overlay;
  pointer-events: none;
  /* 생성 후 약 5초간 머물렀다가 사라지도록 주기를 10초로 설정 */
  animation: ${climateLabelPulse} 10s ease-in-out infinite;
`;

/* 값과 라벨 사이를 이어주는 ... 리더(dots) */
const climateDotsSweep = keyframes`
  0%, 20% {
    opacity: 0;
    transform: scaleX(0);
  }
  30%, 60% {
    opacity: 0.6;
    transform: scaleX(1);
  }
  80%, 100% {
    opacity: 0;
    transform: scaleX(1);
  }
`;

export const ClimateDots = styled.span`
  display: inline-block;
  margin: 0 16px;
  font-size: 32px;
  letter-spacing: 0.22em;
  color: rgba(0,0,0,0.35);
  pointer-events: none;
  user-select: none;
   transform-origin: left center;
   opacity: 0;
   transform: scaleX(0);
   /* 좌측 끝에서 우측으로 점점 채워졌다가 사라지는 애니메이션 */
   animation: ${climateDotsSweep} 10s ease-in-out infinite;
`;

export const SetupHint = styled.div`
  position: absolute;
  /* 기본값은 우측 패널 온습도 텍스트 정렬에 맞추되,
     좌측 패널 등에서 재사용할 때는 $left / $bottom / $fontSize 로 오버라이드 */
  left: ${props => props.$left || 'calc(6% + 220px)'};
  bottom: ${props => props.$bottom || '30px'};
  font-size: ${props => props.$fontSize || '44px'};
  font-weight: 400;
  color: rgba(0,0,0,0.5);
  opacity: 0;
  pointer-events: none;
  z-index: 7;
  white-space: nowrap;
  mix-blend-mode: normal;
  text-shadow: none;
  animation: ${setupHintPulse} 6s ease-in-out infinite;
`;


/* 온도/습도 아이콘도 상단 조명 아이콘과 동일하되,
   값 텍스트와 수평 정렬이 맞도록 살짝 아래로 내린다 */
export const ClimateIcon = styled(BaseHeaderIcon)`
  svg,
  img {
    transform: translateY(2px);
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


