import { useMemo, useEffect, useRef, useState } from 'react';
import * as S from './styles';
import { useSW2Logic } from './logic/mainlogic';
import { getEmotionEntry } from './logic/emotionDB';
// backgroundFromEmotion 는 현재 사용하지 않음 (하단 배경은 앨범 컬러만 사용)
import { getDominantColorFromImage, getAlbumGradientForTrack } from '@/utils/color/albumColor';
import { playSw12BlobAppearance } from '@/utils/data/soundeffect';
import { ALBUM_DATA_BY_NUMBER } from '@/utils/data/albumData';

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

// HEX → HSLA 문자열로 변환하면서 채도/명도를 조정하는 헬퍼
function hexToHslaTone(hex, { sScale = 1, lOffset = 0, alpha = 1 } = {}) {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const s = Math.min(100, Math.max(0, Math.round(hsl.s * sScale)));
  const l = Math.min(100, Math.max(0, Math.round(hsl.l + lOffset)));
  const a = Math.max(0, Math.min(1, alpha));
  return `hsla(${hsl.h}, ${s}%, ${l}%, ${a})`;
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
  const prevCoverRef = useRef('');
  const lastDecisionRef = useRef(0);
  const [captionState, setCaptionState] = useState('idle'); // 'idle' | 'waiting' | 'enter'
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayArtist, setDisplayArtist] = useState('');
  const [displayCoverSrc, setDisplayCoverSrc] = useState('');

  // 색상 디버깅용: 1~16번 앨범 중 하나를 강제로 선택하여 팔레트/배경을 미리보기
  const [debugAlbumNo, setDebugAlbumNo] = useState(null);
  const debugAlbum = useMemo(
    () =>
      (debugAlbumNo && ALBUM_DATA_BY_NUMBER && ALBUM_DATA_BY_NUMBER[debugAlbumNo]) ||
      null,
    [debugAlbumNo]
  );
  const hasDebugPalette = !!debugAlbum;

  // 인풋(실제 사용자 감정 키워드) 유무 판단
  const hasRealKeywords = useMemo(
    () => Array.isArray(keywords) && keywords.some((k) => k && typeof k === 'object' && k.isNew),
    [keywords]
  );

  // 렌딩(초기) 상태: 아직 실제 사용자 감정 키워드가 한 번도 들어오지 않은 상태
  const isLanding = !hasRealKeywords;

  // 색상/팔레트 계산에 사용할 기준 타이틀
  // - 디버그 패널에서 특정 앨범을 선택한 경우 해당 앨범의 displayTitle 사용
  const effectiveTitleForColor = useMemo(
    () => (debugAlbum?.displayTitle || title || ''),
    [debugAlbum, title]
  );

  // 특정 앨범 전용 컬러 튜닝 플래그
  // - albumData.displayTitle 을 공백 제거 + 소문자 기준으로 비교
  const normalizedTitle = useMemo(
    () => effectiveTitleForColor.toLowerCase().replace(/\s+/g, ''),
    [effectiveTitleForColor]
  );
  const isHappyStroll = normalizedTitle === 'happystroll';
  const isCleanSoul = normalizedTitle === 'cleansoul';
  // Life is / Life is Color 전용: 중앙 레드, 외곽 옐로우 계열로만 구성 (그린 계열 제거)
  const isLifeIsColor =
    normalizedTitle === 'lifeiscolor' ||
    normalizedTitle === 'lifeis';

  // 현재 앨범 번호(1~16) 추출 – 디버그 선택이 우선, 아니면 타이틀 기반 매칭
  const activeAlbumNo = useMemo(() => {
    if (debugAlbumNo) return debugAlbumNo;
    if (!normalizedTitle) return null;
    try {
      for (const [no, data] of Object.entries(ALBUM_DATA_BY_NUMBER || {})) {
        const normDisplay = String(data?.displayTitle || '')
          .toLowerCase()
          .replace(/\s+/g, '');
        if (normDisplay === normalizedTitle) {
          return Number(no);
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, [debugAlbumNo, normalizedTitle]);

  // TV2와 동일한 앨범 그라디언트 데이터 (최대 5색 팔레트)
  const trackGradient = useMemo(() => {
    // 디버그 모드에서는 선택된 앨범의 팔레트를 최우선 사용
    if (debugAlbum?.gradient) {
      return debugAlbum.gradient;
    }
    const baseTitle = effectiveTitleForColor;
    if (!baseTitle) return null;
    try {
      return getAlbumGradientForTrack(baseTitle) || null;
    } catch {
      return null;
    }
  }, [debugAlbum, effectiveTitleForColor]);

  // 음악 템포(BPM)에 따른 파동 속도 조절 (보다 드라마틱하게)
  const baseTempo = 100;
  const rawFactor = tempo ? tempo / baseTempo : 1;
  // 너무 느리거나 빠른 극단값을 제한하면서도 차이를 크게 느끼도록 비선형 스케일 적용
  const clamped = clamp(rawFactor, 0.6, 1.8);           // 60% ~ 180% 범위
  const speedFactor = Math.pow(clamped, 1.5);          // 속도 차이를 증폭
  const radialDuration = 12 / speedFactor;             // 기본 12초 기준, 대략 6~24초 범위
  const linearDuration = 9 / speedFactor;              // 기본 9초 기준, 대략 4.5~18초 범위

  // 레바 패널 없이 고정값만 사용하는 간단 컨트롤
  const useStaticControls = (defaults) =>
    useMemo(
      () =>
        Object.fromEntries(
          Object.entries(defaults).map(([key, def]) => [key, def.value])
        ),
      []
    );

  const animation = useStaticControls({
    rotationDuration: { value: 15 },
  });

  const centerRing = useStaticControls({
    topPercent: { value: 20.0 },  // Y 위치
    sizeScale:  { value: 1.14 },  // 크기 배율
    radius:     { value: 71.1 },
    focusX:     { value: 43.8 },
    focusY:     { value: 55.2 },
    stop1:      { value: 16.4 },
    stop2:      { value: 58.0 },
    stop3:      { value: 78.2 },
    opacity:    { value: 1.0 },
    blur:       { value: 2.14 },
    color1:     { value: '#ff509f' },
    color2:     { value: '#ffe4d9' },
    color3:     { value: '#bcedff' },
  });

  // per-blob position (x, y), depth(z), and base size – 고정 레이아웃
  const blobTuning = useStaticControls({
    // 상단 중앙 블롭 (interest)
    interestX:     { value: 87.6 },
    interestY:     { value: 21.1 },
    interestSize:  { value: 26.5 },
    interestDepth: { value: 2 },

    // 오른쪽 아래 블롭 (happy)
    happyX:     { value: 70.5 },
    happyY:     { value: 45.6 },
    happySize:  { value: 51.0 },
    happyDepth: { value: 0 },

    // 왼쪽 아래 블롭 (wonder)
    wonderX:     { value: 15.0 },
    wonderY:     { value: 28.2 },
    wonderSize:  { value: 47.5 },
    wonderDepth: { value: 1 },
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

  // 앨범 기반 메인 블롭:
  //  - TV2와 동일하게 "앨범 팔레트(최대 4~5색)"를 그대로 가져오되,
  //  - 가장 어두운 컬러일수록 내부(core)에, 가장 밝은 컬러일수록 외곽에 배치
  //  - 앨범 컬러가 들어온 경우(coverSrc 존재) 에만 중심 코어 채도를 강하게 올려준다.
  //  - Happy Stroll / Clean Soul / Life is Color 는 개별 스펙:
  //      · Happy Stroll    : 바깥 전체는 카드뮴 옐로우, 안쪽만 레드/오렌지 계열
  //      · Clean Soul      : 블루 + 옐로우 위주 팔레트 (브라운/그린 제거)
  //      · Life is Color   : 중심은 레드, 외곽은 강한 옐로우 (그린 계열 제거)
  const albumInnerBackground = useMemo(() => {
    // 1) Happy Stroll 전용 컬러 스펙 (앨범 팔레트와 무관하게 강제 값 사용)
    if (isHappyStroll) {
      return (
        'radial-gradient(65% 65% at 50% 50%,' +
        // 중심: 레드빛 코어
        ' hsla(10, 92%, 52%, 1.0) 0%,' +
        // 중간: 오렌지 톤 링
        ' hsla(24, 96%, 60%, 0.98) 32%,' +
        // 바깥: 조금 더 연한 카드뮴 옐로우
        ' #FFECAA 100%' +
        ')'
      );
    }

    // 2) Clean Soul 전용 컬러 스펙 – 블루 + 옐로우 위주로만 구성
    if (isCleanSoul) {
      return (
        'radial-gradient(65% 65% at 50% 50%,' +
        // 중심: 딥 블루
        ' hsla(202, 78%, 40%, 1.0) 0%,' +
        // 중간: 밝은 하늘색
        ' hsla(196, 82%, 63%, 0.98) 38%,' +
        // 외곽: 따뜻한 옐로우
        ' #FFE89A 100%' +
        ')'
      );
    }

    // 3) Life is / Life is Color 전용 컬러 스펙 – 중심 레드, 외곽 고채도 옐로우 (그린 톤 제거)
    if (isLifeIsColor) {
      return (
        'radial-gradient(65% 65% at 50% 50%,' +
        // 중심: 강한 레드
        ' hsla(5, 88%, 52%, 1.0) 0%,' +
        // 중간: 오렌지 레드 계열
        ' hsla(18, 92%, 60%, 0.98) 36%,' +
        // 외곽: 더 채도 높은 옐로우 (카드뮴 옐로우 계열)
        ' hsla(50, 100%, 60%, 1.0) 100%' +
        ')'
      );
    }

    // 4) New Beginnings(9번) 전용 – 중심 레드, 외곽 연한 옐로우로 자연스럽게 페이드
    if (activeAlbumNo === 9) {
      return (
        'radial-gradient(65% 65% at 50% 50%,' +
        // 중심: 레드
        ' hsla(8, 82%, 52%, 1.0) 0%,' +
        // 중간: 오렌지 레드
        ' hsla(22, 92%, 60%, 0.98) 40%,' +
        // 외곽: 연한 옐로우
        ' hsla(48, 96%, 78%, 1.0) 100%' +
        ')'
      );
    }

    // 5) 일반 앨범 팔레트 → 어두운색은 안쪽, 밝은색은 바깥
    if (trackGradient && Array.isArray(trackGradient.colors) && trackGradient.colors.length) {
      const colors = trackGradient.colors;
      // 팔레트 전체를 HSL로 변환해서 명도 기준으로 정렬
      const palette = colors
        .map((hex) => {
          const hsl = hexToHsl(hex);
          return hsl ? { hex, hsl } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.hsl.l - b.hsl.l);

      if (!palette.length) {
        // 팔레트 파싱 실패 시 기존 HSL 기반 로직으로 fallback
        return (
          'radial-gradient(65% 65% at 50% 50%,' +
          ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 1.25), calc(var(--album-l, 70%) + 10%), 0.98) 0%,' +
          ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 1.10), var(--album-l, 70%), 0.96) 52%,' +
          ' hsla(var(--album-h, 340), var(--album-s, 70%), calc(var(--album-l, 70%) + 18%), 1.00) 100%' +
          ')'
        );
      }

      const darkest = palette[0];
      const brightest = palette[palette.length - 1];
      const mid = palette[Math.floor(palette.length / 2)];

      // 중심 코어: 가장 어두운 컬러를 기반으로, 채도는 더 강하게(1.5배) 올리고 명도는 살짝 낮춰 깊이감 부여
      let inner = `hsla(${darkest.hsl.h}, ${Math.min(
        100,
        Math.round(darkest.hsl.s * 1.5),
      )}%, ${Math.max(0, darkest.hsl.l - 6)}%, 0.99)`;
      // 중간 링: 중간 밝기 컬러를 약간만 보정해서 팔레트의 성격을 유지
      let midTone = `hsla(${mid.hsl.h}, ${Math.min(
        100,
        Math.round(mid.hsl.s * 1.25),
      )}%, ${Math.min(100, Math.round(mid.hsl.l))}%, 0.97)`;
      // 외곽: 가장 밝은 컬러를 조금 더 밝히고 채도는 유지하거나 살짝 올려 TV2 와의 채도 차이를 줄인다
      let outer = `hsla(${brightest.hsl.h}, ${Math.round(
        brightest.hsl.s * 1.0,
      )}%, ${Math.min(100, Math.round(brightest.hsl.l + 8))}%, 1.0)`;

      // 앨범별 미세 튜닝
      if (activeAlbumNo === 14) {
        // 14번(Echoes): 중심 그린 채도 살짝 상향
        inner = `hsla(${darkest.hsl.h}, ${Math.min(
          100,
          Math.round(darkest.hsl.s * 1.25),
        )}%, ${Math.max(0, darkest.hsl.l - 4)}%, 0.99)`;
      }

      if (activeAlbumNo === 15) {
        // 15번(Shoulders Of Giants):
        // - 중심: 채도 높은 그린
        // - 외곽: 연한 카드뮴 옐로우
        inner = 'hsla(110, 55%, 40%, 1.0)';
        outer = 'hsla(50, 88%, 74%, 0.9)';
      }

      if (activeAlbumNo === 16) {
        // 16번(A Kind Of Hope): 전체적으로 채도 살짝 상향
        midTone = `hsla(${mid.hsl.h}, ${Math.min(
          100,
          Math.round(mid.hsl.s * 1.2),
        )}%, ${Math.max(0, Math.round(mid.hsl.l - 2))}%, 0.97)`;
        outer = `hsla(${brightest.hsl.h}, ${Math.round(
          brightest.hsl.s * 1.05,
        )}%, ${Math.min(100, Math.round(brightest.hsl.l + 12))}%, 1.0)`;
      }

      return (
        'radial-gradient(65% 65% at 50% 50%,' +
        ` ${inner} 0%,` +
        ` ${midTone} 40%,` +
        ` ${outer} 100%` +
        ')'
      );
    }

    // fallback: 단일 HSL 톤 기반 (이전 로직 유지)
    return (
    'radial-gradient(65% 65% at 50% 50%,' +
      ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 1.25), calc(var(--album-l, 70%) + 10%), 0.98) 0%,' +
      ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 1.10), var(--album-l, 70%), 0.96) 52%,' +
      ' hsla(var(--album-h, 340), var(--album-s, 70%), calc(var(--album-l, 70%) + 18%), 1.00) 100%' +
      ')'
    );
  }, [trackGradient, isHappyStroll, isCleanSoul, isLifeIsColor, activeAlbumNo]);
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

  // 미니 블롭용: 메인 블롭보다 한 단계 밝고 부드러운 앨범 컬러 안개
  const miniBlobBackground = useMemo(() => {
    // 디버그 팔레트도 실제 앨범과 동일하게 취급
    const hasAlbumVisual = !!coverSrc || hasDebugPalette;
    if (!hasAlbumVisual) {
      return levaPinkBackground;
    }

    // Happy Stroll 전용: 주변 블롭도 카드뮴 옐로우 계열로 고정 (메인 코어와 톤을 맞춤)
    if (isHappyStroll) {
      return (
        'radial-gradient(60% 60% at 50% 50%,' +
        ' rgba(255, 230, 120, 0.85) 0%,' +
        ' rgba(255, 218, 90, 0.72) 46%,' +
        ' rgba(255, 218, 90, 0.0) 100%' +
        ')'
      );
    }

    // Clean Soul 전용: 블루 + 옐로우 계열의 더 연한 안개
    if (isCleanSoul) {
      return (
        'radial-gradient(60% 60% at 50% 50%,' +
        ' rgba(150, 210, 255, 0.96) 0%,' +
        ' rgba(255, 238, 150, 0.9) 46%,' +
        ' rgba(255, 238, 150, 0.0) 100%' +
        ')'
      );
    }

    // Life is / Life is Color 전용: 레드 → 옐로우 그라디언트 (그린/브라운 톤 제거)
    if (isLifeIsColor) {
      return (
        'radial-gradient(60% 60% at 50% 50%,' +
        ' rgba(240, 60, 72, 0.86) 0%,' +   // 안쪽 레드 (살짝 연하게)
        ' rgba(255, 216, 80, 0.74) 46%,' + // 중간 옐로우 (연하고 부드럽게)
        ' rgba(255, 216, 80, 0.0) 100%' +  // 바깥 투명 옐로우
        ')'
      );
    }

    if (trackGradient && Array.isArray(trackGradient.colors) && trackGradient.colors.length) {
      const colors = trackGradient.colors;
      // 채도/명도 값을 한 단계 올려서, 지금보다 전체적으로 더 진하게 보이도록 조정
      let m1 = hexToHslaTone(colors[0], { sScale: 0.9, lOffset: 6, alpha: 0.98 });
      let m2 = hexToHslaTone(colors[1] || colors[0], { sScale: 0.8, lOffset: 12, alpha: 0.9 });
      let m3 = hexToHslaTone(colors[2] || colors[colors.length - 1], {
        sScale: 0.7,
        lOffset: 18,
        alpha: 0.0,
      });

      // 6번(Ukulele Dance): 중앙 레드빛을 더 강하게
      if (activeAlbumNo === 6) {
        m1 = hexToHslaTone(colors[0], { sScale: 1.15, lOffset: 0, alpha: 0.99 });
      }

      // 12, 13번: 미니 블롭이 너무 흐릿 → 전체적으로 채도/알파 상향
      if (activeAlbumNo === 12 || activeAlbumNo === 13) {
        m1 = hexToHslaTone(colors[0], { sScale: 1.1, lOffset: 0, alpha: 0.99 });
        m2 = hexToHslaTone(colors[1] || colors[0], { sScale: 1.0, lOffset: 6, alpha: 0.95 });
        m3 = hexToHslaTone(colors[2] || colors[colors.length - 1], {
          sScale: 0.9,
          lOffset: 14,
          alpha: 0.12,
        });
      }

      // 15번: 중심 그린 + 옐로우 외곽을 더 선명하게
      if (activeAlbumNo === 15) {
        m1 = 'hsla(110, 55%, 48%, 0.98)';
        // 옐로 채도는 조금 줄이고, 외곽으로 갈수록 빠르게 풀리도록 조정
        m2 = 'hsla(50, 88%, 72%, 0.82)';
        m3 = 'hsla(50, 88%, 82%, 0.0)';
      }
      return (
        'radial-gradient(60% 60% at 50% 50%,' +
        ` ${m1 || colors[0]} 0%,` +
        ` ${m2 || colors[1] || colors[0]} 52%,` +
        ` ${m3 || colors[2] || colors[colors.length - 1]} 100%` +
        ')'
      );
    }

    // fallback: 단일 HSL 기반 파스텔 톤
    return (
      'radial-gradient(60% 60% at 50% 50%,' +
      ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 0.9), calc(var(--album-l, 70%) + 8%), 0.98) 0%,' +
      ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 0.8), calc(var(--album-l, 70%) + 14%), 0.9) 52%,' +
      ' hsla(var(--album-h, 340), calc(var(--album-s, 70%) * 0.7), calc(var(--album-l, 70%) + 20%), 0.0) 100%' +
      ')'
    );
  }, [coverSrc, hasDebugPalette, levaPinkBackground, trackGradient, isHappyStroll, isCleanSoul, isLifeIsColor, activeAlbumNo]);

  const centerGlowBackground = useMemo(() => {
    // 디버그 팔레트가 있으면 coverSrc 유무와 상관없이 albumInnerBackground 를 사용
    const hasAlbumVisual = !!coverSrc || hasDebugPalette;
    const base = hasAlbumVisual ? albumInnerBackground : levaPinkBackground;
    if (!lightTint) return base;
    return `radial-gradient(65% 65% at 50% 50%, ${lightTint} 0%, rgba(0,0,0,0) 72%), ${base}`;
  }, [coverSrc, hasDebugPalette, albumInnerBackground, levaPinkBackground, lightTint]);

  // 하단 배경 그라디언트: 상단은 고정 화이트, 하단은 "앨범 컬러만 아주 연하게" 퍼지도록 구성
  // - 조명(lightColor)이나 감정 키워드 색에는 반응하지 않고,
  // - 각 앨범 팔레트/대표 색에서 H/S/L 을 가져와 매우 연한 파스텔 톤으로만 사용한다.
  const bgColors = useMemo(() => {
    const top = 'hsla(0, 0%, 100%, 1)';

    const hasAlbumVisual = !!coverSrc || hasDebugPalette;

    // 1) trackGradient 가 있으면 첫 번째 컬러를 대표 컬러로 사용
    let baseH = 340;
    let baseS = 60;
    let baseL = 72;

    if (trackGradient && Array.isArray(trackGradient.colors) && trackGradient.colors.length) {
      const first = hexToHsl(trackGradient.colors[0]);
      if (first) {
        baseH = first.h;
        baseS = first.s;
        baseL = first.l;
      }
    }

    // coverSrc 가 없고 trackGradient 도 없으면, 기존 CSS 변수 기반으로 추정
    // (브라우저에서는 CSS 변수 값이 이미 --album-h/s/l 로 들어가 있음)
    if (!hasAlbumVisual && typeof window !== 'undefined') {
      try {
        const root = document.documentElement;
        const hVar = root.style.getPropertyValue('--album-h');
        const sVar = root.style.getPropertyValue('--album-s');
        const lVar = root.style.getPropertyValue('--album-l');
        const hNum = parseInt(hVar, 10);
        const sNum = parseInt(String(sVar).replace('%', ''), 10);
        const lNum = parseInt(String(lVar).replace('%', ''), 10);
        if (!Number.isNaN(hNum)) baseH = hNum;
        if (!Number.isNaN(sNum)) baseS = sNum;
        if (!Number.isNaN(lNum)) baseL = lNum;
      } catch {
        // ignore
      }
    }

    // 앨범 컬러를 매우 연한 파스텔 톤으로만 사용
    const mid = `hsla(${baseH}, ${Math.round(baseS * 0.45)}%, ${Math.min(
      100,
      baseL + 10,
    )}%, 0.38)`;
    const bottom = `hsla(${baseH}, ${Math.round(baseS * 0.55)}%, ${Math.min(
      100,
      baseL + 18,
    )}%, 0.72)`;

    return { top, mid, bottom };
  }, [coverSrc, hasDebugPalette, trackGradient]);

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
  // 곡/아티스트/앨범 커버가 바뀔 때마다 약 6초간 '...' 상태를 유지한 뒤,
  // 블러 + 오퍼시티 + 업(translateY) 애니메이션으로 새 텍스트/커버를 표시한다.
  useEffect(() => {
    const newTitle = title || '';
    const newArtist = artist || '';
    const newCover = coverSrc || '';

    // 실질적인 내용이 없으면 초기화
    if (!newTitle && !newArtist && !newCover) {
      setCaptionState('idle');
      setDisplayTitle('');
      setDisplayArtist('');
      prevTitleRef.current = '';
      prevArtistRef.current = '';
      prevCoverRef.current = '';
      setDisplayCoverSrc('');
      lastDecisionRef.current = decisionTick;
      return;
    }

    // 렌딩(처음) 상태: TV2처럼 더미 값(앨범/아티스트/커버)을 바로 노출하고,
    // '...' 대기 애니메이션은 사용하지 않는다.
    if (isLanding) {
      prevTitleRef.current = newTitle;
      prevArtistRef.current = newArtist;
      prevCoverRef.current = newCover;
      setDisplayTitle(newTitle);
      setDisplayArtist(newArtist);
      setDisplayCoverSrc(newCover);
      setCaptionState('enter');
      lastDecisionRef.current = decisionTick;
      return;
    }

    const sameContent =
      newTitle === prevTitleRef.current &&
      newArtist === prevArtistRef.current &&
      newCover === prevCoverRef.current;
    const sameDecision = decisionTick === lastDecisionRef.current;

    // 곡명/가수도 같고, 마지막으로 처리한 디시전 토큰도 동일하면 재애니메이션 생략
    if (sameContent && sameDecision) {
      return;
    }

    // 새로운 곡으로 전환되는 동안에는 앨범 커버도 잠시 숨겼다가,
    // 약 6초 뒤 텍스트와 동시에 등장하도록 placeholder 로 비워 둔다.
    setDisplayCoverSrc('');

    setCaptionState('waiting'); // 약 6초 동안 로딩 점(...) 상태
    let cancelled = false;
    const currentDecision = decisionTick;

    const t = setTimeout(() => {
      if (cancelled) return;
      prevTitleRef.current = newTitle;
      prevArtistRef.current = newArtist;
      prevCoverRef.current = newCover;
      setDisplayTitle(newTitle);
      setDisplayArtist(newArtist);
      setDisplayCoverSrc(newCover);
      setCaptionState('enter'); // 블러 + 업 애니메이션 시작
      lastDecisionRef.current = currentDecision;
    }, 6000);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [title, artist, coverSrc, isLanding, decisionTick]);

  // 감정 헤더: 가장 최신 키워드를 그대로 사용 (필터링 없이)
  const emotionHeader = useMemo(() => {
    if (!Array.isArray(keywords) || keywords.length === 0) return '';
    const last = keywords[keywords.length - 1];
    if (typeof last === 'string') return last;
    return last?.text || last?.raw || '';
  }, [keywords]);

  // 중앙 캡션에는 최종 곡명/가수명을 사용
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
      {/* 앨범 컬러 디버깅용 패널은 프로덕션에서는 숨김 처리 (필요 시 다시 활성화) */}
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
            const rawKeyword =
              (typeof kwItem === 'string' ? kwItem : kwItem?.text) ||
              blob.labelBottom;
            // 각 블롭별로, 해당 감정이 처음 매칭됐을 때의 곡명이 있으면 우선 사용하고
            // 없다면 중앙 메인 곡명으로 폴백
            const perBlobMusicTitle =
              typeof kwItem === 'object' && kwItem?.songTitle
                ? kwItem.songTitle
                : musicTitle;
          return (
            <Component
              key={blob.id}
              $depthLayer={blob.depthLayer}
                ref={(node) => {
                  if (node) blobRefs.current[blob.id] = node;
                  else delete blobRefs.current[blob.id];
                }}
              style={{
                '--blob-top': `${blob.anchor.y}vw`,
                '--blob-left': `${blob.anchor.x}vw`,
                '--blob-size': `${blob.size.base}vw`,
                  // 뒤쪽 5개의 미니 블롭은 메인 블롭보다 한 단계 더 연한 파스텔 톤을 사용
                  '--blob-bg': miniBlobBackground,
              }}
              >
                <S.ContentRotator $duration={animation.rotationDuration}>
                  {/* 렌딩 상태에서는 SW1 미니 블롭과 동일한 '...' 타입을 사용 */}
                  {isLanding ? (
                    <S.MiniKeywordLine>
                      <S.MiniEllipsis>...</S.MiniEllipsis>
                    </S.MiniKeywordLine>
                  ) : (
                    <>
                      {/* 위: 감정 키워드(사용자 인풋), 아래: 곡명만 한 줄 노출 (가수명 제거) */}
                      <S.MiniKeywordLine>{rawKeyword}</S.MiniKeywordLine>
                      <S.MiniMusicLine>{perBlobMusicTitle}</S.MiniMusicLine>
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
        {displayCoverSrc ? (
          <S.AlbumImage
            key={displayCoverSrc || title}
            src={displayCoverSrc}
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
        {captionState === 'waiting' ? (
          <S.LoadingDots $color="rgba(255,192,220,0.85)">
            <span />
            <span />
            <span />
          </S.LoadingDots>
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
