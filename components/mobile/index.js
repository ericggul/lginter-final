import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useRouter } from "next/router";
import useSocketMobile from "@/utils/hooks/useSocketMobile";
import OrchestratingScreen from "./sections/OrchestratingScreen";
import HeroText from "./sections/HeroText";
import BlobControls from "./sections/BlobControls";
import useLongPressProgress from "./hooks/useLongPressProgress";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
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
// public 자산 사용: 문자열 경로로 next/image에 전달

export default function MobileControls() {
  const router = useRouter();
  const isModal = router?.query?.variant === 'modal';
  const isIOS = useIsIOS();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [showResetButton, setShowResetButton] = useState(false);
  const [forceFinalToken, setForceFinalToken] = useState(0);
  const { emitNewName, emitNewVoice, socket } = useSocketMobile({
    onMobileDecision: (payload) => {
      // payload: { userId, params: { temp, humidity, lightColor, music }, reason }
      const rec = {
        temperature: payload?.params?.temp,
        humidity: payload?.params?.humidity,
        lightColor: payload?.params?.lightColor,
        song: payload?.params?.music,
        reason: payload?.reason
      };
      setRecommendations(rec);
      setLoading(false);
    }
  });
  const [name, setName] = useState("");
  const [mood, setMood] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPress, setShowPress] = useState(false);
  const [listeningStage, setListeningStage] = useState('idle'); // idle | live | finalHold | fadeOut
  const [orchestratingLock, setOrchestratingLock] = useState(false);
  const orchestrateMinMs = 5500;
  const [showTextFallback, setShowTextFallback] = useState(false);
  // Final keyword timings (from BackgroundCanvas/styles.js):
  // Last item delay ~3900ms + item transition 900ms = 4800ms to fully visible
  // Group pulse blink ~1200ms then wait additional 3000ms before showing buttons
  const keywordSequenceMs = 4800;
  const keywordPulseMs = 1200;
  const buttonsDelayAfterPulseMs = 9000; // target: total ~15s after final keyword (4800 + 1200 + 9000)
  const buttonsAppearDelayMs = keywordSequenceMs + keywordPulseMs + buttonsDelayAfterPulseMs; // ~15000ms

  const { isListening, startVoiceRecognition } = useSpeechRecognition({
    onStart: () => {
      setListeningStage('live');
      if (typeof window !== 'undefined') {
        window.blobOpacityMs = 200; // ensure visible when starting listen
        window.blobOpacity = 1;
      }
    },
    onInterim: (text) => {
      setLiveTranscript(text);
    },
    onResult: ({ transcript }) => {
      setMood(transcript);
      setLiveTranscript("");
      if (!name.trim()) setName('사용자');
      // hold final text for 1s then fade out
      setListeningStage('finalHold');
      setTimeout(() => setListeningStage('fadeOut'), 1000);
      // after fade out completes, remove overlay
      setTimeout(() => setListeningStage('idle'), 1600);
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

  useOrchestratingTransitions({ loading, orchestratingLock, setOrchestratingLock, orchestrateMinMs });

  // (moved below state/typedReason declarations)

  const { pressProgress, handlePressStart, handlePressEnd } = useLongPressProgress({
    onCompleted: () => startVoiceRecognition()
  });

  // Build the 4-paragraph message for the typewriter effect
  const p1 = mood ? `“${mood}” 기분에 맞춰` : '기분에 맞춰';
  const p2 = recommendations ? `온도는 ${recommendations.temperature}°C로, 습도는 ${recommendations.humidity}%로 설정할게요.` : '';
  const p3 = recommendations ? `집 안의 조명은 #${String(recommendations?.lightColor || '').replace('#','')} 색감으로 바꿔 공간을 부드럽게 밝힐게요.` : '';
  const p4 = recommendations ? `무드에 맞춘 ${recommendations.song}을 재생할게요.` : '';
  const paragraphs = [p1, p2, p3, p4];
  // Prefer AI-provided reason string when available, fallback to composed paragraphs
  const fullTypedText = recommendations
    ? (recommendations.reason && typeof recommendations.reason === 'string' && recommendations.reason.trim().length > 0
        ? recommendations.reason
        : paragraphs.join('\n\n'))
    : null;


  // 오케스트레이팅 화면이 완전히 끝난 뒤에만 타이핑을 시작해야,
  // 사용자가 실제로 타이핑 모션을 볼 수 있다.
  const isOrchestrating = isIOS ? loading : (loading || orchestratingLock);
  const canStartTyping = recommendations && !isOrchestrating;
  const typewriterText = canStartTyping ? fullTypedText : null;

  const {
    typedReason,
    showReason,
    showHighlights,
    isDone: typingDone,
  } = useTypewriter(typewriterText);

  const { fadeText, localShowResults, resetShowcase } = usePostTypingShowcase({
    fullTypedText,
    typedReason,
    recommendations,
    setOrchestratingLock,
    isIOS,
    typingDone: isIOS ? typingDone : undefined,
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
    if (!name.trim() || !mood.trim()) {
      console.log('❌ Mobile: Name or mood is empty');
      return;
    }
    
    console.log('📱 Mobile: Submitting data:', { name: name.trim(), mood: mood.trim() });
    
    // 이름과 기분 전송 (서버 스키마에 맞춰 userId 포함)
    const userId = name.trim();
    try {
      // 방 참가 (타겟 전송을 위해)
      socket?.emit('mobile-init', { userId });
    } catch {}
    emitNewName(name.trim(), { userId, mood: mood.trim() });
    emitNewVoice(mood.trim(), mood.trim(), 0.8, { userId, name: userId });
    
    console.log('✅ Mobile: Data emitted successfully');
    
    // Controller 경유 결정 대기
    setSubmitted(true);
    setLoading(true);
  }, [name, mood, emitNewName, emitNewVoice, socket]);

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
    } catch {}
  }, [typingDone, recommendations?.lightColor]);

  return (
    <AppContainer $isModal={isModal}>
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
                centerText={(listeningStage === 'finalHold' && mood) ? `“${mood}”` : (liveTranscript ? `“${liveTranscript}”` : undefined)}
                stage={listeningStage === 'fadeOut' ? 'fadeOut' : 'live'}
              />
            )}
          </>
        ) : isOrchestrating ? (
          <>
            <OrchestratingScreen />
          </>
        ) : recommendations && showReason ? (
          <ReasonPanel
            typedReason={typedReason}
            fullTypedText={fullTypedText}
            paragraphs={paragraphs}
            showHighlights={showHighlights}
            fadeText={fadeText}
            typingDone={typingDone}
          />
        ) : null}
        {/* Note: moved keyframe animations to globals.css to avoid JSX parsing issues */}
      </ContentWrapper>
      <BlobControls />
      {showResetButton && (
        <>
          {/* Left: Exit (design only) */}
          <CornerWrap $side="left" $fadeIn>
            <CornerArea $side="left">
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
