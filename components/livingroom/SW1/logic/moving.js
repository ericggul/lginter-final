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


