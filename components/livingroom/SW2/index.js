import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSocketSW2 from "@/utils/hooks/useSocketSW2";
import * as S from './styles';
import { createSocketHandlers } from './logic';

const VIEWPORT = { width: 100, height: 56.25 };
const MIN_VISIBLE_RATIO = 0.8;

const BLOB_CONFIGS = [
  {
    id: 'interest',
    componentKey: 'Sw2InterestBox',
    anchor: { x: 74, y: 30 },
    radius: { x: 6.5, y: 5 },
    jitter: { x: 1.2, y: 0.9 },
    size: { base: 48, min: 42, max: 54 },
    motion: {
      orbit: { min: 0.009, max: 0.013 },
      jitter: { min: 0.012, max: 0.02 },
      scale: { min: 0.006, max: 0.012 },
    },
  },
  {
    id: 'happy',
    componentKey: 'Sw2HappyBox',
    anchor: { x: 28, y: 24 },
    radius: { x: 5.5, y: 4 },
    jitter: { x: 0.9, y: 0.7 },
    size: { base: 36, min: 31, max: 41 },
    motion: {
      orbit: { min: 0.01, max: 0.015 },
      jitter: { min: 0.014, max: 0.022 },
      scale: { min: 0.007, max: 0.013 },
    },
  },
  {
    id: 'wonder',
    componentKey: 'Sw2WonderBox',
    anchor: { x: 22, y: 64 },
    radius: { x: 5.2, y: 4.3 },
    jitter: { x: 0.85, y: 0.75 },
    size: { base: 34, min: 30, max: 38 },
    motion: {
      orbit: { min: 0.008, max: 0.012 },
      jitter: { min: 0.012, max: 0.02 },
      scale: { min: 0.006, max: 0.011 },
    },
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const randomBetween = (min, max) => Math.random() * (max - min) + min;

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
  const animationRef = useRef(null);
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

  useEffect(() => {
    const blobs = BLOB_CONFIGS.map((cfg) => {
      const amplitude = (cfg.size.max - cfg.size.min) / 2;
      const baseSize = cfg.size.base ?? cfg.size.min + amplitude;
      return {
        config: cfg,
        baseSize,
        sizeAmplitude: amplitude,
        x: cfg.anchor.x,
        y: cfg.anchor.y,
        sizeCurrent: baseSize,
        angle: Math.random() * Math.PI * 2,
        dir: Math.random() > 0.5 ? 1 : -1,
        orbitSpeed: randomBetween(cfg.motion.orbit.min, cfg.motion.orbit.max),
        jitterPhase: Math.random() * Math.PI * 2,
        jitterSpeed: randomBetween(cfg.motion.jitter.min, cfg.motion.jitter.max),
        sizePhase: Math.random() * Math.PI * 2,
        sizeSpeed: randomBetween(cfg.motion.scale.min, cfg.motion.scale.max),
      };
    });

    const applyStyles = () => {
      blobs.forEach((blob) => {
        const node = blobRefs.current[blob.config.id];
        if (!node) return;
        node.style.setProperty('--blob-top', `${blob.y}vw`);
        node.style.setProperty('--blob-left', `${blob.x}vw`);
        node.style.setProperty('--blob-size', `${blob.sizeCurrent}vw`);
      });
    };

    const enforceBounds = (value, radius, limit) => {
      const margin = Math.min(radius * MIN_VISIBLE_RATIO, limit / 2);
      return clamp(value, margin, limit - margin);
    };

    const step = () => {
      blobs.forEach((blob) => {
        blob.angle += blob.dir * blob.orbitSpeed;
        blob.jitterPhase += blob.jitterSpeed;
        blob.sizePhase += blob.sizeSpeed;

        const jitterX = Math.sin(blob.jitterPhase) * blob.config.jitter.x;
        const jitterY = Math.cos(blob.jitterPhase) * blob.config.jitter.y;

        let x = blob.config.anchor.x + Math.cos(blob.angle) * blob.config.radius.x + jitterX;
        let y = blob.config.anchor.y + Math.sin(blob.angle) * blob.config.radius.y + jitterY;

        let size = blob.baseSize + Math.sin(blob.sizePhase) * blob.sizeAmplitude;
        size = clamp(size, blob.config.size.min, blob.config.size.max);
        const radius = size / 2;

        const boundedX = enforceBounds(x, radius, VIEWPORT.width);
        if (boundedX !== x) blob.dir = -blob.dir;
        const boundedY = enforceBounds(y, radius, VIEWPORT.height);
        if (boundedY !== y) blob.dir = -blob.dir;

        blob.x = boundedX;
        blob.y = boundedY;
        blob.sizeCurrent = size;
      });

      for (let i = 0; i < blobs.length; i += 1) {
        for (let j = i + 1; j < blobs.length; j += 1) {
          const a = blobs[i];
          const b = blobs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const minDist = (a.sizeCurrent + b.sizeCurrent) / 2 + 0.8;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            a.dir = -a.dir;
            b.dir = -b.dir;
            a.angle += Math.PI / 10;
            b.angle -= Math.PI / 10;
          }
        }
      }

      applyStyles();
      animationRef.current = requestAnimationFrame(step);
    };

    applyStyles();
    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

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
          />
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
