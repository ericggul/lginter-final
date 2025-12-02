import { useState, useMemo, useEffect } from "react";
import useSocketTV1 from "@/utils/hooks/useSocketTV1";
import * as S from './styles';
import * as B from './blobtextbox/@boxes';
import { createSocketHandlers } from './logic';

export default function TV1Controls() {
  const [keywords, setKeywords] = useState([]);
  const [tv2Color, setTv2Color] = useState('#FFD166');
  const [dotCount, setDotCount] = useState(0);
  const unifiedFont = '\'Pretendard\', \'Pretendard Variable\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
  // Top row 4 containers (left→right) dynamic texts; newest always goes to first
  const [topTexts, setTopTexts] = useState(['언짢음', '뿌듯함', '부끄러움', '정신없음']);

  // Blob appear sequence only (1 → 11), 2.5s gap, then stay visible
  const sequence = useMemo(() => [
    'Upset','Proud','Shy','Chaotic','Sad','Wonder','Interest','Playful','Happy','Annoyed','Hungry'
  ], []);
  const [show, setShow] = useState({});
  useEffect(() => {
    const stepMs = 3500; // slower gap (3.5s)
    let phase = 'in'; // 'in' then 'out', repeat
    let idx = -1;
    let timer;
    const step = () => {
      idx += 1;
      if (idx >= sequence.length) {
        idx = 0;
        phase = phase === 'in' ? 'out' : 'in';
      }
      const key = sequence[idx];
      setShow((prev) => ({ ...prev, [key]: phase === 'in' }));
      timer = setTimeout(step, stepMs);
    };
    timer = setTimeout(step, 0); // kick off immediately
    return () => { if (timer) clearTimeout(timer); };
  }, [sequence]);
  const vis = useMemo(() => ({
    Upset:  !!show.Upset,
    Proud:  !!show.Proud,
    Shy:    !!show.Shy,
    Chaotic:!!show.Chaotic,
    Sad:    !!show.Sad,
    Wonder: !!show.Wonder,
    Interest:!!show.Interest,
    Playful: !!show.Playful,
    Happy:   !!show.Happy,
    Annoyed: !!show.Annoyed,
    Hungry:  !!show.Hungry,
  }), [show]);

  // Scaling handled via CSS (viewport width) in styles.Canvas

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  const handlers = useMemo(
    () => createSocketHandlers({ setKeywords, unifiedFont, setTv2Color, setTopTexts }),
    [setKeywords, unifiedFont, setTv2Color, setTopTexts]
  );

  const { socket } = useSocketTV1({
    onEntranceNewVoice: handlers.onEntranceNewVoice,
    onDeviceDecision: handlers.onDeviceDecision,
    onDeviceNewDecision: handlers.onDeviceNewDecision,
  });

  return (
    <S.Root $fontFamily={unifiedFont}>
      <S.Canvas>
        <S.LeftLineImage />
        <S.LeftNow>Now</S.LeftNow>
        <S.LeftTime2>13:00</S.LeftTime2>
        <S.LeftTime3>12:00</S.LeftTime3>
        <S.LeftTime4>11:00</S.LeftTime4>
        <S.LeftShape />
        <S.LeftShape2 />
        <S.LeftShape3 />
        <S.LeftShape4 />
        <S.TopText $fontFamily={unifiedFont}>
          <S.Bold>오늘</S.Bold>
          <span>의 감정들은</span>
          <S.Dots aria-hidden="true">
            <S.Dot $visible={dotCount >= 1}>.</S.Dot>
            <S.Dot $visible={dotCount >= 2}>.</S.Dot>
            <S.Dot $visible={dotCount >= 3}>.</S.Dot>
          </S.Dots>
        </S.TopText>
        <B.InterestBox $fontFamily={unifiedFont} $visible={vis.Interest}>흥미로움</B.InterestBox>
        <B.PlayfulBox $fontFamily={unifiedFont} $visible={vis.Playful}>장난스러움</B.PlayfulBox>
        <B.HappyBox $fontFamily={unifiedFont} $visible={vis.Happy}>행복함</B.HappyBox>
        <B.UpsetBox $fontFamily={unifiedFont} $visible={vis.Upset}>{topTexts[0]}</B.UpsetBox>
        <B.ProudBox $fontFamily={unifiedFont} $visible={vis.Proud}>{topTexts[1]}</B.ProudBox>
        <B.ShyBox $fontFamily={unifiedFont} $visible={vis.Shy}>{topTexts[2]}</B.ShyBox>
        <B.ChaoticBox $fontFamily={unifiedFont} $visible={vis.Chaotic}>{topTexts[3]}</B.ChaoticBox>
        <B.SadBox $fontFamily={unifiedFont} $visible={vis.Sad}>슬픔</B.SadBox>
        <B.WonderBox $fontFamily={unifiedFont} $visible={vis.Wonder}>신기함</B.WonderBox>
        <B.AnnoyedBox $fontFamily={unifiedFont} $visible={vis.Annoyed}>짜증남</B.AnnoyedBox>
        <B.HungryBox $fontFamily={unifiedFont} $visible={vis.Hungry}>배고픔</B.HungryBox>
        
      </S.Canvas>
    </S.Root>
  );
}
