import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import useSocketSW1 from '@/utils/hooks/useSocketSW1';

// Blob layout config for SW1 (independent)
export const SW1_BLOB_CONFIGS = [
  { id: 'interest',  componentKey: 'Sw1InterestBlob' },
  { id: 'wonder',    componentKey: 'Sw1WonderBlob' },
  { id: 'happy',     componentKey: 'Sw1HappyBlob' },
  { id: 'moisture',  componentKey: 'Sw1MoistureBlob' },
];

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

  // Mini blobs: per-user results (up to 4). Start with dummy values.
  const [miniResults, setMiniResults] = useState([
    { userId: 'uA', temp: 22, humidity: 68 },
    { userId: 'uB', temp: 24, humidity: 56 },
    { userId: 'uC', temp: 21, humidity: 36 },
    { userId: 'uD', temp: 20, humidity: 44 },
  ]);

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
    for (let i = 0; i < 4; i += 1) {
      const r = prev[i];
      if (!r || /^u[A-D]$/.test(String(r.userId || '')) || !occupied.has(String(r.userId))) {
        slotByUserRef.current.set(id, i);
        return i;
      }
    }
    // Round-robin fallback
    const idx = nextSlotRef.current % 4;
    nextSlotRef.current = (nextSlotRef.current + 1) % 4;
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
        const list = msg.individuals.filter(Boolean).slice(0, 4);
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
        const uniq = Array.from(new Set(merged.map((u) => String(u)).filter(Boolean))).slice(0, 4);
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
      // Derive quick per-user climate result from emotion category (heuristic)
      const uid = String(payload?.userId || `u${Date.now()}`);
      // persist per-user keyword mapping
      if (uid) {
        keywordByUserRef.current.set(uid, k);
      }
      setMiniResults((prev) => {
        // Bind this user to a mini slot so that keyword mapping works immediately.
        // Keep existing temp/humidity until server decision arrives.
        const byId = (it) => String(it.userId) === uid;
        if (prev.some(byId)) return prev;
        const next = [...prev];
        const dummyIdx = next.findIndex((it) => /^u[A-D]$/.test(String(it.userId)));
        const targetIdx = dummyIdx >= 0 ? dummyIdx : 0;
        next[targetIdx] = { ...next[targetIdx], userId: uid };
        return next;
      });
      setActiveUsers((prev) => {
        const next = new Set(prev);
        next.add(uid);
        return next;
      });
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
      return { ...cfg, top, bottom };
    });
  }, [miniResults]);

  // Derive participant count robustly (no stale state): max of unique active users and non-dummy mini slots
  const participantCount = useMemo(() => {
    const nonDummy = miniResults.filter(
      (r) => r && r.userId && !/^u[A-D]$/.test(String(r.userId))
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
