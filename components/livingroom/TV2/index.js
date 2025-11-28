import React, { useEffect, useMemo, useState } from "react";
import { useBlobVars } from "./blob/blob.logic";
import * as S from './styles';
import { useTV2Logic } from './logic';

export default function TV2Controls() {
  const { env, title, artist, coverSrc } = useTV2Logic();

  const cssVars = useBlobVars(env);

  // Leva 제거에 따라 블롭은 기본 스타일로 동작 (env 기반 cssVars만 유지)

  // Leva 제거

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
      <S.Scaler style={{ transform: `scale(${scale})` }}>
        <S.Root>
          <S.Header>
            <S.HeaderIcon>
              <img src="/figma/tv2-weather.png" alt="" loading="eager" />
            </S.HeaderIcon>
            <S.HeaderTitle>{env.lightLabel || 'Blue Light'}</S.HeaderTitle>
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
                <S.AlbumImage src="/sw2_albumcover/sunny_side_up.png" alt={title || 'album'} />
              </S.AlbumCard>
              <S.TrackTitle>Sunny Side Up</S.TrackTitle>
              <S.Artist>Victor Lundberg</S.Artist>
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
        </S.Root>
      </S.Scaler>
    </S.Viewport>
  );
}
