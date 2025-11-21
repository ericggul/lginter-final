import { useEffect, useState, useCallback, useRef } from 'react';

export default function usePostTypingShowcase({ fullTypedText, typedReason, recommendations, setOrchestratingLock, isIOS = false }) {
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

  // 기본 경로: 타이핑이 끝났을 때(typedReason 길이가 fullTypedText 이상) 오브/키워드 쇼케이스 시작
  useEffect(() => {
    if (!fullTypedText) return;
    if (typedReason && typedReason.length >= fullTypedText.length && !orbShowcaseStarted) {
      console.log('[Showcase] Triggering orbit sequence', {
        typedLen: typedReason.length,
        fullLen: fullTypedText.length,
        orbShowcaseStarted
      });
      setOrbShowcaseStarted(true);
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];

      const TEXT_HOLD_MS = 2000;
      const ORBIT_SOLO_MS = 3000;
      const LABEL_HOLD_MS = 2000;

      let colorName = '조명';
      let musicLabel = '';
      if (recommendations) {
        const hex = (recommendations.lightColor || '').replace('#','');
        if (hex.length === 6) {
          const r = parseInt(hex.slice(0,2), 16) / 255;
          const g = parseInt(hex.slice(2,4), 16) / 255;
          const b = parseInt(hex.slice(4,6), 16) / 255;
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
        else musicLabel = (recommendations.song || '').split('-')[0].trim();
      }

      const t1 = setTimeout(() => {
        setFadeText(true);
        if (typeof window !== 'undefined') {
          window.showFinalOrb = true;
          window.showCenterGlow = true;
          window.clusterSpin = true;
          window.showOrbits = true;
          window.showKeywords = false;
        }

        const t2 = setTimeout(() => {
          if (typeof window !== 'undefined' && recommendations) {
            window.keywordLabels = [
              `${recommendations.temperature}°C`,
              `${recommendations.humidity}%`,
              colorName,
              musicLabel
            ];
            window.showKeywords = true;
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
    }
    console.log('[Showcase] Waiting for typewriter completion', {
      typedLen: typedReason ? typedReason.length : 0,
      fullLen: fullTypedText.length,
      orbShowcaseStarted
    });
  }, [typedReason, fullTypedText, orbShowcaseStarted, recommendations, setOrchestratingLock]);

  // iOS Safari 전용 안전장치:
  // 타이핑이 어느 정도 진행되었는데도 orbShowcaseStarted가 시작되지 않으면
  // 일정 시간이 지난 후 강제로 오브/키워드 쇼케이스를 시작해준다.
  useEffect(() => {
    if (!isIOS) return;
    if (!fullTypedText) return;
    if (!typedReason || typedReason.length === 0) return;
    if (orbShowcaseStarted) return;
    if (!recommendations) return;

    const TEXT_HOLD_MS = 2000;
    const ORBIT_SOLO_MS = 3000;
    const LABEL_HOLD_MS = 2000;
    const EXTRA_BUFFER_MS = 5000;
    const fallbackMs = TEXT_HOLD_MS + ORBIT_SOLO_MS + LABEL_HOLD_MS + EXTRA_BUFFER_MS;

    const tFallback = setTimeout(() => {
      if (orbShowcaseStarted) return;
      console.warn('[Showcase] iOS fallback – forcing orb showcase start');

      let colorName = '조명';
      let musicLabel = '';
      if (recommendations) {
        const hex = (recommendations.lightColor || '').replace('#','');
        if (hex.length === 6) {
          const r = parseInt(hex.slice(0,2), 16) / 255;
          const g = parseInt(hex.slice(2,4), 16) / 255;
          const b = parseInt(hex.slice(4,6), 16) / 255;
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
        else musicLabel = (recommendations.song || '').split('-')[0].trim();
      }

      setOrbShowcaseStarted(true);
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];

      const t1 = setTimeout(() => {
        setFadeText(true);
        if (typeof window !== 'undefined') {
          window.showFinalOrb = true;
          window.showCenterGlow = true;
          window.clusterSpin = true;
          window.showOrbits = true;
          window.showKeywords = false;
        }

        const t2 = setTimeout(() => {
          if (typeof window !== 'undefined' && recommendations) {
            window.keywordLabels = [
              `${recommendations.temperature}°C`,
              `${recommendations.humidity}%`,
              colorName,
              musicLabel
            ];
            window.showKeywords = true;
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
    }, fallbackMs);

    timersRef.current.push(tFallback);

    return () => {
      clearTimeout(tFallback);
      timersRef.current = timersRef.current.filter((id) => id !== tFallback);
    };
  }, [isIOS, fullTypedText, typedReason, orbShowcaseStarted, recommendations, setOrchestratingLock]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  return { fadeText, localShowResults, resetShowcase };
}


