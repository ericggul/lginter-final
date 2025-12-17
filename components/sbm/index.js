import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useSbmPlayer } from "./logic";
import * as S from "./styles";
import { TEXTS } from "./constant";
import { QRCodeSVG } from "qrcode.react";

// Build mobile URL dynamically from current host (no hardcoded domains)
function getMobileUrl() {
  if (typeof window === 'undefined') return '';
  const { protocol, host } = window.location;
  return `${protocol}//${host}/mobile`;
}

export default function SbmScreen() {
  const router = useRouter();
  const slugParam = router?.query?.slug;
  const slugKey = useMemo(() => {
    const raw = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    if (raw === "2" || raw === "3") return raw;
    return "1";
  }, [slugParam]);

  const { videoSrc, stageLabel, socketStatus, lastVoice } = useSbmPlayer(slugKey);

  const [textKey, setTextKey] = useState(0);
  useEffect(() => {
    setTextKey((k) => k + 1);
  }, [stageLabel]);

  const enableQr = slugKey === "2";
  const enableMovingKeyword = slugKey === "1" || slugKey === "3";

  // Guidance arrows (SBM/1,2,3): show for ~5s after a user input arrives.
  const [showArrows, setShowArrows] = useState(false);
  const arrowTimerRef = useRef(null);
  const prevStageRef = useRef(null);

  // Moving keyword (SBM/1,3): spawn on right and travel left then disappear.
  const [movingKeywords, setMovingKeywords] = useState([]); // { id, text, topPct }
  const laneIdxRef = useRef(0);

  useEffect(() => () => {
    try {
      if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
    } catch {}
  }, []);

  const triggerArrows = useCallback(() => {
    try {
      if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
    } catch {}
    setShowArrows(true);
    arrowTimerRef.current = setTimeout(() => setShowArrows(false), 5200);
  }, []);

  useEffect(() => {
    if (!lastVoice?.ts) return;

    const keyword = String(lastVoice.text || lastVoice.originalText || "").trim();
    if (!keyword) return;

    // 1) always guide after input
    triggerArrows();

    // 2) SBM/1,3: animate keyword moving right -> left
    if (enableMovingKeyword) {
      // pick a lane so concurrent keywords don't overlap
      const lanes = [34, 44, 54, 62]; // % from top
      const idx = laneIdxRef.current % lanes.length;
      laneIdxRef.current = (laneIdxRef.current + 1) % lanes.length;
      const topPct = lanes[idx];
      const id = Number(lastVoice.ts) || Date.now();
      setMovingKeywords((prev) => [...prev, { id, text: keyword, topPct }]);
    }
  }, [lastVoice?.ts, lastVoice?.text, lastVoice?.originalText, enableMovingKeyword, triggerArrows]);

  // SBM/2 arrow fallback: if entrance-new-voice is delayed/missed, still guide on t3 entry
  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = stageLabel;
    if (stageLabel === "t3" && prev !== "t3") {
      triggerArrows();
    }
  }, [stageLabel, triggerArrows]);

  const centerText = useMemo(() => {
    // IMPORTANT:
    // - SBM/2 only: show the center text modal (QR 안내 및 단계별 문구)
    // - SBM/1,3: never show this modal (only keyword popup should appear)
    if (!enableQr) return "";

    const voiceText = String(lastVoice?.text || "").trim();
    if (stageLabel === "t3" && voiceText) {
      return `'${voiceText}'에 맞는 공감지능 환경을 조성 중입니다.`;
    }
    if (stageLabel === "t5" && voiceText) {
      return `'${voiceText}'에 맞는 환경이 조성되었습니다.\n안으로 들어와 경험해보세요.`;
    }
    // SBM/2 only: show the QR call-to-action on idle
    if (stageLabel === "idle" && enableQr) return "QR을 스캔하고 공감지능 환경을 경험해보세요.";
    return TEXTS[stageLabel] || (enableQr ? "준비 중입니다." : "");
  }, [stageLabel, lastVoice?.text, enableQr]);
  const showCenterText = Boolean(String(centerText || "").trim());
  const showQr = enableQr && (stageLabel === "idle" || stageLabel === "t1");
  const qrUrl = useMemo(() => getMobileUrl(), []);

  const handleKeywordAnimationEnd = useCallback((id) => {
    setMovingKeywords((prev) => prev.filter((k) => k && k.id !== id));
  }, []);

  return (
    <S.Container>
      <S.Video
        key={videoSrc}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />
     
      {showCenterText && (
        <S.Overlay>
          <S.CenterText key={textKey}>{centerText}</S.CenterText>
        </S.Overlay>
      )}

      {enableQr && (
        <S.QrWrap $show={showQr}>
          <QRCodeSVG
            value={qrUrl}
            size={200}
            level="H"
            bgColor="transparent"
            fgColor="#f5f5f5"
          />
        </S.QrWrap>
      )}

      {enableMovingKeyword && movingKeywords?.length > 0 && (
        <S.MovingKeywordLayer>
          {movingKeywords.map((k) => (
            <S.MovingKeyword
              key={k.id}
              $topPct={k.topPct}
              $durationMs={10000}
              onAnimationEnd={() => handleKeywordAnimationEnd(k.id)}
            >
              {k.text}
            </S.MovingKeyword>
          ))}
        </S.MovingKeywordLayer>
      )}

      {showArrows && (
        <S.ArrowGuideBar>
          <S.Arrow $delayMs={0} />
          <S.Arrow $delayMs={160} />
          <S.Arrow $delayMs={320} />
        </S.ArrowGuideBar>
      )}
    </S.Container>
  );
}
