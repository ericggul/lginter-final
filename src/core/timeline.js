// Global timeline configuration and helpers
// Single source of truth for stage names, labels, and default durations
// Durations are configurable via environment variables for rapid tuning in the field.
//
// Stages:
//  t1: welcome
//  t2: voiceStart
//  t3: voiceInput
//  t4: orchestrated
//  t5: result

export const STAGES = {
  WELCOME: "welcome",           // t1
  VOICE_START: "voiceStart",    // t2
  VOICE_INPUT: "voiceInput",    // t3
  ORCHESTRATED: "orchestrated", // t4
  RESULT: "result",             // t5
};

export const LABELS = {
  [STAGES.WELCOME]: "t1",
  [STAGES.VOICE_START]: "t2",
  [STAGES.VOICE_INPUT]: "t3",
  [STAGES.ORCHESTRATED]: "t4",
  [STAGES.RESULT]: "t5",
};

// Default durations (ms). T2->T3 is user-driven; we do not time it here.
export const DURATIONS = {
  T1_TO_T2_MS: Number(process.env.T1_TO_T2_MS || 6000),
  // T2->T3: user presses the mic; not automatically timed here
  T3_TO_T4_MS: Number(process.env.T3_TO_T4_MS || 6500),
  T4_TO_T5_MS: Number(process.env.T4_TO_T5_MS || 8000),
};

// Utility to build a payload for timeline stage broadcasts
export function buildStagePayload(stage, meta = {}) {
  const now = Date.now();
  return {
    ts: now,
    stage,
    label: LABELS[stage] || null,
    ...meta,
  };
}

// In-memory helper for sequencing with cancellation
export function createTimelineScheduler() {
  let currentSessionId = null;
  let timers = [];

  function clearAllTimers() {
    for (const t of timers) {
      try { clearTimeout(t); } catch {}
    }
    timers = [];
  }

  function startNewSession(sessionId) {
    currentSessionId = sessionId;
    clearAllTimers();
    return currentSessionId;
  }

  function scheduleIfCurrent(sessionId, fn, delayMs) {
    if (!sessionId || sessionId !== currentSessionId) return;
    const handle = setTimeout(() => {
      if (sessionId === currentSessionId) fn();
    }, Math.max(0, delayMs || 0));
    timers.push(handle);
  }

  function getSessionId() {
    return currentSessionId;
  }

  return {
    startNewSession,
    scheduleIfCurrent,
    clearAllTimers,
    getSessionId,
  };
}


