import Image from "next/image";
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useRouter } from "next/router";
import useSocketMobile from "@/utils/hooks/useSocketMobile";
import OrchestratingScreen from "./sections/OrchestratingScreen";
import HeroText from "./sections/HeroText";
import BlobControls from "./sections/BlobControls";
import useLongPressProgress from "./hooks/useLongPressProgress";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import { generateEmpathyLine } from "@/src/services/openai.service";
import useTypewriter from "./hooks/useTypewriter";
import useOrchestratingTransitions from './hooks/useOrchestratingTransitions';
import usePostTypingShowcase from './hooks/usePostTypingShowcase';
import useScrollLock from './hooks/useScrollLock';
import useIsIOS from './hooks/useIsIOS';
import { AppContainer, ContentWrapper } from "./sections/styles/shared/layout";
import ListeningOverlay from "./sections/ListeningOverlay";
import ReasonPanel from './views/ReasonPanel';
import InputForm from './views/InputForm';
import { fonts } from "./sections/styles/tokens";
import { RingPulse as PressRingPulse, HitArea as PressHitArea } from './sections/PressOverlay/styles';

import BackgroundCanvas from '@/components/mobile/BackgroundCanvas';
import { playMobileBackgroundLoop } from '@/utils/data/soundeffect';
import { EV } from '@/src/core/events';
// public 자산 사용: 문자열 경로로 next/image에 전달

