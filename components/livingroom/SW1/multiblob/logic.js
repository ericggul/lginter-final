import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import useSocketSW1 from '@/utils/hooks/useSocketSW1';
import { playSfx } from '@/utils/hooks/useSound';

// 최대 슬롯 개수 (화면에 표현할 수 있는 사용자 수)
// 백엔드 payload는 그대로 두고, 프론트에서 몇 명까지 배치할지만 제어한다.
export const SW1_BLOB_CONFIGS = [
  // depthLayer: 0 = 가장 앞, 1 = 중간, 2 = 뒤
  // radiusFactor: 중심에서의 거리(기본 궤도 반지름에 대한 배율) → 간격을 서로 다르게
  { id: 'slot1', componentKey: 'Sw1OrbitBlob', angleDeg: -90,  depthLayer: 2, radiusFactor: 1.45 }, // 위, 뒤쪽 (조금 안쪽)
  { id: 'slot2', componentKey: 'Sw1OrbitBlob', angleDeg: -25,  depthLayer: 1, radiusFactor: 1.70 }, // 좌-위, 중간 (가장 바깥쪽 중 하나)
  { id: 'slot3', componentKey: 'Sw1OrbitBlob', angleDeg: 25,   depthLayer: 0, radiusFactor: 1.55 }, // 정면 오른쪽, 앞 (기준에 가깝게)
  { id: 'slot4', componentKey: 'Sw1OrbitBlob', angleDeg: 140,  depthLayer: 0, radiusFactor: 1.80 }, // 정면 왼쪽, 앞 (가장 바깥)
  { id: 'slot5', componentKey: 'Sw1OrbitBlob', angleDeg: -155, depthLayer: 1, radiusFactor: 1.30 }, // 우-아래, 중간 (가장 안쪽)
];

const MAX_BLOBS = SW1_BLOB_CONFIGS.length;
const DUMMY_ID_REGEX = /^u[A-E]$/;

// Humidity → mode label
export function computeMode(humidity) {
  if (humidity == null) return '';
  if (humidity >= 65) return '강력 제습';
  if (humidity >= 55) return '적정 제습';
  if (humidity >= 45) return '기본 제습';
  if (humidity >= 35) return '적정 가습';
  return '강력 가습';
}

// Lightweight handlers (legacy device-decision)
export function createSocketHandlers({ setClimate, setParticipantCount, setActiveUsers }) {
  const onDeviceDecision = (data) => {
    const seenUsers = new Set();
    if (data?.device === 'sw1') {
      if (typeof data.temperature === 'number' || typeof data.humidity === 'number') {
        setClimate({
          temp: typeof data.temperature === 'number' ? data.temperature : null,
          humidity: typeof data.humidity === 'number' ? data.humidity : null,
        });
      }
      if (data.assignedUsers) {
        Object.values(data.assignedUsers).forEach((u) => {
          if (u && u !== 'N/A') seenUsers.add(String(u));
        });
        // merge with existing active user set
        setActiveUsers((prev) => {
          const next = new Set(prev);
          for (const u of seenUsers) next.add(u);
          setParticipantCount(next.size);
          return next;
        });
      }
    }
  };
  return { onDeviceDecision };
}

