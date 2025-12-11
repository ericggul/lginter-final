import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import useSocketSW1 from '@/utils/hooks/useSocketSW1';
import { playSwBlobBurstForNewUsers, playSw12BlobAppearance } from '@/utils/data/soundeffect';
import { ensureBlobCount, computeAgeSizeBoost, computeSimilarityRadiusScale } from './moving';

// 복제 기본값: SW1의 슬롯 구성을 그대로 사용 (후속 TODO에서 티어/슬롯 확장 적용)
export const SW1TEST_BLOB_CONFIGS = [
  { id: 'slot1', componentKey: 'Sw1OrbitBlob', angleDeg: -90,  depthLayer: 2, radiusFactor: 1.45 },
  { id: 'slot2', componentKey: 'Sw1OrbitBlob', angleDeg: -25,  depthLayer: 1, radiusFactor: 1.70 },
  { id: 'slot3', componentKey: 'Sw1OrbitBlob', angleDeg: 25,   depthLayer: 0, radiusFactor: 1.55 },
  { id: 'slot4', componentKey: 'Sw1OrbitBlob', angleDeg: 140,  depthLayer: 0, radiusFactor: 1.80 },
  { id: 'slot5', componentKey: 'Sw1OrbitBlob', angleDeg: -155, depthLayer: 1, radiusFactor: 1.30 },
  { id: 'slot6', componentKey: 'Sw1OrbitBlob', angleDeg: -60,  depthLayer: 2, radiusFactor: 1.62 },
  { id: 'slot7', componentKey: 'Sw1OrbitBlob', angleDeg: 60,   depthLayer: 1, radiusFactor: 1.68 },
  { id: 'slot8', componentKey: 'Sw1OrbitBlob', angleDeg: 0,    depthLayer: 2, radiusFactor: 1.50 },
  { id: 'slot9', componentKey: 'Sw1OrbitBlob', angleDeg: -120, depthLayer: 1, radiusFactor: 1.55 },
  { id: 'slot10',componentKey: 'Sw1OrbitBlob', angleDeg: 110,  depthLayer: 2, radiusFactor: 1.65 },
];

const MAX_BLOBS = SW1TEST_BLOB_CONFIGS.length;
const T3_TO_T4_MS = 5000;
const T4_TO_T5_MS = 3800;
const DUMMY_ID_REGEX = /^dummy:/;

export function computeMode(humidity) {
  if (humidity == null) return '';
  if (humidity >= 65) return '강력 제습';
  if (humidity >= 55) return '적정 제습';
  if (humidity >= 45) return '기본 제습';
  if (humidity >= 35) return '적정 가습';
  return '강력 가습';
}

