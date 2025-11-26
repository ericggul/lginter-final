import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "../constants";

export default function useSocketSBM1(options = {}) {
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

      console.log("SBM1 Hook: Initializing socket connection...");

      const s = io({ path: SOCKET_CONFIG.PATH });

      socketRef.current = s;
      setSocket(s);

      s.on("connect", () => {
        console.log("✅ SBM1 socket connected:", s.id);
        s.emit("sbm1-init");
        s.emit('device:heartbeat', { deviceId: s.id, type: 'sbm1', version: '1.0.0', ts: Date.now() });
      });

      s.on("disconnect", () => {
        console.log("❌ SBM1 socket disconnected");
      });

      // ping/reload 응답
      s.on('device:ping', () => {
        s.emit('device:heartbeat', { deviceId: s.id, type: 'sbm1', version: '1.0.0', ts: Date.now() });
      });
      if (typeof window !== 'undefined') {
        s.on('client:reload', () => { window.location.reload(); });
      }

      // 주기적 heartbeat
      const hb = setInterval(() => {
        if (s.connected) s.emit('device:heartbeat', { deviceId: s.id, type: 'sbm1', version: '1.0.0', ts: Date.now() });
      }, 15000);
      s.on('disconnect', () => clearInterval(hb));
    })();
    
    return () => {
      mounted = false;
      console.log("SBM1 Hook: Cleaning up socket");
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
    const { onEntranceNewUser, onEntranceNewName, onEntranceNewVoice } = options || {};

    if (onEntranceNewUser) s.on('entrance-new-user', onEntranceNewUser);
    if (onEntranceNewName) s.on('entrance-new-name', onEntranceNewName);
    if (onEntranceNewVoice) s.on('entrance-new-voice', onEntranceNewVoice);

    return () => {
      if (onEntranceNewUser) s.off('entrance-new-user', onEntranceNewUser);
      if (onEntranceNewName) s.off('entrance-new-name', onEntranceNewName);
      if (onEntranceNewVoice) s.off('entrance-new-voice', onEntranceNewVoice);
    };
  }, [socket, options?.onEntranceNewUser, options?.onEntranceNewName, options?.onEntranceNewVoice]);

  return { 
    socket,
  };
}


