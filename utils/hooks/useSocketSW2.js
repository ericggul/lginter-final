import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { EVENTS, createDeviceDecisionPayload, createBasePayload } from "./socketEvents";
import { SOCKET_CONFIG } from "../constants";
import attachHardReset from "./useHardReset";

// SW2 is ambience (music / light)
export default function useSocketSW2(options = {}) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let mounted = true;
    let detachHardReset = () => {};

    (async () => {
      try {
        await fetch("/api/socket");
      } catch (e) {
        console.log("API socket endpoint not available, using direct connection");
      }
      if (!mounted) return;

      console.log("SW2 Hook: Initializing socket connection...");

      const s = io({ path: SOCKET_CONFIG.PATH });

      socketRef.current = s;
      setSocket(s);
      detachHardReset = attachHardReset(s);

      s.on("connect", () => {
        console.log("✅ SW2 socket connected:", s.id);
        s.emit("sw2-init");
        s.emit('device:heartbeat', { deviceId: s.id, type: 'sw2', version: '1.0.0', ts: Date.now() });
      });

      s.on("disconnect", () => {
        console.log("❌ SW2 socket disconnected");
      });
      // ping/reload
      s.on('device:ping', () => {
        s.emit('device:heartbeat', { deviceId: s.id, type: 'sw2', version: '1.0.0', ts: Date.now() });
      });

      const hb = setInterval(() => { if (s.connected) s.emit('device:heartbeat', { deviceId: s.id, type: 'sw2', version: '1.0.0', ts: Date.now() }); }, 15000);
      s.on('disconnect', () => clearInterval(hb));
    })();
    
    return () => {
      mounted = false;
      console.log("SW2 Hook: Cleaning up socket");
      if (socketRef.current) { 
        detachHardReset();
        socketRef.current.disconnect(); 
        socketRef.current = null; 
      }
    };
  }, []);

  // Attach/detach external handlers
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const { onDeviceDecision, onDeviceNewDecision, onDeviceNewVoice, onLightApplied, onTimelineStage } = options || {};

    if (onDeviceDecision) s.on('device-decision', onDeviceDecision);
    if (onDeviceNewDecision) s.on('device-new-decision', onDeviceNewDecision);
    if (onDeviceNewVoice) s.on('device-new-voice', onDeviceNewVoice);
    if (options.onNewUser) s.on('entrance-new-user', options.onNewUser);
    if (onLightApplied) s.on(EVENTS.LIGHT_APPLIED, onLightApplied);
    if (onTimelineStage) s.on(EVENTS.TIMELINE_STAGE, onTimelineStage);

    return () => {
      if (onDeviceDecision) s.off('device-decision', onDeviceDecision);
      if (onDeviceNewDecision) s.off('device-new-decision', onDeviceNewDecision);
      if (onDeviceNewVoice) s.off('device-new-voice', onDeviceNewVoice);
      if (options.onNewUser) s.off('entrance-new-user', options.onNewUser);
      if (onLightApplied) s.off(EVENTS.LIGHT_APPLIED, onLightApplied);
      if (onTimelineStage) s.off(EVENTS.TIMELINE_STAGE, onTimelineStage);
    };
  }, [socket, options?.onDeviceDecision, options?.onDeviceNewDecision, options?.onDeviceNewVoice, options?.onNewUser, options?.onLightApplied, options?.onTimelineStage]);

  const emitAmbienceDecision = (music, color, assignedUser, meta = {}) => {
    // payload: { uuid, ts, type: 'ambience', music, color, assignedUser }
    const data = { music, color };
    const payload = createDeviceDecisionPayload("ambience", data, assignedUser, meta);
    socketRef.current?.emit(EVENTS.DEVICE_NEW_DECISION, payload);
  };

  const emitDeviceVoice = (text, emotion, meta = {}) => {
    const payload = createBasePayload("sw2", { text, emotion, meta });
    socketRef.current?.emit(EVENTS.DEVICE_NEW_VOICE, payload);
  };

  const emitLightColor = (color, opts = {}) => {
    // opts: { brightness?: number(1-254), transitionMs?: number, targets?: { lightIds?: number[], groupId?: number } }
    const payload = { color, ...opts };
    socketRef.current?.emit(EVENTS.SW2_LIGHT_COLOR, payload);
  };

  return { 
    socket,
    emitAmbienceDecision, 
    emitDeviceVoice,
    emitLightColor
  };
}
