import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import useSocketSW1 from '@/utils/hooks/useSocketSW1';
import { playSwBlobBurstForNewUsers, playSw12BlobAppearance } from '@/utils/data/soundeffect';
import { ensureBlobCount, computeAgeSizeBoost, computeSimilarityRadiusScale } from './moving';

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
  // 추가 슬롯(최대 10개까지 확장 가능)
  { id: 'slot6', componentKey: 'Sw1OrbitBlob', angleDeg: -60,  depthLayer: 2, radiusFactor: 1.62 },
  { id: 'slot7', componentKey: 'Sw1OrbitBlob', angleDeg: 60,   depthLayer: 1, radiusFactor: 1.68 },
  { id: 'slot8', componentKey: 'Sw1OrbitBlob', angleDeg: 0,    depthLayer: 2, radiusFactor: 1.50 },
  { id: 'slot9', componentKey: 'Sw1OrbitBlob', angleDeg: -120, depthLayer: 1, radiusFactor: 1.55 },
  { id: 'slot10',componentKey: 'Sw1OrbitBlob', angleDeg: 110,  depthLayer: 2, radiusFactor: 1.65 },
];

const MAX_BLOBS = SW1_BLOB_CONFIGS.length;
// Timeline durations (ms) for staged animations
const T3_TO_T4_MS = 5000; // allow t3 bloom/entry motion to finish
const T4_TO_T5_MS = 3800; // allow t4 merge/background pulses to finish
const DUMMY_ID_REGEX = /^dummy:/;

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
  // Center climate result (UI-visible)
  const [displayClimate, setDisplayClimate] = useState({ temp: 23, humidity: 50 });
  // Next climate from incoming decision (applied at T5)
  const [nextClimate, setNextClimate] = useState({ temp: 23, humidity: 50 });
  const [dotCount, setDotCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(new Set());
  const [timelineState, setTimelineState] = useState('t1'); // t1..t5
  const [stateTick, setStateTick] = useState(0);
  const [bloomTick, setBloomTick] = useState(0); // 중앙 블룸 트리거 (T4 진입 시점)
  const [typeTick, setTypeTick] = useState(0);  // T4 타이포 라이즈 트리거
  // 첫 번째 디시전 도착 여부 (도착 전에는 텍스트/컬러를 기본 상태로 유지)
  const [hasDecision, setHasDecision] = useState(false);
  // 각 스테이지 전환/이펙트용 타이머
  const stageTimersRef = useRef({ t3Bloom: null, t4: null, t5: null });
  const prevTimelineRef = useRef('t1');
  const stageOrder = ['t1', 't2', 't3', 't4', 't5'];

  const clearStageTimers = useCallback(() => {
    Object.values(stageTimersRef.current || {}).forEach((id) => {
      if (id) clearTimeout(id);
    });
    stageTimersRef.current = { t3Bloom: null, t4: null, t5: null };
  }, []);

  const requestStage = useCallback((next) => {
    if (!stageOrder.includes(next)) return;
    setTimelineState((prev) => {
      const prevIdx = stageOrder.indexOf(prev);
      const nextIdx = stageOrder.indexOf(next);
      // T3 재진입 허용 (재시작 후 재진입 대응)
      if (nextIdx <= prevIdx && next !== 't3') {
        // T4→T4 중복 신호 시에도 타이머 재Arm을 허용하기 위해 상태는 유지하되 tick만 올림
        if (prev === 't4' && next === 't4') {
          setStateTick((x) => x + 1);
        }
        return prev;
      }
      return next;
    });
  }, []);

  // Mini blobs: per-user results (up to MAX_BLOBS). Start with dummy values.
  const [miniResults, setMiniResults] = useState(() => []);
  // 단독 진입 애니메이션용 엔트리 블롭 (오빗과 독립)
  const [entryBlob, setEntryBlob] = useState(null);
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
    onTimelineStage: (payload) => {
      try {
        const stage = String(payload?.stage || '').toLowerCase();
        // map server names to t1..t5
        const map = {
          welcome: 't1',
          voicestart: 't2',
          voiceinput: 't3',
          orchestrated: 't4',
          result: 't5',
          t1: 't1', t2: 't2', t3: 't3', t4: 't4', t5: 't5',
        };
        const next = map[stage] || timelineState;
        // 재시작 시 (t1로 리셋) prevTimelineRef도 리셋
        if (next === 't1') {
          prevTimelineRef.current = 't0'; // 존재하지 않는 값으로 리셋
        }
        if (next !== timelineState) {
          requestStage(next);
        } else if (next === 't3') {
          // 같은 t3 상태지만 재시작 후 재진입인 경우 강제로 트리거
          prevTimelineRef.current = 't2'; // 이전 상태를 t2로 설정하여 useEffect가 실행되도록
          requestStage('t3');
        }
      } catch {}
    },
    // SW2와 동일하게, device-new-voice 에서도 userId 기준으로 참여자 수를 집계
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
      // Controller가 범위(18~30℃)를 보장해야 함. 여기서는 수신값을 신뢰한다.
      // 단, 로컬에서 합성하는 fallback(variance)에는 최소한의 안전 클램프만 적용.
      const clampTempLocal = (t) => {
        if (typeof t !== 'number' || Number.isNaN(t)) return null;
        return Math.round(t);
      };
      const withVariance = (base, offset) => {
        const v = (typeof base === 'number' ? base : 23) + offset;
        // 합성 데이터만 18~30으로 한정해 시각적 일관성 유지
        return Math.max(18, Math.min(30, Math.round(v)));
      };
      const incomingClimate = {
        temp: typeof env.temp === 'number' ? clampTempLocal(env.temp) : displayClimate.temp,
        humidity: typeof env.humidity === 'number' ? env.humidity : displayClimate.humidity,
      };
      setNextClimate(incomingClimate);
      setHasDecision(true);
      try { window.__sw1DecisionTick = (window.__sw1DecisionTick || 0) + 1; } catch {}
      // T4: 디시전 수신 시 타이포/상태 갱신 트리거
      // 중앙 블룸은 하단 엔트리 블롭이 실제로 중앙에 도달하는 타이밍(T3 후반)에 맞춰
      // timelineState === 't3' 처리(useEffect)에서만 한 번 트리거한다.
      setTypeTick((x) => x + 1);

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
                temp: typeof it.temp === 'number' ? clampTempLocal(it.temp) : incomingClimate.temp,
                humidity: typeof it.humidity === 'number' ? it.humidity : incomingClimate.humidity,
                addedAt: Date.now(),
                // 외부 업데이트는 신규 입장으로 취급하지 않음
                isNew: false,
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
            const offsets = [-15, -7, 0, 7, 15]; // spread ≈ 30°
            uniq.forEach((uid, i) => {
              const idx = pickSlotForUser(uid, next);
              const off = offsets[i % offsets.length];
              next[idx] = {
                userId: uid,
                temp: withVariance(incomingClimate.temp, off),
                humidity: incomingClimate.humidity,
                addedAt: Date.now() - i * 800,
                isNew: false, // fallback 생성은 항상 기존 블롭으로 취급
              };
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
            temp: typeof it.temp === 'number' ? clampTempLocal(it.temp) : incomingClimate.temp,
            humidity: typeof it.humidity === 'number' ? it.humidity : incomingClimate.humidity,
            addedAt: Date.now(),
            isNew: false, // 개별 업데이트도 신규 입장으로 취급하지 않음
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

  useEffect(() => () => clearStageTimers(), [clearStageTimers]);

  useEffect(() => {
    const prev = prevTimelineRef.current;
    // T3 진입 시 항상 실행되도록 (재시작 후 재진입 대응)
    if (prev === timelineState && timelineState !== 't3') {
      // 중복 t4 신호로 들어온 경우: 타이머 재Arm만 허용
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
      // 기존 오빗 블롭은 그대로 두고, 진입용 블롭만 별도 상태에 생성
      setMiniResults((prevList) => prevList.map((r) => (r ? { ...r, isNew: false } : r)));
      // 화면 밖 하단에서 중앙으로 올라오는 엔트리 블롭 애니메이션 시작 시 효과음 1회 재생
      playSw12BlobAppearance();
      setEntryBlob({
        id: `entry-${Date.now()}`,
        temp: nextClimate.temp,
        humidity: nextClimate.humidity,
        addedAt: Date.now(),
      });
      stageTimersRef.current.t4 = setTimeout(() => requestStage('t4'), T3_TO_T4_MS);
    } else if (timelineState === 't4') {
      // 하단 엔트리 블롭이 이미 중앙에 도달해 있는 상태에서
      // 중앙 그라데이션/화이트 버스트가 한 번 강하게 빛나도록 T4 진입 시 bloomTick 트리거
      setBloomTick((x) => x + 1);
      stageTimersRef.current.t5 = setTimeout(() => requestStage('t5'), T4_TO_T5_MS);
    } else if (timelineState === 't5') {
      setEntryBlob(null);
      setMiniResults((prevList) => prevList.map((r) => (r ? { ...r, isNew: false } : r)));
      setDisplayClimate(nextClimate);
    }
  }, [timelineState, clearStageTimers, nextClimate, requestStage]);

  // Dots animation
  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c >= 3 ? 0 : c + 1));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // 미니 블롭 텍스트 모드 토글: 값(value) ↔ 카테고리(label)
  // - 초기 6초 동안은 실제 값(°C / %) 유지
  // - 이후 5초 간격으로 값/카테고리를 계속 스위칭
  // - 전환 시에는 먼저 서서히 페이드아웃 → 내용 교체 → 다시 페이드인
  const [miniTextMode, setMiniTextMode] = useState('value'); // 'value' | 'label'
  const [miniTextVisible, setMiniTextVisible] = useState(true);
  useEffect(() => {
    let startTimer;
    let hideTimer;
    let nextCycleTimer;

    const runCycle = () => {
      // 1) 기존 텍스트 서서히 사라지기
      setMiniTextVisible(false);
      hideTimer = setTimeout(() => {
        // 2) 내용 교체 (값 ↔ 라벨)
        setMiniTextMode((prev) => (prev === 'value' ? 'label' : 'value'));
        // 3) 새 텍스트 페이드인
        setMiniTextVisible(true);
        // 4) 다음 전환까지 5초 대기
        nextCycleTimer = setTimeout(runCycle, 5000);
      }, 260); // CSS transition(약 260ms)에 맞춰 살짝 먼저 완전히 사라지게
    };

    // 초기 6초 동안은 값 모드 그대로 유지
    startTimer = setTimeout(() => {
      runCycle();
    }, 6000);

    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (nextCycleTimer) clearTimeout(nextCycleTimer);
    };
  }, []);

  // 미니 블롭 값 → 카테고리 매핑
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

  // Derive mini-blob display text set (값/카테고리 토글 지원)
  const miniBlobDisplay = useMemo(() => {
    // 항상 최소 4개 슬롯은 유지하되, 최대 10개까지만 화면에 배치
    const filled = ensureBlobCount(miniResults, displayClimate, 4, MAX_BLOBS);
    return SW1_BLOB_CONFIGS.slice(0, filled.length).map((cfg, idx) => {
      const r = filled[idx];
      const tempVal = r?.temp != null ? `${r.temp}℃` : '';
      const tempLabel = classifyTempLabel(r?.temp);
      const humVal = r?.humidity != null ? `${Math.round(r.humidity)}%` : '';
      const humLabel = classifyHumidityLabel(r?.humidity);
      const addedAt = r?.addedAt || 0;
      // size boost by age
      const ageScale = computeAgeSizeBoost(addedAt);
      // similarity-based radius scale
      // 유사도 반경: 너무 가까워져 가려지는 문제를 방지하기 위해 near 상향, 변화 곡선 완화
      const radiusScale = computeSimilarityRadiusScale(
        displayClimate?.temp,
        r?.temp,
        { near: 1.0, far: 1.8, normalizeRange: 12 }
      );
      // 최솟값/최댓값 가드로 시각적 안정성 확보
      const rfRaw = (cfg.radiusFactor ?? 1.55) * radiusScale;
      const rfClamped = Math.max(1.18, Math.min(2.10, rfRaw));
      return {
        ...cfg,
        radiusFactorDynamic: rfClamped,
        sizeBoost: ageScale,
        isNew: Boolean(r?.isNew),
        // per-blob 기후값 및 텍스트 모드별 문자열
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

  // 오래된 실사용자 블롭은 1분에 하나씩 자연스럽게 제거 (최대 10개까지 유지)
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
          if (!uid || DUMMY_ID_REGEX.test(uid)) continue; // 더미는 유지
          const addedAt = r.addedAt || 0;
          // 60초 이상 지난 실사용자 블롭을 한 번에 하나씩만 제거
          if (!removedThisTick && addedAt && now - addedAt > 60_000) {
            next[i] = null;
            slotByUserRef.current.delete(uid);
            removedThisTick = true;
          }
        }
        return removedThisTick ? next : prev;
      });
    }, 10_000); // 10초마다 검사 → 1분 이상된 블롭을 순차적으로 하나씩 제거

    return () => clearInterval(interval);
  }, []);

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
        // Play once per new blob; lightly throttle by chaining micro-delays (centralized in soundeffect helpers)
        playSwBlobBurstForNewUsers(newCount, 0.6, 80);
      }
      prevRealUsersRef.current = curr;
    } catch {}
  }, [miniResults]);

  // Derive participant count robustly (no stale state): max of unique active users and non-dummy mini slots
  const participantCount = useMemo(() => {
    return activeUsers.size || 0;
  }, [activeUsers]);


  return {
    blobConfigs: miniBlobDisplay,
    entryBlob,
    centerTemp: displayClimate?.temp ?? 23,
    centerHumidity: displayClimate?.humidity ?? 50,
    participantCount,
    dotCount,
    decisionTick: (typeof window !== 'undefined' && window.__sw1DecisionTick) || 0,
    timelineState,
    stateTick,
    bloomTick,
    typeTick,
    miniTextMode,
    miniTextVisible,
    hasDecision,
  };
}


