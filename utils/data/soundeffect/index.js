// Central manifest + playback helpers for sound effects used in the installation.
// - /api/sfx 라우트는 여기 정의된 파일명을 기준으로 utils/data/soundeffect/*.mp3 를 서빙함.
// - 각 페이지/컴포넌트에서는 "언제" 재생할지만 결정하고,
//   "무슨 파일을 어떤 볼륨/패턴으로 재생할지"는 이 모듈에서 한 번에 관리한다.

import { playSfx } from '@/utils/hooks/useSound';

export const SOUND_EFFECTS = {
  /** 
   * SBM1 입구 화면용 QR 코드 스캔 효과음
   *
   * 파일: utils/data/soundeffect/qrcodesbm1.mp3
   * 라우트: /api/sfx?name=qrcodesbm1  또는  /api/sfx?file=qrcodesbm1.mp3
   *
   * 사용 위치:
   *   - components/entrance/SBM1/logic.js
   *     - useSbm1 훅 내부
   *     - 모바일에서 QR을 새로 스캔하면 socket `onEntranceNewUser` / `onEntranceNewName`
   *       → tip 상태 false → true 전환
   *       → TIP 상단 텍스트 애니메이션이 시작될 때 playSfx('qrcodesbm1') 1회 재생
   */
  SBM1_QR: {
    id: 'qrcodesbm1',
    file: 'qrcodesbm1.mp3',
    pages: ['SBM1 (components/entrance/SBM1)'],
    triggers: [
      'Entrance socket onEntranceNewUser / onEntranceNewName -> tip true (상단 TIP 텍스트 시퀀스 시작 시 1회 재생)',
    ],
  },

  /**
   * TV1 키워드 블롭 등장 효과음
   *
   * 파일: utils/data/soundeffect/keywordblobtv1.mp3
   * 라우트: /api/sfx?name=keywordblobtv1  또는  /api/sfx?file=keywordblobtv1.mp3
   *
   * 사용 위치:
   *   - components/entrance/TV1/logic.js
   *     - createSocketHandlers → onEntranceNewVoice
   *     - entrance-new-voice 이벤트로 새로운 감정 키워드/문장이 들어올 때마다
   *       상단 키워드 블롭 생성과 함께
   *       new Audio('/api/sfx?name=keywordblobtv1') 로 1회 재생
   */
  TV1_KEYWORD: {
    id: 'keywordblobtv1',
    file: 'keywordblobtv1.mp3',
    pages: ['TV1 (components/entrance/TV1)'],
    triggers: [
      'Entrance socket onEntranceNewVoice -> 새로운 키워드 블롭 등장 시 1회 재생',
    ],
  },

  /**
   * SW1 / SW2 음악-감정 블롭 공용 효과음
   *
   * 파일: utils/data/soundeffect/blobsw12.mp3
   * 라우트: /api/sfx?name=blobsw12  또는  /api/sfx?file=blobsw12.mp3
   *
   * 사용 위치:
   *   - components/livingroom/SW1/logic/mainlogic.js
   *     - 실시간 사용자 감정 블롭이 새로 생성될 때
   *       newCount 개수만큼 playSfx('blobsw12', { volume: 0.6 }) 를
   *       짧은 딜레이(i * 80ms)를 두고 연속 재생 (블롭 생성 연타감)
   *
   *   - components/livingroom/SW2/logic.js
   *     - keywords 배열의 마지막 텍스트(tail)가 바뀔 때마다
   *       playSfx('blobsw12', { volume: 0.5 }) 1회 재생
   */
  SW_BLOB: {
    id: 'blobsw12',
    file: 'blobsw12.mp3',
    pages: [
      'SW1 (components/livingroom/SW1)',
      'SW2 (components/livingroom/SW2)',
    ],
    triggers: [
      'SW1 mainlogic: 새로운 감정 블롭들이 생성될 때, 개수만큼 짧게 반복 재생',
      'SW2 logic: keywords 마지막 텍스트가 변경될 때마다 1회 재생',
    ],
  },

  /**
   * Mobile ORCHESTRATING 시퀀스 효과음
   *
   * 파일: utils/data/soundeffect/loading-_complete.mp3
   * 라우트: /api/sfx?name=loading-_complete  또는  /api/sfx?file=loading-_complete.mp3
   *
   * 사용 위치:
   *   - components/mobile/index.js (+ useOrchestratingTransitions)
   *     - 사용자가 name/mood 입력을 제출한 뒤
   *       ORCHESTRATING 화면이 시작되는 시점(loading=true 전환)에 1회 재생
   */
  MOBILE_ORCHESTRATING: {
    id: 'loading-_complete',
    file: 'loading-_complete.mp3',
    pages: ['Mobile (components/mobile)'],
    triggers: [
      'Mobile: 사용자가 input을 제출하고 ORCHESTRATING 텍스트 시퀀스가 시작되는 시점에 1회 재생',
    ],
  },

  /**
   * TV2 전체 화면 전환 효과음
   *
   * 파일: utils/data/soundeffect/tv2_transition.mp3
   * 라우트: /api/sfx?name=tv2_transition  또는  /api/sfx?file=tv2_transition.mp3
   *
   * 사용 위치:
   *   - components/livingroom/TV2/index.js
   *     - 모바일에서 새로운 결정(env)이 도착해 TV2가 T4 시퀀스로 진입하며
   *       화면 전체가 전환될 때(decisionKey 증가 + triggerT4Animations=true) 1회 재생
   */
  TV2_TRANSITION: {
    id: 'tv2_transition',
    file: 'tv2_transition.mp3',
    pages: ['TV2 (components/livingroom/TV2)'],
    triggers: [
      'TV2: 새로운 모바일 input으로 env가 바뀌어 T4 전체 화면 트렌지션이 시작될 때 1회 재생',
    ],
  },

  /**
   * SW1 / SW2 엔트리 블롭 등장 효과음
   *
   * 파일: utils/data/soundeffect/sw12_blobappearance.mp3
   * 라우트: /api/sfx?name=sw12_blobappearance  또는  /api/sfx?file=sw12_blobappearance.mp3
   *
   * 사용 위치:
   *   - SW1: components/livingroom/SW1/logic/mainlogic.js
   *     - timelineState 가 t3 로 진입하면서, 화면 밖 하단에서 중앙으로 올라오는
   *       엔트리 블롭(entryBlob) 애니메이션이 시작될 때 1회 재생
   *
   *   - SW2: components/livingroom/SW2/index.js
   *     - timelineState 가 t3 로 전환되고, EntryCircle 이 화면 하단에서 상단으로
   *       이동하기 시작하는 시퀀스에 맞춰 1회 재생
   */
  SW12_BLOB_APPEARANCE: {
    id: 'sw12_blobappearance',
    file: 'sw12_blobappearance.mp3',
    pages: [
      'SW1 (components/livingroom/SW1)',
      'SW2 (components/livingroom/SW2)',
    ],
    triggers: [
      'SW1: timeline t3 진입 시, 하단에서 중앙으로 올라오는 엔트리 블롭 애니메이션 시작에 맞춰 1회 재생',
      'SW2: timeline t3 진입 시, EntryCircle 이 화면 밖 하단에서 상단으로 이동하기 시작할 때 1회 재생',
    ],
  },

  /**
   * Mobile 전체 화면용 은은한 백그라운드 음악
   *
   * 파일: utils/data/soundeffect/lg_mobile_251211.mp3
   * 라우트: /api/sfx?name=lg_mobile_251211  또는  /api/sfx?file=lg_mobile_251211.mp3
   *
   * 사용 위치:
   *   - components/mobile/index.js
   *     - 모바일 앱이 마운트된 동안, 아주 낮은 볼륨으로 loop 재생
   */
  MOBILE_BG_MUSIC: {
    id: 'lg_mobile_251211',
    file: 'lg_mobile_251211.mp3',
    pages: ['Mobile (components/mobile)'],
    triggers: [
      'Mobile: 앱이 마운트되어 있는 동안, 은은한 백그라운드 음악으로 loop 재생',
    ],
  },

  /**
   * SW1 전체 화면용 은은한 백그라운드 음악
   *
   * 파일: utils/data/soundeffect/lg_sw1_01_251211.mp3
   * 라우트: /api/sfx?name=lg_sw1_01_251211  또는  /api/sfx?file=lg_sw1_01_251211.mp3
   *
   * 사용 위치:
   *   - components/livingroom/SW1
   *     - SW1 화면이 열려 있는 동안, 아주 낮은 볼륨으로 loop 재생
   */
  SW1_BG_MUSIC: {
    id: 'lg_sw1_01_251211',
    file: 'lg_sw1_01_251211.mp3',
    pages: ['SW1 (components/livingroom/SW1)'],
    triggers: [
      'SW1: 화면이 마운트되어 있는 동안, 은은한 백그라운드 음악으로 loop 재생',
    ],
  },

  /**
   * TV1 전체 화면용 은은한 백그라운드 음악
   *
   * 파일: utils/data/soundeffect/lg_tv1_251211.mp3
   * 라우트: /api/sfx?name=lg_tv1_251211  또는  /api/sfx?file=lg_tv1_251211.mp3
   *
   * 사용 위치:
   *   - components/entrance/TV1
   *     - TV1 화면이 열려 있는 동안, 아주 낮은 볼륨으로 loop 재생
   */
  TV1_BG_MUSIC: {
    id: 'lg_tv1_251211',
    file: 'lg_tv1_251211.mp3',
    pages: ['TV1 (components/entrance/TV1)'],
    triggers: [
      'TV1: 화면이 마운트되어 있는 동안, 은은한 백그라운드 음악으로 loop 재생',
    ],
  },

  /**
   * SBM1 입구 화면용 은은한 백그라운드 음악
   *
   * 파일: utils/data/soundeffect/lg_sbm1_251211.mp3
   * 라우트: /api/sfx?name=lg_sbm1_251211  또는  /api/sfx?file=lg_sbm1_251211.mp3
   *
   * 사용 위치:
   *   - components/entrance/SBM1
   *     - SBM1 화면이 열려 있는 동안, 아주 낮은 볼륨으로 loop 재생
   */
  SBM1_BG_MUSIC: {
    id: 'lg_sbm1_251211',
    file: 'lg_sbm1_251211.mp3',
    pages: ['SBM1 (components/entrance/SBM1)'],
    triggers: [
      'SBM1: 화면이 마운트되어 있는 동안, 은은한 백그라운드 음악으로 loop 재생',
    ],
  },

  /**
   * MW1 영상 디스플레이용 백그라운드 음악 (Idle / Active)
   *
   * 파일:
   *   - utils/data/soundeffect/mw1_idle.mp3
   *   - utils/data/soundeffect/mw1_active.mp3
   * 라우트:
   *   - /api/sfx?name=mw1_idle   또는 /api/sfx?file=mw1_idle.mp3
   *   - /api/sfx?name=mw1_active 또는 /api/sfx?file=mw1_active.mp3
   *
   * 사용 위치:
   *   - components/entrance/MW1
   *     - idle 영상 재생 중: mw1_idle.mp3 loop
   *     - active 영상 재생 중: mw1_active.mp3 loop
   */
  MW1_IDLE_BG: {
    id: 'mw1_idle',
    file: 'mw1_idle.mp3',
    pages: ['MW1 (components/entrance/MW1)'],
    triggers: [
      'MW1: idle 레이어 영상이 재생되는 동안 은은한 bg 음악(loop)',
    ],
  },
  MW1_ACTIVE_BG: {
    id: 'mw1_active',
    file: 'mw1_active.mp3',
    pages: ['MW1 (components/entrance/MW1)'],
    triggers: [
      'MW1: active 레이어 영상이 재생되는 동안 은은한 bg 음악(loop)',
    ],
  },
};

