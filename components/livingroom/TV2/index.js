import React, { useEffect, useMemo, useState, useRef } from "react";
import { useControls } from "leva";
import { useBlobVars } from "./blob/blob.logic";
import * as S from './styles';
import { useTV2Logic } from './logic';
import { getDominantColorFromImage } from '@/utils/color/albumColor';
import { getAlbumGradient, parseMusicString, normalizeTrackName } from '@/utils/data/albumData';
import { MUSIC_CATALOG } from '@/utils/data/musicCatalog';
import { computeMiniWarmHue, toHsla as toHslaSW1 } from '@/components/livingroom/SW1/logic/color';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const hsla = (h, s, l, a = 1) => `hsla(${Math.round(h)}, ${clamp(Math.round(s), 0, 100)}%, ${clamp(Math.round(l), 0, 100)}%, ${a})`;
const toHsla = (h, s, l, a = 1) => hsla(h, s, l, a);

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
function hexToHsl(hex){
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export default function TV2Controls() {
  const { env, title, artist, coverSrc, audioSrc } = useTV2Logic();
  const scalerRef = useRef(null);
  const audioRef = useRef(null);
  const [waveformData, setWaveformData] = useState(new Array(32).fill(0));

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

  const hexColor = (env?.lightColor || '').toUpperCase();
  const friendlyName = useMemo(() => describeHexColor(hexColor), [hexColor]);
  const headerText = friendlyName || env.lightLabel || hexColor || '조명 색상';

  // 헤더 컬러는 기본 Leva 값만 사용 (컬러 변경 로직 제거)

  // Consider idle until we have any track meta
  const isIdle = !title && !artist && !coverSrc && (!env || env.music === 'ambient');
  
  // 2초간 로딩 표시를 위한 상태 (변경 직전에 2초 표시)
  const [showTitleLoading, setShowTitleLoading] = useState(true);
  const [showArtistLoading, setShowArtistLoading] = useState(true);
  const [showAlbumCover, setShowAlbumCover] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayArtist, setDisplayArtist] = useState('');
  const [showTempLoading, setShowTempLoading] = useState(false);
  const [showHumidityLoading, setShowHumidityLoading] = useState(false);
  const [showHeaderLoading, setShowHeaderLoading] = useState(false);
  const [displayTemp, setDisplayTemp] = useState(typeof env?.temp === 'number' ? `${env.temp}°C` : '');
  const [displayHumidity, setDisplayHumidity] = useState(typeof env?.humidity === 'number' ? `${env.humidity}%` : '');
  const [displayHeaderText, setDisplayHeaderText] = useState(headerText || '');
  const titleChangeRef = useRef('');
  const artistChangeRef = useRef('');
  const coverChangeRef = useRef('');
  const tempChangeRef = useRef(typeof env?.temp === 'number' ? env.temp : null);
  const humidityChangeRef = useRef(typeof env?.humidity === 'number' ? env.humidity : null);
  const headerChangeRef = useRef(headerText || '');
  
  // 값 변경 시 하단 메시지 표시
  const [showChangeMessage, setShowChangeMessage] = useState(false);
  
  const albumVisualKey = (showAlbumCover && coverSrc) ? coverSrc : 'placeholder';
  
  // title/artist/cover 변경 시 2초간 로딩 후 한 번에 표시
  useEffect(() => {
    const newTitle = title || '';
    const newArtist = artist || '';
    const newCover = coverSrc || '';
    
    // 변경 사항이 있는지 확인
    const titleChanged = newTitle !== titleChangeRef.current;
    const artistChanged = newArtist !== artistChangeRef.current;
    const coverChanged = newCover !== coverChangeRef.current;
    
    if (titleChanged || artistChanged || coverChanged) {
      // 변경 직전: 즉시 로딩 표시하고 모든 콘텐츠 숨김
      setShowTitleLoading(true);
      setShowArtistLoading(true);
      setShowAlbumCover(false);
      setDisplayTitle('');
      setDisplayArtist('');
      
      // 값 변경 메시지 표시
      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);
      
      // 변경된 값 저장
      titleChangeRef.current = newTitle;
      artistChangeRef.current = newArtist;
      coverChangeRef.current = newCover;
      
      // 2초 후 모든 콘텐츠 한 번에 표시
      const timer = setTimeout(() => {
        setShowTitleLoading(false);
        setShowArtistLoading(false);
        setShowAlbumCover(true);
        setDisplayTitle(newTitle);
        setDisplayArtist(newArtist);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    } else if (!newTitle && !newArtist && !newCover) {
      // 모두 비어있으면 로딩 표시
      setShowTitleLoading(true);
      setShowArtistLoading(true);
      setShowAlbumCover(false);
      setDisplayTitle('');
      setDisplayArtist('');
    }
  }, [title, artist, coverSrc]);

  // 온도/습도/헤더 컬러 변경 시 2초간 로딩 후 표시
  useEffect(() => {
    const newTemp = typeof env?.temp === 'number' ? env.temp : null;
    const newHumidity = typeof env?.humidity === 'number' ? env.humidity : null;
    const newHeaderText = headerText || '';
    
    const tempChanged = newTemp !== null && newTemp !== tempChangeRef.current;
    const humidityChanged = newHumidity !== null && newHumidity !== humidityChangeRef.current;
    const headerChanged = newHeaderText !== headerChangeRef.current;
    
    if (tempChanged) {
      tempChangeRef.current = newTemp;
      setShowTempLoading(true);
      setDisplayTemp('');
      
      // 값 변경 메시지 표시
      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);
      
      const timer = setTimeout(() => {
        setShowTempLoading(false);
        setDisplayTemp(newTemp !== null ? `${newTemp}°C` : '');
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [env?.temp]);
  
  useEffect(() => {
    const newHumidity = typeof env?.humidity === 'number' ? env.humidity : null;
    const humidityChanged = newHumidity !== null && newHumidity !== humidityChangeRef.current;
    
    if (humidityChanged) {
      humidityChangeRef.current = newHumidity;
      setShowHumidityLoading(true);
      setDisplayHumidity('');
      
      // 값 변경 메시지 표시
      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);
      
      const timer = setTimeout(() => {
        setShowHumidityLoading(false);
        setDisplayHumidity(newHumidity !== null ? `${newHumidity}%` : '');
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [env?.humidity]);
  
  useEffect(() => {
    const newHeaderText = headerText || '';
    const headerChanged = newHeaderText !== headerChangeRef.current;
    
    if (headerChanged && newHeaderText) {
      headerChangeRef.current = newHeaderText;
      setShowHeaderLoading(true);
      setDisplayHeaderText('');
      
      // 값 변경 메시지 표시
      setShowChangeMessage(true);
      const messageTimer = setTimeout(() => {
        setShowChangeMessage(false);
      }, 3000);
      
      const timer = setTimeout(() => {
        setShowHeaderLoading(false);
        setDisplayHeaderText(newHeaderText);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [headerText]);

  const [albumTone, setAlbumTone] = useState(null);
  const [blurAnim, setBlurAnim] = useState(leftPanelBlur);
  const blurDirRef = useRef(1);
  const rafRef = useRef(null);
  const hasCover = !!coverSrc;
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const waveformRafRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    setBlurAnim(leftPanelBlur);
    blurDirRef.current = 1;
  }, [leftPanelBlur]);

  useEffect(() => {
    let lastTs = null;
    const blurMin = 1;
    const blurMax = 28;
    const blurSpeed = 6; // unit per second
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

  // Web Audio API로 실제 오디오 파형 추출
  useEffect(() => {
    if (!audioSrc || !audioRef.current) {
      // 오디오가 없으면 파형 데이터 초기화
      setWaveformData(new Array(32).fill(0));
      // 기존 연결 정리
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
        // 이미 연결된 소스가 있으면 재연결하지 않음
        if (sourceRef.current) {
          // 기존 연결 재사용 - 새로운 파형 업데이트만 시작
          analyser = analyserRef.current;
          if (analyser) {
            const updateWaveform = () => {
              if (!analyser) return;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);

              // 32개의 바를 위해 데이터를 다운샘플링
              const bars = 32;
              const step = Math.floor(dataArray.length / bars);
              const newWaveformData = [];

              for (let i = 0; i < bars; i++) {
                let sum = 0;
                for (let j = 0; j < step; j++) {
                  sum += dataArray[i * step + j] || 0;
                }
                const avg = sum / step;
                // 0-255 범위를 0-60px 높이로 변환 (최소 4px)
                const height = Math.max(4, (avg / 255) * 60);
                newWaveformData.push(height);
              }

              setWaveformData(newWaveformData);
              waveformRafRef.current = requestAnimationFrame(updateWaveform);
            };

            updateWaveform();
          }
          return;
        }

        // AudioContext 생성
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        // 기존 AudioContext가 있으면 재사용
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContext = audioContextRef.current;
        } else {
          audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;
        }

        // AnalyserNode 생성
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // 32개의 주파수 빈
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // 오디오 소스 연결 (한 번만 연결)
        source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceRef.current = source;

        // 오디오 재생 시도
        try {
          await audioRef.current.play();
        } catch (err) {
          // 자동 재생이 차단된 경우 사용자 인터랙션 대기
          const resume = () => {
            try {
              audioRef.current?.play();
            } catch {}
          };
          window.addEventListener('pointerdown', resume, { once: true });
          window.addEventListener('keydown', resume, { once: true });
          window.addEventListener('touchstart', resume, { once: true, passive: true });
        }

        // 파형 데이터 업데이트 루프
        const updateWaveform = () => {
          if (!analyser) return;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);

          // 32개의 바를 위해 데이터를 다운샘플링
          const bars = 32;
          const step = Math.floor(dataArray.length / bars);
          const newWaveformData = [];

          for (let i = 0; i < bars; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += dataArray[i * step + j] || 0;
            }
            const avg = sum / step;
            // 0-255 범위를 0-60px 높이로 변환 (최소 4px)
            const height = Math.max(4, (avg / 255) * 60);
            newWaveformData.push(height);
          }

          setWaveformData(newWaveformData);
          waveformRafRef.current = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
      } catch (err) {
        console.error('Audio visualization error:', err);
        // 에러 발생 시 ref 정리
        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch {}
          sourceRef.current = null;
        }
      }
    };

    // 오디오 로드 후 초기화
    handleLoadedData = () => {
      initAudio();
    };

    // 이벤트 리스너 추가 (중복 방지)
    const audioElement = audioRef.current;
    audioElement.addEventListener('loadeddata', handleLoadedData);
    
    if (audioElement.readyState >= 2) {
      // 이미 로드된 경우 즉시 초기화
      initAudio();
    }

    return () => {
      if (waveformRafRef.current) {
        cancelAnimationFrame(waveformRafRef.current);
        waveformRafRef.current = null;
      }
      // 이벤트 리스너 제거
      if (audioElement && handleLoadedData) {
        audioElement.removeEventListener('loadeddata', handleLoadedData);
      }
      // source는 한 번만 연결되므로 cleanup에서 제거하지 않음
      // audioSrc가 변경될 때만 정리됨
    };
  }, [audioSrc]);

  const albumCardBackground = useMemo(() => {
    if (!albumTone) {
      // 완전 무입력 상태에서는 흰색으로 시작, 커버는 올라오며 톤 입힘
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
  }, [albumTone]);

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

  // 곡명으로 지정된 그라데이션 확인
  const trackGradient = useMemo(() => {
    // env.music 또는 title 사용 (getAlbumGradient는 둘 다 지원)
    const trackName = env.music || title;
    if (!trackName) return null;
    
    return getAlbumGradient(trackName);
  }, [title, env.music]);

  const albumPalette = useMemo(() => {
    // 매핑된 곡이 있으면 해당 그라데이션 사용
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
    // 없으면 기존 동적 추출 방식 사용
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

  // 헤더 그라데이션 색상을 rgba로 변환
  const hexToRgba = (hex, opacity = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r},${g},${b},${opacity})`;
  };

  // 상단 그라디언트 좌측 컬러는 조명 컬러 디시전에 따라 변경
  const headerStartColor = hexColor && hexColor.match(/^#[0-9A-F]{6}$/i) ? hexColor : headerGradientStart;
  const headerGradientStartRgba = hexToRgba(headerStartColor, headerGradientOpacity);
  const headerGradientMidRgba = hexToRgba(headerGradientMid, headerGradientOpacity);
  const headerGradientEndRgba = hexToRgba(headerGradientEnd, headerGradientOpacity);

  // 우측 원 색상을 rgba로 변환 (각 색상의 투명도 적용)
  const rightCircleColor1Rgba = hexToRgba(rightCircleColor1, rightCircleColor1Opacity);
  const rightCircleColor2Rgba = hexToRgba(rightCircleColor2, rightCircleColor2Opacity);
  // 온도에 따라 rightCircleColor3 계산 (SW1 로직 사용)
  const tempC = typeof env?.temp === 'number' ? env.temp : 24;
  const warmHue = computeMiniWarmHue(tempC);
  const tempBasedColor3 = toHslaSW1(warmHue, 65, 75, rightCircleColor3Opacity); // S=65, L=75로 부드러운 핑크톤
  const rightCircleColor3Rgba = tempBasedColor3;
  const rightCircleColor4Rgba = hexToRgba(rightCircleColor4, rightCircleColor4Opacity);

  // 우측 패널 배경색을 rgba로 변환
  const rightPanelBgColor1Rgba = hexToRgba(rightPanelBgColor1, rightPanelBgColor1Opacity);
  const rightPanelBgColor2Rgba = hexToRgba(rightPanelBgColor2, rightPanelBgColor2Opacity);
  const rightPanelBgColor3Rgba = hexToRgba(rightPanelBgColor3, rightPanelBgColor3Opacity);

  // 텍스트/아이콘 그림자 색상을 rgba로 변환
  const textShadowColorRgba = hexToRgba(textShadowColor, textShadowOpacity);
  const iconShadowColorRgba = hexToRgba(iconShadowColor, iconShadowOpacity);
  const textGlowColorRgba = hexToRgba(textGlowColor, 0.5);
  const iconGlowColorRgba = hexToRgba(iconGlowColor, 0.5);

  return (
    <S.Viewport>
      <S.Scaler ref={scalerRef} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
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
              <S.FadeSlideText key={displayHeaderText || headerText || 'header-loading'}>
                {showHeaderLoading ? <S.LoadingDots><span /><span /><span /></S.LoadingDots> : (displayHeaderText || headerText || '')}
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
                  <S.FadeSlideText key={displayTemp || env.temp || 'temp-loading'}>
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
                  <S.FadeSlideText key={displayHumidity || env.humidity || 'humidity-loading'}>
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
