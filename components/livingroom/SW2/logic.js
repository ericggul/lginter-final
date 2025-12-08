import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSocketSW2 from "@/utils/hooks/useSocketSW2";
import { playSfx } from "@/utils/hooks/useSound";
import { parseMusicString, getAlbumCoverPath, getAlbumSongPath, getAlbumData } from "@/utils/data/albumData";

// 뷰에서 사용할 블롭 배치/초기 키워드 설정
export const BLOB_CONFIGS = [
  {
    id: 'interest',
    componentKey: 'Sw2InterestBox',
    // 상단 중앙에 위치한 원 – 앨범 카드 바로 뒤에서 시작
    anchor: { x: 50, y: 32 },
    radius: { x: 4.5, y: 3.6 },
    jitter: { x: 0.8, y: 0.6 },
    size: { base: 38, min: 32, max: 44 },
    depthLayer: 2, // 가장 뒤쪽 레이어
    // 초기 더미 감정 키워드
    labelTop: '',
    labelBottom: '설렘',
  },
  {
    id: 'happy',
    componentKey: 'Sw2HappyBox',
    // 화면 오른쪽 아래 큰 원 – 살짝 화면 안쪽으로 당김
    anchor: { x: 78, y: 56 },
    radius: { x: 5.8, y: 4.2 },
    jitter: { x: 1.0, y: 0.8 },
    size: { base: 50, min: 44, max: 56 },
    depthLayer: 0, // 가장 앞쪽 레이어
    labelTop: '',
    labelBottom: '평온',
  },
  {
    id: 'wonder',
    componentKey: 'Sw2WonderBox',
    // 화면 왼쪽 아래 큰 원 – 살짝 화면 안쪽으로 당김
    anchor: { x: 22, y: 56 },
    radius: { x: 5.4, y: 4.1 },
    jitter: { x: 0.9, y: 0.75 },
    size: { base: 46, min: 40, max: 52 },
    depthLayer: 1, // 중간 레이어
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
  const initialKeywords = useMemo(
    () => BLOB_CONFIGS.map((b) => ({ text: b.labelBottom || '', isNew: false, id: Date.now() + Math.random() })),
    []
  );
  const [keywords, setKeywords] = useState(() => initialKeywords);
  const prevTailRef = useRef(initialKeywords[initialKeywords.length - 1]?.text || '');
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

  const sanitizeKeyword = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return '';
    const low = s.toLowerCase();
    // profanity/abusive → '불쾌함'
    const bad = /(fuck|shit|bitch|asshole|nigger|fag|cunt|좆|씨발|좇|병신|새끼|꺼져|욕)/i;
    if (bad.test(low)) return '불쾌해';
    // neutral → drop
    const neutral = /(중립|보통|무난|쏘쏘|그냥|괜|괜찮|보통임|평범)/;
    if (neutral.test(s)) return '';
    // mapping to 3-char colloquial
    const map = [
      [/기쁨|행복|좋음|좋다|신남|설렘|설레|즐거|해피|흥겨|신나|좋아/i, '즐거워'],
      [/우울|슬픔|슬퍼|침잠|허무|공허/i, '우울해'],
      [/분노|화남|화나|짜증|혐오|역겨|싫다|불쾌|짜증나/i, '불쾌해'],
      [/긴장|불안|초조|걱정/i, '긴장돼'],
      [/차분|평온|고요|잔잔|안정|편안/i, '차분해'],
      [/설레|기대|두근/i, '기대돼'],
      [/상쾌|시원|청량/i, '상쾌해'],
      [/집중|몰입|명료|선명/i, '집중해'],
    ];
    for (const [re, out] of map) {
      if (re.test(s)) return out;
    }
    // fallback: 3~5자 추출
    const three = s.replace(/\s+/g, '').slice(0, 3);
    return three || '';
  };

  const pushKeyword = useCallback((raw) => {
    const kw = sanitizeKeyword(raw);
    if (!kw) return;
    setKeywords((prev) => {
      const tail = prev[prev.length - 1]?.text || '';
      if (tail === kw) return prev;
      const next = [...prev, { text: kw, isNew: true, id: Date.now() }];
      while (next.length > BLOB_CONFIGS.length) next.shift();
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
      const tail = keywords[keywords.length - 1]?.text || '';
      if (tail && tail !== prevTailRef.current) {
        playSfx('blobsw12', { volume: 0.5 });
      }
      prevTailRef.current = tail;
    } catch {}
  }, [keywords]);

  useEffect(() => {
    const songStr = ambienceData?.song;
    if (!songStr) {
      setTitle('');
      setArtist('');
      setCoverSrc('');
      setAudioSrc('');
      return;
    }
    
    // Parse using albumData utility
    const parsed = parseMusicString(songStr);
    let t = parsed.title;
    let a = parsed.artist;
    
    // Try to get album data for display title/artist
    const albumData = getAlbumData(songStr);
    if (albumData) {
      t = albumData.displayTitle || t;
      a = albumData.displayArtist || a;
    }
    
    // 초기엔 즉시 적용
    if (!title && t) {
      setTitle(t);
      setArtist(a);
      setCoverSrc(getAlbumCoverPath(songStr));
      setAudioSrc(getAlbumSongPath(songStr));
      return;
    }
    // 곡이 바뀌었고, 기존 곡이 재생 중이면 즉시 전환
    if (t && title && t !== title) {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      setTitle(t);
      setArtist(a);
      setCoverSrc(getAlbumCoverPath(songStr));
      setAudioSrc(getAlbumSongPath(songStr));
      switchTimerRef.current = null;
      return;
    }
  }, [ambienceData?.song, title]);

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
