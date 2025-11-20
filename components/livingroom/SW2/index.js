import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSocketSW2 from "@/utils/hooks/useSocketSW2";
import * as S from './styles';
import { createSocketHandlers } from './logic';

const BLOB_CONFIGS = [
  {
    id: 'interest',
    componentKey: 'Sw2InterestBox',
    anchor: { x: 74, y: 30 },
    radius: { x: 6.5, y: 5 },
    jitter: { x: 1.2, y: 0.9 },
    size: { base: 48, min: 42, max: 54 },
    labelTop: '22℃',
    labelBottom: '강력 제습',
  },
  {
    id: 'happy',
    componentKey: 'Sw2HappyBox',
    anchor: { x: 28, y: 24 },
    radius: { x: 5.5, y: 4 },
    jitter: { x: 0.9, y: 0.7 },
    size: { base: 36, min: 31, max: 41 },
    labelTop: '21℃',
    labelBottom: '강력 가습',
  },
  {
    id: 'wonder',
    componentKey: 'Sw2WonderBox',
    anchor: { x: 22, y: 64 },
    radius: { x: 5.2, y: 4.3 },
    jitter: { x: 0.85, y: 0.75 },
    size: { base: 34, min: 30, max: 38 },
    labelTop: '24℃',
    labelBottom: '적정 제습',
  },
];

export default function SW2Controls() {
  const [ambienceData, setAmbienceData] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState({ light: 'N/A', music: 'N/A' });
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

  const handlers = useMemo(
    () => createSocketHandlers({ setAmbienceData, setAssignedUsers, searchYouTubeMusic }),
    [setAmbienceData, setAssignedUsers, searchYouTubeMusic]
  );

  const { socket } = useSocketSW2({
    onDeviceDecision: (data) => {
      handlers.onDeviceDecision(data);
      // assignedUsers 기반 참가자 추정
      if (data?.assignedUsers) {
        const vals = Object.values(data.assignedUsers).filter(v => v && v !== 'N/A');
        if (vals.length) {
          setActiveUsers(prev => {
            const next = new Set(prev);
            vals.forEach(v => next.add(String(v)));
            return next;
          });
        }
      }
    },
    onDeviceNewDecision: (msg) => {
      handlers.onDeviceNewDecision(msg);
      // 컨트롤러에서 emotionKeyword/mergedFrom 전달 시 반영(있으면)
      if (msg?.mergedFrom && Array.isArray(msg.mergedFrom)) {
        setActiveUsers(prev => {
          const next = new Set(prev);
          msg.mergedFrom.forEach(u => { if (u) next.add(String(u)); });
          return next;
        });
      }
    },
    onDeviceNewVoice: (payload) => {
      const uid = payload?.userId ? String(payload.userId) : null;
      if (uid) {
        setActiveUsers(prev => { const next = new Set(prev); next.add(uid); return next; });
      }
    }
  });

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c >= 3 ? 0 : c + 1));
    }, 500);
    return () => clearInterval(id);
  }, []);

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
      setTitle(t); setArtist(a);
      setCoverSrc(`/api/album?name=${encodeURIComponent(t)}`);
      setAudioSrc(`/api/music?name=${encodeURIComponent(t)}`);
      return;
    }
    // 곡이 바뀌었고, 기존 곡이 재생 중이면 10초 후 전환
    if (t && title && t !== title) {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      switchTimerRef.current = setTimeout(() => {
        setTitle(t); setArtist(a);
        setCoverSrc(`/api/album?name=${encodeURIComponent(t)}`);
        setAudioSrc(`/api/music?name=${encodeURIComponent(t)}`);
        switchTimerRef.current = null;
      }, 10000);
      return;
    }
    // 곡이 비워지면 모두 비움
    if (!t) {
      setTitle(''); setArtist(''); setCoverSrc(''); setAudioSrc('');
    }
  }, [ambienceData?.song, parseSong, title]);

  useEffect(() => () => { if (switchTimerRef.current) clearTimeout(switchTimerRef.current); }, []);

  useEffect(() => {
    if (!audioSrc || !audioRef.current) return;
    try {
      audioRef.current.load();
      const p = audioRef.current.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          const resume = () => { try { audioRef.current?.play(); } catch {} };
          window.addEventListener('pointerdown', resume, { once: true });
          window.addEventListener('keydown', resume, { once: true });
          window.addEventListener('touchstart', resume, { once: true, passive: true });
        });
      }
    } catch {}
  }, [audioSrc]);

  const participantCount = useMemo(() => {
    const names = new Set(Object.values(assignedUsers || {}).filter(v => v && v !== 'N/A'));
    return Math.max(names.size, activeUsers.size || 0);
  }, [assignedUsers, activeUsers]);

  return (
    <S.Root>
      {BLOB_CONFIGS.map((blob) => {
        const Component = S[blob.componentKey];
        return (
          <Component
            key={blob.id}
            ref={(node) => {
              if (node) {
                blobRefs.current[blob.id] = node;
                node.style.setProperty('--blob-top', `${blob.anchor.y}vw`);
                node.style.setProperty('--blob-left', `${blob.anchor.x}vw`);
                node.style.setProperty('--blob-size', `${blob.size.base}vw`);
              } else {
                delete blobRefs.current[blob.id];
              }
            }}
          >
            <strong>{blob.labelTop}</strong>
            <span>{blob.labelBottom}</span>
          </Component>
        );
      })}
      {/* If background frame image is unavailable, pass empty to avoid 404 */}
      <S.FrameBg $url="" />
      <S.TopStatus>
        <span>사용자 {participantCount}명을 위한 조율중</span>
        <S.Dots aria-hidden="true">
          <S.Dot $visible={dotCount >= 1}>.</S.Dot>
          <S.Dot $visible={dotCount >= 2}>.</S.Dot>
          <S.Dot $visible={dotCount >= 3}>.</S.Dot>
        </S.Dots>
      </S.TopStatus>

      {/* Compact album card */}
      <S.AlbumCard>
        {coverSrc ? (
          <S.AlbumImage
            src={coverSrc}
            alt={title || 'cover'}
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            onLoad={(e) => { e.currentTarget.style.visibility = 'visible'; }}
            style={{ visibility: 'visible' }}
          />
        ) : (
          <S.AlbumPlaceholder />
        )}
      </S.AlbumCard>
      <S.CaptionWrap>
        <S.HeadText>{title || ' '}</S.HeadText>
        <S.SubText>{artist || ' '}</S.SubText>
      </S.CaptionWrap>

      {/* Hidden audio element */}
      {audioSrc ? <audio ref={audioRef} src={audioSrc} autoPlay loop playsInline preload="auto" /> : null}
    </S.Root>
  );
}
