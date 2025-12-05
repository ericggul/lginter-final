import { useEffect, useRef, useState } from "react";
import useSocketMW1 from "@/utils/hooks/useSocketMW1";
import useTTS from "@/utils/hooks/useTTS";
import * as S from './styles';

export default function MW1Controls() {
  const idleRef = useRef(null);
  const activeRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const { play } = useTTS({ voice: 'alloy', model: 'gpt-4o-mini-tts', format: 'mp3' });

  // Keep idle video playing continuously
  useEffect(() => {
    const v = idleRef.current;
    if (!v) return;
    v.loop = true;
    const tryPlay = () => { try { v.play(); } catch {} };
    tryPlay();
    const onInteract = () => tryPlay();
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  // Activate on entrance-new-user → fade active in
  useSocketMW1({
    onEntranceNewUser: () => {
      setIsActive(true);
      setTimeout(() => setShowTip(true), 2000);
      try { play('안녕하세요! 반갑습니다!'); } catch {}
      const a = activeRef.current;
      if (a) {
        try { a.currentTime = 0; a.play(); } catch {}
      }
    }
  });

  // When active finishes (not looping), fade out to idle
  useEffect(() => {
    const a = activeRef.current;
    if (!a) return;
    const onEnded = () => {
      setIsActive(false);
      setShowTip(false);
    };
    a.addEventListener('ended', onEnded);
    return () => a.removeEventListener('ended', onEnded);
  }, []);

  return (
    <S.Container>
      {/* Idle layer: always playing */}
      <S.LayerVideo
        ref={idleRef}
        src="/video/idle.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        $show={!isActive}
      />
      {/* Active layer: faded in on trigger */}
      <S.LayerVideo
        ref={activeRef}
        src="/video/active.mp4"
        muted
        playsInline
        preload="auto"
        $show={isActive}
      />
      <S.CenterTip $show={showTip}>변화된 집 안의 상태를 구경해보세요</S.CenterTip>
    </S.Container>
  );
}