// 필요하다면 개별 상수로도 사용 가능:
export const SFX_IDS = {
  SBM1_QR: SOUND_EFFECTS.SBM1_QR.id,
  TV1_KEYWORD: SOUND_EFFECTS.TV1_KEYWORD.id,
  SW_BLOB: SOUND_EFFECTS.SW_BLOB.id,
  MOBILE_ORCHESTRATING: SOUND_EFFECTS.MOBILE_ORCHESTRATING.id,
  TV2_TRANSITION: SOUND_EFFECTS.TV2_TRANSITION.id,
  SW12_BLOB_APPEARANCE: SOUND_EFFECTS.SW12_BLOB_APPEARANCE.id,
  MOBILE_BG_MUSIC: SOUND_EFFECTS.MOBILE_BG_MUSIC.id,
   SW1_BG_MUSIC: SOUND_EFFECTS.SW1_BG_MUSIC.id,
   TV1_BG_MUSIC: SOUND_EFFECTS.TV1_BG_MUSIC.id,
   SBM1_BG_MUSIC: SOUND_EFFECTS.SBM1_BG_MUSIC.id,
  MW1_IDLE_BG: SOUND_EFFECTS.MW1_IDLE_BG.id,
  MW1_ACTIVE_BG: SOUND_EFFECTS.MW1_ACTIVE_BG.id,
};

