import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSocketSW2 from "@/utils/hooks/useSocketSW2";
import { playSfx } from "@/utils/hooks/useSound";

// 뷰에서 사용할 블롭 배치/초기 키워드 설정
export const BLOB_CONFIGS = [
  {
    id: 'interest',
    componentKey: 'Sw2InterestBox',
    anchor: { x: 74, y: 30 },
    radius: { x: 6.5, y: 5 },
    jitter: { x: 1.2, y: 0.9 },
    size: { base: 48, min: 42, max: 54 },
    // 초기 더미 감정 키워드
    labelTop: '',
    labelBottom: '설렘',
  },
  {
    id: 'happy',
    componentKey: 'Sw2HappyBox',
    anchor: { x: 28, y: 24 },
    radius: { x: 5.5, y: 4 },
    jitter: { x: 0.9, y: 0.7 },
    size: { base: 36, min: 31, max: 41 },
    labelTop: '',
    labelBottom: '평온',
  },
  {
    id: 'wonder',
    componentKey: 'Sw2WonderBox',
    anchor: { x: 22, y: 64 },
    radius: { x: 5.2, y: 4.3 },
    jitter: { x: 0.85, y: 0.75 },
    size: { base: 34, min: 30, max: 38 },
    labelTop: '',
    labelBottom: '집중',
  },
];

export function createSocketHandlers({ setAmbienceData, setAssignedUsers, searchYouTubeMusic }) {
  const onDeviceDecision = (data) => {
    console.log('💡 SW2 received device-decision:', data);
    if (data.device === 'sw2') {
      console.log('✅ SW2: Data matched, updating state');
      setAmbienceData(data);
      if (data.assignedUsers) {
        setAssignedUsers(data.assignedUsers);
        console.log('👥 SW2: Assigned users:', data.assignedUsers);
      }
      if (data.song) {
        searchYouTubeMusic(data.song);
      }
    } else {
      console.log('⏭️ SW2: Data not for this device, skipping');
    }
  };

  const onDeviceNewDecision = (msg) => {
    if (!msg || (msg.target && msg.target !== 'sw2')) return;
    const env = msg.env || {};
    const data = { device: 'sw2', lightColor: env.lightColor, song: env.music };
    setAmbienceData(prev => ({ ...prev, ...data }));
  };

  return { onDeviceDecision, onDeviceNewDecision };
}

