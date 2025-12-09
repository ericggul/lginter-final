// Minimal Socket.IO server for Next.js API route (migrated from external server.js)

import { Server } from "socket.io";
import { nanoid } from "nanoid";
import {
  upsertUser,
  heartbeat as brainHeartbeat,
  setDeviceError,
  recordDecision,
  storeUserPreference,
  markSeen,
  isSeen,
  gcSeen,
  updateDeviceHeartbeat,
  updateDeviceApplied
} from "../../lib/brain/state";
import { getActiveUsers, calculateFairAverage } from "../../lib/brain/state";
import { MobileNewUser, MobileNewName, MobileNewVoice, ControllerDecision, DeviceHeartbeat, LightColorPayload, safe } from "../../src/core/schemas";
import { EV } from "../../src/core/events";
import { STAGES, DURATIONS, buildStagePayload, createTimelineScheduler } from "../../src/core/timeline";
import { initHue, setLightColor, isHueEnabled } from "../../lib/hue/hueClient";

// Utils: convert incoming color (hex/rgb/hsl) to hsl(h, s%, l%) for Hue application
function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}
function parseHexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
function parseRgbString(s) {
  const m = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(String(s || '').trim());
  if (!m) return null;
  return { r: clamp(m[1], 0, 255), g: clamp(m[2], 0, 255), b: clamp(m[3], 0, 255) };
}
function rgbToHsl(r, g, b) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case R: h = (G - B) / d + (G < B ? 6 : 0); break;
      case G: h = (B - R) / d + 2; break;
      case B: h = (R - G) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function toHslString(color) {
  const raw = String(color || '').trim();
  if (/^hsla?\(/i.test(raw)) {
    // normalize to hsl(...) by stripping alpha if present
    const m = /^hsla?\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%/i.exec(raw);
    if (m) {
      const h = ((Number(m[1]) || 0) % 360 + 360) % 360;
      const s = clamp(m[2], 0, 100);
      const l = clamp(m[3], 0, 100);
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
    return raw; // fallback: pass-through
  }
  const rgb = parseRgbString(raw) || parseHexToRgb(raw);
  if (rgb) {
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  // fallback: pass-through
  return raw;
}

// Map raw user input to a short, safe emotion keyword (3-5 chars where possible)
function toEmotionKeyword(input) {
  if (!input || (typeof input !== 'string' && typeof input !== 'number')) {
    console.log('⚠️ toEmotionKeyword: invalid input type:', typeof input, input);
    return '중립';
  }
  
  const original = String(input).trim();
  if (!original) {
    console.log('⚠️ toEmotionKeyword: empty input');
    return '중립';
  }
  
  // 한글은 대소문자가 없으므로 toLowerCase() 불필요, 공백만 제거
  const s = original.replace(/\s+/g, '');
  
  console.log('🔍 toEmotionKeyword processing:', { original, normalized: s });
  
  // 정확한 매칭 우선 (원본 그대로 비교)
  if (original === '무기력' || s === '무기력' || original.includes('무기력') || s.includes('무기력')) {
    console.log('✅ toEmotionKeyword matched: 무기력');
    return '무기력';
  }
  if (original === '자기확신' || s === '자기확신' || original.includes('자기확신') || s.includes('자기확신')) {
    console.log('✅ toEmotionKeyword matched: 자기확신');
    return '자기확신';
  }
  if (original === '상쾌함' || s === '상쾌함' || (original.includes('상쾌') && original.includes('함')) || (s.includes('상쾌') && s.includes('함'))) {
    console.log('✅ toEmotionKeyword matched: 상쾌함');
    return '상쾌함';
  }
  
  // Profanity → anger
  if (/씨발|시발|ㅅㅂ|좆|존나|개새|병신|fuck|fxxk|shit|bitch|asshole/i.test(s)) return '분노';
  if (/짜증|빡|열받|화남|빡침|개빡/i.test(s)) return '짜증';
  if (/피곤|지침|피로|졸(려|림)/i.test(s)) return '피곤';
  if (/슬픔|슬퍼|우울|서운|눈물|울적/i.test(s)) return '슬픔';
  if (/불안|초조|긴장|걱정|두려/i.test(s)) return '불안';
  if (/행복|기쁨|좋아|신나|즐거|설렘|설레/i.test(s)) return '기쁨';
  if (/상쾌|청량|상큼|산뜻/i.test(s)) return '상쾌함'; // 상쾌 → 상쾌함으로 변환
  if (/맑음/i.test(s)) return '맑음';
  if (/지루|무료|심심/i.test(s)) return '지루';
  if (/답답|막막/i.test(s)) return '답답';
  if (/편안|차분|고요|평온|안정/i.test(s)) return '차분';
  if (/집중|몰입|포커스/i.test(s)) return '집중';
  if (/덥|더워|후끈|뜨거/i.test(s)) return '더위';
  if (/춥|추워|차갑/i.test(s)) return '추위';
  if (/건조|드라이/i.test(s)) return '건조';
  if (/습|눅눅|꿉꿉|후텁/i.test(s)) return '습함';
  
  // 매핑 실패 시 원본 텍스트를 그대로 반환 (TV1에서 블롭 생성 가능하도록)
  console.log('⚠️ toEmotionKeyword: no match, returning original:', original);
  return original;
}

export const config = {
  api: { bodyParser: false },
};

// SW2 music delay helpers (server-only memory; harmless for SSR reloads)
let __sw2LastSong = '';
let __sw2DelayTimer = null;
// Track unique mobile device connections per deviceId (for decrement on disconnect)
const __mobileDeviceSockets = new Map(); // deviceId => Set(socketId)
const __socketToDevice = new Map();

export default function handler(req, res) {
  if (res.socket.server.io) {
    // Socket already initialized
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    // transports: ["websocket", "polling"],
  });

  // Session-scoped timeline scheduler (global per server instance)
  const timeline = createTimelineScheduler();
  // broadcast helper for timeline stage → both entrance and livingroom
  const emitStage = (stage, meta = {}) => {
    try {
      const payload = buildStagePayload(stage, meta);
      io.to("entrance").emit(EV.TIMELINE_STAGE, payload);
      io.to("livingroom").emit(EV.TIMELINE_STAGE, payload);
    } catch (e) {
      console.warn("❌ timeline emit failed:", e?.message || e);
    }
  };
  // helper to fan-out canonical and legacy device-decision
  const emitDeviceDecision = (payload) => {
    io.to("livingroom").emit(EV.DEVICE_DECISION, payload);
    io.to("livingroom").emit(EV.DEVICE_NEW_DECISION, payload); // backward-compat
  };

  // periodic GC for TTL idempotency map
  setInterval(() => {
    try { gcSeen(Date.now()); } catch {}
  }, 10 * 60 * 1000); // 10 minutes

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);
    // --- Init & Rooms ---
    socket.on("mobile-init", (p) => {
      socket.join("mobile");
      const uid = (p && p.userId) ? String(p.userId) : `guest:${socket.id.slice(0, 6)}`;
      if (p?.userId) {
        socket.join(`user:${p.userId}`);
        console.log(`✅ Mobile ${socket.id} joined room: user:${p.userId}`);
      }
      
      // Record socket under deviceId
      let set = __mobileDeviceSockets.get(uid);
      if (!set) { set = new Set(); __mobileDeviceSockets.set(uid, set); }
      if (!set.has(socket.id)) {
        set.add(socket.id);
        __socketToDevice.set(socket.id, uid);
      }

      // First connection for this deviceId → count as new user
      if (set.size === 1) {
        upsertUser(uid, { name: '방문객' });
        const userPayload = { userId: uid, name: '방문객', ts: Date.now() };
        io.emit(EV.ENTRANCE_NEW_USER, userPayload);
        io.emit(EV.CONTROLLER_NEW_USER, userPayload);
      }
    });
    socket.on("livingroom-init", () => socket.join("livingroom"));
    socket.on("entrance-init", () => socket.join("entrance"));
    socket.on("controller-init", () => socket.join("controller"));

    // Device-specific init → map to rooms (keep event names)
    socket.on("mw1-init", () => socket.join("entrance"));
    socket.on("sbm1-init", () => socket.join("entrance"));
    socket.on("tv1-init", () => socket.join("entrance"));
    socket.on("sw1-init", () => socket.join("livingroom"));
    socket.on("sw2-init", () => socket.join("livingroom"));
    socket.on("tv2-init", () => socket.join("livingroom"));

    // Mobile events - forward to Controller; entrance mirrors for user/name
    socket.on("mobile-new-name", (raw) => {
      const data = { uuid: raw?.uuid || nanoid(), ts: raw?.ts || Date.now(), ...raw };
      const idKey = `mobile-new-name:${data.uuid}`;
      if (isSeen(idKey)) return; markSeen(idKey);
      const v = safe(MobileNewName, data); if (!v.ok) { console.warn("❌ invalid mobile-new-name", v.error?.message); return; }
      const payload = v.data;
      if (payload?.userId) upsertUser(payload.userId, { name: payload.name });
      io.to("controller").emit(EV.CONTROLLER_NEW_NAME, payload);
      io.to("entrance").emit(EV.ENTRANCE_NEW_NAME, { userId: payload.userId, name: payload.name });
    });

    socket.on("mobile-new-user", (raw) => {
      const data = { uuid: raw?.uuid || nanoid(), ts: raw?.ts || Date.now(), ...raw };
      const idKey = `mobile-new-user:${data.uuid}`;
      if (isSeen(idKey)) return; markSeen(idKey);
      const v = safe(MobileNewUser, data); if (!v.ok) { console.warn("❌ invalid mobile-new-user", v.error?.message); return; }
      const payload = v.data;
      if (payload?.userId) upsertUser(payload.userId, { name: payload.name });
      io.emit(EV.CONTROLLER_NEW_USER, payload);
      io.emit(EV.ENTRANCE_NEW_USER, { userId: payload.userId, name: payload.name });

      // Start a new global session timeline at t1 (welcome)
      const sessionId = timeline.startNewSession(`u:${payload.userId || 'anon'}:${payload.uuid || nanoid()}`);
      emitStage(STAGES.WELCOME, { sessionId, source: "mobile-new-user" });
      timeline.scheduleIfCurrent(sessionId, () => {
        emitStage(STAGES.VOICE_START, { sessionId });
      }, DURATIONS.T1_TO_T2_MS);
    });

    socket.on("mobile-new-voice", (raw) => {
      const data = { uuid: raw?.uuid || nanoid(), ts: raw?.ts || Date.now(), ...raw };
      const idKey = `mobile-new-voice:${data.uuid}`;
      if (isSeen(idKey)) return; markSeen(idKey);
      const v = safe(MobileNewVoice, data); if (!v.ok) { console.warn("❌ invalid mobile-new-voice", v.error?.message); return; }
      const payload = v.data;

      console.log("🎤 Received mobile-new-voice:", payload);
      console.log("🎤 Raw text/emotion:", payload.text, payload.emotion);

      const originalText = String(payload.text || payload.emotion || '').trim();
      const keyword = toEmotionKeyword(originalText);
      console.log("🎤 Original text:", originalText, "→ Mapped keyword:", keyword);
      
      // Entrance & LivingRoom: 원본 텍스트를 우선 사용 (TV1에서 그라데이션 매칭을 위해)
      // 매핑된 키워드가 "중립"이거나 원본과 다르면 원본 텍스트 사용
      const finalText = (keyword === '중립' || !keyword || keyword === originalText) ? originalText : keyword;
      console.log("🎤 Final text to send:", finalText, "(original:", originalText, ", keyword:", keyword, ")");
      
      io.to("entrance").emit("entrance-new-voice", { 
        userId: payload.userId, 
        text: finalText, 
        emotion: finalText,
        originalText: originalText // 원본 텍스트도 함께 전달
      });
      io.to("livingroom").emit(EV.DEVICE_NEW_VOICE, { userId: payload.userId, text: keyword, emotion: keyword });
      // Controller: keep raw text for climate overrides; pass sanitized emotion
      io.to("controller").emit(EV.CONTROLLER_NEW_VOICE, { ...payload, emotion: keyword });

      // Move timeline to t3 (voiceInput). Controller decision will move to t4.
      const sessionId = timeline.getSessionId() || timeline.startNewSession(`u:${payload.userId || 'anon'}:${payload.uuid || nanoid()}`);
      emitStage(STAGES.VOICE_INPUT, { sessionId, source: "mobile-new-voice" });
      // Fallback: if controller decision is slow, auto-advance to t4 after configured delay.
      timeline.scheduleIfCurrent(sessionId, () => {
        emitStage(STAGES.ORCHESTRATED, { sessionId, fallback: true });
      }, DURATIONS.T3_TO_T4_MS);
    });


    // Controller → LivingRoom + Mobile(user)
    socket.on("controller-new-decision", async (raw) => {
      const data = { uuid: raw?.uuid || nanoid(), ts: raw?.ts || Date.now(), ...raw };
      const v = safe(ControllerDecision, data); if (!v.ok) { console.warn("❌ invalid controller-new-decision", v.error?.message); return; }
      const payload = v.data;
      // Persist per-user preference for recent aggregation and SW1 mini-blobs
      // Only store when individual is provided (avoid polluting store with aggregated env)
      try {
        if (raw?.individual && typeof raw.individual === 'object') {
          const pref = {
            temp: raw.individual.temp,
            humidity: raw.individual.humidity,
            lightColor: raw.individual.lightColor || payload.params?.lightColor,
            music: raw.individual.music || payload.params?.music,
          };
          storeUserPreference(payload.userId, pref, raw?.uuid || nanoid());
        }
      } catch {}

      // Compute merged environment on the server from recent active user preferences
      const aggregatedEnv = calculateFairAverage();
      // Prefer the personal (individual) result for device rendering when available
      const personal =
        raw?.individual && typeof raw.individual === 'object'
          ? {
              temp: raw.individual.temp,
              humidity: raw.individual.humidity,
              lightColor: raw.individual.lightColor,
              music: raw.individual.music,
            }
          : null;

      console.log('📡 Server received controller-new-decision:', {
        userId: payload.userId,
        hasIndividual: !!raw?.individual,
        individual: raw?.individual,
        personal: personal,
        aggregatedEnv: aggregatedEnv,
      });

      // Record decision using aggregated env so deviceState snapshots stay consistent
      const d = recordDecision(payload.userId, aggregatedEnv, payload.reason);
      const decisionId = d.id;

      // Update deviceState snapshots
      // TV2: 개인 디시전만 사용 (폴백 제거). 개인 결과가 없으면 TV2 업데이트/전송을 수행하지 않는다.
      const tv2Env = personal
        ? { temp: personal.temp, humidity: personal.humidity, lightColor: personal.lightColor, music: personal.music }
        : null;
      
      if (tv2Env) {
        console.log('📤 Sending to TV2:', { tv2Env, decisionId, userId: payload.userId });
      } else {
        console.warn('⚠️ TV2 env is null - personal decision missing');
      }
      // SW1: keep aggregated climate
      const sw1Env = { temp: aggregatedEnv.temp, humidity: aggregatedEnv.humidity };
      // SW2: 개인 디시전만 사용 (폴백 제거). 개인 결과가 없으면 SW2 업데이트/전송을 수행하지 않는다.
      const sw2Env = personal
        ? { lightColor: personal.lightColor, music: personal.music }
        : null;
      if (tv2Env) updateDeviceApplied('tv2', tv2Env, decisionId);
      updateDeviceApplied('sw1', sw1Env, decisionId);
      // SW2는 5초 지연 전환을 위해 updateDeviceApplied를 emit 시점에 수행합니다.
      
      // Advance timeline to t4 (orchestrated) immediately upon decision
      const sessionId = timeline.getSessionId() || timeline.startNewSession(`d:${Date.now()}:${payload.userId}`);
      // Clear any pending t3→t4 fallback and schedule t4→t5
      timeline.clearAllTimers();
      emitStage(STAGES.ORCHESTRATED, { sessionId, reason: payload.reason });
      timeline.scheduleIfCurrent(sessionId, () => {
        emitStage(STAGES.RESULT, { sessionId });
      }, DURATIONS.T4_TO_T5_MS);

      // split fan-out
      if (tv2Env) {
        emitDeviceDecision({
          target: 'tv2',
          env: tv2Env,
          reason: payload.reason,
          emotionKeyword: payload.emotionKeyword,
          decisionId,
          mergedFrom: [payload.userId],
        });
      }
      // SW1: 개인 결과(최대 4명)를 함께 전달(프론트는 선택적으로 사용)
      const individuals = [];
      // 0) Always seed current user's personal result if provided
      if (raw?.individual && typeof raw.individual === 'object') {
        individuals.push({
          userId: String(payload.userId),
          temp: raw.individual.temp,
          humidity: raw.individual.humidity,
        });
      }
      // 1) Try recent active preferences to fill remaining slots
      try {
        const actives = getActiveUsers();
        for (const u of actives) {
          if (individuals.length >= 4) break;
          const uid = String(u.originalUserId || u.userId || u.inputId || nanoid());
          if (individuals.some((x) => String(x.userId) === uid)) continue;
          const pref = u.lastPreference || {};
          if (typeof pref.temp === 'number' || typeof pref.humidity === 'number') {
            individuals.push({ userId: uid, temp: pref.temp, humidity: pref.humidity });
          }
        }
      } catch {}
      // 2) As a final fallback, synthesize entries from mergedFromIds so SW1 mini-blobs never stay empty
      try {
        const fillFrom = (Array.isArray(raw?.mergedFrom) && raw.mergedFrom.length ? raw.mergedFrom : [payload.userId]).map(String);
        for (const uid of fillFrom) {
          if (individuals.length >= 4) break;
          if (individuals.some((x) => String(x.userId) === uid)) continue;
          individuals.push({
            userId: uid,
            temp: typeof sw1Env.temp === 'number' ? sw1Env.temp : payload.params?.temp,
            humidity: typeof sw1Env.humidity === 'number' ? sw1Env.humidity : payload.params?.humidity,
          });
        }
      } catch {}
      let mergedFromIds = Array.isArray(raw?.mergedFrom) && raw.mergedFrom.length
        ? raw.mergedFrom.map((v) => String(v)).filter(Boolean)
        : [payload.userId];
      // Ensure mergedFrom contains all known individual userIds as well (defensive)
      try {
        const s = new Set(mergedFromIds);
        (individuals || []).forEach((it) => { if (it?.userId) s.add(String(it.userId)); });
        mergedFromIds = Array.from(s);
      } catch {}
      emitDeviceDecision({
        target: 'sw1',
        env: sw1Env,
        decisionId,
        mergedFrom: mergedFromIds,
        emotionKeyword: payload.emotionKeyword,
        ...(individuals.length ? { individuals } : {}),
        final: sw1Env,
      });
      // SW2: 개인 디시전이 있을 때만 전송 (폴백 제거)
      if (sw2Env && personal?.music) {
        const candidateSong = personal.music;
        const sw2EnvWithSong = { ...sw2Env, music: candidateSong };
        const newSong = candidateSong;
        const emitSw2 = () => {
          updateDeviceApplied('sw2', sw2EnvWithSong, decisionId);
          emitDeviceDecision({
            target: 'sw2',
            env: sw2EnvWithSong,
            decisionId,
            reason: payload.reason,
            emotionKeyword: payload.emotionKeyword,
            mergedFrom: mergedFromIds,
            ...(individuals && individuals.length ? { individuals } : {}),
          });
          __sw2LastSong = newSong;
        };
        try {
          // Delay can be tuned via SW2_MUSIC_DELAY_MS (default 0ms)
          const delayMsEnv = Number(process.env.SW2_MUSIC_DELAY_MS || 0);
          const delayMs = Number.isFinite(delayMsEnv) ? Math.max(0, Math.min(60000, delayMsEnv)) : 0;
          if (newSong && newSong !== __sw2LastSong && delayMs > 0) {
            if (__sw2DelayTimer) clearTimeout(__sw2DelayTimer);
            __sw2DelayTimer = setTimeout(() => {
              emitSw2();
              __sw2DelayTimer = null;
            }, delayMs);
          } else {
            emitSw2();
          }
        } catch {
          emitSw2();
        }
      }
      // targeted to mobile user (include flags/emotionKeyword when present)
      const individualForMobile =
        (raw && typeof raw.individual === 'object' && raw.individual) ||
        null;
      io.to(`user:${payload.userId}`).emit("mobile-new-decision", {
        userId: payload.userId,
        params: payload.params, // aggregated (orchestrated)
        // Prefer per-user params from controller; fall back to null when absent
        individual: individualForMobile,
        reason: payload.reason,
        flags: payload.flags,
        emotionKeyword: payload.emotionKeyword,
        decisionId
      });
      // optional legacy alias (default off)
      const legacy = process.env.LEGACY_DEVICE_DECISION_ALIAS === 'true';
      if (legacy) {
        io.emit(EV.DEVICE_DECISION, { device: "sw2", lightColor: payload.params?.lightColor, song: payload.params?.music, decisionId });
        io.emit(EV.DEVICE_DECISION, { device: "sw1", temperature: payload.params?.temp, humidity: payload.params?.humidity, decisionId });
      }

      // Apply Hue lighting if enabled and color present
      try {
        // Prefer SW2 (personal) color for Hue so physical light matches SW2 device
        const hueColor = (personal && personal.lightColor) || payload?.params?.lightColor;
        if (isHueEnabled() && hueColor) {
          await initHue().catch(() => {});
          const result = await setLightColor({
            color: toHslString(hueColor),
            transitionMs: 700,
          });
          const ack = {
            source: "controller-new-decision",
            decisionId,
            color: toHslString(hueColor),
            ok: !!result?.ok,
            applied: !!result?.applied,
            error: result?.error,
          };
          io.to("livingroom").emit(EV.LIGHT_APPLIED, ack);
          io.to("controller").emit(EV.LIGHT_APPLIED, ack);
        }
      } catch (e) {
        console.warn("❌ Hue apply (controller-new-decision) failed:", e?.message || e);
      }
    });

    socket.on("controller-new-voice", (data) => {
      console.log("🎮 Server received controller-new-voice:", data);
      io.to("livingroom").emit("device-new-voice", data);
    });

    // SW2 direct color control → apply Hue
    socket.on(EV.SW2_LIGHT_COLOR, async (raw) => {
      const data = { uuid: raw?.uuid || nanoid(), ts: raw?.ts || Date.now(), ...raw };
      const v = safe(LightColorPayload, raw);
      if (!v.ok) {
        console.warn("❌ invalid sw2-light-color", v.error?.message);
        return;
      }
      const payload = v.data;
      try {
        if (!isHueEnabled()) {
          io.to("livingroom").emit(EV.LIGHT_APPLIED, { source: "sw2", ok: false, applied: false, disabled: true });
          return;
        }
        await initHue().catch(() => {});
        const hslColor = toHslString(payload.color);
        const result = await setLightColor({ ...payload, color: hslColor });
        const ack = { source: "sw2", ...payload, color: hslColor, ok: !!result?.ok, applied: !!result?.applied, error: result?.error };
        io.to("livingroom").emit(EV.LIGHT_APPLIED, ack);
        io.to("controller").emit(EV.LIGHT_APPLIED, ack);
      } catch (e) {
        console.warn("❌ Hue apply (sw2-light-color) failed:", e?.message || e);
        io.to("livingroom").emit(EV.LIGHT_APPLIED, { source: "sw2", ...payload, ok: false, applied: false, error: e?.message || String(e) });
      }
    });

    // Device health
    socket.on("device:heartbeat", (info) => {
      const hb = { deviceId: info?.deviceId || socket.id, ts: info?.ts || Date.now(), status: info?.status, type: info?.type, version: info?.version };
      const v = safe(DeviceHeartbeat, hb);
      if (v.ok) {
        brainHeartbeat(v.data.deviceId, v.data);
        // Update deviceState snapshot
        updateDeviceHeartbeat(v.data.deviceId, v.data.ts);
        io.to("controller").emit("device-heartbeat", v.data);
      }
    });
    socket.on("device:error", (info) => {
      setDeviceError(info?.deviceId || socket.id, info?.error || 'unknown');
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      try {
        const uid = __socketToDevice.get(socket.id);
        if (uid) {
          const set = __mobileDeviceSockets.get(uid);
          if (set) {
            set.delete(socket.id);
            if (set.size === 0) {
              __mobileDeviceSockets.delete(uid);
              const userPayload = { userId: uid, ts: Date.now() };
              io.emit(EV.ENTRANCE_USER_LEFT, userPayload);
              io.emit(EV.CONTROLLER_USER_LEFT, userPayload);
            }
          }
          __socketToDevice.delete(socket.id);
        }
      } catch {}
    });
  });

  res.socket.server.io = io;
  res.end();
}
