import { useEffect, useMemo, useState, useRef } from 'react';
import useSocketTV2 from '@/utils/hooks/useSocketTV2';
import { parseMusicString, getAlbumCoverPath, getAlbumData, getAlbumSongPath, getAlbumGradient, normalizeTrackName } from '@/utils/data/albumData';
import { getDominantColorFromImage } from '@/utils/color/albumColor';
import { MUSIC_CATALOG } from '@/utils/data/musicCatalog';
import { computeMiniWarmHue, toHsla as toHslaSW1 } from '@/components/livingroom/SW1/logic/color';

const DEFAULT_ENV = {
  temp: 24,
  humidity: 38,
  lightColor: '#6EA7FF',
  music: '',
  lightLabel: '',
};

// Utility functions
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const hsla = (h, s, l, a = 1) => `hsla(${Math.round(h)}, ${clamp(Math.round(s), 0, 100)}%, ${clamp(Math.round(l), 0, 100)}%, ${a})`;
const toHsla = (h, s, l, a = 1) => hsla(h, s, l, a);

const mixHex = (hexA, hexB, ratio = 0.5) => {
  const toRgb = (hex) => {
    const m = hex?.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return null;
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  };
  const a = toRgb(hexA);
  const b = toRgb(hexB);
  if (!a || !b) return hexA || hexB;
  const mix = (ai, bi) => Math.round(ai * ratio + bi * (1 - ratio));
  const [r, g, bVal] = [mix(a[0], b[0]), mix(a[1], b[1]), mix(a[2], b[2])];
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
};

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

function hexToHsl(hex){
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

function hexToRgba(hex, opacity = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

// Zoom-invariant scale for a fixed 3840x2160 canvas
// SW1/SW2와 마찬가지로, 기준 캔버스(3840x2160)를 유지한 채
// 전체가 잘리지 않고 화면 안에 "비율 그대로" 들어오도록 스케일링한다.
// → contain 방식: Math.min(vw/baseW, vh/baseH)
function computeCoverScale() {
  if (typeof window === 'undefined') return 1;
  const baseWidth = 3840;
  const baseHeight = 2160;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Math.min(vw / baseWidth, vh / baseHeight);
}

export function useTV2Logic() {
  const [env, setEnv] = useState(DEFAULT_ENV);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverSrc, setCoverSrc] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [reason, setReason] = useState('');
  const [emotionKeyword, setEmotionKeyword] = useState('');
  // 새로운 디시전이 들어올 때마다 1씩 증가하는 토큰 (env 값이 동일해도 증가)
  const [decisionToken, setDecisionToken] = useState(0);

  useSocketTV2({
    onDeviceNewDecision: (msg) => {
      if (!msg) return;
      const target = msg.target || msg.device;
      if (target && target !== 'tv2') return;
      const e = msg.env || {};
      console.log('🎯 TV2 received decision:', {
        target,
        env: e,
        decisionId: msg.decisionId,
        userId: msg.mergedFrom?.[0],
        reason: msg.reason,
      });
      // 숫자 혹은 숫자 문자열 모두 허용하는 헬퍼
      const toNumberOrFallback = (value, fallback) => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
          const n = Number(value.trim());
          if (!Number.isNaN(n) && Number.isFinite(n)) return n;
        }
        return fallback;
      };

      setEnv((prev) => {
        const nextTemp = toNumberOrFallback(e.temp, prev?.temp ?? DEFAULT_ENV.temp);
        const nextHumidity = toNumberOrFallback(e.humidity, prev?.humidity ?? DEFAULT_ENV.humidity);
        const next = {
          ...prev,
          temp: nextTemp,
          humidity: nextHumidity,
          lightColor: e.lightColor || prev.lightColor || DEFAULT_ENV.lightColor,
          music: typeof e.music === 'string' && e.music ? e.music : prev.music,
        };
        next.lightLabel = next.lightColor ? `Light ${next.lightColor}` : prev.lightLabel;
        console.log('📺 TV2 env updated:', { temp: next.temp, humidity: next.humidity, lightColor: next.lightColor, music: next.music });
        return next;
      });
      // 음악 선택 이유 & 감정 키워드 저장
      if (msg.reason && typeof msg.reason === 'string') {
        setReason(msg.reason);
      }
      if (msg.emotionKeyword && typeof msg.emotionKeyword === 'string') {
        try {
          const { sanitizeEmotion } = require('@/utils/text/sanitizeEmotion');
          setEmotionKeyword(sanitizeEmotion(msg.emotionKeyword, { strict: true }));
        } catch {
          setEmotionKeyword('불쾌해');
        }
      }

      // env 내용이 동일하더라도, 새로운 디시전이 들어왔다는 사실 자체를 전달하기 위한 토큰
      setDecisionToken((prev) => prev + 1);
    },
  });

  // Derive track meta and cover from env.music
  useEffect(() => {
    const s = String(env?.music || '').trim();
    if (!s) {
      setTitle('');
      setArtist('');
      setCoverSrc('');
      setAudioSrc('');
      return;
    }
    
    // Parse using albumData utility
    const parsed = parseMusicString(s);
    let t = parsed.title;
    let a = parsed.artist;
    
    // Try to get album data for display title/artist
    const albumData = getAlbumData(s);
    if (albumData) {
      t = albumData.displayTitle || t;
      a = albumData.displayArtist || a;
    }
    
    setTitle(t);
    setArtist(a);
    
    // Get cover path using albumData
    const coverPath = getAlbumCoverPath(s);
    setCoverSrc(coverPath || '');
    
    // Get audio path using albumData
    const audioPath = getAlbumSongPath(s);
    setAudioSrc(audioPath || '');
  }, [env?.music]);

  return { env, title, artist, coverSrc, audioSrc, reason, emotionKeyword, decisionToken };
}

