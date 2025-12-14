import { useMemo, useState, useEffect } from "react";
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

  const { videoSrc, stageLabel, socketStatus, lastVoiceText } = useSbmPlayer(slugKey);

  const [textKey, setTextKey] = useState(0);
  useEffect(() => {
    setTextKey((k) => k + 1);
  }, [stageLabel]);


  const centerText = useMemo(() => {
    if (stageLabel === "t3" && lastVoiceText) {
      return `'${lastVoiceText}'에 맞는 공감지능 환경을 조성 중입니다.`;
    }
    if (stageLabel === "t5" && lastVoiceText) {
      return `'${lastVoiceText}'에 맞는 환경이 조성되었습니다.\n안으로 들어와 경험해보세요.`;
    }
    return TEXTS[stageLabel] || "준비 중입니다.";
  }, [stageLabel, lastVoiceText]);
  const showQr = stageLabel === "idle" || stageLabel === "t1";
  const qrUrl = useMemo(() => getMobileUrl(), []);

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
     
      <S.Overlay>
        <S.CenterText key={textKey}>{centerText}</S.CenterText>
      </S.Overlay>
      <S.QrWrap $show={showQr}
      opactiy={{ opacity: stageLabel === "idle" ? 1 : 0 }}
      >
        <QRCodeSVG
          value={qrUrl}
          size={256}
          level="H"
          bgColor="transparent"
          fgColor="#f5f5f5"
        />
      </S.QrWrap>
    </S.Container>
  );
}
