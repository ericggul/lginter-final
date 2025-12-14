import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSbmPlayer } from "./logic";
import * as S from "./styles";
import TEXTS from "./constant";

export default function SbmScreen() {
  const router = useRouter();
  const slugParam = router?.query?.slug;
  const slugKey = useMemo(() => {
    const raw = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    if (raw === "2" || raw === "3") return raw;
    return "1";
  }, [slugParam]);

  const { videoSrc, stageLabel, socketStatus } = useSbmPlayer(slugKey);

  const [textKey, setTextKey] = useState(0);
  useEffect(() => {
    setTextKey((k) => k + 1);
  }, [stageLabel]);


  const centerText = TEXTS[stageLabel] || "준비 중입니다.";

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
    </S.Container>
  );
}
