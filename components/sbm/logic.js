import { useEffect, useMemo, useState } from "react";
import { EV } from "@/src/core/events";
import { LABELS, STAGES } from "@/src/core/timeline";
import useSocketSBM from "@/utils/hooks/useSocketSBM";

const VIDEO_MAP = {
  "1": "/video/sbm/sbm1.mp4",
  "2": "/video/sbm/sbm2.mp4",
  "3": "/video/sbm/sbm3.mp4",
};
const TIMELINE_WHITELIST = new Set(["t1", "t3", "t5"]);

export function useSbmPlayer(slugKey) {
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [stageLabel, setStageLabel] = useState("idle");
  const [lastVoiceText, setLastVoiceText] = useState("");

  const normalizedSlug = useMemo(() => {
    if (slugKey === "2" || slugKey === "3") return slugKey;
    return "1";
  }, [slugKey]);

  const videoSrc = useMemo(() => VIDEO_MAP[normalizedSlug] || VIDEO_MAP["1"], [normalizedSlug]);

  useSocketSBM({
    onConnect: () => setSocketStatus("connected"),
    onDisconnect: () => {
      setSocketStatus("disconnected");
      setStageLabel("idle");
    },
    onTimelineStage: (payload = {}) => {
      const { stage, label } = payload;
      const next = label || (stage ? LABELS[stage] : null);

      if (next && TIMELINE_WHITELIST.has(String(next))) {
        setStageLabel(String(next));
        return;
      }
      if (stage === STAGES.WELCOME) setStageLabel("t1");
      if (stage === STAGES.VOICE_INPUT) setStageLabel("t3");
      if (stage === STAGES.RESULT) setStageLabel("t5");
    },
    onEntranceNewUser: () => setStageLabel("t1"),
    onEntranceNewVoice: (payload = {}) => {
      const text = payload.text || payload.originalText || payload.emotion || "";
      if (text) setLastVoiceText(String(text));
    },
  });

  return {
    videoSrc,
    stageLabel,
    socketStatus,
    lastVoiceText,
  };
}
