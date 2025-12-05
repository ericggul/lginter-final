// SW2 moving helpers (structure aligned with SW1)
export const TIMELINE_STATES = {
  t1: { name: 'idle' },
  t2: { name: 'active1' },
  t3: { name: 'active2' },
  t4: { name: 'active3' },
  t5: { name: 'active4' },
};

export function getOrbitMotion(seed = 0) {
  return {
    innerParallaxSec: 36,
    zPulseSec: 14 + Math.round(seed * 6),
    orbitBreathSec: 22 + Math.round(seed * 8),
    delays: { z: Math.round(seed * 3), orbit: 2 + Math.round(seed * 4) },
  };
}


