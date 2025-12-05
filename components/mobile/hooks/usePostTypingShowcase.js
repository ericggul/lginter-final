import { useEffect, useState, useCallback, useRef } from 'react';

export default function usePostTypingShowcase({
  fullTypedText,
  typedReason,
  recommendations,
  setOrchestratingLock,
  isIOS = false,
  typingDone,
}) {
  const [fadeText, setFadeText] = useState(false);
  const [localShowResults, setLocalShowResults] = useState(false);
  const [orbShowcaseStarted, setOrbShowcaseStarted] = useState(false);
  const timersRef = useRef([]);

  const resetShowcase = useCallback(() => {
    setFadeText(false);
    setLocalShowResults(false);
    setOrbShowcaseStarted(false);
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  // 공통: "타이핑이 끝났다"고 판단된 뒤에만 오브/키워드 쇼케이스 시작
  useEffect(() => {
    if (!fullTypedText) return;
    if (!recommendations) return;
    if (orbShowcaseStarted) return;

    // non‑iOS: 기존처럼 문자열 길이 기반으로 완료 여부 판단
    if (!isIOS) {
      if (!typedReason || typedReason.length < fullTypedText.length) {
        return;
      }
    } else {
      // iOS: typewriter 훅이 알려주는 완료 플래그만 신뢰
      if (!typingDone) {
        return;
      }
    }

    console.log('[Showcase] Triggering orbit sequence', {
      typedLen: typedReason ? typedReason.length : 0,
      fullLen: fullTypedText.length,
      orbShowcaseStarted,
      isIOS,
      typingDone,
    });

    setOrbShowcaseStarted(true);
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];

    // Speed up finale: shorter hold and orbit solo before keywords
    const TEXT_HOLD_MS = 600;
    const ORBIT_SOLO_MS = 1200;
    const LABEL_HOLD_MS = 1000;

    let colorName = '조명';
    let musicLabel = '음악';
    console.log('[Showcase] rec inputs', {
      temp: recommendations?.temperature,
      humidity: recommendations?.humidity,
      lightColor: recommendations?.lightColor,
      song: recommendations?.song,
    });
    if (recommendations) {
      const hex = (recommendations.lightColor || '').replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0; const d = max - min;
        if (d !== 0) {
          if (max === r) h = ((g - b) / d) * 60;
          else if (max === g) h = ((b - r) / d) * 60 + 120;
          else h = ((r - g) / d) * 60 + 240;
          if (h < 0) h += 360;
        }
        if (h < 20 || h >= 340) colorName = '빨간 조명';
        else if (h < 50) colorName = '주황 조명';
        else if (h < 70) colorName = '노란 조명';
        else if (h < 170) colorName = '초록 조명';
        else if (h < 260) colorName = '파란 조명';
        else if (h < 310) colorName = '보라 조명';
        else colorName = '분홍 조명';
      }
      const s = (recommendations.song || '').toLowerCase();
      if (s.includes('jazz')) musicLabel = '재즈';
      else if (s.includes('rock')) musicLabel = '록';
      else if (s.includes('hip') || s.includes('rap')) musicLabel = '힙합';
      else if (s.includes('ballad')) musicLabel = '발라드';
      else if (s.includes('pop')) musicLabel = '팝';
      else musicLabel = ((recommendations.song || '').split('-')[0].trim()) || '음악';
    }

    const t1 = setTimeout(() => {
      setFadeText(true);
      if (typeof window !== 'undefined') {
        window.showFinalOrb = true;
        window.showCenterGlow = true;
        window.clusterSpin = true;
        window.showOrbits = true;
        window.showKeywords = false;
        console.log('[Showcase] finale start', {
          showFinalOrb: window.showFinalOrb,
          showOrbits: window.showOrbits,
          showKeywords: window.showKeywords,
        });
      }

      const t2 = setTimeout(() => {
        if (typeof window !== 'undefined' && recommendations) {
          const tempLabel = (recommendations.temperature != null && recommendations.temperature !== '') ? `${recommendations.temperature}°C` : '온도';
          const humidLabel = (recommendations.humidity != null && recommendations.humidity !== '') ? `${recommendations.humidity}%` : '습도';
          window.keywordLabels = [
            tempLabel,
            humidLabel,
            colorName || '조명',
            musicLabel || '음악',
          ];
          window.showKeywords = true;
          console.log('[Showcase] keywords set', {
            labels: window.keywordLabels,
            showKeywords: window.showKeywords,
            tempLabel,
            humidLabel,
            colorName,
            musicLabel,
          });
        }

        const t3 = setTimeout(() => {
          setLocalShowResults(true);
          if (typeof setOrchestratingLock === 'function') setOrchestratingLock(false);
          timersRef.current = timersRef.current.filter((id) => id !== t3);
        }, LABEL_HOLD_MS);
        timersRef.current.push(t3);
        timersRef.current = timersRef.current.filter((id) => id !== t2);
      }, ORBIT_SOLO_MS);
      timersRef.current.push(t2);
      timersRef.current = timersRef.current.filter((id) => id !== t1);
    }, TEXT_HOLD_MS);
    timersRef.current.push(t1);
  }, [
    typedReason,
    fullTypedText,
    orbShowcaseStarted,
    recommendations,
    setOrchestratingLock,
    isIOS,
    typingDone,
  ]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  return { fadeText, localShowResults, resetShowcase };
}