// SW2 화면 전체 상태/이펙트 로직을 모아둔 커스텀 훅
export function useSW2Logic() {
  const [ambienceData, setAmbienceData] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState({ light: 'N/A', music: 'N/A' });
  // 최근 사용자 키워드 (음성 텍스트 / emotionKeyword) 최대 3개까지 유지
  // 초기에는 감정 관련 더미 키워드 3개를 채워둔다
  const initialKeywords = useMemo(() => BLOB_CONFIGS.map((b) => b.labelBottom || ''), []);
  const [keywords, setKeywords] = useState(() => initialKeywords);
  const prevTailRef = useRef(initialKeywords[initialKeywords.length - 1] || '');
  const [dotCount, setDotCount] = useState(0);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverSrc, setCoverSrc] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const audioRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const switchTimerRef = useRef(null);
  const blobRefs = useRef({});
  const searchYouTubeMusic = useCallback(async () => {}, []); // no-op

  const pushKeyword = useCallback((raw) => {
    const kw = String(raw || '').trim();
    if (!kw) return;
    setKeywords((prev) => {
      // 이미 동일 키워드가 맨 뒤에 있으면 중복 추가 방지
      if (prev[prev.length - 1] === kw) return prev;
      const next = [...prev, kw];
      // 블롭 개수만큼만 유지
      if (next.length > BLOB_CONFIGS.length) next.shift();
      return next;
    });
  }, []);

  // Only listen to orchestrated decisions; ignore legacy device-decision to prevent non-orchestrated playback

  useSocketSW2({
    onDeviceNewDecision: (msg) => {
      // Orchestrated only
      // 컨트롤러에서 emotionKeyword/mergedFrom 전달 시 반영(있으면)
      if (msg?.mergedFrom && Array.isArray(msg.mergedFrom)) {
        setActiveUsers((prev) => {
          const next = new Set(prev);
          msg.mergedFrom.forEach((u) => {
            if (u) next.add(String(u));
          });
          return next;
        });
      }
      if (msg?.emotionKeyword) {
        pushKeyword(msg.emotionKeyword);
      }
      // Apply ambience update
      const env = msg?.env || {};
      const data = { device: 'sw2', lightColor: env.lightColor, song: env.music };
      // Overwrite completely to avoid stale song persisting from previous events
      setAmbienceData(data);
    },
    onDeviceNewVoice: (payload) => {
      const uid = payload?.userId ? String(payload.userId) : null;
      if (uid) {
        setActiveUsers((prev) => {
          const next = new Set(prev);
          next.add(uid);
          return next;
        });
      }
      // 모바일에서 바로 들어오는 사용자 입력 텍스트도 블롭 키워드로 사용
      if (payload?.text || payload?.emotion) {
        pushKeyword(payload.text || payload.emotion);
      }
    },
  });

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c >= 3 ? 0 : c + 1));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Play sfx when a new keyword blob appears (tail changed)
  useEffect(() => {
    try {
      const tail = keywords[keywords.length - 1] || '';
      if (tail && tail !== prevTailRef.current) {
        playSfx('blobsw12', { volume: 0.5 });
      }
      prevTailRef.current = tail;
    } catch {}
  }, [keywords]);

  const parseSong = useCallback((song) => {
    if (!song) return { t: '', a: '' };
    const parts = String(song).split(' - ');
    if (parts.length >= 2) return { t: parts[0].trim(), a: parts.slice(1).join(' - ').trim() };
    return { t: String(song).trim(), a: '' };
  }, []);

  useEffect(() => {
    const songStr = ambienceData?.song;
    const { t, a } = parseSong(songStr);
    // 초기엔 즉시 적용
    if (!title && t) {
      setTitle(t);
      setArtist(a);
      setCoverSrc(`/api/album?name=${encodeURIComponent(t)}`);
      setAudioSrc(`/api/music?name=${encodeURIComponent(t)}`);
      return;
    }
    // 곡이 바뀌었고, 기존 곡이 재생 중이면 즉시 전환
    if (t && title && t !== title) {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      setTitle(t);
      setArtist(a);
      setCoverSrc(`/api/album?name=${encodeURIComponent(t)}`);
      setAudioSrc(`/api/music?name=${encodeURIComponent(t)}`);
      switchTimerRef.current = null;
      return;
    }
    // 곡이 비워지면 모두 비움
    if (!t) {
      setTitle('');
      setArtist('');
      setCoverSrc('');
      setAudioSrc('');
    }
  }, [ambienceData?.song, parseSong, title]);

  useEffect(
    () => () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!audioSrc || !audioRef.current) return;
    try {
      audioRef.current.load();
      const p = audioRef.current.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          const resume = () => {
            try {
              audioRef.current?.play();
            } catch {}
          };
          window.addEventListener('pointerdown', resume, { once: true });
          window.addEventListener('keydown', resume, { once: true });
          window.addEventListener('touchstart', resume, { once: true, passive: true });
        });
      }
    } catch {}
  }, [audioSrc]);

  const participantCount = useMemo(() => {
    const names = new Set(Object.values(assignedUsers || {}).filter((v) => v && v !== 'N/A'));
    return Math.max(names.size, activeUsers.size || 0);
  }, [assignedUsers, activeUsers]);

  return {
    blobConfigs: BLOB_CONFIGS,
    keywords,
    dotCount,
    title,
    artist,
    coverSrc,
    audioSrc,
    audioRef,
    participantCount,
    blobRefs,
  };
}
