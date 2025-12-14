import { useEffect, useRef } from 'react';
import * as S from './styles';
import { BlobBackground, TopMessage as TopMsg, BetweenIcon, QrFloat, FuronMark } from './ui';
import { useSbm1 } from './logic';
import { playSbm1BackgroundLoop } from '@/utils/data/soundeffect';

export default function SBM1Controls() {
  const { qrUrl, furonPath, vars, stage, flashTick } = useSbm1();

  // SBM1 화면용 백그라운드 음악 (lg_sbm1_251211.mp3)
  // - 입구 화면이 열려 있는 동안, 은은하게 loop 재생
  const bgAudioRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (bgAudioRef.current) return; // 이미 재생 중이면 중복 방지
    const audio = playSbm1BackgroundLoop(0.2);
    bgAudioRef.current = audio || null;
    return () => {
      try {
        if (bgAudioRef.current) {
          bgAudioRef.current.pause();
        }
      } catch {}
      bgAudioRef.current = null;
    };
  }, []);

  return (
    <S.Container style={vars}>
      <BlobBackground />
      {/* key forces remount so the pulse animation restarts every trigger */}
      <S.BGFlash key={flashTick} $pulse={flashTick > 0} />
      <TopMsg stage={stage} />
      <BetweenIcon src="/sbm/sbm1-between-icon.png.png" active={stage === 't3'} />
      <QrFloat value={qrUrl} />
      <FuronMark src={furonPath} />
    </S.Container>
  );
}
