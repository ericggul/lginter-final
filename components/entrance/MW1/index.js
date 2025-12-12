import { useEffect, useRef, useState } from "react";
import useSocketMW1 from "@/utils/hooks/useSocketMW1";
import useTTS from "@/utils/hooks/useTTS";
import * as S from './styles';
import { playMw1IdleBackgroundLoop, playMw1ActiveBackgroundLoop } from '@/utils/data/soundeffect';

export default function MW1Controls() {
  const idleRef = useRef(null);
  const activeRef = useRef(null);
  const idleBgRef = useRef(null);
  const activeBgRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const { play } = useTTS({ voice: 'marin', model: 'gpt-4o-mini-tts', format: 'mp3' });

  // Keep idle video & idle bg music playing continuously (until active triggered)
  useEffect(() => {
    const v = idleRef.current;
    if (v) {
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
    }
    return undefined;
  }, []);

  // Idle 배경음 loop (mw1_idle.mp3) – 컴포넌트 마운트 시 시작
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (idleBgRef.current) return;
    const audio = playMw1IdleBackgroundLoop(0.22);
    idleBgRef.current = audio || null;
    return () => {
      try { idleBgRef.current?.pause(); } catch {}
      idleBgRef.current = null;
    };
  }, []);

  // Activate on entrance-new-user → fade active in
  useSocketMW1({
    onEntranceNewUser: () => {
      setIsActive(true);
      // 2초 후 텍스트 등장, 총 8초 후 사라짐
      setTimeout(() => {
        setShowTip(true);
        setTimeout(() => setShowTip(false), 8000);
      }, 2000);
      try { play('안녕하세요! 반갑습니다!'); } catch {}
      const a = activeRef.current;
      if (a) {
        try { a.currentTime = 0; a.play(); } catch {}
      }
      // idle 음악 정지, active 음악 시작
      try { idleBgRef.current?.pause(); } catch {}
      const bg = playMw1ActiveBackgroundLoop(0.24);
      activeBgRef.current = bg || null;
    }
  });

  // When active finishes (not looping), fade out to idle
  useEffect(() => {
    const a = activeRef.current;
    if (!a) return;
    const onEnded = () => {
      setIsActive(false);
      setShowTip(false);
      // active 음악을 멈추고 idle 음악을 다시 켠다
      try { activeBgRef.current?.pause(); } catch {}
      if (!idleBgRef.current && typeof window !== 'undefined') {
        const audio = playMw1IdleBackgroundLoop(0.22);
        idleBgRef.current = audio || null;
      } else {
        try { idleBgRef.current?.play(); } catch {}
      }
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
      <S.CenterTip $show={showTip}>
        <strong>어서오세요!</strong>
        {'\n'}
        들어와서 조율된 공간을 경험해보세요
      </S.CenterTip>
    </S.Container>
  );
}
