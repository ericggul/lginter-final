import { useEffect, useMemo, useRef, useState } from 'react';
import * as S from './styles';

// Phases
// hidden -> greet1(만나서/반가워요!) -> greet2(오늘도/수고하셨어요.) -> final(오늘의 하루는/어땠나요?)
export default function HeroText({ isModal = false, onFinalPhase, forceFinal }) {
  const [phase, setPhase] = useState('hidden');
  const [opacity, setOpacity] = useState(0);

  const fadeMs = 650; // fade duration (조금 더 여유 있게 페이드 인/아웃)
  const visibleMs = 2000; // time to wait before next change

  const timersRef = useRef([]);
  const clearTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    // Start timeline after mount
    const t1 = setTimeout(() => {
      // 먼저 greet1 상태로 전환 후, opacity를 0 -> 1로 올리면서
      // 실제 텍스트가 부드럽게 페이드 인되도록 분리
      setPhase('greet1');
      setOpacity(0);
      const t2 = setTimeout(() => {
        setOpacity(1);
      }, 120); // 한두 프레임 정도 여유를 두고 트리거
      timersRef.current.push(t2);
    }, 2000); // first appearance within 2 seconds after entering
    timersRef.current.push(t1);
    return clearTimers;
  }, []);

  // External override: jump directly to final phase (restart flow)
  useEffect(() => {
    if (!forceFinal) return;
    clearTimers();
    setPhase('final');
    setOpacity(1);
    if (typeof onFinalPhase === 'function') onFinalPhase();
  }, [forceFinal]);

  useEffect(() => {
    if (phase === 'greet1') {
      // After showing greet1 for 2s, fade to greet2
      const t = setTimeout(() => {
        setOpacity(0);
        const tInner = setTimeout(() => {
          setPhase('greet2');
          setOpacity(1);
          
        }, fadeMs);
        timersRef.current.push(tInner);
      }, visibleMs);
      timersRef.current.push(t);
    } else if (phase === 'greet2') {
      // After showing greet2 for 2s, fade to final and notify parent
      const t = setTimeout(() => {
        setOpacity(0);
        const tInner = setTimeout(() => {
          setPhase('final');
          setOpacity(1);
          if (typeof onFinalPhase === 'function') onFinalPhase();
        }, fadeMs);
        timersRef.current.push(tInner);
      }, visibleMs);
      timersRef.current.push(t);
    }
  }, [phase]);

  const { line1, line2, subText } = useMemo(() => {
    if (phase === 'greet1') {
      // 만나서 반가워요 화면: 퓨론 자기소개 문구는 제거
      return { line1: '만나서', line2: '반가워요!', subText: null };
    }
    if (phase === 'greet2') {
      return { line1: '오늘도', line2: '수고하셨어요.', subText: null };
    }
    if (phase === 'final') {
      return {
        line1: '오늘 하루는',
        line2: '어땠나요?',
        // 안내 문구 카피 수정: (롱프레스 제거) 탭으로 즉시 음성 입력 시작
        subText: '아래의 원을 눌러 짧은 키워드를 말해주세요',
      };
    }
    // hidden
    return { line1: '', line2: '', subText: null };
  }, [phase]);

  if (phase === 'hidden') {
    return <div></div>
  }

  return (
    <S.Container>
      <S.Title $isModal={isModal} $opacity={opacity} $fadeMs={fadeMs}>
        {line1}<br/>{line2}
      </S.Title>
      {subText && (
        <S.Sub $isModal={isModal} $opacity={opacity} $fadeMs={fadeMs}>
          {subText}
        </S.Sub>
      )}
    </S.Container>
  );
}