// ---------------------------------------------------------------------------
// Playback helpers
// ---------------------------------------------------------------------------

// SBM1: QR 스캔 → TIP 상단 텍스트 시퀀스 시작 시 1회 재생
export function playSbm1QrTipStart() {
  return playSfx(SFX_IDS.SBM1_QR);
}

// TV1: entrance-new-voice 로 새로운 키워드 블롭이 등장할 때 1회 재생
export function playTv1KeywordBlobOnce() {
  return playSfx(SFX_IDS.TV1_KEYWORD);
}

// SW1 / SW2: 공용 블롭 효과음 단일 재생 (기본 볼륨은 호출처에서 전달)
export function playSwBlobOnce(volume = 0.5) {
  return playSfx(SFX_IDS.SW_BLOB, { volume });
}

// SW1: 새로운 실사용자 블롭 N개가 추가될 때, 약간의 간격을 두고 연속 재생
export function playSwBlobBurstForNewUsers(count, volume = 0.6, intervalMs = 80) {
  const n = Number(count) || 0;
  if (n <= 0) return;
  for (let i = 0; i < n; i += 1) {
    setTimeout(() => {
      playSwBlobOnce(volume);
    }, i * intervalMs);
  }
}

// Mobile: ORCHESTRATING 화면이 시작될 때 1회 재생
export function playMobileOrchestratingStart(volume = 1.0) {
  return playSfx(SFX_IDS.MOBILE_ORCHESTRATING, { volume });
}

