import { useEffect, useMemo, useState, useRef } from 'react';
import { getDominantColorFromImage } from '@/utils/color/albumColor';
import {
  parseMusicString,
  getAlbumGradient,
  normalizeTrackName,
  getAlbumData,
} from '@/utils/data/albumData';
import { MUSIC_CATALOG } from '@/utils/data/musicCatalog';
import { computeMiniWarmHue, toHsla as toHslaSW1 } from '@/components/livingroom/SW1/logic/color';
import {
  hsla,
  describeHexColor,
  hexToHsl,
  hexToRgba,
  mixHex,
} from '../logic/color';
import { computeCoverScale } from '../logic/scale';
import { computeWaveformFromAnalyser } from '../logic/waveform';

const HEADER_WARM_MOODS = [
  '따뜻한 무드',
  '포근한 무드',
  '편안한 무드',
  '행복한 무드',
  '기분 좋은 무드',
  '은은하게 따뜻한 무드',
];

const HEADER_COOL_MOODS = [
  '차분한 무드',
  '시원한 무드',
  '청량감 있는 무드',
  '잔잔한 무드',
  '맑고 선선한 무드',
  '조용한 무드',
];

// 온도 값을 간단한 영어 라벨로 분류 (SW1과 동일한 규칙)
const classifyTempLabel = (t) => {
  if (t == null || Number.isNaN(t)) return '';
  const temp = Math.round(t);
  if (temp <= 20) return 'Cool';
  if (temp <= 23) return 'Fresh';
  if (temp <= 26) return 'Comfortable';
  if (temp <= 28) return 'Warm';
  return 'Hot';
};

// 습도 값을 간단한 영어 라벨로 분류 (SW1과 동일한 규칙)
const classifyHumidityLabel = (h) => {
  if (h == null || Number.isNaN(h)) return '';
  const hum = Math.round(h);
  if (hum <= 29) return 'Dry';
  if (hum <= 45) return 'Balanced';
  if (hum <= 60) return 'Moist';
  if (hum <= 70) return 'Humid';
  return 'Foggy';
};

