import { useRef, useState } from "react";
import useSocketMW1 from "@/utils/hooks/useSocketMW1";
import * as S from './styles';
import { useMW1VideoLogic } from "./logic";

export default function MW1Controls() {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [src, setSrc] = useState("/video/idle.mp4");
  const [videoKey, setVideoKey] = useState('idle');

  const { handleEnded, onEntranceNewUser } = useMW1VideoLogic({
    isActive, setIsActive, setSrc, setVideoKey, idleSrc: "/video/idle.mp4", activeSrc: "/video/active.mp4"
  });

  useSocketMW1({ onEntranceNewUser });

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
    </S.Container>
  );
}