// Mobile: 앱이 켜져 있는 동안 은은한 백그라운드 음악 loop 재생
export function playMobileBackgroundLoop(volume = 0.25) {
  return playSfx(SFX_IDS.MOBILE_BG_MUSIC, { volume, loop: true });
}

// SW1: 화면이 켜져 있는 동안 은은한 백그라운드 음악 loop 재생
export function playSw1BackgroundLoop(volume = 0.22) {
  return playSfx(SFX_IDS.SW1_BG_MUSIC, { volume, loop: true });
}

// TV1: 화면이 켜져 있는 동안 은은한 백그라운드 음악 loop 재생
export function playTv1BackgroundLoop(volume = 0.22) {
  return playSfx(SFX_IDS.TV1_BG_MUSIC, { volume, loop: true });
}

// SBM1: 화면이 켜져 있는 동안 은은한 백그라운드 음악 loop 재생
export function playSbm1BackgroundLoop(volume = 0.22) {
  return playSfx(SFX_IDS.SBM1_BG_MUSIC, { volume, loop: true });
}

// MW1: Idle 영상 재생 중 백그라운드 음악 loop
export function playMw1IdleBackgroundLoop(volume = 0.22) {
  return playSfx(SFX_IDS.MW1_IDLE_BG, { volume, loop: true });
}

// MW1: Active 영상 재생 중 백그라운드 음악 loop
export function playMw1ActiveBackgroundLoop(volume = 0.24) {
  return playSfx(SFX_IDS.MW1_ACTIVE_BG, { volume, loop: true });
}

// TV2: 새로운 결정으로 T4 전체 화면 전환이 시작될 때 1회 재생
export function playTv2Transition(volume = 1.0) {
  return playSfx(SFX_IDS.TV2_TRANSITION, { volume });
}

// SW1 / SW2: 화면 밖 하단에서 중앙으로 올라오는 엔트리 블롭 등장 시 1회 재생
export function playSw12BlobAppearance(volume = 1.0) {
  return playSfx(SFX_IDS.SW12_BLOB_APPEARANCE, { volume });
}



