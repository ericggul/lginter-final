import { useEffect, useRef, useState } from 'react';

export default function useTypewriter(text, { charMs = 55 } = {}) {
  const [typedReason, setTypedReason] = useState('');
  const [showReason, setShowReason] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const startAtRef = useRef(null);
  const rafIdRef = useRef(null);
  const ivIdRef = useRef(null);
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
      if (ivIdRef.current != null) clearInterval(ivIdRef.current);
      rafIdRef.current = null;
      ivIdRef.current = null;
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
      if (ivIdRef.current != null) clearInterval(ivIdRef.current);
      rafIdRef.current = null;
      ivIdRef.current = null;
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

    // start both RAF and a lightweight interval as a safety net
    const rafStep = (t) => {
      if (!drive(t)) rafIdRef.current = requestAnimationFrame(rafStep);
    };
    rafIdRef.current = requestAnimationFrame(rafStep);

    ivIdRef.current = setInterval(() => {
      drive();
    }, Math.max(16, Math.floor(charMs / 2)));

    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (ivIdRef.current != null) clearInterval(ivIdRef.current);
      rafIdRef.current = null;
      ivIdRef.current = null;
    };
  }, [text, charMs]);

  return { typedReason, showReason, showHighlights, showResults, isDone };
}