export default function MobileControls() {
  const router = useRouter();
  const isModal = router?.query?.variant === 'modal';
  const isIOS = useIsIOS();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [showResetButton, setShowResetButton] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const [forceFinalToken, setForceFinalToken] = useState(0);
  const [showEmpathy, setShowEmpathy] = useState(false);
  const [empathyDone, setEmpathyDone] = useState(false);
  const [empathyFading, setEmpathyFading] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const [typeText, setTypeText] = useState('');
  const submittedRef = useRef(false);

  const buildEmpathyLine = (rawMood) => {
    let s = String(rawMood || '').trim();
    try {
      const { sanitizeEmotion } = require('@/utils/text/sanitizeEmotion');
      s = sanitizeEmotion(s, { strict: true });
    } catch {
      s = '불쾌해';
    }
    if (!s) return '조금 더 편안함을 느끼실 수 있는 공간을 준비해볼게요.';
    if (s.includes('피곤') || s.includes('지침') || s.includes('기진') || s.includes('과로')) {
      return '많이 피곤하셨겠어요. 피로를 풀 수 있는 공간을 준비해볼게요.';
    }
    if (s.includes('짜증') || s.includes('화가') || s.includes('화남') || s.includes('답답') || s.includes('스트레스') || s.includes('불안')) {
      return '마음이 누그러질 수 있도록 조용하고 편안한 분위기를 준비해볼게요.';
    }
    if (s.includes('우울') || s.includes('슬프') || s.includes('서운')) {
      return '마음이 조금 가벼워지도록 따뜻한 분위기를 준비해볼게요.';
    }
    if (s.includes('지루') || s.includes('무료') || s.includes('심심')) {
      return '지루함이 덜 느껴지도록 환기되는 분위기를 만들어볼게요.';
    }
    if (s.includes('행복') || s.includes('기쁨') || s.includes('좋아') || s.includes('설레') || s.includes('상쾌') || s.includes('즐거')) {
      return '좋은 기분이 오래 이어지도록 분위기를 살려볼게요.';
    }
    return `“${s}”라고 느끼셨군요. 편안함을 느낄 수 있는 공간을 준비해볼게요.`;
  };

  const lightMoodFromHex = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return '부드러운';
    const v = m[1];
    const r = parseInt(v.slice(0, 2), 16) / 255;
    const g = parseInt(v.slice(2, 4), 16) / 255;
    const b = parseInt(v.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0; const d = max - min;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) * 60;
      else if (max === g) h = ((b - r) / d) * 60 + 120;
      else h = ((r - g) / d) * 60 + 240;
      if (h < 0) h += 360;
    }
    if (h < 20 || h >= 340) return '따뜻한';
    if (h < 50) return '포근한';
    if (h < 70) return '밝은';
    if (h < 170) return '신선한';
    if (h < 260) return '청량한';
    if (h < 310) return '잔잔한';
    return '로맨틱한';
  };

  const musicMoodFromSong = (song) => {
    const s = String(song || '').toLowerCase();
    if (!s) return '잔잔한';
    if (s.includes('jazz')) return '재즈풍의';
    if (s.includes('rock')) return '에너제틱한';
    if (s.includes('hip') || s.includes('rap')) return '리드미컬한';
    if (s.includes('ballad')) return '감성적인';
    if (s.includes('lofi') || s.includes('lo-fi') || s.includes('chill')) return '차분한';
    if (s.includes('pop')) return '경쾌한';
    return '잔잔한';
  };

  const buildSummaryText = (currentMood, rec) => {
    if (!rec) return '';
    let safe = '';
    try {
      const { sanitizeEmotion, toSpokenEmotion } = require('@/utils/text/sanitizeEmotion');
      const clean = sanitizeEmotion(String(currentMood || ''), { strict: true });
      safe = toSpokenEmotion(clean);
    } catch {
      safe = '';
    }
    const musicMood = musicMoodFromSong(rec.song);
    const lightMood = lightMoodFromHex(rec.lightColor);
    const envMood = '편안한';
    const moodPart = safe ? `“${safe}”한 감정에 맞춰 ` : '';
    return `${moodPart}음악은 ${musicMood} 무드에 맞추고, 조명은 ${lightMood} 무드, 온도와 습도는 ${rec.temperature}°C, ${rec.humidity}%로 하여 ${envMood} 공간을 조성했어요.`;
  };

  // Hard reset all visual globals on first mount to avoid mixing with previous session
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.isListening = false;
      window.blobOpacityMs = 600;
      window.blobOpacity = 1;
      window.bgSettings = {
        top: '#ECF8FA', mid: '#FAFDFF', low: '#FFE0F8', bottom: '#FFF0FB', midStop: 23, lowStop: 64,
      };
      window.showKeywords = false;
      window.keywordLabels = [];
      window.clusterSpin = false;
      window.newOrbEnter = false;
      window.showOrbits = false;
      window.mainBlobFade = false;
      window.showFinalOrb = false;
      window.showCenterGlow = false;
      window.orbitRadiusScale = 1;
      window.wobbleTarget = 1;
      window.mainBlobStatic = false;
      window.blobSettings = {
        color0: '#F7F7E8', color1: '#F4E9D7', color2: '#F79CBF', color3: '#C5F7EA', color4: '#C8F4E9'
      };
    } catch {}
  }, []);

  const { emitNewName, emitNewVoice, socket, deviceId } = useSocketMobile({
    onMobileDecision: (payload) => {
      if (!submittedRef.current) {
        // ignore stale broadcasts if user hasn't submitted in this session
        return;
      }
      // payload (server):
      // { userId, params(aggregated), individual(personal), tv2Env(tv2 applied), reason, emotionKeyword, decisionId }
      // 요구사항:
      // - 음악: 개인 디시전(individual) 기준
      // - 온도/습도/조명: TV2에 내려간 디시전(tv2Env) 기준으로 TV2와 통일
      const tv2Chosen = (payload?.tv2Env && typeof payload.tv2Env === 'object')
        ? payload.tv2Env
        : (payload?.params || {});
      const personal = (payload?.individual && typeof payload.individual === 'object')
        ? payload.individual
        : null;
      const personalMusic = personal?.music || payload?.params?.music;
      const rec = {
        temperature: tv2Chosen?.temp,
        humidity: tv2Chosen?.humidity,
        lightColor: tv2Chosen?.lightColor,
        song: personalMusic,
        reason: payload?.reason,
        emotionKeyword: payload?.emotionKeyword,
        decisionId: payload?.decisionId,
      };
      setRecommendations(rec);
      try {
        window.clusterSpin = false;
        window.showOrbits = true;
        window.orbitRadiusScale = 0.92;
        window.wobbleTarget = 0; // coast to stop
        // Ensure blob is visible again for the result showcase
        window.blobOpacity = 1;
        window.blobOpacityMs = 600;
      } catch {}
      setLoading(false);
    }
  });
  const [name, setName] = useState("");
  const [mood, setMood] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);
  const [showPress, setShowPress] = useState(false);
  const [listeningStage, setListeningStage] = useState('idle'); // idle | live | finalHold | fadeOut
  const [orchestratingLock, setOrchestratingLock] = useState(false);
  // 최소 약 5초 동안 오케스트레이션 블롭 + 텍스트가 유지되도록 홀드 시간 설정
  const orchestrateMinMs = 5000;
  const [showTextFallback, setShowTextFallback] = useState(false);
  // Final keyword timings (from BackgroundCanvas/styles.js):
  // Last item delay ~3900ms + item transition 900ms = 4800ms to fully visible
  // Group pulse blink ~1200ms then wait additional 3000ms before showing buttons
  const keywordSequenceMs = 4800;
  const keywordPulseMs = 1200;
  const buttonsDelayAfterPulseMs = 7000; // 1초 단축 (기존 9000)
  const buttonsAppearDelayMs = keywordSequenceMs + keywordPulseMs + buttonsDelayAfterPulseMs; // ~14000ms

  const { isListening, startVoiceRecognition } = useSpeechRecognition({
    onStart: () => {
      setListeningStage('live');
      if (typeof window !== 'undefined') {
        window.blobOpacityMs = 200; // ensure visible when starting listen
        window.blobOpacity = 1;
        window.wobbleTarget = 1;
      }
    },
    onInterim: (text) => {
      setLiveTranscript(text);
    },
    onResult: ({ transcript }) => {
      try {
        const { sanitizeEmotion } = require('@/utils/text/sanitizeEmotion');
        setMood(sanitizeEmotion(transcript, { strict: true }));
      } catch {
        setMood('불쾌해');
      }
      setLiveTranscript("");
      if (!name.trim()) setName('사용자');
      // hold final text longer, then fade out
      setListeningStage('finalHold');
      setTimeout(() => setListeningStage('fadeOut'), 3500);
      // after fade out completes, remove overlay
      setTimeout(() => setListeningStage('idle'), 4500);
    },
    onError: () => setShowTextFallback(true)
  });

  // react to listening stage for blob opacity transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (listeningStage === 'fadeOut' && !loading) {
      window.blobOpacityMs = 600;
      window.blobOpacity = 0; // fade to fully transparent so background만 노출
    }
  }, [listeningStage, loading]);

  // ---------------------------------------------------------------------------
  // Background ambient music (lg_mobile_251211.mp3)
  // - 모바일 앱이 열려 있는 동안, 아주 낮은 볼륨으로 loop 재생
  // - 사용자가 페이지를 벗어나면 자동 정지
  // ---------------------------------------------------------------------------
  const bgAudioRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // 이미 재생 중이면 중복 생성 방지
    if (bgAudioRef.current) return;
    const audio = playMobileBackgroundLoop(0.22);
    bgAudioRef.current = audio || null;
    return () => {
      try {
        if (bgAudioRef.current) {
          bgAudioRef.current.pause();
        }
      } catch {}
      bgAudioRef.current = null;
    };
  }, []);

  useOrchestratingTransitions({ loading, orchestratingLock, setOrchestratingLock, orchestrateMinMs });

  // (moved below state/typedReason declarations)

  const { pressProgress, handlePressStart, handlePressEnd } = useLongPressProgress({
    onCompleted: () => startVoiceRecognition()
  });

  // Concise, single-sentence summary (stable length to avoid early cut)
  const templateText = recommendations ? buildSummaryText(mood, recommendations) : '';
  const paragraphs = [templateText];
  // Prefer AI-provided reason string when available, fallback to composed paragraphs
  const fullTypedText = recommendations ? templateText : null;


  // 오케스트레이팅 화면이 완전히 끝난 뒤에만 타이핑/공감/결과가 이어지도록,
  // 플랫폼(iOS/Android)에 상관없이 loading 이후 최소 홀드 시간을 보장한다.
  const isOrchestrating = loading || orchestratingLock;

  // Empathy first, then analysis typing (both in orchestrated stage)
  const [empathyLine, setEmpathyLine] = useState('');
  useEffect(() => {
    if (!recommendations) { setShowEmpathy(false); setEmpathyDone(false); setEmpathyFading(false); setTypingStarted(false); return; }
    if (isOrchestrating) return;
    // Start empathy once when results available
    setShowEmpathy(true);
    // Choose exactly one line and keep it fixed
    try {
      const line = buildEmpathyLine(mood);
      setEmpathyLine(line);
    } catch { setEmpathyLine(buildEmpathyLine(mood)); }
    setEmpathyDone(false);
    setEmpathyFading(false);
    // 공감 문장 동안에는 중앙 메인 블롭은 살짝 투명하게 "정지"하고,
    // 배경 회전 블롭(오빗)은 계속 동작하도록 전환
    if (typeof window !== 'undefined') {
      try {
        window.mainBlobFade = false;
        window.mainBlobStatic = true;
        window.blobOpacityMs = 800;
        window.blobOpacity = 0.78; // 살짝 투명하게
        window.showOrbits = true;  // 배경 회전 블롭 유지
        // 공감 문구 동안에는 메인 블롭이 함께 회전하지 않도록,
        // 클러스터 전체 회전(spin)은 비활성화
        window.clusterSpin = false;
        window.showFinalOrb = false;
        window.showCenterGlow = true;
      } catch {}
    }
    let t2 = null;
    const t1 = setTimeout(() => {
      setEmpathyDone(true);
      setEmpathyFading(true);
      // latch the current full text to avoid mid-run changes cutting the animation
      try { setTypeText(fullTypedText || ''); } catch {}
      setTypingStarted(true);
      if (typeof window !== 'undefined') {
        try {
          window.mainBlobStatic = false;
        } catch {}
      }
      t2 = setTimeout(() => {
        setShowEmpathy(false);
        setEmpathyFading(false);
      }, 240);
    }, 4000);
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [recommendations, isOrchestrating, fullTypedText]);

  // Start typewriter right after empathy finishes
  const typewriterText = typingStarted ? (typeText || fullTypedText) : null;

  const {
    typedReason,
    showReason,
    showHighlights,
    isDone: typingDone,
  } = useTypewriter(typewriterText);

  const { fadeText, localShowResults, resetShowcase } = usePostTypingShowcase({
    fullTypedText: typeText || fullTypedText,
    typedReason,
    recommendations,
    setOrchestratingLock,
    isIOS,
    typingDone: isIOS ? typingDone : undefined,
    empathyDone,
  });

  // (Typewriter, weather, press handlers moved to hooks above)

  // applies scroll lock while mounted
  useScrollLock();

  // 결과가 준비되고 로딩/락이 해제된 후 2초 뒤 리셋 버튼 표시
  useEffect(() => {
    if (recommendations && !isOrchestrating) {
      setShowResetButton(false);
      const t = setTimeout(() => setShowResetButton(true), buttonsAppearDelayMs);
      return () => clearTimeout(t);
    }
    setShowResetButton(false);
    return undefined;
  }, [recommendations, loading, orchestratingLock, buttonsAppearDelayMs]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const nm = (name || '').trim() || '사용자';
    const md = (mood || '').trim();
    if (!md) {
      console.log('❌ Mobile: Mood is empty');
      return;
    }
    if (!(name || '').trim()) {
      try { setName('사용자'); } catch {}
    }
    
    console.log('📱 Mobile: Submitting data:', { name: nm, mood: md });
    
    // 이름과 기분 전송 (서버 스키마에 맞춰 userId 포함)
    const userId = deviceId;
    try {
      // 방 참가 (타겟 전송을 위해)
      socket?.emit('mobile-init', { userId });
    } catch {}
    // Sanitize before sending
    let safeMood = md;
    try {
      const { sanitizeEmotion } = require('@/utils/text/sanitizeEmotion');
      safeMood = sanitizeEmotion(md, { strict: true });
    } catch {
      safeMood = '불쾌해';
    }
    emitNewName(nm, { userId, mood: safeMood });
    emitNewVoice(safeMood, safeMood, 0.8, { userId, name: nm });
    
    console.log('✅ Mobile: Data emitted successfully');
    
    // Controller 경유 결정 대기
    setSubmitted(true);
    setLoading(true);
    try {
      window.showOrbits = true;
      window.clusterSpin = true;
    } catch {}
  }, [name, mood, emitNewName, emitNewVoice, socket, deviceId]);

  const handleReset = useCallback(() => {
    // Soft reset to voice-start screen (final headline), preserving page session
    setLoading(false);
    setOrchestratingLock(false);
    setRecommendations(null);
    setSubmitted(false);
    setShowResetButton(false);
    setShowPress(true);
    setListeningStage('idle');
    setMood('');
    setShowEmpathy(false);
    setEmpathyDone(false);
    setTypingStarted(false);
    setTypeText('');
    // reset local showcases/typewriter
    try { resetShowcase(); } catch {}
    // reset background globals to idle
    if (typeof window !== 'undefined') {
      try {
        window.isListening = false;
        // instant hide current background to avoid last-scene flicker
        window.blobOpacityMs = 0;
        window.blobOpacity = 0;
        // restore default background gradient
        window.bgSettings = {
          top: '#ECF8FA',
          mid: '#FAFDFF',
          low: '#FFE0F8',
          bottom: '#FFF0FB',
          midStop: 23,
          lowStop: 64,
        };
        window.showKeywords = false;
        window.keywordLabels = [];
        window.clusterSpin = false;
        window.newOrbEnter = false;
        window.showOrbits = false;
        window.mainBlobFade = false;
        window.showFinalOrb = false;
        window.blobSettings = {
          color0: '#F7F7E8',
          color1: '#F4E9D7',
          color2: '#F79CBF',
          color3: '#C5F7EA',
          color4: '#C8F4E9'
        };
        window.wobbleTarget = 1;
        // fade back in
        setTimeout(() => {
          try {
            window.blobOpacityMs = 600;
            window.blobOpacity = 1;
          } catch {}
        }, 30);
      } catch {}
    }
    // Force hero to jump to final phase ("오늘 하루는 어땠나요?")
    setForceFinalToken((t) => t + 1);
  }, [resetShowcase, setOrchestratingLock]);

  const handleExit = useCallback(() => {
    // 1) UI: 즉시 종료 화면으로 전환 (네트워크 실패에도 UX는 완료)
    setIsExited(true);
    setShowResetButton(false);
    try { window.showOrbits = false; window.clusterSpin = false; } catch {}
    // 2) 서버: 컨트롤러 인원수에서 즉시 빠지도록 leave 이벤트 송신 + 소켓 종료
    try {
      const ts = Date.now();
      socket?.emit?.(EV.MOBILE_EXIT, { userId: deviceId, ts, uuid: `mobile-exit-${ts}` });
    } catch {}
    try { socket?.disconnect?.(); } catch {}
    // 3) 배경 음악 정지
    try { if (bgAudioRef.current) bgAudioRef.current.pause(); } catch {}
  }, [socket, deviceId]);

  // iOS Safari 등에서 타이머/애니메이션이 지연되더라도,
  // 결정이 도착한 뒤에는 오케스트레이팅 락이 영원히 풀리지 않는 것을 방지하는 안전장치.
  useEffect(() => {
    if (!isIOS) return;
    if (!submitted) return;
    if (!recommendations) return;
    if (loading || !orchestratingLock) return;

    const fallbackMs = orchestrateMinMs + 7000; // 기본 홀드 시간 + 여유 버퍼
    const id = setTimeout(() => {
      console.warn('[Mobile] Fallback: forcing orchestratingLock=false after timeout', {
        loading,
        orchestratingLock,
        hasRecommendations: !!recommendations,
      });
      setOrchestratingLock(false);
    }, fallbackMs);

    return () => clearTimeout(id);
  }, [submitted, recommendations, loading, orchestratingLock, orchestrateMinMs, setOrchestratingLock]);

  

  // 모바일 페이지에서 스크롤 락 (마운트/언마운트 시 적용/해제)
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  const showBrandLogo = submitted && (isOrchestrating || recommendations);

  // When typing finishes, softly tint the background gradient toward the recommended light color
  useEffect(() => {
    const hex = recommendations?.lightColor;
    if (!hex || !typingDone) return;
    // Helpers: hex <-> rgb/hsl
    const parseHex = (h) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim());
      if (!m) return null;
      const v = m[1];
      return { r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) };
    };
    const rgbToHsl = (r, g, b) => {
      const R = r / 255, G = g / 255, B = b / 255;
      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      const d = max - min;
      if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
        switch (max) {
          case R: h = (G - B) / d + (G < B ? 6 : 0); break;
          case G: h = (B - R) / d + 2; break;
          case B: h = (R - G) / d + 4; break;
        }
        h /= 6;
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };
    const hslToHex = (h, s, l) => {
      const S = s / 100, L = l / 100;
      const C = (1 - Math.abs(2 * L - 1)) * S;
      const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = L - C / 2;
      let r1 = 0, g1 = 0, b1 = 0;
      if (h < 60) { r1 = C; g1 = X; b1 = 0; }
      else if (h < 120) { r1 = X; g1 = C; b1 = 0; }
      else if (h < 180) { r1 = 0; g1 = C; b1 = X; }
      else if (h < 240) { r1 = 0; g1 = X; b1 = C; }
      else if (h < 300) { r1 = X; g1 = 0; b1 = C; }
      else { r1 = C; g1 = 0; b1 = X; }
      const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
      return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`.toUpperCase();
    };
    const baseRgb = parseHex(hex);
    if (!baseRgb) return;
    const { h, s } = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    // Preserve hue/sat; set lightness to airy levels for visible tint
    const top = hslToHex(h, Math.min(100, Math.max(35, s)), 94);
    const mid = hslToHex(h, Math.min(100, Math.max(40, s)), 90);
    const low = hslToHex(h, Math.min(100, Math.max(45, s)), 86);
    const bottom = hslToHex(h, Math.min(100, Math.max(30, s)), 96);
    try {
      window.bgSettings = { top, mid, low, bottom, midStop: 23, lowStop: 64 };
      // also nudge blob colors toward the same hue for subtle coherence
      const blob0 = hslToHex(h, Math.max(20, Math.min(70, s - 25)), 95);
      const blob1 = hslToHex(h, Math.max(25, Math.min(75, s - 15)), 92);
      const blob2 = hslToHex(h, Math.max(30, Math.min(80, s - 5)), 88);
      const blob3 = hslToHex(h, Math.max(35, Math.min(85, s)), 84);
      const blob4 = hslToHex(h, Math.max(40, Math.min(90, s + 5)), 80);
      window.blobSettings = { color0: blob0, color1: blob1, color2: blob2, color3: blob3, color4: blob4 };
    } catch {}
  }, [typingDone, recommendations?.lightColor]);

  return (
    <AppContainer $isModal={isModal}>
      {isExited && (
        <ExitOverlay>
          <ExitMessage>
            <div className="title">room3 체험이 종료 되었습니다!</div>
            <div className="sub">즐거운 하루 되시길 바라요</div>
          </ExitMessage>
        </ExitOverlay>
      )}
      {showBrandLogo && (
        <BrandLogoWrap>
          <Image src="/brand/furon_logo.png" alt="Furon" priority width={24} height={24} />
        </BrandLogoWrap>
      )}
      <BackgroundCanvas
        cameraMode="default"
        showMoodWords={!submitted && showPress}
      />
      <ContentWrapper $isModal={isModal}>
        {!submitted && !isListening && (
          <>
            <HeroText isModal={isModal} onFinalPhase={() => setShowPress(true)} forceFinal={forceFinalToken} />
            
            
            
            {/* 설명 문구 - 기능 유지하되 숨김 */}
            <p style={{ display: 'none' }}>
              이름과 기분을 입력해주세요
            </p>
          </>
        )}
        
        {!submitted ? (
          <>
            <InputForm
              name={name}
              onNameChange={setName}
              mood={mood}
              onMoodChange={setMood}
              onSubmit={handleSubmit}
              showPress={showPress}
              isListening={isListening}
              pressProgress={pressProgress}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
              showTextFallback={showTextFallback}
            />
            {(isListening || listeningStage === 'finalHold' || listeningStage === 'fadeOut') && (
              <ListeningOverlay
                topLabel="듣고 있어요"
                centerText={(listeningStage === 'finalHold' && mood)
                  ? `“${mood}”`
                  : (liveTranscript
                      ? (() => {
                          try {
                            const { sanitizeEmotion } = require('@/utils/text/sanitizeEmotion');
                            return `“${sanitizeEmotion(liveTranscript, { strict: true })}”`;
                          } catch {
                            return '“불쾌해”';
                          }
                        })()
                      : undefined)
                }
                stage={listeningStage === 'fadeOut' ? 'fadeOut' : 'live'}
              />
            )}
          </>
        ) : isOrchestrating ? (
          <>
            <OrchestratingScreen />
          </>
        ) : recommendations ? (
          <>
            {showEmpathy && (
              <EmpathyWrap $fadeOut={empathyFading}>
                <p>{empathyLine}</p>
              </EmpathyWrap>
            )}
            {typingStarted && (
              <ReasonPanel
                typedReason={typedReason}
                fullTypedText={typeText || fullTypedText}
                paragraphs={paragraphs}
                showHighlights={showHighlights}
                fadeText={fadeText}
                typingDone={typingDone}
              />
            )}
          </>
        ) : null}
        {/* Note: moved keyframe animations to globals.css to avoid JSX parsing issues */}
      </ContentWrapper>
      {/* 임시 비활성화: 조절 레버 패널 숨김 */}
      {false && <BlobControls />}
      {showResetButton && (
        <>
          {/* Left: Exit (design only) */}
          <CornerWrap $side="left" $fadeIn>
            <CornerArea $side="left" onClick={handleExit} role="button" aria-label="exit experience">
              <CornerLabel>종료</CornerLabel>
            </CornerArea>
          </CornerWrap>
          {/* Right: Restart (functional: same as previous reset) */}
          <CornerWrap $side="right" $fadeIn>
            <CornerArea $side="right" onClick={handleReset} role="button" aria-label="restart and try again">
              <InnerOrb />
              <LargeRing />
              <LargeRing $delay />
              <LargeRing $delay2 />
              <CornerLabel>재시작</CornerLabel>
            </CornerArea>
          </CornerWrap>
        </>
      )}
    </AppContainer>
  );
}

const buttonsFadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const empathyIn = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const empathyOut = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const EmpathyWrap = styled.div`
  width: 100%;
  text-align: center;
  padding: 2.2rem 1.6rem;
  color: #222;
  animation: ${empathyIn} 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  ${(p) => p.$fadeOut && css`animation: ${empathyOut} 220ms ease forwards;`}

  p {
    font-family: ${fonts.ui};
    font-weight: 800;
    font-size: 1.4rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const CornerWrap = styled.div`
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 28px);
  ${(p) => p.$side === 'left' ? 'left: clamp(16px, 6vw, 28px);' : 'right: clamp(16px, 6vw, 28px);'}
  z-index: 2600;
  pointer-events: auto;
  ${(p) => p.$fadeIn && css`
    opacity: 0;
    animation: ${buttonsFadeIn} 900ms ease forwards;
  `}
`;

const CornerArea = styled(PressHitArea)`
  width: 220px;
  height: 220px;
  position: relative;
  overflow: visible;
  ${(p) => p.$side === 'left' ? '--center-x: 18%;' : '--center-x: 82%;'}
  --center-y: 78%;
  --glow-size: 640px;  /* soft white background glow diameter */
  --core-size: 128px;  /* inner core size (ripple center) */
`;

const CornerLabel = styled.div`
  position: absolute;
  left: var(--center-x, 50%);
  top: var(--center-y, 50%);
  transform: translate(-50%, -50%);
  font-family: ${fonts.ui};
  font-weight: 500;
  font-size: 1.0rem;
  color:rgb(90, 90, 90);
  user-select: none;
  white-space: nowrap;
  z-index: 2;
`;

const innerDrift = keyframes`
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
  50% { transform: translate(calc(-50% + 2px), calc(-50% - 2px)) scale(1.04); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
`;

const InnerOrb = styled.div`
  position: absolute;
  left: var(--center-x, 50%);
  top: var(--center-y, 50%);
  transform: translate(-50%, -50%);
  width: var(--core-size);
  height: var(--core-size);
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255,255,255,0.98) 0%,
    rgba(255,255,255,0.7) 48%,
    rgba(255,255,255,0.35) 62%,
    rgba(255,255,255,0.0) 76%
  );
  filter: blur(6px);
  mix-blend-mode: screen;
  animation: ${innerDrift} 3200ms ease-in-out infinite;
  z-index: 1;
`;

const SubtleOrb = styled.div`
  position: absolute;
  left: var(--center-x, 50%);
  top: var(--center-y, 50%);
  transform: translate(-50%, -50%);
  width: var(--glow-size);
  height: var(--glow-size);
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255,255,255,0.90) 0%,
    rgba(255,255,255,0.55) 42%,
    rgba(255,255,255,0.22) 62%,
    rgba(255,255,255,0.00) 88%
  );
  filter: blur(26px);
  mix-blend-mode: screen;
  animation: ${innerDrift} 3600ms ease-in-out infinite;
  z-index: 0;
`;

const subtleRipple = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.5;
    filter: blur(6px);
  }
  35% { opacity: 0.3; }
  55% { opacity: 0.12; }
  70%, 100% {
    transform: translate(-50%, -50%) scale(2.1);
    opacity: 0;
    filter: blur(10px);
  }
`;

const LargeRing = styled(PressRingPulse)`
  left: var(--center-x, 50%);
  top: var(--center-y, 50%);
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  filter: blur(7px);
  animation: ${subtleRipple} 3000ms ease-out infinite;
  opacity: 0.35;
  ${(p) => p.$delay2 ? 'animation-delay: 2000ms;' : p.$delay ? 'animation-delay: 1000ms;' : ''}
  z-index: 1;
`;

const BrandLogoWrap = styled.div`
  position: fixed;
  top: clamp(20px, 6vh, 44px);
  left: 50%;
  transform: translateX(-50%);
  width: clamp(16px, 5vw, 24px);
  height: clamp(16px, 5vw, 24px);
  z-index: 2200;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const exitIn = keyframes`
  0% { opacity: 0; transform: translateY(18px); filter: blur(14px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
`;

const ExitOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`;

const ExitMessage = styled.div`
  text-align: center;
  color: #111;
  padding: 24px;
  animation: ${exitIn} 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;

  .title {
    font-family: ${fonts.ui};
    font-weight: 900;
    font-size: clamp(1.4rem, 6vw, 2.2rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .sub {
    margin-top: 10px;
    font-family: ${fonts.ui};
    font-weight: 700;
    font-size: clamp(1.05rem, 4.6vw, 1.5rem);
    line-height: 1.4;
    color: rgba(17,17,17,0.78);
  }
`;
