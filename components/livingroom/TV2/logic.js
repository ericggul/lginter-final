import { useEffect, useMemo, useState } from 'react';
import useSocketTV2 from '@/utils/hooks/useSocketTV2';

const DEFAULT_ENV = {
  temp: 24,
  humidity: 38,
  lightColor: '#6EA7FF',
  music: '시원한 EDM',
  lightLabel: 'Blue Light',
};

export function useTV2Logic() {
  const [env, setEnv] = useState(DEFAULT_ENV);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverSrc, setCoverSrc] = useState('');

  useSocketTV2({
    onDeviceNewDecision: (msg) => {
      if (!msg) return;
      const target = msg.target || msg.device;
      if (target && target !== 'tv2') return;
      const e = msg.env || {};
      setEnv((prev) => {
        const next = {
          ...prev,
          temp: typeof e.temp === 'number' ? e.temp : prev.temp,
          humidity: typeof e.humidity === 'number' ? e.humidity : prev.humidity,
          lightColor: e.lightColor || prev.lightColor,
          music: typeof e.music === 'string' && e.music ? e.music : prev.music,
        };
        next.lightLabel = next.lightColor ? `Light ${next.lightColor}` : prev.lightLabel;
        return next;
      });
    },
  });

  // Derive track meta and cover from env.music
  useEffect(() => {
    const s = String(env?.music || '').trim();
    if (!s) {
      setTitle('');
      setArtist('');
      setCoverSrc('');
      return;
    }
    // Parse "Title - Artist" or "Title by Artist"
    let t = s;
    let a = '';
    if (s.includes(' - ')) {
      const parts = s.split(' - ');
      t = parts[0].trim();
      a = parts.slice(1).join(' - ').trim();
    } else if (/ by /i.test(s)) {
      const parts = s.split(/ by /i);
      t = parts[0].trim();
      a = parts.slice(1).join(' by ').trim();
    }
    setTitle(t);
    setArtist(a);
    if (t) {
      setCoverSrc(`/api/album?name=${encodeURIComponent(t)}`);
    } else {
      setCoverSrc('');
    }
  }, [env?.music]);

  return { env, title, artist, coverSrc };
}


