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

// Zoom-invariant cover scale for a fixed 3840x2160 canvas
// Math.min을 사용하여 전체 콘텐츠가 화면에 맞도록 스케일링
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
      setEnv((prev) => {
        const next = {
          ...prev,
          temp: typeof e.temp === 'number' ? e.temp : prev.temp,
          humidity: typeof e.humidity === 'number' ? e.humidity : prev.humidity,
          lightColor: e.lightColor || prev.lightColor,
          music: typeof e.music === 'string' && e.music ? e.music : prev.music,
        };
        next.lightLabel = next.lightColor ? `Light ${next.lightColor}` : prev.lightLabel;
        console.log('📺 TV2 env updated:', { temp: next.temp, humidity: next.humidity, lightColor: next.lightColor, music: next.music });
        return next;
      });
      // 음악 선택 이유 저장
      if (msg.reason && typeof msg.reason === 'string') {
        setReason(msg.reason);
      }
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

  return { env, title, artist, coverSrc, audioSrc, reason };
}

export function useTV2DisplayLogic({ env, title, artist, coverSrc, audioSrc, reason, levaControls, audioRef }) {
  const hexColor = (env?.lightColor || '').toUpperCase();
  const friendlyName = useMemo(() => describeHexColor(hexColor), [hexColor]);
  const headerText = friendlyName || env.lightLabel || hexColor || '조명 색상';
  
  const isIdle = !title && !artist && !coverSrc && (!env || env.music === 'ambient');
  
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
  
  const titleChangeRef = useRef('');
  const artistChangeRef = useRef('');
  const coverChangeRef = useRef('');
  const tempChangeRef = useRef(typeof env?.temp === 'number' ? env.temp : null);
  const humidityChangeRef = useRef(typeof env?.humidity === 'number' ? env.humidity : null);
  const headerChangeRef = useRef(headerText || '');
  
  const [showChangeMessage, setShowChangeMessage] = useState(false);
  
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
  
  // Title/Artist/Cover loading logic
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
      
      const timer = setTimeout(() => {
        setShowTitleLoading(false);
        setShowArtistLoading(false);
        setShowAlbumCover(true);
        setDisplayTitle(newTitle);
        setDisplayArtist(newArtist);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
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
  
  // Temperature loading logic
  useEffect(() => {
    const newTemp = typeof env?.temp === 'number' ? env.temp : null;
    const tempChanged = newTemp !== null && newTemp !== tempChangeRef.current;
    
    if (tempChanged) {
      tempChangeRef.current = newTemp;
      setShowTempLoading(true);
      setDisplayTemp('');
      
      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);
      
      const timer = setTimeout(() => {
        setShowTempLoading(false);
        setDisplayTemp(newTemp !== null ? `${newTemp}°C` : '');
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [env?.temp]);
  
  // Humidity loading logic
  useEffect(() => {
    const newHumidity = typeof env?.humidity === 'number' ? env.humidity : null;
    const humidityChanged = newHumidity !== null && newHumidity !== humidityChangeRef.current;
    
    if (humidityChanged) {
      humidityChangeRef.current = newHumidity;
      setShowHumidityLoading(true);
      setDisplayHumidity('');
      
      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);
      
      const timer = setTimeout(() => {
        setShowHumidityLoading(false);
        setDisplayHumidity(newHumidity !== null ? `${newHumidity}%` : '');
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [env?.humidity]);
  
  // Header loading logic
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
      
      const timer = setTimeout(() => {
        setShowHeaderLoading(false);
        setDisplayHeaderText(newHeaderText);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
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
                // 높이를 4px~120px 범위로 매핑 (더 적극적인 움직임)
                const height = Math.max(4, Math.min(120, (max / 255) * 120));
                newWaveformData.push(height);
              }
              setWaveformData(newWaveformData);
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
        analyser.smoothingTimeConstant = 0.3; // 더 민감하게 반응하도록 감소
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
                // 높이를 6px~140px 범위로 매핑 (더 적극적인 움직임)
                const height = Math.max(6, Math.min(140, (max / 255) * 140));
            newWaveformData.push(height);
          }
          setWaveformData(newWaveformData);
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
  
  // Color conversions (헤더: 좌측 앨범, 가운데 조명, 우측 화이트)
  const headerStartBase = hexColor && hexColor.match(/^#[0-9A-F]{6}$/i) ? hexColor : levaControls?.headerGradientStart || '#4880e2';
  const headerStartColor = albumPalette?.left1 || headerStartBase;
  const headerMidColor = headerStartBase;
  const headerEndColor = '#ffffff';
  const headerGradientStartRgba = hexToRgba(headerStartColor, levaControls?.headerGradientOpacity || 1);
  const headerGradientMidRgba = hexToRgba(headerMidColor, levaControls?.headerGradientOpacity || 1);
  const headerGradientEndRgba = hexToRgba(headerEndColor, levaControls?.headerGradientOpacity || 1);
  
  const rightCircleColor1Rgba = hexToRgba(levaControls?.rightCircleColor1 || '#f8e9eb', levaControls?.rightCircleColor1Opacity || 1);
  const rightCircleColor2Base = levaControls?.rightCircleColor2 || '#e8adbe';
  const rightCircleColor2Rgba = hexToRgba(albumPalette?.left2 || rightCircleColor2Base, levaControls?.rightCircleColor2Opacity || 0.69);
  const tempC = typeof env?.temp === 'number' ? env.temp : 24;
  const warmHue = computeMiniWarmHue(tempC);
  const tempBasedColor3 = toHslaSW1(warmHue, 65, 75, levaControls?.rightCircleColor3Opacity || 0.37);
  const blobCenterBase = albumPalette?.left3 || tempBasedColor3;
  // 중앙 컬러를 약간 더 연하게 고정
  const rightCircleColor3Rgba = hexToRgba(mixHex(blobCenterBase, '#ffffff', 0.35), levaControls?.rightCircleColor3Opacity || 0.37);
  const rightCircleColor4Rgba = hexToRgba(levaControls?.rightCircleColor4 || '#fff3ed', levaControls?.rightCircleColor4Opacity || 0.60);
  
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
    const tag = catalogEntry?.tags?.[0] || env.music;
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }, [env.music]);
  
  // Reason 표시: 타이핑 없이 바로 나타났다 페이드아웃
  // Reason 표시 제거 (좌측 문장 비표시)
  
  return {
    // Display states
    isIdle,
    headerText,
    displayTitle,
    displayArtist,
    displayTemp,
    displayHumidity,
    displayHeaderText,
    showTitleLoading,
    showArtistLoading,
    showAlbumCover,
    showTempLoading,
    showHumidityLoading,
    showHeaderLoading,
    showChangeMessage,
    albumVisualKey,
    
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
  };
}
