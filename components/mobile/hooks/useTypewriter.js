import { useEffect, useRef, useState } from 'react';

export default function useTypewriter(text, { charMs = 55 } = {}) {
  const [typedReason, setTypedReason] = useState('');
  const [showReason, setShowReason] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const startAtRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastCountRef = useRef(0);
  const activeTextRef = useRef('');

  const drive = (now) => {
    const totalLen = activeTextRef.current.length;
    if (!startAtRef.current) startAtRef.current = (now != null ? now : performance.now());
    const elapsed = (now != null ? now : performance.now()) - startAtRef.current;
    const count = Math.min(totalLen, Math.floor(elapsed / Math.max(1, charMs)));
    if (count !== lastCountRef.current) {
      lastCountRef.current = count;
      setTypedReason(activeTextRef.current.slice(0, count));
    }
    if (count >= totalLen) {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      setIsDone(true);
      setTimeout(() => {
        setShowHighlights(true);
        setTimeout(() => setShowResults(true), 4000);
      }, 500);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const incoming = typeof text === 'string' ? text : '';

    if (!text) {
      // pause without losing progress
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      return;
    }

    const isNew = incoming !== activeTextRef.current;
    if (isNew) {
      activeTextRef.current = incoming;
      setShowReason(true);
      setShowHighlights(false);
      setShowResults(false);
      setIsDone(false);
      setTypedReason('');
      lastCountRef.current = 0;
      startAtRef.current = null;
    }

    // Drive typing with a single RAF loop (avoids double work on iOS Safari)
    const rafStep = (t) => {
      if (!drive(t)) rafIdRef.current = requestAnimationFrame(rafStep);
    };
    rafIdRef.current = requestAnimationFrame(rafStep);

    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    };
  }, [text, charMs]);

  return { typedReason, showReason, showHighlights, showResults, isDone };
}
