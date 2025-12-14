import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "../constants";
import { EV } from "@/src/core/events";
import attachHardReset from "./useHardReset";

// Generic SBM socket hook (shared by all sbm routes)
export default function useSocketSBM(options = {}) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("disconnected");
  const handlersRef = useRef({
    onConnect: options.onConnect,
    onDisconnect: options.onDisconnect,
    onTimelineStage: options.onTimelineStage,
    onEntranceNewUser: options.onEntranceNewUser,
  });

  useEffect(() => {
    handlersRef.current = {
      onConnect: options.onConnect,
      onDisconnect: options.onDisconnect,
      onTimelineStage: options.onTimelineStage,
      onEntranceNewUser: options.onEntranceNewUser,
    };
  }, [options.onConnect, options.onDisconnect, options.onTimelineStage, options.onEntranceNewUser]);

  useEffect(() => {
    let mounted = true;
    let detachHardReset = () => {};

    (async () => {
      try {
        await fetch("/api/socket");
      } catch {
        // best-effort warm-up
      }
      if (!mounted) return;

      const s = io({
        path: SOCKET_CONFIG.PATH,
        transports: SOCKET_CONFIG.TRANSPORTS,
      });

      socketRef.current = s;
      setStatus("connecting");
      detachHardReset = attachHardReset(s);

      const handleConnect = () => {
        if (!mounted) return;
        setStatus("connected");
        s.emit(EV.INIT_ENTRANCE);
        handlersRef.current.onConnect?.();
      };

      const handleDisconnect = () => {
        if (!mounted) return;
        setStatus("disconnected");
        handlersRef.current.onDisconnect?.();
      };

      const handleTimeline = (payload) => handlersRef.current.onTimelineStage?.(payload);
      const handleEntranceNewUser = (payload) => handlersRef.current.onEntranceNewUser?.(payload);

      s.on("connect", handleConnect);
      s.on("disconnect", handleDisconnect);
      s.on(EV.TIMELINE_STAGE, handleTimeline);
      s.on(EV.ENTRANCE_NEW_USER, handleEntranceNewUser);

      return () => {
        s.off("connect", handleConnect);
        s.off("disconnect", handleDisconnect);
        s.off(EV.TIMELINE_STAGE, handleTimeline);
        s.off(EV.ENTRANCE_NEW_USER, handleEntranceNewUser);
        detachHardReset();
        s.close();
        socketRef.current = null;
      };
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { socket: socketRef.current, status };
}

