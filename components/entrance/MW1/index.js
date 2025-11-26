import { useEffect, useRef, useState } from "react";
import useSocketMW1 from "@/utils/hooks/useSocketMW1";
import * as S from './styles';
import { useMW1VideoLogic } from "./logic";

export default function MW1Controls() {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [src, setSrc] = useState("/video/idle.mp4");
  const [videoKey, setVideoKey] = useState('idle');
  const [showTip, setShowTip] = useState(false);

  const { handleEnded, onEntranceNewUser } = useMW1VideoLogic({
    isActive, setIsActive, setSrc, setVideoKey, idleSrc: "/video/idle.mp4", activeSrc: "/video/active.mp4",
    onActivated: () => {
      // Show tip 2s after activation, and keep it while active
      setTimeout(() => {
        setShowTip(true);
      }, 2000);
    }
  });

  useSocketMW1({ onEntranceNewUser });
  // Hide tip when we return to idle
  useEffect(() => {
    if (!isActive) setShowTip(false);
  }, [isActive]);

  return (
    <S.Container>
      <S.FullscreenVideo
        key={videoKey}
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        loop={!isActive}
      />
      <S.CenterTip $show={showTip}>변화된 집 안의 상태를 구경해보세요</S.CenterTip>
    </S.Container>
  );
}
