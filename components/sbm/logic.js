import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_CONFIG } from "@/utils/constants";
import { EV } from "@/src/core/events";
import { LABELS, STAGES } from "@/src/core/timeline";

const VIDEO_MAP = {
  "1": "/video/sbm/sbm1.mp4",
  "2": "/video/sbm/sbm2.mp4",
  "3": "/video/sbm/sbm3.mp4",
};
const TIMELINE_WHITELIST = new Set(["t1", "t3", "t5"]);

export function useSbmPlayer(slugKey) {
  const socketRef = useRef(null);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [stageLabel, setStageLabel] = useState("idle");

  const normalizedSlug = useMemo(() => {
    if (slugKey === "2" || slugKey === "3") return slugKey;
    return "1";
  }, [slugKey]);

  const videoSrc = useMemo(() => VIDEO_MAP[normalizedSlug] || VIDEO_MAP["1"], [normalizedSlug]);

  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};

    (async () => {
      try {
        await fetch("/api/socket");
      } catch {
        // warm-up is best-effort; ignore errors
      }
      if (!mounted) return;

      const s = io({
        path: SOCKET_CONFIG.PATH,
        transports: SOCKET_CONFIG.TRANSPORTS,
      });
      socketRef.current = s;
      setSocketStatus("connecting");

      const handleConnect = () => {
        if (!mounted) return;
        setSocketStatus("connected");
        // keep stage as-is; will advance when timeline events arrive
        s.emit(EV.INIT_ENTRANCE);
      };

      const handleDisconnect = () => {
        if (!mounted) return;
        setSocketStatus("disconnected");
        setStageLabel("idle");
      };

      const handleTimeline = (payload = {}) => {
        const { stage, label } = payload;
        const next = label || (stage ? LABELS[stage] : null);

        // we only care about t1, t3, t5 for now
        if (next && TIMELINE_WHITELIST.has(String(next))) {
          setStageLabel(String(next));
          return;
        }

        // fallback mapping when label is missing but stage is present
        if (stage === STAGES.WELCOME) setStageLabel("t1");
        if (stage === STAGES.VOICE_INPUT) setStageLabel("t3");
        if (stage === STAGES.RESULT) setStageLabel("t5");
      };

      // Defensive: some environments may miss the first timeline emit.
      // When a new mobile user arrives (entrance-new-user), treat it as t1.
      const handleEntranceNewUser = () => {
        if (!mounted) return;
        setStageLabel("t1");
      };

      s.on("connect", handleConnect);
      s.on("disconnect", handleDisconnect);
      s.on(EV.TIMELINE_STAGE, handleTimeline);
      s.on(EV.ENTRANCE_NEW_USER, handleEntranceNewUser);

      cleanup = () => {
        s.off("connect", handleConnect);
        s.off("disconnect", handleDisconnect);
        s.off(EV.TIMELINE_STAGE, handleTimeline);
        s.off(EV.ENTRANCE_NEW_USER, handleEntranceNewUser);
        s.close();
        socketRef.current = null;
      };
    })();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return {
    videoSrc,
    stageLabel,
    socketStatus,
  };
}
