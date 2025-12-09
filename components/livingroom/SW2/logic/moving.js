// SW2 moving helpers (structure aligned with SW1)
// SW2 타임라인 단계별( t1~t5 ) 프론트 연출용 메타 데이터
// - 백엔드 payload 포맷에는 영향을 주지 않는다.
export const TIMELINE_STATES = {
  t1: {
    name: 'idle',
  },
  t2: {
    name: 'voice-start',
  },
  // t3: 하단 중앙에서 등장한 원이 상단 원으로 서서히 이동하는 구간 (약 2초)
  t3: {
    name: 'entry-move',
    entryToCenterMs: 2000,
  },
  // t4: t3에서 올라온 원이 상단 원 속으로 들어가며 빛나는 구간 (약 4초)
  t4: {
    name: 'merge-and-bloom',
    mergeMs: 4000,
  },
  // t5: 배경과 상단 원이 함께 빛나면서 원래 상태로 서서히 복귀하는 구간 (약 2초)
  t5: {
    name: 'restore',
    restoreMs: 2000,
  },
};

export function getOrbitMotion(seed = 0) {
  return {
    innerParallaxSec: 36,
    zPulseSec: 14 + Math.round(seed * 6),
    orbitBreathSec: 22 + Math.round(seed * 8),
    delays: { z: Math.round(seed * 3), orbit: 2 + Math.round(seed * 4) },
  };
}


