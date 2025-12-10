import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSocketSW2 from "@/utils/hooks/useSocketSW2";
import { playSwBlobOnce } from "@/utils/data/soundeffect";
import { parseMusicString, getAlbumCoverPath, getAlbumSongPath, getAlbumData } from "@/utils/data/albumData";
import { TIMELINE_STATES } from "./logic/moving";

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
    // 화면 오른쪽 아래 큰 원 – 하단 쪽으로 조금 더 내려서
    // 다른 원과 살짝 떨어지도록 조정
    anchor: { x: 80, y: 60 },
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
    // 화면 왼쪽 아래 큰 원 – 하단 쪽으로 조금 더 내려서
    // 다른 원과 살짝 떨어지도록 조정
    anchor: { x: 20, y: 60 },
    radius: { x: 5.4, y: 4.1 },
    jitter: { x: 0.9, y: 0.75 },
    size: { base: 46, min: 40, max: 52 },
    depthLayer: 1, // 중간 레이어
    labelTop: '',
    labelBottom: '집중',
  },
  {
    id: 'calm',
    componentKey: 'Sw2CalmBox',
    // 좌측 하단 쪽에 살짝 더 작은 원 – 큰 원(wonder)보다 조금 더 아래쪽
    // 에 배치해서 자연스럽게 2단 레이어가 되도록 조정
    // (좌측 아래에서 더 오른쪽으로 옮겨 중앙 쪽에 가깝게 배치)
    anchor: { x: 24, y: 52 },
    radius: { x: 4.2, y: 3.4 },
    jitter: { x: 0.7, y: 0.6 },
    size: { base: 32, min: 26, max: 38 },
    depthLayer: 2,
    labelTop: '',
    labelBottom: '차분',
  },
  {
    id: 'vivid',
    componentKey: 'Sw2VividBox',
    // 우측 하단 쪽에 살짝 더 작은 원 – 큰 원(happy)보다 조금 더 아래쪽
    // 에 배치해서 자연스럽게 2단 레이어가 되도록 조정
    // (오른쪽 아래에서 훨씬 위로 올려, 평온 블롭과 겹치지 않으면서도
    // 화면 안쪽 상단까지 시야에 잘 들어오도록 조정)
    anchor: { x: 86, y: 46 },
    radius: { x: 4.1, y: 3.3 },
    jitter: { x: 0.7, y: 0.6 },
    size: { base: 34, min: 28, max: 40 },
    depthLayer: 1,
    labelTop: '',
    labelBottom: '선명',
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
  // 최근 사용자 키워드 (음성 텍스트 / emotionKeyword) 최대 5개까지 유지
  // 초기에는 감정 관련 더미 키워드 5개를 채워둔다
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

  // ---------------------------
  // Timeline stage (t1..t5)
  // ---------------------------
  const [timelineState, setTimelineState] = useState('t1'); // t1..t5
  const stageOrder = ['t1', 't2', 't3', 't4', 't5'];
  // t3 → t4, t4 → t5 전환을 부드럽게 제어하기 위한 로컬 타이머
  const stageTimersRef = useRef({ t4: null, t5: null });
  const prevTimelineRef = useRef('t1');

  const clearStageTimers = useCallback(() => {
    Object.values(stageTimersRef.current || {}).forEach((id) => {
      if (id) clearTimeout(id);
    });
    stageTimersRef.current = { t4: null, t5: null };
  }, []);

  const requestStage = useCallback((next) => {
    if (!stageOrder.includes(next)) return;
    setTimelineState((prev) => {
      const prevIdx = stageOrder.indexOf(prev);
      const nextIdx = stageOrder.indexOf(next);
      // t3는 재진입을 허용(다시 voiceinput 단계가 온 경우)
      if (nextIdx < prevIdx && next !== 't3') {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => () => clearStageTimers(), [clearStageTimers]);

  useEffect(() => {
    const prev = prevTimelineRef.current;
    if (prev === timelineState) return;
    prevTimelineRef.current = timelineState;
    clearStageTimers();

    if (timelineState === 't3') {
      const ms = TIMELINE_STATES.t3.entryToCenterMs || 4500;
      stageTimersRef.current.t4 = setTimeout(() => requestStage('t4'), ms);
    } else if (timelineState === 't4') {
      const ms = TIMELINE_STATES.t4.mergeMs || 2600;
      stageTimersRef.current.t5 = setTimeout(() => requestStage('t5'), ms);
    }
  }, [timelineState, clearStageTimers, requestStage]);

  const pushKeyword = useCallback((raw) => {
    const original = String(raw || '').trim();
    if (!original) return;
    setKeywords((prev) => {
      const tail = prev[prev.length - 1]?.raw || prev[prev.length - 1]?.text || '';
      if (tail === original) return prev;
      const next = [
        ...prev,
        {
          text: original,      // 화면에 그대로 노출할 사용자 인풋
          raw: original,
          isNew: true,
          id: Date.now(),
        },
      ];
      while (next.length > BLOB_CONFIGS.length) next.shift();
      return next;
    });
  }, []);

  // Only listen to orchestrated decisions; ignore legacy device-decision to prevent non-orchestrated playback

  const handleTimelineStage = useCallback((payload) => {
    try {
      const stage = String(payload?.stage || '').toLowerCase();
      // 서버에서 오는 타임라인 스테이지명을 t1~t5로 매핑하되,
      // SW2에서는 t3 이후(t4/t5)는 프론트 전용 타이머로만 진행한다.
      const map = {
        welcome: 't1',
        voicestart: 't2',
        voiceinput: 't3',
        // orchestrated/result 는 SW2에서는 로컬 타이머로만 처리 → 무시
        t1: 't1',
        t2: 't2',
        t3: 't3',
      };
      const next = map[stage];
      if (!next) return;
      requestStage(next);
    } catch {}
  }, [requestStage]);

  useSocketSW2({
    onDeviceNewDecision: (msg) => {
      // Orchestrated only
      // 컨트롤러에서 mergedFrom 전달 시 반영(있으면)
      if (msg?.mergedFrom && Array.isArray(msg.mergedFrom)) {
        setActiveUsers((prev) => {
          const next = new Set(prev);
          msg.mergedFrom.forEach((u) => {
            if (u) next.add(String(u));
          });
          return next;
        });
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
          const clone = new Set(next);
          clone.add(uid);
          return clone;
        });
      }
      // 모바일에서 바로 들어오는 사용자 입력 텍스트도 블롭 키워드로 사용
      if (payload?.text || payload?.emotion) {
        pushKeyword(payload.text || payload.emotion);
      }
    },
    // 타임라인 스테이지 신호는 SW2 프론트 연출에만 사용 (백엔드는 그대로)
    onTimelineStage: handleTimelineStage,
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
        playSwBlobOnce(0.5);
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

  const lightColor = ambienceData?.lightColor || null;

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
    timelineState,
    lightColor,
  };
}
