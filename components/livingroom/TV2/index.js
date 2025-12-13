import React, { useEffect, useRef } from "react";
import { parseMusicString, normalizeTrackName } from '@/utils/data/albumData';
import { MUSIC_CATALOG } from '@/utils/data/musicCatalog';
import { useControls } from "leva";
import { useBlobVars } from "./blob/blob.logic";
import * as S from './styles';
import { useTV2Logic, useTV2DisplayLogic } from './logic';
import { playTv2Transition } from '@/utils/data/soundeffect';
import useTTS from "@/utils/hooks/useTTS";

export default function TV2Controls() {
  const { env, title, artist, coverSrc, audioSrc, reason, emotionKeyword, decisionToken } = useTV2Logic();
  const scalerRef = useRef(null);
  const audioRef = useRef(null);
  const lastTransitionKeyRef = useRef(null);
  const t5SpokenRef = useRef(-1);

  const cssVars = useBlobVars(env);
  const { play: playTts } = useTTS({ voice: 'marin', model: 'gpt-4o-mini-tts', format: 'mp3', volume: 0.9 });
  // 언어 감지: 한글 포함 여부로 ko/en 분기
  const getLang = (s) => /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(String(s || '')) ? 'ko' : 'en';


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
    headerGradientEndPos,
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
    textBlendMode,
    iconGlowColor,
    iconShadowColor,
    iconShadowOpacity,
    iconShadowBlur,
    iconShadowOffsetX,
    iconShadowOffsetY,
  } = useControls('TV2 Controls', {
    // 1. 경계 블러값과 범위 조절
    edgeBlurAmount: { value: 37, min: 0, max: 100, step: 1, label: '경계 블러 강도' },
    edgeBlurWidth: { value: 56, min: 0, max: 120, step: 1, label: '경계 블러 범위' },
    // 2. 상단 헤더 그라데이션
    headerGradientStart: { value: '#4880e2', label: '헤더 시작 색상' },
    headerGradientMid: { value: '#ffe9f4', label: '헤더 중간 색상' },
    headerGradientEnd: { value: '#fcfcfc', label: '헤더 끝 색상' },
    headerGradientMidPos: { value: 10, min: 0, max: 100, step: 1, label: '헤더 중간 위치(%)' },
    headerGradientEndPos: { value: 90, min: 0, max: 100, step: 1, label: '헤더 우측 위치(%)' },
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
    //    우측 원 전체를 더 위로 올리기 위해 top 기본값과 최소값 조정
    rightCircleRight: { value: 20, min: -20, max: 20, step: 0.1, label: '우측 원 오른쪽 위치(%)' },
    rightCircleTop: { value: -3, min: -20, max: 50, step: 0.1, label: '우측 원 상단 위치(%)' },
    rightCircleScale: { value: 1.1, min: 0.1, max: 3, step: 0.01, label: '우측 원 크기 스케일' },
    rightCircleWidth: { value: 2200, min: 500, max: 4000, step: 50, label: '우측 원 너비' },
    rightCircleHeight: { value: 2200, min: 500, max: 4000, step: 50, label: '우측 원 높이' },
    rightCircleColor1: { value: '#f8e9eb', label: '우측 원 색상1' },
    rightCircleColor1Opacity: { value: 1, min: 0, max: 1, step: 0.01, label: '우측 원 색상1 투명도' },
    rightCircleColor2: { value: '#e8adbe', label: '우측 원 색상2' },
    rightCircleColor2Opacity: { value: 0.69, min: 0, max: 1, step: 0.01, label: '우측 원 색상2 투명도' },
    rightCircleColor3: { value: '#d87199', label: '우측 원 색상3' },
    rightCircleColor3Opacity: { value: 0.37, min: 0, max: 1, step: 0.01, label: '우측 원 색상3 투명도' },
    rightCircleColor4: { value: '#fff3ed', label: '우측 원 색상4' },
    rightCircleColor4Opacity: { value: 0.60, min: 0, max: 1, step: 0.01, label: '우측 원 색상4 투명도' },
    //    현재 튜닝된 그라데이션 위치값을 기본값으로 반영
    rightCircleGradientPos1: { value: 15.2, min: 0, max: 100, step: 0.1, label: '우측 원 그라데이션 위치1(%)' },
    rightCircleGradientPos2: { value: 56.2, min: 0, max: 100, step: 0.1, label: '우측 원 그라데이션 위치2(%)' },
    rightCircleGradientPos3: { value: 79.9, min: 0, max: 100, step: 0.1, label: '우측 원 그라데이션 위치3(%)' },
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
    textBlendMode: { value: 'overlay', options: ['overlay', 'difference', 'screen', 'multiply'], label: '텍스트 블렌드 모드' },
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
    emotionKeyword,
    decisionToken,
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
    displayReason,
    showReasonLoading,
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
    prevHeaderGradient,
    prevHeaderVisible,
    headerSweepMainColor,
    headerSweepContrastColor,
    headerSweepWhiteColor,
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
    motionState,
    decisionKey,
    showBorderFlash,
    isT4,
    isT5,
    triggerT4Animations,
    triggerT5Animations,
    waveformPulseIntensity,
    headerSweepActive,
  } = displayLogic;

  // T5 안내: 음악/조명/기후 정보 포함
  useEffect(() => {
    try {
      if (triggerT5Animations && isT5 && decisionKey !== t5SpokenRef.current) {
        const musicName = (displayTitle || env.music || '음악').trim();
        const colorName = (displayHeaderTextValue || displayHeaderText || env.lightColor || '조명').trim();
        t5SpokenRef.current = decisionKey;
        playTts(`${musicName}, ${colorName}에 맞추어 조율된 공간을 경험해 보세요.`);
      }
    } catch {}
  }, [triggerT5Animations, isT5, decisionKey, displayTitle, env.music, displayHeaderTextValue, displayHeaderText, env.lightColor, playTts]);

  // TV2: 새로운 모바일 input으로 env가 바뀌어 T4 전체 화면 전환이 시작될 때 효과음 1회 재생
  useEffect(() => {
    try {
      if (triggerT4Animations && isT4) {
        const lastKey = lastTransitionKeyRef.current;
        if (lastKey !== decisionKey) {
          playTv2Transition();
          lastTransitionKeyRef.current = decisionKey;
        }
      }
    } catch {}
  }, [triggerT4Animations, isT4, decisionKey]);

  // 곡명 컬러는 블랙으로 고정 (화이트 글로우는 스타일에 적용)
  const titleColor = '#000';

  // 모든 정보가 한 번에 뜨도록 공통 로딩 상태
  const isLoading =
    showTitleLoading ||
    showArtistLoading ||
    showTempLoading ||
    showHumidityLoading ||
    showHeaderLoading ||
    showReasonLoading;
  
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
          {/* TV2 전역 페이지 트랜지션 레이어
              - logic.js의 motionState / isIdle 플래그만 읽어서
                진입/결정 시각 효과만 추가 (로직/소켓은 전혀 수정하지 않음) */}
          <S.PageOverlay
            key={`tv2-page-overlay-${decisionKey}-${motionState}`}
            $isIdle={isIdle}
            $triggerT4={triggerT4Animations}
          />
          <S.Header
            key={`header-${decisionKey}-${isT4}`}
            $gradientStart={headerGradientStartRgba}
            $gradientMid={headerGradientMidRgba}
            $gradientEnd={headerGradientEndRgba}
            $gradientMidPos={headerGradientMidPos}
            $gradientEndPos={headerGradientEndPos}
            $edgeBlurAmount={edgeBlurAmount}
            $edgeBlurWidth={edgeBlurWidth}
            $isT4={isT4}
            $triggerT4={triggerT4Animations}
            $sweepMain={headerSweepMainColor}
            $sweepContrast={headerSweepContrastColor}
            $sweepWhite={headerSweepWhiteColor}
            $sweepActive={headerSweepActive}
          >
            <div className="header-bg" aria-hidden="true" />
            <div className="header-edge-top" aria-hidden="true" />
            <div className="header-bottom-blur" aria-hidden="true" />
            {prevHeaderGradient ? (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 0,
                  opacity: prevHeaderVisible ? 1 : 0,
                  transition: "opacity 900ms ease",
                  background: `linear-gradient(90deg,
                    ${prevHeaderGradient.start} 0%,
                    ${prevHeaderGradient.mid} ${prevHeaderGradient.midPos}%,
                    ${prevHeaderGradient.end} ${prevHeaderGradient.endPos}%,
                    ${prevHeaderGradient.end} 100%)`,
                  backgroundSize: "300% 100%",
                }}
              />
            ) : null}
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
                <S.FadeSlideText $slideLR $isT5={isT5} $triggerT5={triggerT5Animations} key={`${displayHeaderTextValue || displayHeaderText || 'header-loading'}-${decisionKey}`} lang={getLang(displayHeaderTextValue || displayHeaderText || '')}>
                  {showHeaderLoading ? (
                    <S.LoadingDots><span /><span /><span /></S.LoadingDots>
                  ) : (
                    <>
                      {displayHeaderTextValue || displayHeaderText || ''}
                      {displayReason && !showReasonLoading && (
                        <S.ReasonCaption>{displayReason}</S.ReasonCaption>
                      )}
                    </>
                  )}
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
              $isT4={isT4}
              $triggerT4={triggerT4Animations}
            >
              <S.LeftPanelRightEdge
                $blurAmount={edgeBlurAmount}
                $blurWidth={edgeBlurWidth}
                $color1={albumPalette?.left1 || leftPanelColor1}
                $color2={albumPalette?.left2 || leftPanelColor2}
                $color4={albumPalette?.left4 || leftPanelColor4}
              />
              <S.EmotionFlow>
                <span lang={getLang(isLoading ? '' : (musicTag || env.music || ''))}>
                  {isLoading
                    ? <S.LoadingDots><span /><span /><span /></S.LoadingDots>
                    : (musicTag || env.music || '')}
                </span>
              </S.EmotionFlow>
              <S.AngularSweep />
              <S.AngularSharp />
              {/* 앨범 뒤쪽을 살짝 눌러주는 다크 블롭 */}
              <S.AlbumBackdropBlob $dark={headerSweepContrastColor} />
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
              <S.FadeSlideText $slideLR $isT5={isT5} $triggerT5={triggerT5Animations} key={`${env.music || 'music-loading'}-${decisionKey}`}>
                {(() => {
                  if (!env.music) {
                    return <S.LoadingDots><span /><span /><span /></S.LoadingDots>;
                  }
                  // musicCatalog에서 카테고리(cat) 우선 사용, 없으면 tags[0] 사용
                  const parsed = parseMusicString(env.music);
                  const normalizedParsedTitle = normalizeTrackName(parsed.title);
                  const catalogEntry = MUSIC_CATALOG.find((m) => {
                    const normalizedCatalogTitle = normalizeTrackName(m.title);
                    const normalizedCatalogId = normalizeTrackName(m.id);
                    return normalizedCatalogTitle === normalizedParsedTitle || 
                           normalizedCatalogId === normalizedParsedTitle;
                  });
                  const label = (catalogEntry?.cat || catalogEntry?.tags?.[0] || env.music || '').toString();
                  return (
                    <>
                      <span lang={getLang(label)}>{label}</span>
                      {displayReason && !showReasonLoading && (
                        <S.ReasonCaption>{displayReason}</S.ReasonCaption>
                      )}
                    </>
                  );
                })()}
              </S.FadeSlideText>
              </S.MusicRow>
              <S.AlbumCard>
              <S.AlbumBg $bg={albumCardBackground || 'rgba(255,255,255,0.96)'} />
            <S.AlbumVisual key={albumVisualKey} $isT5={isT5} $triggerT5={triggerT5Animations}>
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
                $blend={textBlendMode}
              $color={titleColor}
              $dark={headerSweepContrastColor}
            >
              <S.FadeSlideText $isT5={isT5} $triggerT5={triggerT5Animations} key={`${displayTitle || env.music || 'title-loading'}-${decisionKey}`} lang={getLang(displayTitle || env.music || '')}>
                {showTitleLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : (displayTitle || env.music || '')}
              </S.FadeSlideText>
            </S.TrackTitle>
              <S.Artist
                $glowColor={textGlowColorRgba}
                $shadowColor={textShadowColorRgba}
                $shadowBlur={textShadowBlur}
                $shadowOffsetX={textShadowOffsetX}
                $shadowOffsetY={textShadowOffsetY}
              $dark={headerSweepContrastColor}
            >
              <S.FadeSlideText $isT5={isT5} $triggerT5={triggerT5Animations} key={`${displayArtist || 'artist-loading'}-${decisionKey}`} lang={getLang(displayArtist)}>
                {showArtistLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : displayArtist}
              </S.FadeSlideText>
            </S.Artist>
            {/* 음악 파형 인디케이터 (임시 비활성화) */}
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
            </S.LeftPanel>
            <S.RightPanel
              style={cssVars}
              $edgeBlurAmount={edgeBlurAmount}
              $edgeBlurWidth={edgeBlurWidth}
              $bgColor1={rightPanelBgColor1Rgba}
              $bgColor2={rightPanelBgColor2Rgba}
              $bgColor2Pos={rightPanelBgColor2Pos}
              $bgColor3={rightPanelBgColor3Rgba}
              $isT4={isT4}
              $triggerT4={triggerT4Animations}
            >
              {/* 우측 블롭 중심 기준으로 아주 은은하게 퍼지는 파동 표현 (SW2 파형 느낌 포팅) */}
              <S.RightCenterPulse
                $right={rightCircleRight}
                $top={rightCircleTop}
                $width={rightCircleWidth * rightCircleScale}
                $height={rightCircleHeight * rightCircleScale}
              />
              <S.RightEllipseMark 
                src="/figma/Ellipse%202767.png" 
                alt=""
                $right={rightCircleRight}
                $top={rightCircleTop}
                /* 우측 원보다 약간 작게, 동일한 중심에서 회전하도록 설정 */
                $size={rightCircleWidth * rightCircleScale * 0.9}
              />
              <S.ClimateGroup>
              <S.ClimateRow
                key={`temp-${displayTemp || env.temp || ''}`}
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
                  <S.FadeSlideText $roulette $isT5={isT5} $triggerT5={triggerT5Animations} $blend="overlay" key={`${displayTemp || env.temp || 'temp-loading'}-${decisionKey}`}>
                    {showTempLoading ? (
                      <S.LoadingDots><span /><span /><span /></S.LoadingDots>
                    ) : (
                      <>
                        {displayTemp || (typeof env?.temp === 'number' ? `${env.temp}°C` : '')}
                        {displayReason && !showReasonLoading && (
                          <S.ReasonCaption>{displayReason}</S.ReasonCaption>
                        )}
                      </>
                    )}
                  </S.FadeSlideText>
                </S.ClimateRow>
              <S.ClimateRow
                key={`hum-${displayHumidity || env.humidity || ''}`}
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
                  <S.FadeSlideText $roulette $isT5={isT5} $triggerT5={triggerT5Animations} $blend="overlay" key={`${displayHumidity || env.humidity || 'humidity-loading'}-${decisionKey}`}>
                    {showHumidityLoading ? (
                      <S.LoadingDots><span /><span /><span /></S.LoadingDots>
                    ) : (
                      <>
                        {displayHumidity || (typeof env?.humidity === 'number' ? `${env.humidity}%` : '')}
                        {displayReason && !showReasonLoading && (
                          <S.ReasonCaption>{displayReason}</S.ReasonCaption>
                        )}
                      </>
                    )}
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
          {showBorderFlash && <S.BorderFlash />}
        </S.Root>
      </S.Scaler>
    </S.Viewport>
  );
}
