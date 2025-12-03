import React, { useEffect, useMemo, useState, useRef } from "react";
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

  // 특정 플레이스홀더/무드 텍스트는 개별 파일을 만들지 않고
  // 항상 존재하는 공통 커버 하나만 사용
  if (base === '시원한 EDM') {
    return '/sw2_albumcover/331music.png';
  }

  const simple = base
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `/sw2_albumcover/${simple}.png`;
}

export default function TV2Controls() {
  const { env, title, artist, coverSrc } = useTV2Logic();
  const scalerRef = useRef(null);

  const cssVars = useBlobVars(env);

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

  return (
    <S.Viewport>
      <S.Scaler ref={scalerRef} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <S.Root>
          <S.Header>
            <S.HeaderIcon>
              <img src="/figma/tv2-weather.png" alt="" loading="eager" />
            </S.HeaderIcon>
            <S.HeaderTitle>{headerText}</S.HeaderTitle>
          </S.Header>
          <S.Content>
            <S.LeftPanel>
              <S.AngularSweep />
              <S.AngularSharp />
              <S.MusicRow>
                <S.MusicIcon>
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
              <S.TrackTitle>{title || env.music || ''}</S.TrackTitle>
              <S.Artist>{artist || ''}</S.Artist>
            </S.LeftPanel>
            <S.RightPanel style={cssVars}>
              <S.RightEllipseMark src="/figma/Ellipse%202767.png" alt="" />
              <S.ClimateGroup>
                <S.ClimateRow>
                  <S.ClimateIcon>
                    <img src="/figma/tv2-temperature.png" alt="" />
                  </S.ClimateIcon>
                  <div>{env.temp}°C</div>
                </S.ClimateRow>
                <S.ClimateRow>
                  <S.ClimateIcon>
                    <img src="/figma/tv2-humidity.png" alt="" />
                  </S.ClimateIcon>
                  <div>{env.humidity}%</div>
                </S.ClimateRow>
              </S.ClimateGroup>
              <S.RightSw1Ellipse />
              <S.RightCenterPulse />
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
