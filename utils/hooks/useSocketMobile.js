import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "../constants";

// Inline payload creators (moved from socketEvents)
const createBasePayload = (source, additionalData = {}) => ({
  uuid: `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  ts: Date.now(),
  source,
  ...additionalData
});

const createMobileUserPayload = (userId, meta = {}) => createBasePayload("mobile", { userId, meta });
const createMobileNamePayload = (name, meta = {}) => createBasePayload("mobile", { name, userId: meta.userId, meta });
const createMobileVoicePayload = (text, emotion, score = 0.5, meta = {}) => createBasePayload("mobile", { text, emotion, score, userId: meta.userId, meta });

function getOrCreateDeviceId() {
  try {
    if (typeof window === 'undefined') return `dev-${Math.random().toString(36).slice(2, 10)}`;
    const key = 'mobile:deviceId';
    let id = localStorage.getItem(key);
    if (!id) {
      const rnd = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
      id = String(rnd);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  }
}

// mobile-side socket: init and emit actions
export default function useSocketMobile(options = {}) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const deviceIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Stable per-device ID (persists across tabs for same origin)
    deviceIdRef.current = getOrCreateDeviceId();

    // Socket 즉시 초기화 (fetch 제거로 지연 최소화)
    console.log("Mobile Hook: Initializing socket connection...");

    const s = io({
      path: SOCKET_CONFIG.PATH,
      transports: SOCKET_CONFIG.TRANSPORTS,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 12000,
      forceNew: true,
      withCredentials: false,
    });

    socketRef.current = s;
    setSocket(s);

    const emitInit = () => {
      try { s.emit("mobile-init", { userId: deviceIdRef.current }); } catch {}
    };

    s.on("connect", () => {
      console.log("✅ Mobile socket connected:", s.id);
      emitInit();
    });

    // If already connected (re-mount or quick connection), emit init immediately
    if (s.connected) emitInit();

    s.on("disconnect", () => {
      console.log("❌ Mobile socket disconnected");
    });

    s.on("connect_error", (error) => {
      console.error("❌ Mobile socket connection error:", error.message);
    });

    // Attach dynamic listeners
    const { onMobileDecision } = options || {};
    if (onMobileDecision) {
      s.on("mobile-new-decision", (payload) => {
        console.log("📩 [Mobile] received mobile-new-decision:", payload);
        onMobileDecision(payload);
      });
    }

    return () => {
      mounted = false;
      console.log("Mobile Hook: Cleaning up socket");
      if (socketRef.current) {
        if (onMobileDecision) socketRef.current.off("mobile-new-decision");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const ensureMeta = (meta = {}) => ({ userId: deviceIdRef.current, ...meta });

  // emits: mobile-new-user, mobile-new-name, mobile-new-voice, mobile-user-needs
  const emitNewUser = (payload = {}) => {
    const finalPayload = payload.uuid ? payload : createMobileUserPayload(payload.userId || deviceIdRef.current, ensureMeta(payload.meta));
    console.log("📱 Mobile Hook: Emitting mobile-new-user:", finalPayload);
    socketRef.current?.emit("mobile-new-user", finalPayload);
  };

  const emitNewName = (name, meta = {}) => {
    const payload = createMobileNamePayload(name, ensureMeta(meta));
    console.log("📱 Mobile Hook: Emitting mobile-new-name:", payload);
    socketRef.current?.emit("mobile-new-name", payload);
  };

  const emitNewVoice = (text, emotion, score = 0.5, meta = {}) => {
    const payload = createMobileVoicePayload(text, emotion, score, ensureMeta(meta));
    console.log("📱 Mobile Hook: Emitting mobile-new-voice:", payload);
    socketRef.current?.emit("mobile-new-voice", payload);
  };

  const emitUserNeeds = (needs) => {
    // expects { userId, temperature, humidity, lightColor, song, priority, timestamp }
    socketRef.current?.emit("mobile-user-needs", { userId: deviceIdRef.current, ...needs });
  };

  return { 
    socket,
    deviceId: deviceIdRef.current,
    emitNewUser, 
    emitNewName, 
    emitNewVoice,
    emitUserNeeds
  };
}