export function createSocketHandlers({ setDisplayClimate, setNextClimate, setParticipantCount, setActiveUsers }) {
  const onDeviceDecision = (data) => {
    const seenUsers = new Set();
    if (data?.device === 'sw1') {
      if (typeof data.temperature === 'number' || typeof data.humidity === 'number') {
        const payload = {
          temp: typeof data.temperature === 'number' ? data.temperature : null,
          humidity: typeof data.humidity === 'number' ? data.humidity : null,
        };
        setDisplayClimate(payload);
        setNextClimate(payload);
      }
      if (data.assignedUsers) {
        Object.values(data.assignedUsers).forEach((u) => {
          if (u && u !== 'N/A') seenUsers.add(String(u));
        });
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

// Independent SW1test logic hook
export function useSW1TestLogic() {
  const [displayClimate, setDisplayClimate] = useState({ temp: 23, humidity: 50 });
  const [nextClimate, setNextClimate] = useState({ temp: 23, humidity: 50 });
  const [dotCount, setDotCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [timelineState, setTimelineState] = useState('t1'); // t1..t5
  const [stateTick, setStateTick] = useState(0);
  const [bloomTick, setBloomTick] = useState(0);
  const [typeTick, setTypeTick] = useState(0);
  const [hasDecision, setHasDecision] = useState(false);
  // test-only extended signals
  const [sceneZoomOutTick, setSceneZoomOutTick] = useState(0);
  const [edgeGlowTick, setEdgeGlowTick] = useState(0);
  const [orchestrateTick, setOrchestrateTick] = useState(0);
  const [burstTick, setBurstTick] = useState(0);
  const [entryAngle, setEntryAngle] = useState(0); // deg
  const stageTimersRef = useRef({ t3Bloom: null, t4: null, t5: null });
  const prevTimelineRef = useRef('t1');
  const stageOrder = ['t1', 't2', 't3', 't4', 't5'];

  const clearStageTimers = useCallback(() => {
    Object.values(stageTimersRef.current || {}).forEach((id) => { if (id) clearTimeout(id); });
    stageTimersRef.current = { t3Bloom: null, t4: null, t5: null };
  }, []);

  const requestStage = useCallback((next) => {
    if (!stageOrder.includes(next)) return;
    setTimelineState((prev) => {
      const prevIdx = stageOrder.indexOf(prev);
      const nextIdx = stageOrder.indexOf(next);
      if (nextIdx <= prevIdx && next !== 't3') {
        if (prev === 't4' && next === 't4') setStateTick((x) => x + 1);
        return prev;
      }
      return next;
    });
  }, []);

  // Legacy miniResults (for quick fallback). Will be phased out by orbitLines flattening.
  const [miniResults, setMiniResults] = useState(() => []);
  const [entryBlob, setEntryBlob] = useState(null);
  const prevRealUsersRef = useRef(new Set());
  const [zSeeds] = useState(() => Array.from({ length: MAX_BLOBS }, () => Math.random()));
  const [keywords, setKeywords] = useState([]);
  const keywordByUserRef = useRef(new Map());
  const slotByUserRef = useRef(new Map());
  const nextSlotRef = useRef(0);
  const pickSlotForUser = useCallback((uid, prev) => {
    const id = String(uid || '');
    if (!id) return 0;
    if (slotByUserRef.current.has(id)) return slotByUserRef.current.get(id);
    const occupied = new Set(prev.map((r) => String(r?.userId || '')));
    for (let i = 0; i < MAX_BLOBS; i += 1) {
      const r = prev[i];
      if (!r || DUMMY_ID_REGEX.test(String(r.userId || '')) || !occupied.has(String(r.userId))) {
        slotByUserRef.current.set(id, i);
        return i;
      }
    }
    const idx = nextSlotRef.current % MAX_BLOBS;
    nextSlotRef.current = (nextSlotRef.current + 1) % MAX_BLOBS;
    slotByUserRef.current.set(id, idx);
    return idx;
  }, []);

  // ---------------------------
  // Orbit tiers (inner/mid/outer)
  // ---------------------------
  const [orbitLines, setOrbitLines] = useState(() => ({
    inner: [],
    mid:   [],
    outer: [],
  }));
  const ORBIT_MIN_PER_TIER = 2;
  const ORBIT_MAX_PER_TIER = 4;
  const pickTierForTemp = useCallback((center, temp, humidity = null) => {
    const d = Math.abs((typeof center === 'number' ? center : 23) - (typeof temp === 'number' ? temp : 23));
    if (d <= 1.5) return 'inner';
    if (d <= 3.5) return 'mid';
    return 'outer';
  }, []);
  const pushToOrbitLine = useCallback((entry) => {
    setOrbitLines((prev) => {
      const tier = entry.orbitTier;
      const next = { inner: [...prev.inner], mid: [...prev.mid], outer: [...prev.outer] };
      next[tier].push(entry);
      if (next[tier].length > ORBIT_MAX_PER_TIER) {
        // Eject oldest
        next[tier].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
        next[tier].shift();
      }
      return next;
    });
  }, []);
  // Ensure min two dummies per tier
  const ensureOrbitBaselines = useCallback((climate) => {
    setOrbitLines((prev) => {
      const next = { inner: [...prev.inner], mid: [...prev.mid], outer: [...prev.outer] };
      const tiers = ['inner', 'mid', 'outer'];
      tiers.forEach((t) => {
        while (next[t].length < ORBIT_MIN_PER_TIER) {
          next[t].push({
            userId: `dummy:${t}:${next[t].length}`,
            temp: climate?.temp ?? 23,
            humidity: climate?.humidity ?? 50,
            addedAt: Date.now() - (next[t].length + 1) * 500,
            orbitTier: t,
            zSeed: Math.random(),
          });
        }
      });
      return next;
    });
  }, []);

  useSocketSW1({
    onTimelineStage: (payload) => {
      try {
        const stage = String(payload?.stage || '').toLowerCase();
        const map = { welcome: 't1', voicestart: 't2', voiceinput: 't3', orchestrated: 't4', result: 't5', t1: 't1', t2: 't2', t3: 't3', t4: 't4', t5: 't5' };
        const next = map[stage] || timelineState;
        if (next === 't1') prevTimelineRef.current = 't0';
        if (next !== timelineState) {
          requestStage(next);
        } else if (next === 't3') {
          prevTimelineRef.current = 't2';
          requestStage('t3');
        }
      } catch {}
    },
    onDeviceNewVoice: (payload) => {
      try {
        const uid = payload?.userId ? String(payload.userId) : null;
        if (!uid) return;
        if (DUMMY_ID_REGEX.test(uid)) return;
        setActiveUsers((prev) => {
          const next = new Set(prev);
          next.add(uid);
          return next;
        });
      } catch {}
    },
    onDeviceNewDecision: (msg) => {
      if (!msg || msg.target !== 'sw1') return;
      const env = msg.env || {};
      const clampTempLocal = (t) => {
        if (typeof t !== 'number' || Number.isNaN(t)) return null;
        return Math.round(t);
        };
      const withVariance = (base, offset) => {
        const v = (typeof base === 'number' ? base : 23) + offset;
        return Math.max(18, Math.min(30, Math.round(v)));
      };
      const incomingClimate = {
        temp: typeof env.temp === 'number' ? clampTempLocal(env.temp) : displayClimate.temp,
        humidity: typeof env.humidity === 'number' ? env.humidity : displayClimate.humidity,
      };
      setNextClimate(incomingClimate);
      setHasDecision(true);
      try { window.__sw1DecisionTick = (window.__sw1DecisionTick || 0) + 1; } catch {}
      setTypeTick((x) => x + 1);
      // extended signals for SW1test
      setSceneZoomOutTick((x) => x + 1);
      setEdgeGlowTick((x) => x + 1);
      setEntryAngle(() => Math.round(Math.random() * 360));

      const merged = Array.isArray(msg.mergedFrom) ? msg.mergedFrom : [];
      if (merged.length) {
        setActiveUsers((prev) => {
          const next = new Set(prev);
          merged.forEach((u) => { if (u) next.add(String(u)); });
          return next;
        });
      }
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
                temp: typeof it.temp === 'number' ? clampTempLocal(it.temp) : incomingClimate.temp,
                humidity: typeof it.humidity === 'number' ? it.humidity : incomingClimate.humidity,
                addedAt: Date.now(),
                isNew: false,
              };
              // tier assign
              const tier = pickTierForTemp(incomingClimate.temp, next[idx].temp, next[idx].humidity);
              pushToOrbitLine({ ...next[idx], orbitTier: tier, zSeed: Math.random() });
            });
            return next;
          });
          setActiveUsers(() => {
            const s = new Set(list.map((m) => String(m.userId || '')));
            return s;
          });
        }
      } else if (Array.isArray(merged) && merged.length) {
        const uniq = Array.from(new Set(merged.map((u) => String(u)).filter(Boolean))).slice(0, MAX_BLOBS);
        if (uniq.length) {
          setMiniResults((prev) => {
            const next = [...prev];
            const offsets = [-15, -7, 0, 7, 15];
            uniq.forEach((uid, i) => {
              const idx = pickSlotForUser(uid, next);
              const off = offsets[i % offsets.length];
              next[idx] = {
                userId: uid,
                temp: withVariance(incomingClimate.temp, off),
                humidity: incomingClimate.humidity,
                addedAt: Date.now() - i * 800,
                isNew: false,
              };
              const tier = pickTierForTemp(incomingClimate.temp, next[idx].temp, next[idx].humidity);
              pushToOrbitLine({ ...next[idx], orbitTier: tier, zSeed: Math.random() });
            });
            return next;
          });
          setActiveUsers(() => new Set(uniq));
        }
      } else if (msg.individual && typeof msg.individual === 'object') {
        const it = msg.individual;
        setMiniResults((prev) => {
          const next = [...prev];
          const uid = String(it.userId || `u${Date.now()}`);
          const idx = pickSlotForUser(uid, next);
          next[idx] = {
            userId: uid,
            temp: typeof it.temp === 'number' ? clampTempLocal(it.temp) : incomingClimate.temp,
            humidity: typeof it.humidity === 'number' ? it.humidity : incomingClimate.humidity,
            addedAt: Date.now(),
            isNew: false,
          };
          const tier = pickTierForTemp(incomingClimate.temp, next[idx].temp, next[idx].humidity);
          pushToOrbitLine({ ...next[idx], orbitTier: tier, zSeed: Math.random() });
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
      const uid = String(payload?.userId || '');
      if (uid) keywordByUserRef.current.set(uid, k);
    },
  });

  useEffect(() => () => clearStageTimers(), [clearStageTimers]);

  useEffect(() => {
    const prev = prevTimelineRef.current;
    if (prev === timelineState && timelineState !== 't3') {
      if (timelineState === 't4') {
        clearStageTimers();
        stageTimersRef.current.t5 = setTimeout(() => requestStage('t5'), T4_TO_T5_MS);
      }
      return;
    }
    prevTimelineRef.current = timelineState;
    setStateTick((x) => x + 1);
    clearStageTimers();

    if (timelineState === 't3') {
      setMiniResults((prevList) => prevList.map((r) => (r ? { ...r, isNew: false } : r)));
      playSw12BlobAppearance();
      setEntryBlob({
        id: `entry-${Date.now()}`,
        temp: nextClimate.temp,
        humidity: nextClimate.humidity,
        addedAt: Date.now(),
      });
      ensureOrbitBaselines(nextClimate);
      stageTimersRef.current.t4 = setTimeout(() => requestStage('t4'), T3_TO_T4_MS);
    } else if (timelineState === 't4') {
      setBloomTick((x) => x + 1);
      // orchestration phase start (≈3s)
      setOrchestrateTick((x) => x + 1);
      setTimeout(() => setBurstTick((x) => x + 1), 3000);
      stageTimersRef.current.t5 = setTimeout(() => requestStage('t5'), T4_TO_T5_MS);
    } else if (timelineState === 't5') {
      setEntryBlob(null);
      setMiniResults((prevList) => prevList.map((r) => (r ? { ...r, isNew: false } : r)));
      setDisplayClimate(nextClimate);
    }
  }, [timelineState, clearStageTimers, nextClimate, requestStage]);

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c >= 3 ? 0 : c + 1));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const [miniTextMode, setMiniTextMode] = useState('value');
  const [miniTextVisible, setMiniTextVisible] = useState(true);
  useEffect(() => {
    let startTimer;
    let hideTimer;
    let nextCycleTimer;
    const runCycle = () => {
      setMiniTextVisible(false);
      hideTimer = setTimeout(() => {
        setMiniTextMode((prev) => (prev === 'value' ? 'label' : 'value'));
        setMiniTextVisible(true);
        nextCycleTimer = setTimeout(runCycle, 7000);
      }, 260);
    };
    startTimer = setTimeout(() => { runCycle(); }, 7000);
    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (nextCycleTimer) clearTimeout(nextCycleTimer);
    };
  }, []);

  const classifyTempLabel = (t) => {
    if (t == null || Number.isNaN(t)) return '';
    const temp = Math.round(t);
    if (temp <= 20) return 'Cool';
    if (temp <= 23) return 'Fresh';
    if (temp <= 26) return 'Comfortable';
    if (temp <= 28) return 'Warm';
    return 'Hot';
  };
  const classifyHumidityLabel = (h) => {
    if (h == null || Number.isNaN(h)) return "";
    const hum = Math.round(h);
    if (hum <= 29) return "Dry";
    if (hum <= 45) return "Balanced";
    if (hum <= 60) return "Moist";
    if (hum <= 70) return "Humid";
    return "Foggy";
  };

  // Flatten orbit tiers → blob configs (angle and radius per tier)
  const miniBlobDisplay = useMemo(() => {
    // Build tier arrays ensuring minima
    const tiers = ['inner', 'mid', 'outer'];
    const base = { inner: [...orbitLines.inner], mid: [...orbitLines.mid], outer: [...orbitLines.outer] };
    tiers.forEach((t) => {
      while (base[t].length < ORBIT_MIN_PER_TIER) {
        base[t].push({
          userId: `dummy:${t}:${base[t].length}`,
          temp: displayClimate?.temp ?? 23,
          humidity: displayClimate?.humidity ?? 50,
          addedAt: Date.now() - (base[t].length + 1) * 400,
          orbitTier: t,
          zSeed: Math.random(),
        });
      }
    });
    // Angle presets per tier
    const anglesFor = (n, offset = 0) =>
      Array.from({ length: n }, (_, i) => Math.round(offset + (360 / n) * i));
    const ANGLE_PRESETS = {
      // 미니/중간 블롭은 십자 형태를 느낄 수 있도록 축을 나누고,
      // outer(대 블롭)는 기존 위치를 유지해 전체가 너무 딱딱해 보이지 않게 한다.
      inner: [-90, 90],   // 위/아래 축 (작은 블롭)
      mid: [0, 180],      // 좌/우 축 (중간 블롭)
      outer: [-140, 40],  // 큰 블롭: 약간 비틀린 좌상/우측
    };
    // inner: 화이트 코어에 거의 붙어서 도는 수준
    // mid: 중앙 메인 블롭과 절반 정도 겹치며 도는 아크
    // outer: 기존 외곽 궤도 유지
    const radiusByTier = { inner: 0.70, mid: 1.20, outer: 2.05 };
    const depthByTier = { inner: 0, mid: 1, outer: 2 };
    const out = [];
    tiers.forEach((tier, tierIndex) => {
      const list = base[tier].slice(0, ORBIT_MAX_PER_TIER);
      const angles =
        list.length === 2 && ANGLE_PRESETS[tier]
          ? ANGLE_PRESETS[tier]
          : anglesFor(list.length, tierIndex * 10);
      list.forEach((r, i) => {
        const temp = r?.temp ?? displayClimate?.temp ?? 23;
        const hum = r?.humidity ?? displayClimate?.humidity ?? 50;
        // 중앙 상태(displayClimate)와의 차이에 따라 블롭 크기/반경을 살짝 조정
        const dTemp = Math.abs((displayClimate?.temp ?? 23) - temp);
        const dHum = Math.abs((displayClimate?.humidity ?? 50) - hum);
        const intensity = Math.min(1.0, (dTemp / 8 + dHum / 40)); // 0~1 근사
        const radiusScale = 1 + intensity * 0.35; // 최대 약 35%까지 밖으로
        const sizeScale = 1 + intensity * 0.3;    // 최대 약 30%까지 커짐
        out.push({
          id: `${tier}-${i}`,
          componentKey: 'Sw1TestOrbitBlob',
          angleDeg: angles[i] ?? 0,
          depthLayer: depthByTier[tier],
          radiusFactor: radiusByTier[tier],
          radiusFactorDynamic: radiusByTier[tier] * radiusScale,
          zSeed: r.zSeed ?? Math.random(),
          sizeBoost: computeAgeSizeBoost(r.addedAt || Date.now()) * sizeScale,
          tier,
          temp,
          humidity: hum,
          topValue: temp != null ? `${temp}℃` : '',
          topLabel: classifyTempLabel(temp),
          bottomValue: hum != null ? `${Math.round(hum)}%` : '',
          bottomLabel: classifyHumidityLabel(hum),
        });
      });
    });
    // Fallback when orbitLines empty → use legacy ensureBlobCount
    if (!out.length) {
      const filled = ensureBlobCount(miniResults, displayClimate, 4, MAX_BLOBS);
      return SW1TEST_BLOB_CONFIGS.slice(0, filled.length).map((cfg, idx) => {
        const r = filled[idx];
        const tempVal = r?.temp != null ? `${r.temp}℃` : '';
        const tempLabel = classifyTempLabel(r?.temp);
        const humVal = r?.humidity != null ? `${Math.round(r.humidity)}%` : '';
        const humLabel = classifyHumidityLabel(r?.humidity);
        return {
          ...cfg,
          radiusFactorDynamic: cfg.radiusFactor ?? 1.55,
          sizeBoost: computeAgeSizeBoost(r?.addedAt || 0),
          isNew: Boolean(r?.isNew),
          temp: r?.temp ?? null,
          humidity: r?.humidity ?? null,
          topValue: tempVal,
          topLabel: tempLabel,
          bottomValue: humVal,
          bottomLabel: humLabel,
          depthLayer: cfg.depthLayer ?? 1,
          radiusFactor: cfg.radiusFactor ?? 1.55,
          zSeed: zSeeds[idx] ?? 0,
        };
      });
    }
    return out;
  }, [orbitLines, displayClimate, miniResults, zSeeds]);

  // Legacy builder kept for fallback path
  const legacyBlobDisplay = useMemo(() => {
    const filled = ensureBlobCount(miniResults, displayClimate, 4, MAX_BLOBS);
    return SW1TEST_BLOB_CONFIGS.slice(0, filled.length).map((cfg, idx) => {
      const r = filled[idx];
      const tempVal = r?.temp != null ? `${r.temp}℃` : '';
      const tempLabel = classifyTempLabel(r?.temp);
      const humVal = r?.humidity != null ? `${Math.round(r.humidity)}%` : '';
      const humLabel = classifyHumidityLabel(r?.humidity);
      const addedAt = r?.addedAt || 0;
      const ageScale = computeAgeSizeBoost(addedAt);
      const radiusScale = computeSimilarityRadiusScale(displayClimate?.temp, r?.temp, { near: 1.0, far: 1.8, normalizeRange: 12 });
      const rfRaw = (cfg.radiusFactor ?? 1.55) * radiusScale;
      const rfClamped = Math.max(1.18, Math.min(2.10, rfRaw));
      return {
        ...cfg,
        radiusFactorDynamic: rfClamped,
        sizeBoost: ageScale,
        isNew: Boolean(r?.isNew),
        temp: r?.temp ?? null,
        humidity: r?.humidity ?? null,
        topValue: tempVal,
        topLabel: tempLabel,
        bottomValue: humVal,
        bottomLabel: humLabel,
        depthLayer: cfg.depthLayer ?? 1,
        radiusFactor: cfg.radiusFactor ?? 1.55,
        zSeed: zSeeds[idx] ?? 0,
      };
    });
  }, [miniResults, zSeeds, displayClimate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMiniResults((prev) => {
        if (!prev || !prev.length) return prev;
        const now = Date.now();
        let removedThisTick = false;
        const next = [...prev];
        for (let i = 0; i < next.length; i += 1) {
          const r = next[i];
          if (!r) continue;
          const uid = String(r.userId || '');
          if (!uid || DUMMY_ID_REGEX.test(uid)) continue;
          const addedAt = r.addedAt || 0;
          if (!removedThisTick && addedAt && now - addedAt > 60_000) {
            next[i] = null;
            slotByUserRef.current.delete(uid);
            removedThisTick = true;
          }
        }
        return removedThisTick ? next : prev;
      });
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const isReal = (id) => id && !DUMMY_ID_REGEX.test(String(id));
      const curr = new Set(miniResults.map((r) => (r && r.userId) ? String(r.userId) : '').filter((id) => isReal(id)));
      const prev = prevRealUsersRef.current || new Set();
      let newCount = 0;
      curr.forEach((id) => { if (!prev.has(id)) newCount += 1; });
      if (newCount > 0) playSwBlobBurstForNewUsers(newCount, 0.6, 80);
      prevRealUsersRef.current = curr;
    } catch {}
  }, [miniResults]);

  const participantCount = useMemo(() => activeUsers.size || 0, [activeUsers]);

  return {
    blobConfigs: miniBlobDisplay.length ? miniBlobDisplay : legacyBlobDisplay,
    entryBlob,
    entryAngle,
    centerTemp: displayClimate?.temp ?? 23,
    centerHumidity: displayClimate?.humidity ?? 50,
    participantCount,
    dotCount,
    decisionTick: (typeof window !== 'undefined' && window.__sw1DecisionTick) || 0,
    timelineState,
    stateTick,
    bloomTick,
    typeTick,
    sceneZoomOutTick,
    edgeGlowTick,
    orchestrateTick,
    burstTick,
    miniTextMode,
    miniTextVisible,
    hasDecision,
  };
}


