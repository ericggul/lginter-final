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

  // Scaling handled via CSS (viewport width) in styles.Canvas

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  const handlers = useMemo(
    () => createSocketHandlers({ setKeywords, unifiedFont, setTv2Color }),
    [setKeywords, unifiedFont, setTv2Color]
  );

  const { socket } = useSocketTV1({
    onEntranceNewVoice: handlers.onEntranceNewVoice,
    onDeviceDecision: handlers.onDeviceDecision,
    onDeviceNewDecision: handlers.onDeviceNewDecision,
  });

  return (
    <S.Root $fontFamily={unifiedFont}>
      <S.Canvas>
        <S.LeftNow>Now</S.LeftNow>
        <S.LeftTime2>13:00</S.LeftTime2>
        <S.LeftTime3>12:00</S.LeftTime3>
        <S.LeftTime4>11:00</S.LeftTime4>
        <S.LeftLineBlur />
        <S.LeftShape />
        <S.LeftShape2 />
        <S.LeftShape3 />
        <S.LeftShape4 />
        <S.LeftLine />
        <S.TopText $fontFamily={unifiedFont}>
          <S.Bold>오늘</S.Bold>
          <span>의 감정들은</span>
          <S.Dots aria-hidden="true">
            <S.Dot $visible={dotCount >= 1}>.</S.Dot>
            <S.Dot $visible={dotCount >= 2}>.</S.Dot>
            <S.Dot $visible={dotCount >= 3}>.</S.Dot>
          </S.Dots>
        </S.TopText>
        <B.InterestBox $fontFamily={unifiedFont}>흥미로움</B.InterestBox>
        <B.PlayfulBox $fontFamily={unifiedFont}>장난스러움</B.PlayfulBox>
        <B.HappyBox $fontFamily={unifiedFont}>행복함</B.HappyBox>
        <B.UpsetBox $fontFamily={unifiedFont}>언짢음</B.UpsetBox>
        <B.ProudBox $fontFamily={unifiedFont}>뿌듯함</B.ProudBox>
        <B.ShyBox $fontFamily={unifiedFont}>부끄러움</B.ShyBox>
        <B.ChaoticBox $fontFamily={unifiedFont}>정신없음</B.ChaoticBox>
        <B.SadBox $fontFamily={unifiedFont}>슬픔</B.SadBox>
        <B.WonderBox $fontFamily={unifiedFont}>신기함</B.WonderBox>
        <B.AnnoyedBox $fontFamily={unifiedFont}>짜증남</B.AnnoyedBox>
        <B.HungryBox $fontFamily={unifiedFont}>배고픔</B.HungryBox>
        <S.PillWrap>
          {keywords.map((kw) => (
            <S.Pill
              key={kw.id}
              $fontFamily={kw.fontFamily || unifiedFont}
              $fontWeight={kw.fontWeight}
              $fontStyle={kw.fontStyle}
              $fontSize={kw.fontSize}
            >
              <S.PillText>{kw.text}</S.PillText>
            </S.Pill>
          ))}
        </S.PillWrap>
      </S.Canvas>
    </S.Root>
  );
}
