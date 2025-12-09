import { useMemo } from 'react';
import * as S from './styles';
import { useSW2Logic } from './logic/mainlogic';
import { getEmotionEntry } from './logic/emotionDB';
import { buildMiniVars, backgroundFromEmotion } from './logic/color';
import { getDominantColorFromImage } from '@/utils/color/albumColor';
import { useControls } from 'leva';

export default function SW2Controls() {
  const {
    blobConfigs,
    keywords,
    dotCount,
    title,
    artist,
    coverSrc,
    audioSrc,
    audioRef,
    participantCount,
    blobRefs,
    timelineState,
  } = useSW2Logic();

  const animation = useControls('SW2 Animation', {
    rotationDuration: { value: 15, min: 0, max: 120, step: 1 },
  });

  const centerRing = useControls('SW2 Center Ring', {
    topPercent: { value: 20.0,  min: 10, max: 55,  step: 0.1 },   // Y 위치
    sizeScale:  { value: 1.14,  min: 0.6, max: 1.4, step: 0.01 }, // 크기 배율
    radius:     { value: 71.1,  min: 40, max: 100, step: 0.1 },
    focusX:     { value: 43.8,  min: 0,  max: 100, step: 0.1 },
    focusY:     { value: 55.2,  min: 0,  max: 100, step: 0.1 },
    stop1:      { value: 16.4,  min: 0,  max: 100, step: 0.1 },
    stop2:      { value: 58.0,  min: 0,  max: 100, step: 0.1 },
    stop3:      { value: 78.2,  min: 0,  max: 100, step: 0.1 },
    opacity:    { value: 1.0,   min: 0,  max: 1,   step: 0.01 },
    blur:       { value: 2.14,  min: 0,  max: 5,   step: 0.05 },
    color1:     { value: '#ff509f' },
    color2:     { value: '#ffe4d9' },
    color3:     { value: '#bcedff' },
  });

  // Leva controls for per-blob position (x, y), depth(z), and base size
  const blobTuning = useControls('SW2 Blobs', {
    // 상단 중앙 블롭 (interest)
    interestX:     { value: 87.6, min: 0,  max: 100, step: 0.1 },
    interestY:     { value: 21.1, min: 0,  max: 80,  step: 0.1 },
    interestSize:  { value: 26.5, min: 10, max: 80,  step: 0.5 },
    interestDepth: { value: 2,  min: 0,  max: 2,   step: 1 },

    // 오른쪽 아래 블롭 (happy)
    happyX:     { value: 70.5, min: 0,  max: 100, step: 0.1 },
    happyY:     { value: 45.6, min: 0,  max: 80,  step: 0.1 },
    happySize:  { value: 51.0, min: 10, max: 80,  step: 0.5 },
    happyDepth: { value: 0,  min: 0,  max: 2,   step: 1 },

    // 왼쪽 아래 블롭 (wonder)
    wonderX:     { value: 15.0, min: 0,  max: 100, step: 0.1 },
    wonderY:     { value: 28.2, min: 0,  max: 80,  step: 0.1 },
    wonderSize:  { value: 47.5, min: 10, max: 80,  step: 0.5 },
    wonderDepth: { value: 1,  min: 0,  max: 2,   step: 1 },
  });

  const tunedBlobConfigs = useMemo(
    () =>
      blobConfigs.map((blob) => {
        const pick = (i) => {
          const k = keywords?.[i];
          if (!k) return null;
          return typeof k === 'string' ? { text: k, isNew: false } : k;
        };
        const kwObj =
          blob.id === 'interest' ? (pick(0) || { text: '', isNew: false }) :
          blob.id === 'happy'    ? (pick(1) || pick(0) || { text: '', isNew: false }) :
          blob.id === 'wonder'   ? (pick(2) || pick(0) || { text: '', isNew: false }) :
          { text: '', isNew: false };
        const entry = kwObj.text ? getEmotionEntry(kwObj.text) : null; // no input → keep default colors
        if (blob.id === 'interest') {
          return {
            ...blob,
            anchor: {
              ...blob.anchor,
              x: blobTuning.interestX,
              y: blobTuning.interestY,
            },
            size: {
              ...blob.size,
              base: blobTuning.interestSize,
            },
            depthLayer: blobTuning.interestDepth,
            emotionEntry: entry,
            isNew: !!kwObj.isNew,
          };
        }
        if (blob.id === 'happy') {
          return {
            ...blob,
            anchor: {
              ...blob.anchor,
              x: blobTuning.happyX,
              y: blobTuning.happyY,
            },
            size: {
              ...blob.size,
              base: blobTuning.happySize,
            },
            depthLayer: blobTuning.happyDepth,
            emotionEntry: entry,
            isNew: !!kwObj.isNew,
          };
        }
        if (blob.id === 'wonder') {
          return {
            ...blob,
            anchor: {
              ...blob.anchor,
              x: blobTuning.wonderX,
              y: blobTuning.wonderY,
            },
            size: {
              ...blob.size,
              base: blobTuning.wonderSize,
            },
            depthLayer: blobTuning.wonderDepth,
            emotionEntry: entry,
            isNew: !!kwObj.isNew,
          };
        }
        return blob;
      }),
    [blobConfigs, blobTuning, keywords]
  );

  const interestBlob = useMemo(
    () => tunedBlobConfigs.find((blob) => blob.id === 'interest'),
    [tunedBlobConfigs]
  );

  // Leva 스펙(기본 핑크)과 앨범 컬러 기반 내부 채움 중 선택
  const levaPinkBackground = `radial-gradient(${centerRing.radius}% ${centerRing.radius}% at ${centerRing.focusX}% ${centerRing.focusY}%, ${centerRing.color1} ${centerRing.stop1}%, ${centerRing.color2} ${centerRing.stop2}%, ${centerRing.color3} ${centerRing.stop3}%)`;
  // 앨범 기반: 안쪽은 앨범 컬러, 바깥은 기존 핑크 계열을 유지
  const albumInnerBackground =
    'radial-gradient(65% 65% at 50% 50%,' +
    ' hsla(var(--album-h, 340), var(--album-s, 60%), var(--album-l, 60%), 0.96) 0%,' +
    ' hsla(340, 86%, 86%, 0.55) 58%,' +
    ' hsla(340, 90%, 88%, 1.0) 100%' +
    ')';
  const centerGlowBackground = coverSrc ? albumInnerBackground : levaPinkBackground;

  // Album dominant color → root-level CSS vars (non-blocking)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    (async () => {
      try {
        if (coverSrc) {
          const c = await getDominantColorFromImage(coverSrc);
          const root = document.documentElement;
          root.style.setProperty('--album-h', String(Math.round(c.h)));
          root.style.setProperty('--album-s', `${Math.round(c.s)}%`);
          root.style.setProperty('--album-l', `${Math.round(c.l)}%`);
        }
      } catch {}
    })();
  }

  // SW2 백엔드에서 아직 곡 정보가 안 온 초기 상태에서도
  // 기본 데모 이미지를 보기 좋게 보여주기 위한 fallback 텍스트
  const displayTitle = title || 'Happy Alley';
  const displayArtist = artist || 'Kevin MacLeod';

  return (
    <S.Root
      data-stage={timelineState}
      style={{
        backgroundColor: `hsla(var(--album-h, ${getEmotionEntry(keywords?.[0] || '설렘').center.h}), 35%, 90%, 0.22)`,
        // CenterGlow / EntryCircle 가 동일한 스케일을 쓰도록 공유 CSS 변수 설정
        '--center-scale': centerRing.sizeScale,
      }}
    >
      {/* 상단에서부터 번져 나가는 핑크 파동 레이어 (백엔드와 무관한 순수 프론트 효과) */}
      <S.TopWaveLayer aria-hidden="true">
        {/* 서로 다른 딜레이를 줘서 연속적인 리플 느낌 생성 */}
        <S.TopWaveCircle $delay={0} />
        <S.TopWaveCircle $delay={3} />
        <S.TopWaveCircle $delay={6} />
      </S.TopWaveLayer>

      {/* 가운데 원형 핑크 그라디언트 (SW1 스타일 응용) */}
      <S.CenterGlow
        data-stage={timelineState}
        $topPercent={centerRing.topPercent}
        $opacity={centerRing.opacity}
        $blur={centerRing.blur}
        $scale={centerRing.sizeScale}
        $background={centerGlowBackground}
      />

      {/* t3: 중앙 하단에서 등장해 상단 블롭과 같은 디자인으로 이동
          t4: 상단 블롭 속으로 말려 들어가는 엔트리 블롭 */}
      {interestBlob && (timelineState === 't3' || timelineState === 't4') && (
        <S.EntryCircle
          data-stage={timelineState}
          aria-hidden="true"
          $depthLayer={interestBlob.depthLayer}
          style={{
            '--blob-size': `${interestBlob.size.base}vw`,
            ...(interestBlob.emotionEntry ? buildMiniVars(interestBlob.emotionEntry) : {}),
          }}
        />
      )}

      <S.BlobRotator $duration={animation.rotationDuration}>
        {tunedBlobConfigs.map((blob, idx) => {
          const Component = S[blob.componentKey];
          const kwItem = keywords[idx];
          const keyword = (typeof kwItem === 'string' ? kwItem : kwItem?.text) || blob.labelBottom;
          return (
            <Component
              key={blob.id}
              $depthLayer={blob.depthLayer}
              ref={(node) => { if (node) blobRefs.current[blob.id] = node; else delete blobRefs.current[blob.id]; }}
              style={{
                '--blob-top': `${blob.anchor.y}vw`,
                '--blob-left': `${blob.anchor.x}vw`,
                '--blob-size': `${blob.size.base}vw`,
                ...(blob.emotionEntry ? buildMiniVars(blob.emotionEntry) : {}),
              }}
            >
              {blob.isNew ? <S.NewKeywordOverlay /> : null}
              <S.ContentRotator $duration={animation.rotationDuration}>
                {/* SW2 로직과 연결된 사용자 키워드만 중앙에 표시 (백엔드와 로직은 그대로) */}
                <span>{keyword}</span>
              </S.ContentRotator>
            </Component>
          );
        })}
      </S.BlobRotator>
      {/* t5: 배경 전체가 한 번 더 부드럽게 빛나는 펄스 */}
      {timelineState === 't5' && <S.BackgroundPulse data-stage={timelineState} aria-hidden="true" />}
      {/* If background frame image is unavailable, pass empty to avoid 404 */}
      <S.FrameBg $url="" />
      <S.TopStatus>
        <span>사용자 {participantCount}명을 위한 조율중</span>
        <S.Dots aria-hidden="true">
          <S.Dot $visible={dotCount >= 1}>.</S.Dot>
          <S.Dot $visible={dotCount >= 2}>.</S.Dot>
          <S.Dot $visible={dotCount >= 3}>.</S.Dot>
        </S.Dots>
      </S.TopStatus>

      {/* Compact album card */}
      <S.AlbumCard>
        {coverSrc ? (
          <S.AlbumImage
            src={coverSrc}
            alt={title || 'cover'}
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            onLoad={(e) => { e.currentTarget.style.visibility = 'visible'; }}
            style={{ visibility: 'visible' }}
          />
        ) : (
          <S.AlbumPlaceholder />
        )}
      </S.AlbumCard>
      <S.CaptionWrap>
        <S.HeadText>{displayTitle}</S.HeadText>
        <S.SubText>{displayArtist}</S.SubText>
      </S.CaptionWrap>

      {/* Hidden audio element */}
      {audioSrc ? <audio ref={audioRef} src={audioSrc} autoPlay loop playsInline preload="auto" /> : null}
    </S.Root>
  );
}
