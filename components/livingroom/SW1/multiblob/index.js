import { useState, useEffect, useCallback } from "react";
import { KeyframesGlobal as BGKeyframesGlobal, BlobCssGlobal as BGBlobCssGlobal } from "@/components/mobile/BackgroundCanvas/styles";
import useSocketSW1 from "@/utils/hooks/useSocketSW1";
import * as S from './styles';

export default function SW1Controls() {
  const [climateData, setClimateData] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const BACKGROUND_URL = null; // remove background PNG (big pink blobs)
  const ELLIPSE_URL = "/sw1_blobimage/sw1-ellipse.png"; // ellipse image moved to public/sw1_blobimage/sw1-ellipse.png

  const handleDeviceDecision = useCallback((data) => {
    const seenUsers = new Set();
    if (data.device === 'sw1') {
      setClimateData({ temperature: data.temperature, humidity: data.humidity });
      if (data.assignedUsers) {
        Object.values(data.assignedUsers).forEach((u) => {
          if (u && u !== 'N/A') seenUsers.add(String(u));
        });
        setParticipantCount(seenUsers.size);
      }
    }
  }, []);

  const { socket } = useSocketSW1({ onDeviceDecision: handleDeviceDecision });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  const computeMode = (humidity) => {
    if (humidity == null) return '';
    if (humidity >= 65) return '강력 제습';
    if (humidity >= 55) return '적정 제습';
    if (humidity >= 45) return '기본 제습';
    if (humidity >= 35) return '적정 가습';
    return '강력 가습';
  };

  const baseTemp = climateData?.temperature ?? 23;
  const baseHum = climateData?.humidity ?? 50;

  // animation and blobs removed per request

  return (
    <S.Root $backgroundUrl={BACKGROUND_URL}>
      <S.MotionProps />
      <S.TopStatus>
        <span>사용자 {participantCount}명을 위한 조율중</span>
        <S.Dots aria-hidden="true">
          <S.Dot $visible={dotCount >= 1}>.</S.Dot>
          <S.Dot $visible={dotCount >= 2}>.</S.Dot>
          <S.Dot $visible={dotCount >= 3}>.</S.Dot>
        </S.Dots>
      </S.TopStatus>
      <S.Stage>
        <S.Sw1InterestBlob>
          <strong>22℃</strong>
          <span>강력 제습</span>
        </S.Sw1InterestBlob>
        <S.Sw1WonderBlob>
          <strong>24℃</strong>
          <span>적정 제습</span>
        </S.Sw1WonderBlob>
        <S.Sw1HappyBlob>
          <strong>21℃</strong>
          <span>강력 가습</span>
        </S.Sw1HappyBlob>
        <S.Sw1MoistureBlob>
          <strong>20℃</strong>
          <span>적정 가습</span>
        </S.Sw1MoistureBlob>
        <S.GradientEllipse />
        <S.CenterMark src="/figma/Ellipse%202767.png" alt="" />
        <S.EllipseLayer>
          <S.Ellipse $ellipseUrl={ELLIPSE_URL} />
        </S.EllipseLayer>
        <S.CenterTextWrap>
          <S.CenterTemp>{`${baseTemp}°C`}</S.CenterTemp>
          <S.CenterMode>{computeMode(baseHum)}</S.CenterMode>
        </S.CenterTextWrap>
      </S.Stage>
    </S.Root>
  );
}




