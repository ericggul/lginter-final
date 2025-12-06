import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Lightweight Korean TTS hook powered by the /api/tts OpenAI proxy.
 * Minimizes latency by streaming mp3 and playing immediately.
 */
export default function useTTS(options = {}) {
  const {
    voice = 'alloy',
    model = 'gpt-4o-mini-tts',
    format = 'mp3',
    volume = 1.0,
  } = options;

  const audioRef = useRef(null);
  const revokeRef = useRef(null);
  const abortRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | loading | playing | error
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    try {
      if (abortRef.current) abortRef.current.abort();
    } catch {}
    abortRef.current = null;
    try {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = '';
      }
    } catch {}
    audioRef.current = null;
    if (revokeRef.current) {
      URL.revokeObjectURL(revokeRef.current);
      revokeRef.current = null;
    }
    setStatus('idle');
  }, []);

  const play = useCallback(
    async (text, opts = {}) => {
      if (typeof window === 'undefined') return;
      const payloadText = (text || '').trim();
      if (!payloadText) {
        setError('텍스트가 없습니다.');
        setStatus('error');
        return;
      }

      // cancel any ongoing playback/request
      stop();
      setError(null);
      setStatus('loading');

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            text: payloadText,
            voice: opts.voice || voice,
            model: opts.model || model,
            format: opts.format || format,
          }),
        });

        if (!res.ok) {
          let detail = '';
          try {
            detail = await res.text();
          } catch {}
          throw new Error(detail || 'TTS 요청 실패');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revokeRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        const vol = Number.isFinite(opts.volume) ? opts.volume : volume;
        audio.volume = Math.max(0, Math.min(1, vol));

        audio.onended = () => {
          stop();
        };
        audio.onerror = () => {
          setStatus('error');
        };

        const p = audio.play();
        setStatus('playing');
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            setStatus('error');
          });
        }
      } catch (err) {
        if (err?.name === 'AbortError') {
          return;
        }
        setError(String(err));
        setStatus('error');
        stop();
      }
    },
    [format, model, stop, voice, volume]
  );

  return useMemo(
    () => ({
      play,
      stop,
      status,
      error,
    }),
    [error, play, status, stop]
  );
}

