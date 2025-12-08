import React, { useEffect, useRef } from "react";
import { parseMusicString, normalizeTrackName } from '@/utils/data/albumData';
import { MUSIC_CATALOG } from '@/utils/data/musicCatalog';
import { useControls } from "leva";
import { useBlobVars } from "./blob/blob.logic";
import * as S from './styles';
import { useTV2Logic, useTV2DisplayLogic } from './logic';

export default function TV2Controls() {
  const { env, title, artist, coverSrc, audioSrc, reason } = useTV2Logic();
  const scalerRef = useRef(null);
  const audioRef = useRef(null);

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
  
  // 모든 로직은 logic.js의 useTV2DisplayLogic에서 처리
  const displayLogic = useTV2DisplayLogic({
    env,
    title,
    artist,
    coverSrc,
    audioSrc,
    reason,
    levaControls: {
      edgeBlurAmount,
      edgeBlurWidth,
      headerGradientStart,
      headerGradientMid,
      headerGradientEnd,
      headerGradientMidPos,
      headerGradientOpacity,
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
      rightPanelBgColor1,
      rightPanelBgColor1Opacity,
      rightPanelBgColor2,
      rightPanelBgColor2Opacity,
      rightPanelBgColor2Pos,
      rightPanelBgColor3,
      rightPanelBgColor3Opacity,
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
    },
    audioRef,
  });
  
  // 모든 로직은 displayLogic에서 처리됨
  const {
    isIdle,
    headerText: displayHeaderText,
    displayTitle,
    displayArtist,
    displayTemp,
    displayHumidity,
    displayHeaderText: displayHeaderTextValue,
    showTitleLoading,
    showArtistLoading,
    showAlbumCover,
    showTempLoading,
    showHumidityLoading,
    showHeaderLoading,
    showChangeMessage,
    albumVisualKey,
    albumTone,
    blurAnim,
    waveformData,
    scale,
    albumCardBackground,
    albumPalette,
    musicTag,
    headerGradientStartRgba,
    headerGradientMidRgba,
    headerGradientEndRgba,
    rightCircleColor1Rgba,
    rightCircleColor2Rgba,
    rightCircleColor3Rgba,
    rightCircleColor4Rgba,
    rightPanelBgColor1Rgba,
    rightPanelBgColor2Rgba,
    rightPanelBgColor3Rgba,
    textShadowColorRgba,
    iconShadowColorRgba,
    textGlowColorRgba,
    iconGlowColorRgba,
  } = displayLogic;
  
  // 브라우저 줌 방지 및 스크롤 비활성화 (UI 관련만 유지)
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
      <S.Scaler ref={scalerRef} style={{ '--tv2-scale': scale }}>
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
            >
              <S.FadeSlideText key={displayHeaderTextValue || displayHeaderText || 'header-loading'}>
                {showHeaderLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : (displayHeaderTextValue || displayHeaderText || '')}
              </S.FadeSlideText>
            </S.HeaderTitle>
          </S.Header>
          <S.Content>
            <S.LeftPanel
              $color1={albumPalette?.left1 || leftPanelColor1}
              $color2={albumPalette?.left2 || leftPanelColor2}
              $color3={albumPalette?.left3 || leftPanelColor3}
              $color4={albumPalette?.left4 || leftPanelColor4}
              $color5={albumPalette?.left5 || leftPanelColor5}
              $pos1={albumPalette?.pos1 ?? leftPanelGradientPos1}
              $pos2={albumPalette?.pos2 ?? leftPanelGradientPos2}
              $pos3={albumPalette?.pos3 ?? leftPanelGradientPos3}
              $pos4={albumPalette?.pos4 ?? leftPanelGradientPos4}
              $blur={blurAnim}
              $edgeBlurAmount={edgeBlurAmount}
              $edgeBlurWidth={edgeBlurWidth}
            >
              <S.LeftPanelRightEdge
                $blurAmount={edgeBlurAmount}
                $blurWidth={edgeBlurWidth}
                $color1={albumPalette?.left1 || leftPanelColor1}
                $color2={albumPalette?.left2 || leftPanelColor2}
                $color4={albumPalette?.left4 || leftPanelColor4}
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
              <S.FadeSlideText key={env.music || 'music-loading'}>
                {(() => {
                  if (!env.music) {
                    return <S.LoadingDots><span /><span /><span /></S.LoadingDots>;
                  }
                  // musicCatalog에서 tags 찾기
                  const parsed = parseMusicString(env.music);
                  const normalizedParsedTitle = normalizeTrackName(parsed.title);
                  const catalogEntry = MUSIC_CATALOG.find((m) => {
                    const normalizedCatalogTitle = normalizeTrackName(m.title);
                    const normalizedCatalogId = normalizeTrackName(m.id);
                    return normalizedCatalogTitle === normalizedParsedTitle || 
                           normalizedCatalogId === normalizedParsedTitle;
                  });
                  const tag = catalogEntry?.tags?.[0] || env.music;
                  return tag.charAt(0).toUpperCase() + tag.slice(1);
                })()}
              </S.FadeSlideText>
              </S.MusicRow>
              <S.AlbumCard>
              <S.AlbumBg $bg={albumCardBackground || 'rgba(255,255,255,0.96)'} />
            <S.AlbumVisual key={albumVisualKey}>
                {showAlbumCover && coverSrc ? (
                  <S.AlbumImage
                    src={coverSrc}
                    alt={displayTitle || 'album'}
                    onError={(e) => {
                      try {
                          e.currentTarget.style.visibility = 'hidden';
                      } catch {}
                    }}
                    loading="eager"
                  />
                ) : (
                  <S.AlbumPlaceholder>
                    {coverSrc && <S.AlbumGlow />}
                  </S.AlbumPlaceholder>
                )}
              </S.AlbumVisual>
              </S.AlbumCard>
              <S.TrackTitle
                $glowColor={textGlowColorRgba}
                $shadowColor={textShadowColorRgba}
                $shadowBlur={textShadowBlur}
                $shadowOffsetX={textShadowOffsetX}
                $shadowOffsetY={textShadowOffsetY}
            >
              <S.FadeSlideText key={displayTitle || env.music || 'title-loading'}>
                {showTitleLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : (displayTitle || env.music || '')}
              </S.FadeSlideText>
            </S.TrackTitle>
              <S.Artist
                $glowColor={textGlowColorRgba}
                $shadowColor={textShadowColorRgba}
                $shadowBlur={textShadowBlur}
                $shadowOffsetX={textShadowOffsetX}
                $shadowOffsetY={textShadowOffsetY}
            >
              <S.FadeSlideText key={displayArtist || 'artist-loading'}>
                {showArtistLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : displayArtist}
              </S.FadeSlideText>
            </S.Artist>
            {/* 음악 파형 인디케이터 */}
            <S.WaveformIndicator>
              {waveformData.map((height, i) => (
                <S.WaveformBar
                  key={i}
                  $height={height}
                />
              ))}
            </S.WaveformIndicator>
            {/* 숨김 오디오 요소 */}
            {audioSrc ? (
              <audio
                ref={audioRef}
                src={audioSrc}
                autoPlay
                loop
                playsInline
                preload="auto"
                style={{ display: 'none' }}
              />
            ) : null}
            {showChangeMessage && (
              <S.ChangeMessage>값이 변경되는 것에 3초 소요</S.ChangeMessage>
            )}
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
                  <S.FadeSlideText $roulette key={displayTemp || env.temp || 'temp-loading'}>
                    {showTempLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : (displayTemp || (typeof env?.temp === 'number' ? `${env.temp}°C` : ''))}
                  </S.FadeSlideText>
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
                  <S.FadeSlideText $roulette key={displayHumidity || env.humidity || 'humidity-loading'}>
                    {showHumidityLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : (displayHumidity || (typeof env?.humidity === 'number' ? `${env.humidity}%` : ''))}
                  </S.FadeSlideText>
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
