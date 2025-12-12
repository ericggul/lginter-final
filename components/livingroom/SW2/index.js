import { useMemo, useEffect, useRef, useState } from 'react';
import * as S from './styles';
import { useSW2Logic } from './logic/mainlogic';
import { getEmotionEntry } from './logic/emotionDB';
// backgroundFromEmotion 는 현재 사용하지 않음 (하단 배경은 앨범 컬러만 사용)
import { getDominantColorFromImage } from '@/utils/color/albumColor';
import { useControls } from 'leva';
import { playSw12BlobAppearance } from '@/utils/data/soundeffect';

// lightColor(hex) → hsl 변환 유틸 (SW2 하단 배경용)
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function hexToRgbaString(hex, opacity = 1) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const a = Math.max(0, Math.min(1, Number(opacity)));
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function rgbToHsl(r, g, b) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R:
        h = (G - B) / d + (G < B ? 6 : 0);
        break;
      case G:
        h = (B - R) / d + 2;
        break;
      default:
        h = (R - G) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export default function SW2Controls() {
  const {
    blobConfigs,
    keywords,
    dotCount,
    title,
    artist,
    coverSrc,
    lightColor,
    participantCount,
    blobRefs,
    timelineState,
    tempo,
    decisionTick,
  } = useSW2Logic();

  const prevTimelineRef = useRef(timelineState);
  const prevTitleRef = useRef('');
  const prevArtistRef = useRef('');
  const lastDecisionRef = useRef(0);
  const [captionState, setCaptionState] = useState('idle'); // 'idle' | 'waiting' | 'enter'
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayArtist, setDisplayArtist] = useState('');

  // 인풋(실제 사용자 감정 키워드) 유무 판단
  const hasRealKeywords = useMemo(
    () => Array.isArray(keywords) && keywords.some((k) => k && typeof k === 'object' && k.isNew),
    [keywords]
  );

  // 렌딩(초기) 상태: 아직 실제 사용자 감정 키워드가 한 번도 들어오지 않은 상태
  const isLanding = !hasRealKeywords;

  // 음악 템포(BPM)에 따른 파동 속도 조절 (보다 드라마틱하게)
  const baseTempo = 100;
  const rawFactor = tempo ? tempo / baseTempo : 1;
  // 너무 느리거나 빠른 극단값을 제한하면서도 차이를 크게 느끼도록 비선형 스케일 적용
  const clamped = clamp(rawFactor, 0.6, 1.8);           // 60% ~ 180% 범위
  const speedFactor = Math.pow(clamped, 1.5);          // 속도 차이를 증폭
  const radialDuration = 12 / speedFactor;             // 기본 12초 기준, 대략 6~24초 범위
  const linearDuration = 9 / speedFactor;              // 기본 9초 기준, 대략 4.5~18초 범위

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
          return typeof k === 'string' ? { text: k, raw: k, isNew: false } : k;
        };
        const kwObj =
          blob.id === 'interest' ? (pick(0) || { text: '', isNew: false }) :
          blob.id === 'happy'    ? (pick(1) || { text: '', isNew: false }) :
          blob.id === 'wonder'   ? (pick(2) || { text: '', isNew: false }) :
          blob.id === 'calm'     ? (pick(3) || pick(1) || { text: '', isNew: false }) :
          blob.id === 'vivid'    ? (pick(4) || pick(2) || { text: '', isNew: false }) :
          { text: '', isNew: false };
        // 컬러 매핑용 키: 화면에 보이는 텍스트 그대로 사용 (매핑 실패 시 EmotionDB 가 설렘으로 fallback)
        const keyForColor = kwObj.text;
        // 렌딩 상태에서는 모든 미니 블롭이 동일한 메인 감정 컬러(설렘 계열)를 공유하도록 통일
        const baseEntry = getEmotionEntry(keyForColor || '설렘');
        const entry = hasRealKeywords ? baseEntry : getEmotionEntry('설렘');
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
        // calm / vivid 도 동일한 colorEntry 를 공유해서 항상 컬러가 존재하도록
        if (blob.id === 'calm' || blob.id === 'vivid') {
          return {
            ...blob,
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

  // 감정 키워드를 따로 표시하기 위해, 원본 사용자 인풋 텍스트를 그대로 씀
  const emotionKeywords = useMemo(
    () => (Array.isArray(keywords) ? keywords.map((k) => (typeof k === 'string' ? k : k?.text || '')) : []),
    [keywords]
  );
  // Leva 스펙(기본 핑크)과 앨범 컬러 기반 내부 채움 중 선택
  const levaPinkBackground = `radial-gradient(${centerRing.radius}% ${centerRing.radius}% at ${centerRing.focusX}% ${centerRing.focusY}%, ${centerRing.color1} ${centerRing.stop1}%, ${centerRing.color2} ${centerRing.stop2}%, ${centerRing.color3} ${centerRing.stop3}%)`;
  // 앨범 기반: 안쪽은 "기본 블롭"과 동일한 S/L 을 가진 컬러이고, Hue 만 앨범 컬러에 맞춰 회전
  const albumInnerBackground =
    'radial-gradient(65% 65% at 50% 50%,' +
    // S/L 은 기본 블롭과 동일한 값으로 고정하고, Hue(var(--album-h))만 변경
    ' hsla(var(--album-h, 340), 78%, 70%, 0.96) 0%,' +
    ' hsla(340, 86%, 86%, 0.55) 58%,' +
    ' hsla(340, 90%, 88%, 1.0) 100%' +
    ')';
  // TV2/모바일과 동일한 "결정(lightColor)"를 SW2 중앙에도 아주 은은하게 반영한다.
  // - 앨범 기반 룩은 유지
  // - 비용이 큰 애니메이션/루프 없이 background transition만 사용
  const lightTint = useMemo(() => {
    const raw = String(lightColor || '').trim();
    if (!raw) return null;
    if (!/^#?([0-9a-f]{6})$/i.test(raw)) return null;
    const normalized = raw.startsWith('#') ? raw : `#${raw}`;
    return hexToRgbaString(normalized, 0.22);
  }, [lightColor]);

  const centerGlowBackground = useMemo(() => {
    const base = coverSrc ? albumInnerBackground : levaPinkBackground;
    if (!lightTint) return base;
    return `radial-gradient(65% 65% at 50% 50%, ${lightTint} 0%, rgba(0,0,0,0) 72%), ${base}`;
  }, [coverSrc, albumInnerBackground, levaPinkBackground, lightTint]);

  // 하단 배경 그라디언트: 상단은 고정 화이트, 하단은 "앨범 컬러 기반의 아주 연한 파스텔 톤"만 사용
  // (조명(lightColor)이나 감정 키워드 색에는 더 이상 반응하지 않음)
  // - 상단: 거의 흰색
  // - 하단: 화면 가장 아래쪽에서부터 앨범 컬러의 "연한" 톤이 부드러운 안개처럼 올라왔다가
  //         위로 갈수록 자연스럽게 사라지도록, 아래쪽에 큰 radial glow 를 둔다.
  const bgColors = useMemo(() => {
    const top = 'hsla(0, 0%, 100%, 1)';
    // 하단 중심(mid): 앨범 컬러를 기반으로 하되, 채도는 크게 낮추고 밝기는 충분히 올려서
    // 어떤 앨범이 오더라도 항상 "연한 파스텔" 느낌만 남도록 조정
    const mid =
      'hsla(var(--album-h, 340), calc(var(--album-s, 65%) * 0.35), calc(var(--album-l, 80%) + 10%), 0.85)';
    // 가장 아래(bottom)는 mid보다 한 단계 더 밝고 옅은 톤으로만 남겨서
    // 바닥이 너무 진하게 물들지 않도록 가드
    const bottom =
      'hsla(var(--album-h, 340), calc(var(--album-s, 65%) * 0.25), calc(var(--album-l, 86%) + 14%), 0.30)';
    return { top, mid, bottom };
  }, [coverSrc]);

  // SW2: timeline t3 진입 시, 화면 밖 하단에서 상단으로 올라오는 EntryCircle 애니메이션 시작에 맞춰 효과음 1회 재생
  useEffect(() => {
    try {
      const prev = prevTimelineRef.current;
      if (timelineState === 't3' && prev !== 't3' && hasRealKeywords) {
        playSw12BlobAppearance();
      }
      prevTimelineRef.current = timelineState;
    } catch {}
  }, [timelineState, hasRealKeywords]);

  // Album dominant color → root-level CSS vars (TV2와 동일한 기준 사용, 변형 없이 매핑)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    (async () => {
      try {
        if (!coverSrc) return;
        const c = await getDominantColorFromImage(coverSrc);
        if (!c) return;
        const root = document.documentElement;
        const h = Math.round(c.h ?? 340);
        const s = Math.round(c.s ?? 70);
        const l = Math.round(c.l ?? 70);
        // TV2와 동일하게, 앨범에서 뽑은 H/S/L을 그대로 CSS 변수에 넣는다.
        root.style.setProperty('--album-h', String(h));
        root.style.setProperty('--album-s', `${s}%`);
        root.style.setProperty('--album-l', `${l}%`);
        // 중앙 캡션 텍스트용 그림자 컬러: 앨범 컬러보다 훨씬 어두운 톤
        const shadowL = Math.max(0, Math.round((c.l ?? 40) - 32));
        const shadowColor = `hsla(${Math.round(c.h)}, ${Math.round(c.s)}%, ${shadowL}%, 0.9)`;
        root.style.setProperty('--sw2-caption-shadow', shadowColor);
      } catch {
        // ignore sampling failures
      }
    })();
  }

  // 백엔드에서 곡 정보가 안 온 초기 상태에서는
  // 실제 곡명/가수명 대신 '...' 플레이스홀더만 애니메이션으로 노출
  // 곡/아티스트가 바뀔 때마다 2초간 '...' 상태를 보여준 뒤,
  // 블러 + 오퍼시티 + 업(translateY) 애니메이션으로 새 텍스트를 표시한다.
  useEffect(() => {
    // 렌딩(처음) 상태에서는 중앙 캡션 대신 블롭 키워드 쪽에서만 '...'을 보여주므로 스킵
    if (isLanding) return;
    const newTitle = title || '';
    const newArtist = artist || '';

    // 실질적인 내용이 없으면 초기화
    if (!newTitle && !newArtist) {
      setCaptionState('idle');
      setDisplayTitle('');
      setDisplayArtist('');
      prevTitleRef.current = '';
      prevArtistRef.current = '';
      lastDecisionRef.current = decisionTick;
      return;
    }

    const sameContent =
      newTitle === prevTitleRef.current && newArtist === prevArtistRef.current;
    const sameDecision = decisionTick === lastDecisionRef.current;

    // 곡명/가수도 같고, 마지막으로 처리한 디시전 토큰도 동일하면 재애니메이션 생략
    if (sameContent && sameDecision) {
      return;
    }

    setCaptionState('waiting'); // 2초 동안 '...' 상태
    let cancelled = false;
    const currentDecision = decisionTick;

    const t = setTimeout(() => {
      if (cancelled) return;
      prevTitleRef.current = newTitle;
      prevArtistRef.current = newArtist;
      setDisplayTitle(newTitle);
      setDisplayArtist(newArtist);
      setCaptionState('enter'); // 블러 + 업 애니메이션 시작
      lastDecisionRef.current = currentDecision;
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [title, artist, isLanding, decisionTick]);

  // 감정 헤더: 가장 최신 키워드를 그대로 사용 (필터링 없이)
  const emotionHeader = useMemo(() => {
    if (!Array.isArray(keywords) || keywords.length === 0) return '';
    const last = keywords[keywords.length - 1];
    if (typeof last === 'string') return last;
    return last?.text || last?.raw || '';
  }, [keywords]);

  // 각 미니 블롭에 공통으로 곡명/가수명을 노출
  const musicTitle = useMemo(() => title || '', [title]);
  const musicArtist = useMemo(() => artist || '', [artist]);

  return (
    <S.Root
      data-stage={timelineState}
      style={{
          // 상단 0~55%는 거의 흰색(콘텐츠를 방해하지 않도록 유지)
          // 하단은 큰 radial-gradient 를 사용해, 화면 가장 아래에서부터
          // 앨범 컬러 안개가 자연스럽게 퍼져 올라오는 느낌을 만든다.
          backgroundImage: `
            linear-gradient(
              to bottom,
              ${bgColors.top} 0%,
              ${bgColors.top} 55%,
              transparent 100%
            ),
            radial-gradient(
              130% 130% at 50% 115%,
              ${bgColors.bottom} 0%,
              ${bgColors.mid} 45%,
              transparent 100%
            )
          `,
        // CenterGlow / EntryCircle 가 동일한 스케일을 쓰도록 공유 CSS 변수 설정
        '--center-scale': centerRing.sizeScale,
      }}
    >
      {/* 상단에서부터 번져 나가는 핑크 파동 레이어 (백엔드와 무관한 순수 프론트 효과) */}
      <S.TopWaveLayer aria-hidden="true">
        {/* 서로 다른 딜레이를 줘서 연속적인 리플 느낌 생성 */}
        <S.TopWaveCircle $variant={1} $delay={0} $duration={radialDuration} />
        <S.TopWaveCircle $variant={2} $delay={5} $duration={radialDuration} />
        <S.TopWaveCircle $variant={3} $delay={9} $duration={radialDuration} />
        {/* 기존 SW2 선형(화이트 링) 파동을 중앙 상단에 오버레이 */}
        <S.TopLinearWaveCircle $delay={0} $duration={linearDuration} />
        <S.TopLinearWaveCircle $delay={4.5} $duration={linearDuration} />
        <S.TopLinearWaveCircle $delay={9} $duration={linearDuration} />
      </S.TopWaveLayer>

      {/* 가운데 원형 핑크 그라디언트 (SW1 스타일 응용, 인풋 이후에도 항상 동일한 메인 블롭 유지) */}
      <S.CenterGlow
        data-stage={timelineState}
        $topPercent={centerRing.topPercent}
        $opacity={centerRing.opacity}
        $blur={centerRing.blur}
        $scale={centerRing.sizeScale}
        $background={centerGlowBackground}
      />

      {/* t3/t4: 화면 하단에서 올라와 메인 블롭으로 합쳐지는 엔트리 서클 (컬러는 메인 블롭과 동일하게 고정) */}
      {interestBlob && (timelineState === 't3' || timelineState === 't4') && (
        <>
          {/* t3 전용: 엔트리 서클의 지나온 경로에 남는 잔상 트레일 */}
          {timelineState === 't3' && (
            <>
              <S.EntryCircleTrail
                data-stage={timelineState}
                aria-hidden="true"
                $depthLayer={interestBlob.depthLayer}
                $delay={0.16}
                $opacity={0.55}
                $blur={2.0}
                style={{
                  '--blob-size': `${interestBlob.size.base}vw`,
                  '--blob-bg': centerGlowBackground,
                }}
              />
              <S.EntryCircleTrail
                data-stage={timelineState}
                aria-hidden="true"
                $depthLayer={interestBlob.depthLayer}
                $delay={0.32}
                $opacity={0.35}
                $blur={2.8}
                style={{
                  '--blob-size': `${interestBlob.size.base}vw`,
                  '--blob-bg': centerGlowBackground,
                }}
              />
            </>
          )}

          <S.EntryCircle
            data-stage={timelineState}
            aria-hidden="true"
            $depthLayer={interestBlob.depthLayer}
            style={{
              '--blob-size': `${interestBlob.size.base}vw`,
              '--blob-bg': centerGlowBackground,
            }}
          />
        </>
      )}

      {/* t4: 화면 전체 배경 채도/광량 펄스 레이어 (SW1 BackgroundPulse 참고) */}
      {timelineState === 't4' && (
        <>
          <S.BackgroundPulse data-stage={timelineState} aria-hidden="true" />
        </>
      )}

      <S.BlobRotator $duration={animation.rotationDuration}>
        {tunedBlobConfigs.map((blob, idx) => {
          const Component = S[blob.componentKey];
          const kwItem = keywords[idx];
          const rawKeyword = (typeof kwItem === 'string' ? kwItem : kwItem?.text) || blob.labelBottom;
          return (
            <Component
              key={blob.id}
              $depthLayer={blob.depthLayer}
              ref={(node) => { if (node) blobRefs.current[blob.id] = node; else delete blobRefs.current[blob.id]; }}
              style={{
                '--blob-top': `${blob.anchor.y}vw`,
                '--blob-left': `${blob.anchor.x}vw`,
                '--blob-size': `${blob.size.base}vw`,
                // 컬러 로직을 잠시 비활성화하고, 랜딩 때의 메인 블롭 그라디언트를 항상 사용
                '--blob-bg': centerGlowBackground,
              }}
            >
              <S.ContentRotator $duration={animation.rotationDuration}>
                {/* 렌딩 상태에서는 실제 키워드/음악 대신 '...' 애니메이션만 보여준다 */}
                {isLanding ? (
                  <>
                    <S.MiniKeywordLine>
                      <S.MiniEllipsis>...</S.MiniEllipsis>
                    </S.MiniKeywordLine>
                    <S.MiniMusicLine>
                      <S.MiniEllipsis>...</S.MiniEllipsis>
                    </S.MiniMusicLine>
                  </>
                ) : (
                  <>
                    {/* 위: 감정 키워드(사용자 인풋), 아래: 곡명만 한 줄 노출 (가수명 제거) */}
                    <S.MiniKeywordLine>{rawKeyword}</S.MiniKeywordLine>
                    <S.MiniMusicLine>{musicTitle}</S.MiniMusicLine>
                  </>
                )}
              </S.ContentRotator>
            </Component>
          );
        })}
      </S.BlobRotator>
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
            key={coverSrc || title}
            src={coverSrc}
            alt={title || 'cover'}
            onError={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.opacity = '0';
              }
            }}
            onLoad={(e) => {
              // React의 SyntheticEvent는 풀링되므로, 실제 DOM 요소를 미리 캡처해 둔다.
              const img = e.currentTarget;
              if (!img) return;
              // 새 앨범 커버가 로드되면 0 → 1로 부드럽게 페이드인
              requestAnimationFrame(() => {
                if (img) {
                  img.style.opacity = '1';
                }
              });
            }}
          />
        ) : (
          <S.AlbumPlaceholder />
        )}
      </S.AlbumCard>
      <S.CaptionWrap>
        {isLanding || captionState === 'waiting' ? (
          <>
            <S.HeadText><S.MiniEllipsis>...</S.MiniEllipsis></S.HeadText>
            <S.SubText><S.MiniEllipsis>...</S.MiniEllipsis></S.SubText>
          </>
        ) : (
          <>
            {/* 상단: 곡명, 하단: 가수명 – 감정 인풋(키워드)은 메인 캡션에 노출하지 않는다 */}
            <S.HeadText $state={captionState}>{displayTitle}</S.HeadText>
            <S.SubText $state={captionState}>{displayArtist}</S.SubText>
          </>
        )}
      </S.CaptionWrap>

      {/* NOTE: BGM intentionally disabled on SW2 (sound effects only) */}
    </S.Root>
  );
}
