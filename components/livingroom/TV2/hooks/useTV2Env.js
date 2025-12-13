import { useEffect, useState } from 'react';
import useSocketTV2 from '@/utils/hooks/useSocketTV2';
import {
  parseMusicString,
  getAlbumCoverPath,
  getAlbumData,
  getAlbumSongPath,
} from '@/utils/data/albumData';

const DEFAULT_ENV = {
  temp: 23,
  humidity: 63,
  lightColor: '#6EA7FF', // pastel blue landing
  music: 'happy-alley', // landing track
  lightLabel: '',
};

export function useTV2Logic() {
  const [env, setEnv] = useState(DEFAULT_ENV);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverSrc, setCoverSrc] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [reason, setReason] = useState('');
  const [emotionKeyword, setEmotionKeyword] = useState('');
  // 새로운 디시전이 들어올 때마다 1씩 증가하는 토큰 (env 값이 동일해도 증가)
  const [decisionToken, setDecisionToken] = useState(0);

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
        reason: msg.reason,
      });
      // 숫자 혹은 숫자 문자열 모두 허용하는 헬퍼
      const toNumberOrFallback = (value, fallback) => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
          const n = Number(value.trim());
          if (!Number.isNaN(n) && Number.isFinite(n)) return n;
        }
        return fallback;
      };

      setEnv((prev) => {
        const nextTemp = toNumberOrFallback(e.temp, prev?.temp ?? DEFAULT_ENV.temp);
        const nextHumidity = toNumberOrFallback(
          e.humidity,
          prev?.humidity ?? DEFAULT_ENV.humidity,
        );
        const next = {
          ...prev,
          temp: nextTemp,
          humidity: nextHumidity,
          lightColor: e.lightColor || prev.lightColor || DEFAULT_ENV.lightColor,
          music: typeof e.music === 'string' && e.music ? e.music : prev.music,
        };
        next.lightLabel = next.lightColor ? `Light ${next.lightColor}` : prev.lightLabel;
        console.log('📺 TV2 env updated:', {
          temp: next.temp,
          humidity: next.humidity,
          lightColor: next.lightColor,
          music: next.music,
        });
        return next;
      });
      // 음악 선택 이유 & 감정 키워드 저장
      if (msg.reason && typeof msg.reason === 'string') {
        setReason(msg.reason);
      }
      if (msg.emotionKeyword && typeof msg.emotionKeyword === 'string') {
        try {
          const { sanitizeEmotion } = require('@/utils/text/sanitizeEmotion');
          setEmotionKeyword(sanitizeEmotion(msg.emotionKeyword, { strict: true }));
        } catch {
          setEmotionKeyword('불쾌해');
        }
      }

      // env 내용이 동일하더라도, 새로운 디시전이 들어왔다는 사실 자체를 전달하기 위한 토큰
      setDecisionToken((prev) => prev + 1);
    },
  });

  // Derive track meta and cover from env.music
  useEffect(() => {
    const s = String(env?.music || '').trim();
    if (!s) {
      setTitle('');
      setArtist('');
      setCoverSrc('');
      setAudioSrc('');
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

  return { env, title, artist, coverSrc, audioSrc, reason, emotionKeyword, decisionToken };
}


