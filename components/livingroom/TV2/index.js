import React, { useEffect, useMemo, useState, useRef } from "react";
import { useControls } from "leva";
import { useBlobVars } from "./blob/blob.logic";
import * as S from './styles';
import { useTV2Logic } from './logic';

// Convert hex to HSL and produce a compact natural-language description
function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const v = m[1];
  return { r: parseInt(v.slice(0,2),16), g: parseInt(v.slice(2,4),16), b: parseInt(v.slice(4,6),16) };
}
function rgbToHsl(r,g,b){
  const R=r/255,G=g/255,B=b/255; const max=Math.max(R,G,B),min=Math.min(R,G,B);
  let h=0,s=0; const l=(max+min)/2; const d=max-min;
  if(d!==0){ s=l>0.5? d/(2-max-min): d/(max-min);
    switch(max){case R:h=(G-B)/d+(G<B?6:0);break;case G:h=(B-R)/d+2;break;default:h=(R-G)/d+4;}
    h/=6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}
function describeHexColor(hex){
  const rgb=hexToRgb(hex); if(!rgb) return '중립 톤';
  const {h,s,l}=rgbToHsl(rgb.r,rgb.g,rgb.b);
  const tone = l>80? '파스텔 ' : (s<25? '부드러운 ' : '');
  let name='중립 톤';
  if(h<15||h>=345) name='레드';
  else if(h<35) name='코랄';
  else if(h<50) name='오렌지';
  else if(h<70) name='옐로';
  else if(h<95) name='라임';
  else if(h<150) name='민트';
  else if(h<185) name='청록';
  else if(h<215) name='블루';
  else if(h<245) name='인디고';
  else if(h<285) name='보라';
  else if(h<330) name='마젠타';
  else name='핑크';
  return `${tone}${name}`.trim();
}
// Build a best-effort static fallback cover path from the title
function fallbackCoverForTitle(title){
  const base = String(title || '').trim();
  if (!base) return '';
  const simple = base.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '_').replace(/^_+|_+$/g, '');
  return `/sw2_albumcover/${simple}.png`;
}

