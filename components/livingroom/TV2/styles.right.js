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

/* 기후 정보 슬라이드 인 */
const climatePush = keyframes`
  0%   { transform: translateX(60%) rotateX(20deg); opacity: 0; }
  60%  { transform: translateX(-6%) rotateX(-8deg); opacity: 1; }
  100% { transform: translateX(0) rotateX(0deg); opacity: 1; }
`;

/* 온습도 타이핑 애니메이션 */
const noticeTyping = keyframes`
  0%   { width: 0; opacity: 0; }
  8%   { width: 0; opacity: 1; }
  55%  { width: 100%; opacity: 1; }
  80%  { width: 100%; opacity: 0.9; }
  100% { width: 100%; opacity: 0; }
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
  /* 우측 온습도 텍스트도 70% 투명 블랙 */
  color: rgba(0,0,0,0.7);
  /* 그룹 자체는 블렌드 없이, 언더레이만 soft-light/color-burn 사용 */
  mix-blend-mode: normal;
  /* blend-mode가 배경과 상호작용하도록 드롭섀도우 필터 제거 */
  filter: none;
`;

export const ClimateRow = styled.div`
  /* 아이콘과 텍스트 사이 간격을 조금 좁힘 */
  display: flex; align-items: center; gap: 40px;
  /* 온도/습도 텍스트도 중간 수준으로 (살짝 축소) */
  font-size: 76px;
  font-weight: 500;
  color: rgba(0,0,0,0.7);
  /* 실제 글립은 FadeSlideText에서 hard-light 블렌드를 사용 */
  mix-blend-mode: normal;
  animation: ${climatePush} 0.8s ease-out;
  will-change: transform, opacity;
  text-shadow: none;

  /* 값 텍스트(FadeSlideText)에 동일 언더레이 적용
     - 텍스트는 mix-blend-mode: hard-light(블랙)
     - 이 언더레이는 화이트 soft-light로 강하게 블룸 느낌을 준다 */
  & > div{
    position: relative; display: inline-block;
  }
  /* 두 번째 div(FadeSlideText 컨테이너)만 살짝 위로 올려 아이콘과 높이를 맞춘다 */
  & > div:last-of-type {
    transform: translateY(-6px);
  }
  & > div::before{
    content:''; position:absolute; inset:-22% -24%;
    border-radius:22px;
    background: radial-gradient(
      circle at 50% 55%,
      rgba(255,255,255,0.85) 0%,
      rgba(255,255,255,0.42) 52%,
      rgba(255,255,255,0.00) 92%
    );
    filter: blur(40px);
    mix-blend-mode: soft-light;
    z-index:-1; pointer-events:none;
    /* 텍스트 뒤 화이트 soft-light 오버레이를 더 강하게 */
    opacity: 0.32;
  }
  & > div::after{
    content:''; position:absolute; inset:-20% -22%;
    border-radius:22px;
    background: radial-gradient(
      circle at 50% 55%,
      rgba(255,255,255,0.95) 0%,
      rgba(255,255,255,0.55) 48%,
      rgba(255,255,255,0.00) 84%
    );
    filter: blur(60px);
    mix-blend-mode: soft-light;
    z-index:-1; pointer-events:none;
    opacity: 0.58;
  }
`;

export const NoticeTyping = styled.div`
  margin-top: 8px;
  /* 안내 텍스트도 살짝 축소 */
  font-size: 46px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: rgba(0,0,0,0.7);
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
  color: rgba(0,0,0,0.7);
  opacity: 1;
  text-shadow: none;
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


