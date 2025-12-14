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
  const [tipText, setTipText] = useState('환영합니다.\n조율된 공간을 경험해보세요.');
  const [tipAnimState, setTipAnimState] = useState('hidden'); // 'hidden' | 'enter' | 'visible' | 'exit'
  const { play } = useTTS({ voice: 'marin', model: 'gpt-4o-mini-tts', format: 'mp3' });
  const hasWelcomedRef = useRef(false);
  const timeoutsRef = useRef([]);

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
      // 기존 타이머 정리
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      setIsActive(true);
      const schedule = (fn, delay) => {
        const id = setTimeout(fn, delay);
        timeoutsRef.current.push(id);
      };

      const initialDelay = 2000; // 기존과 동일하게 2초 후 시작
      const enterDuration = 700;
      const holdDuration = 4000;
      const exitDuration = 900;
      const gapBetween = 400;
      const secondHoldDuration = 3000; // 두 번째 모달은 조금 더 일찍 사라지도록

      // 1. 첫 번째 메시지 (환영합니다...)
      schedule(() => {
        setTipText('환영합니다.\n조율된 공간을 경험해보세요.');
        setShowTip(true);
        setTipAnimState('enter');

        schedule(() => {
          setTipAnimState('visible');
        }, enterDuration);

        schedule(() => {
          setTipAnimState('exit');
        }, enterDuration + secondHoldDuration);
      }, initialDelay);

      // 2. 첫 번째 모달 완전 종료 후, 두 번째 메시지
      const firstTotal =
        initialDelay + enterDuration + holdDuration + exitDuration + gapBetween;

      schedule(() => {
        setShowTip(false);
        // 두 번째 문구: 거실에 공간이\n준비되었습니다. (두 줄 구성)
        setTipText('거실에 공간이\n준비되었습니다.');
        setShowTip(true);
        setTipAnimState('enter');

        schedule(() => {
          setTipAnimState('visible');
        }, enterDuration);

        schedule(() => {
          setTipAnimState('exit');
        }, enterDuration + holdDuration);

        schedule(() => {
          setShowTip(false);
          setTipAnimState('hidden');
        }, enterDuration + secondHoldDuration + exitDuration);
      }, firstTotal);
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

  // isActive 상승 시점(T1)에만 환영 멘트 재생; 비활성화 시 리셋
  useEffect(() => {
    if (isActive && !hasWelcomedRef.current) {
      hasWelcomedRef.current = true;
      try { play('환영합니다. 조율된 공간을 경험해보세요.'); } catch {}
    }
    if (!isActive) {
      hasWelcomedRef.current = false;
    }
  }, [isActive, play]);

  // When active finishes (not looping), fade out to idle
  useEffect(() => {
    const a = activeRef.current;
    if (!a) return;
    const onEnded = () => {
      // 액티브 영상이 끝나면 이후 예약된 모달 타이머를 모두 정리하고 즉시 숨김
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      setIsActive(false);
      setShowTip(false);
      setTipAnimState('hidden');
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

  // 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
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
      <S.CenterTip $show={showTip} $state={tipAnimState}>
        {tipText}
      </S.CenterTip>
    </S.Container>
  );
}