export default function TV2Controls() {
  const { env, title, artist, coverSrc } = useTV2Logic();
  const scalerRef = useRef(null);

  const cssVars = useBlobVars(env);

  // Leva 컨트롤
  const {
    // 1. 경계 블러값과 범위 조절
    edgeBlurAmount,
    edgeBlurWidth,
    // 2. 상단 헤더 그라데이션
    headerGradientStart,
    headerGradientMid,
    headerGradientEnd,
    headerGradientMidPos,
    headerGradientOpacity,
    // 3. 좌측 패널 백그라운드 그라데이션
    leftPanelColor1,
    leftPanelColor2,
    leftPanelColor3,
    leftPanelColor4,
    leftPanelColor5,
    leftPanelGradientPos1,
    leftPanelGradientPos2,
    leftPanelGradientPos3,
    leftPanelGradientPos4,
    leftPanelBlur,
    // 4. 우측 원
    rightCircleRight,
    rightCircleTop,
    rightCircleScale,
    rightCircleWidth,
    rightCircleHeight,
    rightCircleColor1,
    rightCircleColor1Opacity,
    rightCircleColor2,
    rightCircleColor2Opacity,
    rightCircleColor3,
    rightCircleColor3Opacity,
    rightCircleColor4,
    rightCircleColor4Opacity,
    rightCircleGradientPos1,
    rightCircleGradientPos2,
    rightCircleGradientPos3,
    rightCircleOpacity,
    // 5. 우측 패널 배경색
    rightPanelBgColor1,
    rightPanelBgColor1Opacity,
    rightPanelBgColor2,
    rightPanelBgColor2Opacity,
    rightPanelBgColor2Pos,
    rightPanelBgColor3,
    rightPanelBgColor3Opacity,
    // 6. 텍스트/아이콘 그림자 및 글로우
    textGlowColor,
    textShadowColor,
    textShadowOpacity,
    textShadowBlur,
    textShadowOffsetX,
    textShadowOffsetY,
    iconGlowColor,
    iconShadowColor,
    iconShadowOpacity,
    iconShadowBlur,
    iconShadowOffsetX,
    iconShadowOffsetY,
  } = useControls('TV2 Controls', {
    // 1. 경계 블러값과 범위 조절
    edgeBlurAmount: { value: 9, min: 0, max: 50, step: 1, label: '경계 블러 강도' },
    edgeBlurWidth: { value: 8, min: 0, max: 100, step: 1, label: '경계 블러 범위' },
    // 2. 상단 헤더 그라데이션
    headerGradientStart: { value: '#4880e2', label: '헤더 시작 색상' },
    headerGradientMid: { value: '#ffe9f4', label: '헤더 중간 색상' },
    headerGradientEnd: { value: '#fcfcfc', label: '헤더 끝 색상' },
    headerGradientMidPos: { value: 73, min: 0, max: 100, step: 1, label: '헤더 중간 위치(%)' },
    headerGradientOpacity: { value: 1, min: 0, max: 1, step: 0.01, label: '헤더 투명도' },
    // 3. 좌측 패널 백그라운드 그라데이션
    leftPanelColor1: { value: '#ff719c', label: '좌측 색상1' },
    leftPanelColor2: { value: '#ffe2ea', label: '좌측 색상2' },
    leftPanelColor3: { value: '#fffded', label: '좌측 색상3' },
    leftPanelColor4: { value: '#ffbac4', label: '좌측 색상4' },
    leftPanelColor5: { value: '#f2e1e1', label: '좌측 색상5' },
    leftPanelGradientPos1: { value: 0, min: 0, max: 360, step: 1, label: '좌측 그라데이션 위치1(deg)' },
    leftPanelGradientPos2: { value: 0, min: 0, max: 360, step: 0.1, label: '좌측 그라데이션 위치2(deg)' },
    leftPanelGradientPos3: { value: 150, min: 0, max: 360, step: 0.1, label: '좌측 그라데이션 위치3(deg)' },
    leftPanelGradientPos4: { value: 283, min: 0, max: 360, step: 1, label: '좌측 그라데이션 위치4(deg)' },
    leftPanelBlur: { value: 1, min: 0, max: 100, step: 1, label: '좌측 블러' },
    // 4. 우측 원
    rightCircleRight: { value: -4.9, min: -20, max: 20, step: 0.1, label: '우측 원 오른쪽 위치(%)' },
    rightCircleTop: { value: 4, min: 0, max: 50, step: 0.1, label: '우측 원 상단 위치(%)' },
    rightCircleScale: { value: 0.97, min: 0.1, max: 3, step: 0.01, label: '우측 원 크기 스케일' },
    rightCircleWidth: { value: 2000, min: 500, max: 4000, step: 50, label: '우측 원 너비' },
    rightCircleHeight: { value: 2000, min: 500, max: 4000, step: 50, label: '우측 원 높이' },
    rightCircleColor1: { value: '#f8e9eb', label: '우측 원 색상1' },
    rightCircleColor1Opacity: { value: 1, min: 0, max: 1, step: 0.01, label: '우측 원 색상1 투명도' },
    rightCircleColor2: { value: '#e8adbe', label: '우측 원 색상2' },
    rightCircleColor2Opacity: { value: 0.69, min: 0, max: 1, step: 0.01, label: '우측 원 색상2 투명도' },
    rightCircleColor3: { value: '#d87199', label: '우측 원 색상3' },
    rightCircleColor3Opacity: { value: 0.37, min: 0, max: 1, step: 0.01, label: '우측 원 색상3 투명도' },
    rightCircleColor4: { value: '#fff3ed', label: '우측 원 색상4' },
    rightCircleColor4Opacity: { value: 0.60, min: 0, max: 1, step: 0.01, label: '우측 원 색상4 투명도' },
    rightCircleGradientPos1: { value: 21.5, min: 0, max: 100, step: 0.1, label: '우측 원 그라데이션 위치1(%)' },
    rightCircleGradientPos2: { value: 58.2, min: 0, max: 100, step: 0.1, label: '우측 원 그라데이션 위치2(%)' },
    rightCircleGradientPos3: { value: 67.5, min: 0, max: 100, step: 0.1, label: '우측 원 그라데이션 위치3(%)' },
    rightCircleOpacity: { value: 1, min: 0, max: 1, step: 0.01, label: '우측 원 전체 투명도' },
    // 5. 우측 패널 배경색
    rightPanelBgColor1: { value: '#ffffff', label: '우측 패널 배경색1' },
    rightPanelBgColor1Opacity: { value: 0.95, min: 0, max: 1, step: 0.01, label: '우측 패널 배경색1 투명도' },
    rightPanelBgColor2: { value: '#efebe1', label: '우측 패널 배경색2' },
    rightPanelBgColor2Opacity: { value: 0.78, min: 0, max: 1, step: 0.01, label: '우측 패널 배경색2 투명도' },
    rightPanelBgColor2Pos: { value: 55, min: 0, max: 100, step: 1, label: '우측 패널 배경색2 위치(%)' },
    rightPanelBgColor3: { value: '#d8f5f8', label: '우측 패널 배경색3' },
    rightPanelBgColor3Opacity: { value: 0.90, min: 0, max: 1, step: 0.01, label: '우측 패널 배경색3 투명도' },
    // 6. 텍스트/아이콘 그림자 및 글로우
    textGlowColor: { value: '#e9ffe6', label: '텍스트 글로우 색상' },
    textShadowColor: { value: '#1c1b76', label: '텍스트 그림자 색상' },
    textShadowOpacity: { value: 0.19, min: 0, max: 1, step: 0.01, label: '텍스트 그림자 투명도' },
    textShadowBlur: { value: 8, min: 0, max: 20, step: 1, label: '텍스트 그림자 블러' },
    textShadowOffsetX: { value: 1, min: -10, max: 10, step: 1, label: '텍스트 그림자 X 오프셋' },
    textShadowOffsetY: { value: 0, min: -10, max: 10, step: 1, label: '텍스트 그림자 Y 오프셋' },
    iconGlowColor: { value: '#e9ffe6', label: '아이콘 글로우 색상' },
    iconShadowColor: { value: '#1c1b76', label: '아이콘 그림자 색상' },
    iconShadowOpacity: { value: 0.19, min: 0, max: 1, step: 0.01, label: '아이콘 그림자 투명도' },
    iconShadowBlur: { value: 8, min: 0, max: 20, step: 1, label: '아이콘 그림자 블러' },
    iconShadowOffsetX: { value: 1, min: -10, max: 10, step: 1, label: '아이콘 그림자 X 오프셋' },
    iconShadowOffsetY: { value: 0, min: -10, max: 10, step: 1, label: '아이콘 그림자 Y 오프셋' },
  });

  // 3s toggle for header label (hex ↔ natural-language name)
  const [showAltLabel, setShowAltLabel] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setShowAltLabel((v) => !v), 3000);
    return () => clearInterval(id);
  }, []);
  const hexColor = (env?.lightColor || '').toUpperCase();
  const friendlyName = useMemo(() => describeHexColor(hexColor), [hexColor]);
  const headerText = showAltLabel ? (friendlyName || env.lightLabel || 'Blue Light') : (hexColor || env.lightLabel || 'Blue Light');

  // Consider idle until we have any track meta
  const isIdle = !title && !artist && !coverSrc && (!env || env.music === 'ambient');
  const fallbackCover = useMemo(() => fallbackCoverForTitle(title), [title]);

  // Zoom-invariant cover scale for a fixed 3840x2160 canvas (match TV1 behavior)
  const computeCoverScale = () => {
    if (typeof window === 'undefined') return 1;
    const baseWidth = 3840;
    const baseHeight = 2160;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return Math.max(vw / baseWidth, vh / baseHeight);
  };
  const [scale, setScale] = useState(() => computeCoverScale());
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setScale(computeCoverScale());
    update();
    window.addEventListener('resize', update);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update);
      window.visualViewport.addEventListener('scroll', update);
    }
    return () => {
      window.removeEventListener('resize', update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', update);
        window.visualViewport.removeEventListener('scroll', update);
      }
    };
  }, []);

  // Debug logging for layout analysis
  useEffect(() => {
    const check = () => {
      if (!scalerRef.current) return;
      const r = scalerRef.current.getBoundingClientRect();
      console.log("TV2 Layout Debug:", {
        vw: window.innerWidth,
        vh: window.innerHeight,
        scale,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        transform: scalerRef.current.style.transform
      });
    };
    const timer = setInterval(check, 2000);
    window.addEventListener('resize', check);
    // Initial check
    setTimeout(check, 500);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', check);
    };
  }, [scale]);

  // Block browser zoom gestures/shortcuts to keep the view locked
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };
    const onGesture = (e) => {
      e.preventDefault();
    };
    let lastTouch = 0;
    const onTouchStart = (e) => {
      const now = Date.now();
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
      if (now - lastTouch < 300) {
        e.preventDefault();
      }
      lastTouch = now;
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('gesturestart', onGesture);
    window.addEventListener('gesturechange', onGesture);
    window.addEventListener('gestureend', onGesture);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel, { passive: false });
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('gesturestart', onGesture);
      window.removeEventListener('gesturechange', onGesture);
      window.removeEventListener('gestureend', onGesture);
      window.removeEventListener('touchstart', onTouchStart, { passive: false });
    };
  }, []);

  // Disable page scroll while mounted
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // 헤더 그라데이션 색상을 rgba로 변환
  const hexToRgba = (hex, opacity = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r},${g},${b},${opacity})`;
  };

  const headerGradientStartRgba = hexToRgba(headerGradientStart, headerGradientOpacity);
  const headerGradientMidRgba = hexToRgba(headerGradientMid, headerGradientOpacity);
  const headerGradientEndRgba = hexToRgba(headerGradientEnd, headerGradientOpacity);

  // 우측 원 색상을 rgba로 변환 (각 색상의 투명도 적용)
  const rightCircleColor1Rgba = hexToRgba(rightCircleColor1, rightCircleColor1Opacity);
  const rightCircleColor2Rgba = hexToRgba(rightCircleColor2, rightCircleColor2Opacity);
  const rightCircleColor3Rgba = hexToRgba(rightCircleColor3, rightCircleColor3Opacity);
  const rightCircleColor4Rgba = hexToRgba(rightCircleColor4, rightCircleColor4Opacity);

  // 우측 패널 배경색을 rgba로 변환
  const rightPanelBgColor1Rgba = hexToRgba(rightPanelBgColor1, rightPanelBgColor1Opacity);
  const rightPanelBgColor2Rgba = hexToRgba(rightPanelBgColor2, rightPanelBgColor2Opacity);
  const rightPanelBgColor3Rgba = hexToRgba(rightPanelBgColor3, rightPanelBgColor3Opacity);

  // 텍스트/아이콘 그림자 색상을 rgba로 변환
  const textShadowColorRgba = hexToRgba(textShadowColor, textShadowOpacity);
  const iconShadowColorRgba = hexToRgba(iconShadowColor, iconShadowOpacity);
  const textGlowColorRgba = hexToRgba(textGlowColor, 0.5);
  const iconGlowColorRgba = hexToRgba(iconGlowColor, 0.5);

  return (
    <S.Viewport>
      <S.Scaler ref={scalerRef} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <S.Root>
          <S.Header
            $gradientStart={headerGradientStartRgba}
            $gradientMid={headerGradientMidRgba}
            $gradientEnd={headerGradientEndRgba}
            $gradientMidPos={headerGradientMidPos}
            $edgeBlurAmount={edgeBlurAmount}
            $edgeBlurWidth={edgeBlurWidth}
          >
            <S.HeaderIcon
              $glowColor={iconGlowColorRgba}
              $shadowColor={iconShadowColorRgba}
              $shadowBlur={iconShadowBlur}
              $shadowOffsetX={iconShadowOffsetX}
              $shadowOffsetY={iconShadowOffsetY}
            >
              <img src="/figma/tv2-weather.png" alt="" loading="eager" />
            </S.HeaderIcon>
            <S.HeaderTitle
              $glowColor={textGlowColorRgba}
              $shadowColor={textShadowColorRgba}
              $shadowBlur={textShadowBlur}
              $shadowOffsetX={textShadowOffsetX}
              $shadowOffsetY={textShadowOffsetY}
            >{headerText}</S.HeaderTitle>
          </S.Header>
          <S.Content>
            <S.LeftPanel
              $color1={leftPanelColor1}
              $color2={leftPanelColor2}
              $color3={leftPanelColor3}
              $color4={leftPanelColor4}
              $color5={leftPanelColor5}
              $pos1={leftPanelGradientPos1}
              $pos2={leftPanelGradientPos2}
              $pos3={leftPanelGradientPos3}
              $pos4={leftPanelGradientPos4}
              $blur={leftPanelBlur}
              $edgeBlurAmount={edgeBlurAmount}
              $edgeBlurWidth={edgeBlurWidth}
            >
              <S.LeftPanelRightEdge
                $blurAmount={edgeBlurAmount}
                $blurWidth={edgeBlurWidth}
                $color1={leftPanelColor1}
                $color2={leftPanelColor2}
                $color4={leftPanelColor4}
              />
              <S.AngularSweep />
              <S.AngularSharp />
              <S.MusicRow
                $glowColor={textGlowColorRgba}
                $shadowColor={textShadowColorRgba}
                $shadowBlur={textShadowBlur}
                $shadowOffsetX={textShadowOffsetX}
                $shadowOffsetY={textShadowOffsetY}
              >
                <S.MusicIcon
                  $glowColor={iconGlowColorRgba}
                  $shadowColor={iconShadowColorRgba}
                  $shadowBlur={iconShadowBlur}
                  $shadowOffsetX={iconShadowOffsetX}
                  $shadowOffsetY={iconShadowOffsetY}
                >
                  <img src="/figma/tv2-song.png" alt="" />
                </S.MusicIcon>
                <div>{env.music}</div>
              </S.MusicRow>
              <S.AlbumCard>
                {(coverSrc || fallbackCover) ? (
                  <S.AlbumImage
                    src={coverSrc || fallbackCover}
                    alt={title || 'album'}
                    onError={(e) => {
                      try {
                        // One-time fallback to normalized public asset, then hide if still failing
                        if (fallbackCover && !e.currentTarget.src.endsWith(fallbackCover)) {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackCover;
                        } else {
                          e.currentTarget.style.visibility = 'hidden';
                        }
                      } catch {}
                    }}
                    loading="eager"
                  />
                ) : null}
              </S.AlbumCard>
              <S.TrackTitle
                $glowColor={textGlowColorRgba}
                $shadowColor={textShadowColorRgba}
                $shadowBlur={textShadowBlur}
                $shadowOffsetX={textShadowOffsetX}
                $shadowOffsetY={textShadowOffsetY}
              >{title || env.music || ''}</S.TrackTitle>
              <S.Artist
                $glowColor={textGlowColorRgba}
                $shadowColor={textShadowColorRgba}
                $shadowBlur={textShadowBlur}
                $shadowOffsetX={textShadowOffsetX}
                $shadowOffsetY={textShadowOffsetY}
              >{artist || ''}</S.Artist>
            </S.LeftPanel>
            <S.RightPanel
              style={cssVars}
              $edgeBlurAmount={edgeBlurAmount}
              $edgeBlurWidth={edgeBlurWidth}
              $bgColor1={rightPanelBgColor1Rgba}
              $bgColor2={rightPanelBgColor2Rgba}
              $bgColor2Pos={rightPanelBgColor2Pos}
              $bgColor3={rightPanelBgColor3Rgba}
            >
              <S.RightEllipseMark 
                src="/figma/Ellipse%202767.png" 
                alt=""
                $right={rightCircleRight}
                $top={rightCircleTop}
              />
              <S.ClimateGroup>
                <S.ClimateRow
                  $glowColor={textGlowColorRgba}
                  $shadowColor={textShadowColorRgba}
                  $shadowBlur={textShadowBlur}
                  $shadowOffsetX={textShadowOffsetX}
                  $shadowOffsetY={textShadowOffsetY}
                >
                  <S.ClimateIcon
                    $glowColor={iconGlowColorRgba}
                    $shadowColor={iconShadowColorRgba}
                    $shadowBlur={iconShadowBlur}
                    $shadowOffsetX={iconShadowOffsetX}
                    $shadowOffsetY={iconShadowOffsetY}
                  >
                    <img src="/figma/tv2-temperature.png" alt="" />
                  </S.ClimateIcon>
                  <div>{env.temp}°C</div>
                </S.ClimateRow>
                <S.ClimateRow
                  $glowColor={textGlowColorRgba}
                  $shadowColor={textShadowColorRgba}
                  $shadowBlur={textShadowBlur}
                  $shadowOffsetX={textShadowOffsetX}
                  $shadowOffsetY={textShadowOffsetY}
                >
                  <S.ClimateIcon
                    $glowColor={iconGlowColorRgba}
                    $shadowColor={iconShadowColorRgba}
                    $shadowBlur={iconShadowBlur}
                    $shadowOffsetX={iconShadowOffsetX}
                    $shadowOffsetY={iconShadowOffsetY}
                  >
                    <img src="/figma/tv2-humidity.png" alt="" />
                  </S.ClimateIcon>
                  <div>{env.humidity}%</div>
                </S.ClimateRow>
              </S.ClimateGroup>
              <S.RightSw1Ellipse
                $right={rightCircleRight}
                $top={rightCircleTop}
                $width={rightCircleWidth * rightCircleScale}
                $height={rightCircleHeight * rightCircleScale}
                $color1={rightCircleColor1Rgba}
                $color2={rightCircleColor2Rgba}
                $color3={rightCircleColor3Rgba}
                $color4={rightCircleColor4Rgba}
                $pos1={rightCircleGradientPos1}
                $pos2={rightCircleGradientPos2}
                $pos3={rightCircleGradientPos3}
                $opacity={rightCircleOpacity}
              />
            </S.RightPanel>
          </S.Content>
          {isIdle && (
            <S.ThinkingOverlay aria-hidden>
              <S.ThinkingDot /><S.ThinkingDot /><S.ThinkingDot />
            </S.ThinkingOverlay>
          )}
        </S.Root>
      </S.Scaler>
    </S.Viewport>
  );
}
