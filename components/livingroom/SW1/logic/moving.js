// Motion parameter helpers for SW1 mini blobs
export function getOrbitMotion(seed = 0) {
  return {
    innerParallaxSec: 48,
    zPulseSec: 16 + Math.round(seed * 9),
    orbitBreathSec: 26 + Math.round(seed * 8),
    delays: { z: Math.round(seed * 4), orbit: 2 + Math.round(seed * 5) },
  };
}

export function getDelays(seed = 0) {
  return {
    zDelay: Math.round(seed * 4),
    orbitDelay: 2 + Math.round(seed * 5),
  };
}

// ---------------------------
// Timeline moving parameters
// ---------------------------
// Central/miniblob behaviors per timeline stage (t1..t5)
export const TIMELINE_STATES = {
  t1: {
    name: 'idle',
    central: { breathAmplitude: 0.04, breathSec: 9, blurExtraPx: 0, bloomOnce: false },
    mini: { flowSpeed: 1.0, emitOneFromCenter: false, mergeSpacingFactor: 1.0, newBlobSizeBoost: 1.12 },
  },
  t2: {
    name: 'active1',
    central: { breathAmplitude: 0.04, breathSec: 9, blurExtraPx: 8, bloomOnce: false, showOrchestratingIndicator: true },
    mini: { flowSpeed: 1.0, emitOneFromCenter: false, mergeSpacingFactor: 1.0, newBlobSizeBoost: 1.12 },
  },
  t3: {
    name: 'active2',
    central: { breathAmplitude: 0.05, breathSec: 9, blurExtraPx: 6, bloomOnce: true, bloomDurationMs: 2000 },
    mini: { flowSpeed: 1.0, emitOneFromCenter: true, mergeSpacingFactor: 1.1, newBlobSizeBoost: 1.18 },
  },
  t4: {
    name: 'active3',
    central: { breathAmplitude: 0.05, breathSec: 9, blurExtraPx: 6, bloomOnDecision: true, bloomDurationMs: 2000, typeRise: true },
    mini: { flowSpeed: 1.0, emitOneFromCenter: false, mergeSpacingFactor: 1.1, newBlobSizeBoost: 1.20 },
  },
  t5: {
    name: 'active4',
    central: { breathAmplitude: 0.04, breathSec: 9, blurExtraPx: 0, bloomOnce: false },
    mini: { flowSpeed: 1.0, emitOneFromCenter: false, mergeSpacingFactor: 1.0, newBlobSizeBoost: 1.10, similarityRadiusScale: true },
  },
};

// ---------------------------
// Similarity/size helpers
// ---------------------------
export function computeSimilarityRadiusScale(centerTemp, blobTemp, options = {}) {
  const { near = 0.88, far = 1.12, normalizeRange = 20 } = options;
  const base = typeof centerTemp === 'number' ? centerTemp : 23;
  const t = typeof blobTemp === 'number' ? blobTemp : base;
  const diff = Math.abs(t - base);
  const s = Math.max(0, Math.min(1, diff / normalizeRange)); // 0..1
  return near + (far - near) * s;
}

export function computeAgeSizeBoost(addedAt, now = Date.now(), options = {}) {
  const { min = 0.85, max = 1.2, decayPerSec = 0.05 } = options;
  if (!addedAt) return 1;
  const ageSec = Math.max(0, (now - addedAt) / 1000);
  const value = max - ageSec * decayPerSec;
  return Math.max(min, Math.min(max, value));
}

// Ensure list length between min..max by adding simple dummies
export function ensureBlobCount(list, climate, min = 3, max = 7) {
  const out = [...(list || [])].slice(0, max);
  const missing = Math.max(0, min - out.filter(Boolean).length);
  for (let i = 0; i < missing; i += 1) {
    out[i] = out[i] || {
      userId: `dummy:${i}`,
      temp: climate?.temp ?? 23,
      humidity: climate?.humidity ?? 50,
      addedAt: Date.now() - (i + 1) * 500,
      isNew: false,
    };
  }
  return out.slice(0, max);
}