export function useTV2DisplayLogic({
  env,
  title,
  artist,
  coverSrc,
  audioSrc,
  reason,
  emotionKeyword,
  decisionToken,
  levaControls,
  audioRef,
}) {
  const hexColor = (env?.lightColor || '').toUpperCase();
  // AI가 준 emotionKeyword를 기반으로, 컬러명이 아니라 "무드" 이름을 우선 노출
  const moodLabel = useMemo(() => {
    const base = (emotionKeyword || '').trim();
    if (!base) return '';
    // 이미 "무드"가 붙어있으면 그대로 사용, 아니면 뒤에 "무드"를 붙인다.
    if (base.endsWith('무드')) return base;
    return `${base} 무드`;
  }, [emotionKeyword]);

  const friendlyName = useMemo(() => describeHexColor(hexColor), [hexColor]);
  // 1순위: AI 무드 이름, 2순위: 컬러/라벨/HEX에서 결정된 warm/cool 무드 중 하나
  const fallbackMood = useMemo(() => {
    const base = (friendlyName || env.lightLabel || hexColor || '').trim();
    const hsl = hexToHsl(hexColor);
    // 기본값: 웜 팔레트 첫 번째
    if (!base || !hsl) return HEADER_WARM_MOODS[0];

    const { h } = hsl;
    // 대략적인 분류:
    // - warm: 레드/오렌지/옐로/핑크/마젠타 (0~90, 270~360)
    // - cool: 그린/민트/블루/퍼플 (90~270)
    const isWarm = h < 90 || h >= 270;
    const palette = isWarm ? HEADER_WARM_MOODS : HEADER_COOL_MOODS;

    // 컬러 문자열을 정수로 해싱해서 항상 같은 색상에 같은 무드가 매핑되도록 함
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
    }
    const idx = hash % palette.length;
    return palette[idx];
  }, [friendlyName, env?.lightLabel, hexColor]);
  // 최종 상단 텍스트는 "-무드의 조명" 형태로 노출
  const headerMoodText = moodLabel || fallbackMood;
  const headerText = headerMoodText ? `${headerMoodText}의 조명` : '조명의 무드';

  const isIdle = !title && !artist && !coverSrc && (!env || env.music === 'ambient');

  // TV2 → Hue sync:
  // When the TV2 top-panel color (env.lightColor) changes, softly apply it to Hue.
  // - Debounced to avoid spamming when the UI animates/updates rapidly
  // - Fire-and-forget (never blocks or mutates existing TV2 logic)
  const hueSyncTimerRef = useRef(null);
  const lastHueSyncedColorRef = useRef('');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = String(hexColor || '').trim();
    if (!/^#[0-9A-F]{6}$/i.test(next)) return;
    if (next === lastHueSyncedColorRef.current) return;

    if (hueSyncTimerRef.current) clearTimeout(hueSyncTimerRef.current);
    hueSyncTimerRef.current = setTimeout(() => {
      lastHueSyncedColorRef.current = next;
      try {
        fetch('/api/lighttest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'color', color: next }),
          // keepalive helps in kiosk-ish environments during navigation
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }, 350);

    return () => {
      if (hueSyncTimerRef.current) clearTimeout(hueSyncTimerRef.current);
    };
  }, [hexColor]);

  // T3/T4/T5 Motion State Management
  // T3: Input exists but no decision yet (default waiting)
  // T4: Decision triggered (3 seconds of parallel animations)
  // T5: All decisions fully processed (all content appears)
  const [motionState, setMotionState] = useState('T3'); // 'T3' | 'T4' | 'T5'
  const [decisionKey, setDecisionKey] = useState(0); // Increments on new decision
  const [showBorderFlash, setShowBorderFlash] = useState(false);
  const prevEnvRef = useRef(null);
  const motionStateRef = useRef('T3');

  // env 변화에 따라 idle 여부만 판단하고 스냅샷 유지
  useEffect(() => {
    const hasInput = !!(
      env?.music ||
      env?.lightColor ||
      typeof env?.temp === 'number' ||
      typeof env?.humidity === 'number'
    );

    if (!prevEnvRef.current) {
      prevEnvRef.current = { ...env };
      // 최초 진입 시에는 항상 T3에서 시작하고,
      // 실제 디시전 이벤트(decisionToken)가 들어올 때 T4/T5 전환을 맡긴다.
      if (!hasInput) {
        setMotionState('T3');
        motionStateRef.current = 'T3';
      }
      return;
    }

    if (!hasInput) {
      setMotionState('T3');
      motionStateRef.current = 'T3';
    }

    prevEnvRef.current = { ...env };
  }, [env]);

  // 새로운 디시전 토큰이 들어올 때마다 T4 → T5 전환 및 decisionKey++
  useEffect(() => {
    if (!decisionToken) return; // 초기값 0: 아직 디시전 없음

    const hasInput = !!(
      env?.music ||
      env?.lightColor ||
      typeof env?.temp === 'number' ||
      typeof env?.humidity === 'number'
    );
    if (!hasInput) return;

    setMotionState('T4');
    motionStateRef.current = 'T4';
    setDecisionKey((prev) => prev + 1);

    // 상단 전체 테두리 플래시
    setShowBorderFlash(true);
    const flashTimer = setTimeout(() => setShowBorderFlash(false), 400);

    // 6초 뒤 T5 진입 (정보가 약 6초 딜레이 후 한 번에 뜨도록)
    const t5Timer = setTimeout(() => {
      setMotionState('T5');
      motionStateRef.current = 'T5';
    }, 6000);

    return () => {
      clearTimeout(t5Timer);
      clearTimeout(flashTimer);
    };
  }, [decisionToken, env]);

  // Loading states
  const [showTitleLoading, setShowTitleLoading] = useState(true);
  const [showArtistLoading, setShowArtistLoading] = useState(true);
  const [showAlbumCover, setShowAlbumCover] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayArtist, setDisplayArtist] = useState('');
  const [showTempLoading, setShowTempLoading] = useState(true);
  const [showHumidityLoading, setShowHumidityLoading] = useState(true);
  const [showHeaderLoading, setShowHeaderLoading] = useState(true);
  const [displayTemp, setDisplayTemp] = useState('');
  const [displayHumidity, setDisplayHumidity] = useState('');
  const [displayTempLabel, setDisplayTempLabel] = useState('');
  const [displayHumidityLabel, setDisplayHumidityLabel] = useState('');
  const [displayHeaderText, setDisplayHeaderText] = useState('');
  // 선택 이유(감정 설명) 표시용
  const [displayReason, setDisplayReason] = useState('');
  const [showReasonLoading, setShowReasonLoading] = useState(true);

  const titleChangeRef = useRef('');
  const artistChangeRef = useRef('');
  const coverChangeRef = useRef('');
  // 초기 값과 같더라도 첫 번째 디시전에서 반드시 온도/습도 값이 나타나도록
  // 기본 ref 값은 null 로 두고, decisionKey 기반으로 변경 여부를 판단한다.
  const tempChangeRef = useRef(null);
  const humidityChangeRef = useRef(null);
  const tempDecisionKeyRef = useRef(0);
  const humidityDecisionKeyRef = useRef(0);
  const headerChangeRef = useRef(headerText || '');
  const reasonChangeRef = useRef(reason || '');

  const [showChangeMessage, setShowChangeMessage] = useState(false);
  // 상단 헤더 컬러 스윕 모션 활성화 여부 (조명 컬러가 존재하는 동안 항상 루프)
  const headerSweepActive = !!env?.lightColor;
  const albumVisualKey = showAlbumCover && coverSrc ? coverSrc : 'placeholder';

  // Album tone extraction
  const [albumTone, setAlbumTone] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const src = coverSrc;
    if (!src) {
      setAlbumTone(null);
      return;
    }
    (async () => {
      try {
        const c = await getDominantColorFromImage(src);
        if (!cancelled) setAlbumTone(c?.isFallback ? null : c);
      } catch {
        if (!cancelled) setAlbumTone(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coverSrc]);

  // Title/Artist/Cover loading logic (respects T4 state)
  useEffect(() => {
    const newTitle = title || '';
    const newArtist = artist || '';
    const newCover = coverSrc || '';

    const titleChanged = newTitle !== titleChangeRef.current;
    const artistChanged = newArtist !== artistChangeRef.current;
    const coverChanged = newCover !== coverChangeRef.current;

    if (titleChanged || artistChanged || coverChanged) {
      setShowTitleLoading(true);
      setShowArtistLoading(true);
      setShowAlbumCover(false);
      setDisplayTitle('');
      setDisplayArtist('');

      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);

      titleChangeRef.current = newTitle;
      artistChangeRef.current = newArtist;
      coverChangeRef.current = newCover;

      // Wait for T5 state before showing content (T4 keeps '...' 동안 대기)
      const checkT5 = () => {
        if (motionStateRef.current === 'T5') {
          setShowTitleLoading(false);
          setShowArtistLoading(false);
          setShowAlbumCover(true);
          setDisplayTitle(newTitle);
          setDisplayArtist(newArtist);
        } else {
          // If still in T4, wait a bit more
          setTimeout(checkT5, 100);
        }
      };

      // If already in T5, show immediately. Otherwise 약 6초 뒤에 T5를 체크
      if (motionStateRef.current === 'T5') {
        // Already in T5, show immediately
        checkT5();
      } else {
        const timer = setTimeout(checkT5, 6000);
        return () => {
          clearTimeout(timer);
          clearTimeout(messageTimer);
        };
      }

      return () => {
        clearTimeout(messageTimer);
      };
    } else if (!newTitle && !newArtist && !newCover) {
      setShowTitleLoading(true);
      setShowArtistLoading(true);
      setShowAlbumCover(false);
      setDisplayTitle('');
      setDisplayArtist('');
    }
  }, [title, artist, coverSrc]);

  // Reason (감정/선택 이유) 로딩 로직 – emotionKeyword만 사용, 3글자 감정 키워드로 축약
  useEffect(() => {
    const base = (emotionKeyword || '').trim();
    if (!base) {
      setShowReasonLoading(false);
      setDisplayReason('');
      return;
    }
    const newReason = base.length > 3 ? base.slice(0, 3) : base;
    const changed = newReason !== reasonChangeRef.current;

    if (changed) {
      reasonChangeRef.current = newReason;
      setShowReasonLoading(true);
      setDisplayReason('');

      const checkT5 = () => {
        if (motionStateRef.current === 'T5') {
          setShowReasonLoading(false);
          setDisplayReason(newReason);
        } else {
          setTimeout(checkT5, 100);
        }
      };

      if (motionStateRef.current === 'T5') {
        checkT5();
      } else {
        const timer = setTimeout(checkT5, 6000);
        return () => clearTimeout(timer);
      }
    } else if (!newReason) {
      setShowReasonLoading(true);
      setDisplayReason('');
    }
  }, [reason]);

  // Temperature loading logic (respects T4 state)
  useEffect(() => {
    const newTemp = typeof env?.temp === 'number' ? env.temp : null;
    // 새로운 디시전(decisionKey) 이 들어왔거나, 온도 값 자체가 바뀐 경우에만 갱신
    const keyChanged = decisionKey !== tempDecisionKeyRef.current;
    const valueChanged = newTemp !== null && newTemp !== tempChangeRef.current;

    if (!keyChanged && !valueChanged) return;
    if (newTemp === null) return;

    tempChangeRef.current = newTemp;
    tempDecisionKeyRef.current = decisionKey;

    setShowTempLoading(true);
    setDisplayTemp('');
    setDisplayTempLabel('');

    setShowChangeMessage(true);
    const messageTimer = setTimeout(() => {
      setShowChangeMessage(false);
    }, 3000);

    const label = classifyTempLabel(newTemp);
    const checkT5 = () => {
      if (motionStateRef.current === 'T5') {
        setShowTempLoading(false);
        setDisplayTemp(`${newTemp}°C`);
        setDisplayTempLabel(label);
      } else {
        setTimeout(checkT5, 100);
      }
    };

    const timer = setTimeout(checkT5, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(messageTimer);
    };
  }, [env?.temp, decisionKey]);

  // Humidity loading logic (respects T4 state)
  useEffect(() => {
    const newHumidity = typeof env?.humidity === 'number' ? env.humidity : null;
    const keyChanged = decisionKey !== humidityDecisionKeyRef.current;
    const valueChanged = newHumidity !== null && newHumidity !== humidityChangeRef.current;

    if (!keyChanged && !valueChanged) return;
    if (newHumidity === null) return;

    humidityChangeRef.current = newHumidity;
    humidityDecisionKeyRef.current = decisionKey;

    setShowHumidityLoading(true);
    setDisplayHumidity('');
    setDisplayHumidityLabel('');

    setShowChangeMessage(true);
    const messageTimer = setTimeout(() => {
      setShowChangeMessage(false);
    }, 3000);

    const label = classifyHumidityLabel(newHumidity);
    const checkT5 = () => {
      if (motionStateRef.current === 'T5') {
        setShowHumidityLoading(false);
        setDisplayHumidity(`${newHumidity}%`);
        setDisplayHumidityLabel(label);
      } else {
        setTimeout(checkT5, 100);
      }
    };

    const timer = setTimeout(checkT5, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(messageTimer);
    };
  }, [env?.humidity, decisionKey]);

  // Header loading logic (respects T4 state)
  useEffect(() => {
    const newHeaderText = headerText || '';
    const headerChanged = newHeaderText !== headerChangeRef.current;

    if (headerChanged && newHeaderText) {
      headerChangeRef.current = newHeaderText;
      setShowHeaderLoading(true);
      setDisplayHeaderText('');

      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);

      const checkT5 = () => {
        if (motionStateRef.current === 'T5') {
          setShowHeaderLoading(false);
          setDisplayHeaderText(newHeaderText);
        } else {
          setTimeout(checkT5, 100);
        }
      };

      const timer = setTimeout(checkT5, 6000);

      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }

    // 초기 진입 시 색상이 바뀌지 않더라도 첫 값은 반드시 노출되도록 보정
    if (!headerChanged && newHeaderText && !displayHeaderText) {
      const reveal = () => {
        setShowHeaderLoading(false);
        setDisplayHeaderText(newHeaderText);
      };
      if (motionStateRef.current === 'T5') {
        reveal();
      } else {
        const t = setTimeout(reveal, 6000);
        return () => clearTimeout(t);
      }
    }
  }, [headerText]);

  // Blur animation
  const [blurAnim, setBlurAnim] = useState(levaControls?.leftPanelBlur || 1);
  const blurDirRef = useRef(1);
  const rafRef = useRef(null);

  useEffect(() => {
    setBlurAnim(levaControls?.leftPanelBlur || 1);
    blurDirRef.current = 1;
  }, [levaControls?.leftPanelBlur]);

  useEffect(() => {
    let lastTs = null;
    const blurMin = 1;
    const blurMax = 28;
    const blurSpeed = 6;
    const step = (ts) => {
      if (lastTs == null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      setBlurAnim((prev) => {
        const next = prev + blurDirRef.current * blurSpeed * dt;
        if (next >= blurMax) {
          blurDirRef.current = -1;
          return blurMax;
        }
        if (next <= blurMin) {
          blurDirRef.current = 1;
          return blurMin;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Audio waveform visualization
  const [waveformData, setWaveformData] = useState(new Array(32).fill(0));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const waveformRafRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!audioSrc || !audioRef?.current) {
      setWaveformData(new Array(32).fill(0));
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
          sourceRef.current = null;
        } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (waveformRafRef.current) {
        cancelAnimationFrame(waveformRafRef.current);
        waveformRafRef.current = null;
      }
      return;
    }

    let audioContext = null;
    let analyser = null;
    let source = null;
    let handleLoadedData = null;

    const initAudio = async () => {
      try {
        if (sourceRef.current) {
          analyser = analyserRef.current;
          if (analyser) {
            const updateWaveform = () => {
              if (!analyser) return;
              const scaled = computeWaveformFromAnalyser(analyser, 32);
              setWaveformData(scaled);
              waveformRafRef.current = requestAnimationFrame(updateWaveform);
            };
            updateWaveform();
          }
          return;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContext = audioContextRef.current;
        } else {
          audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;
        }

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // 더 많은 주파수 데이터를 얻기 위해 증가
        // 음악 변화에 더 민감하게 반응하도록 설정
        analyser.smoothingTimeConstant = 0.15;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyserRef.current = analyser;

        source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;

        try {
          await audioRef.current.play();
        } catch (err) {
          const resume = () => {
            try {
              audioRef.current?.play();
            } catch {}
          };
          window.addEventListener('pointerdown', resume, { once: true });
          window.addEventListener('keydown', resume, { once: true });
          window.addEventListener('touchstart', resume, { once: true, passive: true });
        }

        const updateWaveform = () => {
          if (!analyser) return;
          const scaled = computeWaveformFromAnalyser(analyser, 32);
          setWaveformData(scaled);
          waveformRafRef.current = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
      } catch (err) {
        console.error('Audio visualization error:', err);
        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch {}
          sourceRef.current = null;
        }
      }
    };

    handleLoadedData = () => {
      initAudio();
    };

    const audioElement = audioRef?.current;
    if (audioElement) {
      audioElement.addEventListener('loadeddata', handleLoadedData);
      if (audioElement.readyState >= 2) {
        initAudio();
      }
    }

    return () => {
      if (waveformRafRef.current) {
        cancelAnimationFrame(waveformRafRef.current);
        waveformRafRef.current = null;
      }
      if (audioElement && handleLoadedData) {
        audioElement.removeEventListener('loadeddata', handleLoadedData);
      }
    };
  }, [audioSrc, audioRef]);

  // Scale calculation
  const [scale, setScale] = useState(() => computeCoverScale());
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setScale(computeCoverScale());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update);
      window.visualViewport.addEventListener('scroll', update);
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', update);
        window.visualViewport.removeEventListener('scroll', update);
      }
    };
  }, []);

  // Computed values
  const hasCover = !!coverSrc;

  const albumCardBackground = useMemo(() => {
    if (!albumTone) {
      return hasCover
        ? 'radial-gradient(120% 120% at 50% 45%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 40%, rgba(255,255,255,0.36) 100%)'
        : 'rgba(255,255,255,0.96)';
    }
    const h = albumTone.h;
    const s = albumTone.s;
    const l = albumTone.l;
    const innerL = Math.min(100, l + 12);
    const midL = Math.max(0, l - 4);
    const edgeL = Math.max(0, l - 12);
    const s1 = Math.min(100, s + 8);
    return `radial-gradient(120% 120% at 35% 25%,
      hsla(${h}, ${s1}%, ${innerL}%, 0.95) 0%,
      hsla(${h}, ${s}%, ${midL}%, 0.85) 45%,
      hsla(${h}, ${s}%, ${edgeL}%, 1) 100%)`;
  }, [albumTone, hasCover]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const h = albumTone?.h ?? 340;
    const s = albumTone?.s ?? 70;
    const l = albumTone?.l ?? 70;
    root.style.setProperty('--album-h', String(Math.round(h)));
    root.style.setProperty('--album-s', `${Math.round(s)}%`);
    root.style.setProperty('--album-l', `${Math.round(l)}%`);
  }, [albumTone]);

  const trackGradient = useMemo(() => {
    const trackName = env.music || title;
    if (!trackName) return null;
    return getAlbumGradient(trackName);
  }, [title, env.music]);

  const albumPalette = useMemo(() => {
    if (trackGradient) {
      return {
        left1: trackGradient.colors[0],
        left2: trackGradient.colors[1],
        left3: trackGradient.colors[2],
        left4: trackGradient.colors[3],
        left5: trackGradient.colors[4],
        pos1: trackGradient.stops[0],
        pos2: trackGradient.stops[1],
        pos3: trackGradient.stops[2],
        pos4: trackGradient.stops[3],
      };
    }
    if (!albumTone) return null;
    const h = albumTone.h;
    const s = albumTone.s;
    const l = albumTone.l;
    return {
      left1: hsla(h, s + 10, l - 22, 0.9),
      left2: hsla(h + 8, s - 6, l - 6, 0.9),
      left3: hsla(h + 12, s - 10, l + 10, 0.85),
      left4: hsla(h - 18, s - 18, l + 4, 0.9),
      left5: hsla(h - 8, s - 22, l + 18, 0.95),
      pos1: 0,
      pos2: 0,
      pos3: 150,
      pos4: 283,
    };
  }, [trackGradient, albumTone]);

  // ===== 음악 BPM 기반 우측 파동(pulse) 설정 =====
  // - SW2에서와 동일한 앨범 메타 데이터(getAlbumData)를 사용해 BPM 조회
  // - BPM이 빠를수록 파동 주기가 짧아지도록 설정
  const trackNameForTempo = env.music || title || '';
  const albumData = useMemo(
    () => getAlbumData(trackNameForTempo),
    [trackNameForTempo],
  );
  const tempo =
    albumData && typeof albumData.bpm === 'number' && Number.isFinite(albumData.bpm) && albumData.bpm > 0
      ? albumData.bpm
      : 100;

  // 한 번 퍼지는 파동을 "4박자(한 마디)" 정도 길이로 가정하고 BPM에 따라 duration 계산
  const beatSeconds = 60 / tempo;
  const basePulseDuration = Math.min(12, Math.max(4, beatSeconds * 4));

  const makeSeededRandom = (seedStr, salt) => {
    let h = 0;
    const s = String(seedStr || '');
    for (let i = 0; i < s.length; i += 1) {
      h = (h * 31 + s.charCodeAt(i) + salt * 131) >>> 0;
    }
    return (h % 1000) / 1000;
  };

  // 세 개의 파동이 BPM을 공유하되, 트랙마다 약간 다른 랜덤 타이밍으로 출발
  const pulseDelays = useMemo(() => {
    const seed = trackNameForTempo || `${tempo}`;
    const r2 = makeSeededRandom(seed, 2);
    const r3 = makeSeededRandom(seed, 3);
    const d1 = 0;
    const d2 = basePulseDuration * (0.3 + 0.3 * r2); // 0.3~0.6 구간
    const d3 = basePulseDuration * (0.65 + 0.25 * r3); // 0.65~0.9 구간
    return [d1, d2, d3];
  }, [trackNameForTempo, tempo, basePulseDuration]);

  // Color conversions (헤더: 좌측 조명 컬러, 가운데 조명, 우측 화이트)
  const headerStartBase =
    hexColor && hexColor.match(/^#[0-9A-F]{6}$/i)
      ? hexColor
      : levaControls?.headerGradientStart || '#4880e2';
  // 상단 기본 헤더 그라디언트는 "조명 컬러(lightColor)"만 기준으로 사용
  // (앨범 컬러는 별도의 스윕 레이어에서만 일부 사용)
  const headerStartColor = headerStartBase;
  const headerMidColor = headerStartBase;
  const headerEndColor = '#ffffff';
  // 조명 컬러 변경이 더 확실히 느껴지도록,
  // HSL 기반으로 채도를 살짝 높여서 상단 그라디언트에 반영
  const headerCoreHsl = hexToHsl(headerStartColor);
  const headerGradientStartRgba = headerCoreHsl
    ? hsla(
        headerCoreHsl.h,
        Math.min(100, headerCoreHsl.s * 1.35),
        headerCoreHsl.l,
        levaControls?.headerGradientOpacity || 1,
      )
    : hexToRgba(headerStartColor, levaControls?.headerGradientOpacity || 1);
  const headerGradientMidRgba = headerCoreHsl
    ? hsla(
        headerCoreHsl.h,
        Math.min(100, headerCoreHsl.s * 1.35),
        headerCoreHsl.l,
        levaControls?.headerGradientOpacity || 1,
      )
    : hexToRgba(headerMidColor, levaControls?.headerGradientOpacity || 1);
  const headerGradientEndRgba = hexToRgba(
    headerEndColor,
    levaControls?.headerGradientOpacity || 1,
  );

  // Smooth header gradient transition:
  // Crossfade from the previous gradient to the new one (cheap: opacity only, debounced by React render).
  const prevHeaderGradientRef = useRef(null);
  const prevHeaderFadeTimerRef = useRef(null);
  const [prevHeaderGradient, setPrevHeaderGradient] = useState(null);
  const [prevHeaderVisible, setPrevHeaderVisible] = useState(false);

  useEffect(() => {
    const next = {
      start: headerGradientStartRgba,
      mid: headerGradientMidRgba,
      end: headerGradientEndRgba,
      midPos: levaControls?.headerGradientMidPos ?? 10,
      endPos: levaControls?.headerGradientEndPos ?? 90,
    };
    const prev = prevHeaderGradientRef.current;

    // First paint: just store.
    if (!prev) {
      prevHeaderGradientRef.current = next;
      return;
    }

    const changed =
      prev.start !== next.start ||
      prev.mid !== next.mid ||
      prev.end !== next.end ||
      prev.midPos !== next.midPos ||
      prev.endPos !== next.endPos;

    if (changed) {
      setPrevHeaderGradient(prev);
      setPrevHeaderVisible(true);

      // Trigger fade-out on next frame so CSS transition kicks in.
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => setPrevHeaderVisible(false));
      } else {
        setPrevHeaderVisible(false);
      }

      if (prevHeaderFadeTimerRef.current) clearTimeout(prevHeaderFadeTimerRef.current);
      prevHeaderFadeTimerRef.current = setTimeout(() => {
        setPrevHeaderGradient(null);
      }, 900);
    }

    prevHeaderGradientRef.current = next;
    return () => {
      if (prevHeaderFadeTimerRef.current) clearTimeout(prevHeaderFadeTimerRef.current);
    };
    // Intentionally include raw values to match actual paint inputs.
  }, [
    headerGradientStartRgba,
    headerGradientMidRgba,
    headerGradientEndRgba,
    levaControls?.headerGradientMidPos,
    levaControls?.headerGradientEndPos,
  ]);

  // 앨범 컬러 중 가장 어두운 컬러를 상단 패널 스윕의 좌측 시작 컬러로 사용
  const albumDarkSweepColor = useMemo(() => {
    const opacity = levaControls?.headerGradientOpacity || 0.95;

    // 1) 앨범 톤이 있으면, 그 톤에서 살짝 더 눌린 다크 톤을 우선 사용
    //    → 실제 앨범 커버 변경에 따라 상단 스윕 컬러도 즉시 바뀌도록
    if (albumTone) {
      const l = Math.max(0, albumTone.l - 12);
      return hsla(albumTone.h, albumTone.s, l, opacity);
    }

    // 2) 곡별 그라디언트가 있으면, 그 중 "가장 어두운" 컬러를 사용
    if (trackGradient && Array.isArray(trackGradient.colors) && trackGradient.colors.length > 0) {
      let darkest = null;
      let darkestL = 101;
      trackGradient.colors.forEach((c) => {
        const hsl = hexToHsl(c);
        if (hsl && typeof hsl.l === 'number' && hsl.l < darkestL) {
          darkestL = hsl.l;
          darkest = hsl;
        }
      });
      if (darkest) {
        return hsla(darkest.h, darkest.s, darkest.l, opacity);
      }
    }

    // 3) 마지막으로 조명 컬러를 기준으로 가장 어두운 톤 뽑기
    const baseHsl = hexToHsl(headerStartBase);
    if (baseHsl) {
      const l = Math.max(0, baseHsl.l - 20);
      return hsla(baseHsl.h, baseHsl.s, l, opacity);
    }

    // 어떤 정보도 없으면 기존 값 그대로
    return headerStartBase;
  }, [trackGradient, albumTone, headerStartBase, levaControls?.headerGradientOpacity]);

  // 헤더 상단 패널용 컬러 스윕(좌→우 루프) 색상 세트
  // - 메인 컬러: "조명 컬러(lightColor)"를 기반으로 한 파스텔 톤 (긴 구간을 담당)
  // - 대비 컬러: 앨범 컬러 중 가장 어두운 톤 (아주 짧은 구간만 스쳐 지나가도록)
  // - 화이트: 끝단을 정리하는 하이라이트
  let headerSweepMainColor = headerStartBase;
  const baseSweepHsl = hexToHsl(headerStartBase);
  if (baseSweepHsl) {
    const { h, s, l } = baseSweepHsl;
    const mainL = Math.min(96, l + 10);
    const mainS = Math.max(5, Math.min(100, s - 8));
    headerSweepMainColor = hsla(h, mainS, mainL, levaControls?.headerGradientOpacity || 0.95);
  }

  const headerSweepContrastColor = albumDarkSweepColor || headerSweepMainColor;
  const headerSweepWhiteColor = 'rgba(255,255,255,0.98)';

  // 우측 블롭 컬러 구성
  // - color1 / color2 / color4: 기본 Figma/Leva 색상의 명도·채도를 유지하면서,
  //   앨범 팔레트 색을 살짝 섞어 "톤만" 따라가도록 조정 (앨범 때문에 너무 칙칙/튀지 않도록)
  // - color3: SW1의 온도 기반 컬러를 그대로 사용 (중앙 핵심 온도 컬러)
  const baseRightColor1 = levaControls?.rightCircleColor1 || '#f8e9eb';
  const baseRightColor2 = levaControls?.rightCircleColor2 || '#e8adbe';
  const baseRightColor4 = levaControls?.rightCircleColor4 || '#fff3ed';
  const albumMixRatio = 0.7; // 0.7: 기본 색 70% + 앨범 색 30%

  const rightCircleColor1Base = albumPalette?.left1
    ? mixHex(baseRightColor1, albumPalette.left1, albumMixRatio)
    : baseRightColor1;
  const rightCircleColor1Rgba = hexToRgba(
    rightCircleColor1Base,
    levaControls?.rightCircleColor1Opacity || 1,
  );

  const rightCircleColor2Base = albumPalette?.left2
    ? mixHex(baseRightColor2, albumPalette.left2, albumMixRatio)
    : baseRightColor2;
  const rightCircleColor2Rgba = hexToRgba(
    rightCircleColor2Base,
    levaControls?.rightCircleColor2Opacity || 0.69,
  );
  const tempC = typeof env?.temp === 'number' ? env.temp : 24;
  const warmHue = computeMiniWarmHue(tempC);
  const tempBasedColor3 = toHslaSW1(
    warmHue,
    65,
    75,
    levaControls?.rightCircleColor3Opacity || 0.37,
  );
  // 중앙 color3은 온도 기반 색상을 그대로 사용 (앨범 팔레트/화이트와 섞지 않음)
  const rightCircleColor3Rgba = tempBasedColor3;

  const rightCircleColor4Base = albumPalette?.left4
    ? mixHex(baseRightColor4, albumPalette.left4, albumMixRatio)
    : baseRightColor4;
  const rightCircleColor4Rgba = hexToRgba(
    rightCircleColor4Base,
    levaControls?.rightCircleColor4Opacity || 0.6,
  );

  const rightPanelBgColor1Rgba = hexToRgba(
    levaControls?.rightPanelBgColor1 || '#ffffff',
    levaControls?.rightPanelBgColor1Opacity || 0.95,
  );
  const rightPanelBgColor2Rgba = hexToRgba(
    levaControls?.rightPanelBgColor2 || '#efebe1',
    levaControls?.rightPanelBgColor2Opacity || 0.78,
  );
  const rightPanelBgColor3Rgba = hexToRgba(
    levaControls?.rightPanelBgColor3 || '#d8f5f8',
    levaControls?.rightPanelBgColor3Opacity || 0.9,
  );

  const textShadowColorRgba = hexToRgba(
    levaControls?.textShadowColor || '#1c1b76',
    levaControls?.textShadowOpacity || 0.19,
  );
  const iconShadowColorRgba = hexToRgba(
    levaControls?.iconShadowColor || '#1c1b76',
    levaControls?.iconShadowOpacity || 0.19,
  );
  const textGlowColorRgba = hexToRgba(levaControls?.textGlowColor || '#e9ffe6', 0.5);
  const iconGlowColorRgba = hexToRgba(levaControls?.iconGlowColor || '#e9ffe6', 0.5);

  // Music tag lookup
  const musicTag = useMemo(() => {
    if (!env.music) return '';
    const parsed = parseMusicString(env.music);
    const normalizedParsedTitle = normalizeTrackName(parsed.title);
    const catalogEntry = MUSIC_CATALOG.find((m) => {
      const normalizedCatalogTitle = normalizeTrackName(m.title);
      const normalizedCatalogId = normalizeTrackName(m.id);
      return (
        normalizedCatalogTitle === normalizedParsedTitle ||
        normalizedCatalogId === normalizedParsedTitle
      );
    });
    // Prefer category(cat) over tags; fallback to env.music string
    const label = catalogEntry?.cat || catalogEntry?.tags?.[0] || env.music;
    return (label || '').toString();
  }, [env.music]);

  // Reason 표시: 타이핑 없이 바로 나타났다 페이드아웃
  // Reason 표시 제거 (좌측 문장 비표시)

  // Animation flags for T4 and T5
  const isT4 = motionState === 'T4';
  const isT5 = motionState === 'T5';
  const isT3 = motionState === 'T3';

  // T4: Parallel animations trigger
  const triggerT4Animations = isT4 && decisionKey > 0;

  // T5: All content appears with roulette motion
  const triggerT5Animations = isT5 && decisionKey > 0;

  // Music indicator pulse intensity (stronger in T5)
  const waveformPulseIntensity = isT5 ? 1.4 : 1.0;

  // Landing bootstrap: show default content immediately without a decision
  useEffect(() => {
    const hasInput =
      !!(
        env?.music ||
        env?.lightColor ||
        typeof env?.temp === 'number' ||
        typeof env?.humidity === 'number'
      );
    if (!hasInput) return;
    if (decisionKey !== 0) return;
    if (motionStateRef.current !== 'T3') return;

    // Promote to T5 and reveal current values
    setMotionState('T5');
    motionStateRef.current = 'T5';

    // Header
    if (headerText) {
      setShowHeaderLoading(false);
      setDisplayHeaderText(headerText);
    }
    // Title/Artist/Cover
    setShowTitleLoading(false);
    setShowArtistLoading(false);
    setShowAlbumCover(!!coverSrc);
    setDisplayTitle(title || '');
    setDisplayArtist(artist || '');

    // Temp/Humidity
    const tNum = typeof env?.temp === 'number' ? env.temp : null;
    const hNum = typeof env?.humidity === 'number' ? env.humidity : null;
    const t = tNum != null ? `${tNum}°C` : '';
    const h = hNum != null ? `${hNum}%` : '';
    if (t) {
      setShowTempLoading(false);
      setDisplayTemp(t);
      setDisplayTempLabel(classifyTempLabel(tNum));
    }
    if (h) {
      setShowHumidityLoading(false);
      setDisplayHumidity(h);
      setDisplayHumidityLabel(classifyHumidityLabel(hNum));
    }
  }, [
    env?.music,
    env?.lightColor,
    env?.temp,
    env?.humidity,
    title,
    artist,
    coverSrc,
    headerText,
    decisionKey,
  ]);

  return {
    // Display states
    isIdle,
    headerText,
    displayTitle,
    displayArtist,
    displayTemp,
    displayHumidity,
    displayTempLabel,
    displayHumidityLabel,
    displayHeaderText,
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

    // Motion states
    motionState,
    decisionKey,
    showBorderFlash,
    isT3,
    isT4,
    isT5,
    triggerT4Animations,
    triggerT5Animations,
    waveformPulseIntensity,
    // BPM / 파동 제어 값
    tempo,
    pulseDuration: basePulseDuration,
    pulseDelays,

    // Visual states
    albumTone,
    blurAnim,
    waveformData,
    scale,
    albumCardBackground,
    albumPalette,
    musicTag,

    // Color values
    headerGradientStartRgba,
    headerGradientMidRgba,
    headerGradientEndRgba,
    prevHeaderGradient,
    prevHeaderVisible,
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

    // Header color sweep (상단 패널 컬러 루프 모션용)
    headerSweepMainColor,
    headerSweepContrastColor,
    headerSweepWhiteColor,
    headerSweepActive,
  };
}