export function useTV2DisplayLogic({ env, title, artist, coverSrc, audioSrc, reason, emotionKeyword, decisionToken, levaControls, audioRef }) {
  const hexColor = (env?.lightColor || '').toUpperCase();
  const friendlyName = useMemo(() => describeHexColor(hexColor), [hexColor]);
  const headerText = friendlyName || env.lightLabel || hexColor || '조명 색상';
  
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
    const hasInput = !!(env?.music || env?.lightColor || typeof env?.temp === 'number' || typeof env?.humidity === 'number');

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

    const hasInput = !!(env?.music || env?.lightColor || typeof env?.temp === 'number' || typeof env?.humidity === 'number');
    if (!hasInput) return;

    setMotionState('T4');
    motionStateRef.current = 'T4';
    setDecisionKey((prev) => prev + 1);

    // 상단 전체 테두리 플래시
    setShowBorderFlash(true);
    const flashTimer = setTimeout(() => setShowBorderFlash(false), 400);

    // 3초 뒤 T5 진입
    const t5Timer = setTimeout(() => {
      setMotionState('T5');
      motionStateRef.current = 'T5';
    }, 3000);

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
  const albumVisualKey = (showAlbumCover && coverSrc) ? coverSrc : 'placeholder';
  
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
    return () => { cancelled = true; };
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
      
      // Wait for T5 state before showing content (T4 keeps '...' for 3 seconds)
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
      
      // If already in T5, show immediately. Otherwise wait 3 seconds for T4->T5 transition
      if (motionStateRef.current === 'T5') {
        // Already in T5, show immediately
        checkT5();
      } else {
        // Start checking after 3 seconds (T4 duration)
        const timer = setTimeout(checkT5, 3000);
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
        const timer = setTimeout(checkT5, 3000);
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
    
    setShowChangeMessage(true);
    const messageTimer = setTimeout(() => {
      setShowChangeMessage(false);
    }, 3000);
    
    const checkT5 = () => {
      if (motionStateRef.current === 'T5') {
        setShowTempLoading(false);
        setDisplayTemp(`${newTemp}°C`);
      } else {
        setTimeout(checkT5, 100);
      }
    };
    
    const timer = setTimeout(checkT5, 3000);
    
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
    
    setShowChangeMessage(true);
    const messageTimer = setTimeout(() => {
      setShowChangeMessage(false);
    }, 3000);
    
    const checkT5 = () => {
      if (motionStateRef.current === 'T5') {
        setShowHumidityLoading(false);
        setDisplayHumidity(`${newHumidity}%`);
      } else {
        setTimeout(checkT5, 100);
      }
    };
    
    const timer = setTimeout(checkT5, 3000);
    
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
      
      const timer = setTimeout(checkT5, 3000);
      
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
        const t = setTimeout(reveal, 3000);
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
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const bars = 32;
          const newWaveformData = [];
          let globalMax = 0;
          
          // 로그 스케일로 샘플링하여 저주파수와 고주파수를 모두 포함
          for (let i = 0; i < bars; i++) {
            // 로그 스케일 인덱스 계산
            const ratio = i / (bars - 1);
            const logIndex = Math.floor(
              Math.pow(dataArray.length, ratio) - 1
            );
            const nextRatio = (i + 1) / (bars - 1);
            const nextLogIndex = i < bars - 1 
              ? Math.floor(Math.pow(dataArray.length, nextRatio) - 1)
              : dataArray.length;
            
            // 해당 범위의 최대값 사용 (더 역동적인 시각화)
            let max = 0;
            for (let j = Math.max(0, logIndex); j < Math.min(nextLogIndex, dataArray.length); j++) {
              max = Math.max(max, dataArray[j] || 0);
            }
            globalMax = Math.max(globalMax, max);
            newWaveformData.push(max);
          }

          const minHeight = 8;
          const maxHeight = 160;
          const normGlobal = globalMax / 255 || 0.0001;
          const gain = normGlobal < 0.4 ? 0.4 / normGlobal : 1;

          const scaled = newWaveformData.map(raw => {
            const norm = (raw / 255) * gain;
            const clamped = Math.max(0, Math.min(1, norm));
            const gamma = Math.pow(clamped, 0.7);
            return Math.max(minHeight, Math.min(maxHeight, gamma * maxHeight));
          });

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
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const bars = 32;
          const newWaveformData = [];
          let globalMax = 0;
          
          // 로그 스케일로 샘플링하여 저주파수와 고주파수를 모두 포함
          for (let i = 0; i < bars; i++) {
            // 로그 스케일 인덱스 계산
            const ratio = i / (bars - 1);
            const logIndex = Math.floor(
              Math.pow(dataArray.length, ratio) - 1
            );
            const nextRatio = (i + 1) / (bars - 1);
            const nextLogIndex = i < bars - 1 
              ? Math.floor(Math.pow(dataArray.length, nextRatio) - 1)
              : dataArray.length;
            
            // 해당 범위의 최대값 사용 (더 역동적인 시각화)
            let max = 0;
            for (let j = Math.max(0, logIndex); j < Math.min(nextLogIndex, dataArray.length); j++) {
              max = Math.max(max, dataArray[j] || 0);
            }
            globalMax = Math.max(globalMax, max);
            newWaveformData.push(max);
          }

          // 글로벌 레벨에 따라 자동 게인 걸어서 좀 더 적극적으로 움직이도록
          const minHeight = 8;
          const maxHeight = 160;
          const normGlobal = globalMax / 255 || 0.0001;
          // 신호가 작으면 증폭, 크면 그대로
          const gain = normGlobal < 0.4 ? 0.4 / normGlobal : 1;

          const scaled = newWaveformData.map(raw => {
            const norm = (raw / 255) * gain;
            const clamped = Math.max(0, Math.min(1, norm));
            // 살짝 감마를 줘서 작은 변화도 잘 보이게
            const gamma = Math.pow(clamped, 0.7);
            return Math.max(minHeight, Math.min(maxHeight, gamma * maxHeight));
          });

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
      return hasCover ? 'radial-gradient(120% 120% at 50% 45%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 40%, rgba(255,255,255,0.36) 100%)' : 'rgba(255,255,255,0.96)';
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
  
  // Color conversions (헤더: 좌측 조명 컬러, 가운데 조명, 우측 화이트)
  const headerStartBase = hexColor && hexColor.match(/^#[0-9A-F]{6}$/i) ? hexColor : levaControls?.headerGradientStart || '#4880e2';
  // 상단 기본 헤더 그라디언트는 "조명 컬러(lightColor)"만 기준으로 사용
  // (앨범 컬러는 별도의 스윕 레이어에서만 일부 사용)
  const headerStartColor = headerStartBase;
  const headerMidColor = headerStartBase;
  const headerEndColor = '#ffffff';
  const headerGradientStartRgba = hexToRgba(headerStartColor, levaControls?.headerGradientOpacity || 1);
  const headerGradientMidRgba = hexToRgba(headerMidColor, levaControls?.headerGradientOpacity || 1);
  const headerGradientEndRgba = hexToRgba(headerEndColor, levaControls?.headerGradientOpacity || 1);

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
  }, [headerGradientStartRgba, headerGradientMidRgba, headerGradientEndRgba, levaControls?.headerGradientMidPos, levaControls?.headerGradientEndPos]);

  // 앨범 컬러 중 가장 어두운 컬러를 상단 패널 스윕의 좌측 시작 컬러로 사용
  const albumDarkSweepColor = useMemo(() => {
    const opacity = levaControls?.headerGradientOpacity || 0.95;

    // 1) 곡별 그라디언트가 있으면, 그 중 "가장 어두운" 컬러를 사용
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

    // 2) 그라디언트가 없으면, 앨범 톤에서 살짝 더 눌린 다크 톤 사용
    if (albumTone) {
      const l = Math.max(0, albumTone.l - 12);
      return hsla(albumTone.h, albumTone.s, l, opacity);
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
  const rightCircleColor1Rgba = hexToRgba(rightCircleColor1Base, levaControls?.rightCircleColor1Opacity || 1);

  const rightCircleColor2Base = albumPalette?.left2
    ? mixHex(baseRightColor2, albumPalette.left2, albumMixRatio)
    : baseRightColor2;
  const rightCircleColor2Rgba = hexToRgba(rightCircleColor2Base, levaControls?.rightCircleColor2Opacity || 0.69);
  const tempC = typeof env?.temp === 'number' ? env.temp : 24;
  const warmHue = computeMiniWarmHue(tempC);
  const tempBasedColor3 = toHslaSW1(warmHue, 65, 75, levaControls?.rightCircleColor3Opacity || 0.37);
  // 중앙 color3은 온도 기반 색상을 그대로 사용 (앨범 팔레트/화이트와 섞지 않음)
  const rightCircleColor3Rgba = tempBasedColor3;

  const rightCircleColor4Base = albumPalette?.left4
    ? mixHex(baseRightColor4, albumPalette.left4, albumMixRatio)
    : baseRightColor4;
  const rightCircleColor4Rgba = hexToRgba(rightCircleColor4Base, levaControls?.rightCircleColor4Opacity || 0.60);
  
  const rightPanelBgColor1Rgba = hexToRgba(levaControls?.rightPanelBgColor1 || '#ffffff', levaControls?.rightPanelBgColor1Opacity || 0.95);
  const rightPanelBgColor2Rgba = hexToRgba(levaControls?.rightPanelBgColor2 || '#efebe1', levaControls?.rightPanelBgColor2Opacity || 0.78);
  const rightPanelBgColor3Rgba = hexToRgba(levaControls?.rightPanelBgColor3 || '#d8f5f8', levaControls?.rightPanelBgColor3Opacity || 0.90);
  
  const textShadowColorRgba = hexToRgba(levaControls?.textShadowColor || '#1c1b76', levaControls?.textShadowOpacity || 0.19);
  const iconShadowColorRgba = hexToRgba(levaControls?.iconShadowColor || '#1c1b76', levaControls?.iconShadowOpacity || 0.19);
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
      return normalizedCatalogTitle === normalizedParsedTitle || 
             normalizedCatalogId === normalizedParsedTitle;
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
  
  return {
    // Display states
    isIdle,
    headerText,
    displayTitle,
    displayArtist,
    displayTemp,
    displayHumidity,
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
