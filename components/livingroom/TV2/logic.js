import { useEffect, useMemo, useState } from 'react';
import useSocketTV2 from '@/utils/hooks/useSocketTV2';
import { parseMusicString, getAlbumCoverPath, getAlbumData, getAlbumSongPath } from '@/utils/data/albumData';

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
  const [audioSrc, setAudioSrc] = useState('');

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

  return { env, title, artist, coverSrc, audioSrc };
}