// Independent SW1 logic hook (no coupling to SW2)
export function useSW1Logic() {
  // Center climate result (aggregated)
  const [climate, setClimate] = useState({ temp: 23, humidity: 50 });
  const [dotCount, setDotCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(new Set());

  // Mini blobs: per-user results (up to MAX_BLOBS). Start with dummy values.
  const [miniResults, setMiniResults] = useState(() => {
    // uA ~ uE 까지를 더미 아이디로 사용 (백엔드와는 무관한 프론트 전용)
    return Array.from({ length: MAX_BLOBS }, (_, idx) => {
      const letter = String.fromCharCode(65 + idx); // A, B, ...
      return {
        userId: `u${letter}`,
        temp: 23,
        humidity: 50,
      };
    });
  });
  // Track previously seen real userIds to detect new blob creations
  const prevRealUsersRef = useRef(new Set());

  // 각 블롭마다 서로 다른 z축 애니메이션 위상을 주기 위한 랜덤 seed (프론트 전용)
  const [zSeeds] = useState(
    () => Array.from({ length: MAX_BLOBS }, () => Math.random())
  );

  // Optional: capture latest voice keywords (independent, not reused from SW2)
  const [keywords, setKeywords] = useState([]); // keep last 4 (recency list for fallback)
  // Map: userId -> last keyword
  const keywordByUserRef = useRef(new Map());
  // Stable slot assignment: userId -> slot index (0..3)
  const slotByUserRef = useRef(new Map());
  const nextSlotRef = useRef(0);
  const pickSlotForUser = useCallback((uid, prev) => {
    const id = String(uid || '');
    if (!id) return 0;
    if (slotByUserRef.current.has(id)) return slotByUserRef.current.get(id);
    // Find first free slot by user occupancy
    const occupied = new Set(prev.map((r) => String(r?.userId || '')));
    for (let i = 0; i < MAX_BLOBS; i += 1) {
      const r = prev[i];
      if (!r || DUMMY_ID_REGEX.test(String(r.userId || '')) || !occupied.has(String(r.userId))) {
        slotByUserRef.current.set(id, i);
        return i;
      }
    }
    // Round-robin fallback
    const idx = nextSlotRef.current % MAX_BLOBS;
    nextSlotRef.current = (nextSlotRef.current + 1) % MAX_BLOBS;
    slotByUserRef.current.set(id, idx);
    return idx;
  }, []);

  // Wire socket listeners (orchestrated path only; ignore legacy device-decision to prevent count resets)
  useSocketSW1({
    onDeviceNewDecision: (msg) => {
      if (!msg || msg.target !== 'sw1') return;
      const env = msg.env || {};
      const nextClimate = {
        temp: typeof env.temp === 'number' ? env.temp : climate.temp,
        humidity: typeof env.humidity === 'number' ? env.humidity : climate.humidity,
      };
      setClimate(nextClimate);

      // Participants (source-of-truth from message)
      const merged = Array.isArray(msg.mergedFrom) ? msg.mergedFrom : [];
      if (merged.length) {
        setActiveUsers((prev) => {
          const next = new Set(prev);
          merged.forEach((u) => { if (u) next.add(String(u)); });
          return next;
        });
      }
      // If server provided a group emotionKeyword, optionally seed to merged users
      if (msg?.emotionKeyword && merged.length) {
        merged.forEach((uid) => {
          const id = String(uid || '');
          if (id) keywordByUserRef.current.set(id, msg.emotionKeyword);
        });
        setKeywords((prev) => {
          const k = msg.emotionKeyword;
          if (!k) return prev;
          const next = [...prev, k];
          while (next.length > 4) next.shift();
          return next;
        });
      }

      // Per-user individuals (if server provides). Otherwise keep rolling list.
      if (Array.isArray(msg.individuals)) {
        const list = msg.individuals.filter(Boolean).slice(0, MAX_BLOBS);
        if (list.length) {
          setMiniResults((prev) => {
            const next = [...prev];
            list.forEach((it) => {
              const uid = String(it.userId || '');
              const idx = pickSlotForUser(uid, next);
              next[idx] = {
                userId: uid || next[idx]?.userId || `u${idx}`,
                temp: typeof it.temp === 'number' ? it.temp : nextClimate.temp,
                humidity: typeof it.humidity === 'number' ? it.humidity : nextClimate.humidity,
              };
            });
            return next;
          });
          setActiveUsers(() => {
            const s = new Set(list.map((m) => String(m.userId || '')));
            return s;
          });
        }
      } else if (Array.isArray(merged) && merged.length) {
        // Fallback: synthesize per-user entries from mergedFrom (unique users)
        const uniq = Array.from(
          new Set(merged.map((u) => String(u)).filter(Boolean))
        ).slice(0, MAX_BLOBS);
        if (uniq.length) {
          setMiniResults((prev) => {
            const next = [...prev];
            uniq.forEach((uid) => {
              const idx = pickSlotForUser(uid, next);
              next[idx] = { userId: uid, temp: nextClimate.temp, humidity: nextClimate.humidity };
            });
            return next;
          });
          setActiveUsers(() => new Set(uniq));
        }
      } else if (msg.individual && typeof msg.individual === 'object') {
        // push recent individual to the end
        const it = msg.individual;
        setMiniResults((prev) => {
          const next = [...prev];
          const uid = String(it.userId || `u${Date.now()}`);
          const idx = pickSlotForUser(uid, next);
          next[idx] = {
            userId: uid,
            temp: typeof it.temp === 'number' ? it.temp : nextClimate.temp,
            humidity: typeof it.humidity === 'number' ? it.humidity : nextClimate.humidity,
          };
          return next;
        });
        setActiveUsers((prev) => {
          const next = new Set(prev);
          if (it?.userId) next.add(String(it.userId));
          return next;
        });
      }

    },
    onDeviceNewVoice: (payload) => {
      const k = String(payload?.text || payload?.emotion || '').trim();
      if (!k) return;
      setKeywords((prev) => {
        const next = [...prev, k];
        while (next.length > 4) next.shift();
        return next;
      });
      // Voice event should not affect participant count or mini-blobs.
      // We only keep keywords for UI; slots will be assigned by orchestrated decision.
      const uid = String(payload?.userId || '');
      if (uid) keywordByUserRef.current.set(uid, k);
    },
  });

  // Dots animation
  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c >= 3 ? 0 : c + 1));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Derive mini-blob display text set (temp on top, humidity% on bottom)
  const miniBlobDisplay = useMemo(() => {
    return SW1_BLOB_CONFIGS.map((cfg, idx) => {
      const r = miniResults[idx];
      const top = r?.temp != null ? `${r.temp}℃` : '';
      const bottom = r?.humidity != null ? `${Math.round(r.humidity)}%` : '';
      return {
        ...cfg,
        top,
        bottom,
        depthLayer: cfg.depthLayer ?? 1,
        radiusFactor: cfg.radiusFactor ?? 1.55,
        zSeed: zSeeds[idx] ?? 0,
      };
    });
  }, [miniResults, zSeeds]);

  // Play sfx when a new real user appears in mini blobs
  useEffect(() => {
    try {
      const isReal = (id) => id && !DUMMY_ID_REGEX.test(String(id));
      const curr = new Set(
        miniResults
          .map((r) => (r && r.userId) ? String(r.userId) : '')
          .filter((id) => isReal(id))
      );
      const prev = prevRealUsersRef.current || new Set();
      // Count new ids in current set not present before
      let newCount = 0;
      curr.forEach((id) => {
        if (!prev.has(id)) newCount += 1;
      });
      if (newCount > 0) {
        // Play once per new blob; lightly throttle by chaining micro-delays
        for (let i = 0; i < newCount; i += 1) {
          setTimeout(() => { playSfx('blobsw12', { volume: 0.6 }); }, i * 80);
        }
      }
      prevRealUsersRef.current = curr;
    } catch {}
  }, [miniResults]);

  // Derive participant count robustly (no stale state): max of unique active users and non-dummy mini slots
  const participantCount = useMemo(() => {
    const nonDummy = miniResults.filter(
      (r) => r && r.userId && !DUMMY_ID_REGEX.test(String(r.userId))
    ).length;
    return Math.max(activeUsers.size || 0, nonDummy || 0);
  }, [activeUsers, miniResults]);

  return {
    blobConfigs: miniBlobDisplay,
    centerTemp: climate?.temp ?? 23,
    centerHumidity: climate?.humidity ?? 50,
    participantCount,
    dotCount,
  };
}
