import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { EVENTS, createDeviceDecisionPayload, createBasePayload } from "./socketEvents";
import { SOCKET_CONFIG } from "../constants";

// SW1 is climate (temperature/humidity)
export default function useSocketSW1(options = {}) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await fetch("/api/socket");
      } catch (e) {
        console.log("API socket endpoint not available, using direct connection");
      }
      if (!mounted) return;

      console.log("SW1 Hook: Initializing socket connection...");

      const s = io({ path: SOCKET_CONFIG.PATH });

      socketRef.current = s;
      setSocket(s);

      s.on("connect", () => {
        console.log("✅ SW1 socket connected:", s.id);
        s.emit("sw1-init");
        s.emit('device:heartbeat', { deviceId: s.id, type: 'sw1', version: '1.0.0', ts: Date.now() });
      });

      s.on("disconnect", () => {
        console.log("❌ SW1 socket disconnected");
      });
      // ping/reload
      s.on('device:ping', () => {
        s.emit('device:heartbeat', { deviceId: s.id, type: 'sw1', version: '1.0.0', ts: Date.now() });
      });

      const hb = setInterval(() => { if (s.connected) s.emit('device:heartbeat', { deviceId: s.id, type: 'sw1', version: '1.0.0', ts: Date.now() }); }, 15000);
      s.on('disconnect', () => clearInterval(hb));
    })();
    
    return () => {
      mounted = false;
      console.log("SW1 Hook: Cleaning up socket");
      if (socketRef.current) { 
        socketRef.current.disconnect(); 
        socketRef.current = null; 
      }
    };
  }, []);

  // Attach/detach external handlers
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const { onDeviceDecision, onDeviceNewDecision, onDeviceNewVoice, onTimelineStage } = options || {};

    if (onDeviceDecision) s.on('device-decision', onDeviceDecision);
    if (onDeviceNewDecision) s.on('device-new-decision', onDeviceNewDecision);
    if (onDeviceNewVoice) s.on('device-new-voice', onDeviceNewVoice);
    if (onTimelineStage) s.on(EVENTS.TIMELINE_STAGE, onTimelineStage);

    return () => {
      if (onDeviceDecision) s.off('device-decision', onDeviceDecision);
      if (onDeviceNewDecision) s.off('device-new-decision', onDeviceNewDecision);
      if (onDeviceNewVoice) s.off('device-new-voice', onDeviceNewVoice);
      if (onTimelineStage) s.off(EVENTS.TIMELINE_STAGE, onTimelineStage);
    };
  }, [socket, options?.onDeviceDecision, options?.onDeviceNewDecision, options?.onDeviceNewVoice, options?.onTimelineStage]);

  const emitClimateDecision = (temp, humidity, assignedUser, meta = {}) => {
    // payload: { uuid, ts, type: 'climate', temp, humidity, assignedUser }
    const data = { temp, humidity };
    const payload = createDeviceDecisionPayload("climate", data, assignedUser, meta);
    socketRef.current?.emit(EVENTS.DEVICE_NEW_DECISION, payload);
  };

  // 테스트용: 타임라인 강제 전송(T1~T5)
  const emitTimelineStage = (stage) => {
    try {
      const payload = { stage, ts: Date.now(), source: 'test' };
      socketRef.current?.emit(EVENTS.TIMELINE_STAGE, payload);
    } catch {}
  };

  // 테스트용: SW1이 필요로 하는 필드를 그대로 보냄
  // { env: { temp, humidity }, mergedFrom: [userIds], individuals: [{ userId, temp, humidity }] }
  const emitDecisionWithIndividuals = (msg = {}) => {
    try {
      // 컨트롤러 역할을 대체하는 테스트용: 여기서 18~30℃ 보정
      const clamp = (t) => {
        if (typeof t !== 'number' || Number.isNaN(t)) return t;
        return Math.max(18, Math.min(30, Math.round(t)));
      };
      const safe = { ...msg };
      if (safe.env && typeof safe.env.temp === 'number') {
        safe.env = { ...safe.env, temp: clamp(safe.env.temp) };
      }
      if (Array.isArray(safe.individuals)) {
        safe.individuals = safe.individuals.map((it) => ({
          ...it,
          temp: typeof it?.temp === 'number' ? clamp(it.temp) : it?.temp,
        }));
      }
      socketRef.current?.emit(EVENTS.DEVICE_NEW_DECISION, safe);
    } catch {}
  };

  const emitDeviceVoice = (text, emotion, meta = {}) => {
    const payload = createBasePayload("sw1", { text, emotion, meta });
    socketRef.current?.emit(EVENTS.DEVICE_NEW_VOICE, payload);
  };

  return { 
    socket,
    emitClimateDecision, 
    emitDeviceVoice,
    emitTimelineStage,
    emitDecisionWithIndividuals
  };
}
