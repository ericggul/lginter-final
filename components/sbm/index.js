import { useMemo } from "react";
import { useRouter } from "next/router";
import { useSbmPlayer } from "./logic";
import * as S from "./styles";

export default function SbmScreen() {
  const router = useRouter();
  const slugParam = router?.query?.slug;
  const slugKey = useMemo(() => {
    const raw = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    if (raw === "2" || raw === "3") return raw;
    return "1";
  }, [slugParam]);

  const { videoSrc, stageLabel, socketStatus } = useSbmPlayer(slugKey);

  return (
    <S.Container>
      <S.StageBadge>
        <span>{stageLabel || "t1"}</span>
        <S.StatusDot $state={socketStatus} />
      </S.StageBadge>
      <S.VideoWrap>
        <S.Video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
        />
        <S.VideoLabel>
          sbm/{slugKey}
        </S.VideoLabel>
      </S.VideoWrap>
    </S.Container>
  );
}
