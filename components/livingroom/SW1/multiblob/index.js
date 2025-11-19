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
        <BGKeyframesGlobal $blurIncrease={0} $blobSize={600} $orbitRadiusScale={1} />
        <BGBlobCssGlobal />
        <S.GradientEllipse />
        <S.CenterMark src="/figma/Ellipse%202767.png" alt="" />
        <S.SmallBlobsLayer>
          {/* Quadrant BackgroundCanvas blobs (smaller than center mark) */}
          <S.BCBlobTL>
            <div
              className="blob"
              style={{
                '--center-x': '38%',
                '--center-y': '23%',
                '--start': '50%',
                '--end': '99%',
                '--blur': '53px',
                '--feather': '12%',
                '--inner-blur': '20px',
                '--rim-tilt': '30deg',
                '--c0': '#F7F7E8',
                '--c1': '#F4E9D7',
                '--c2': '#F79CBF',
                '--c3': '#C5F7EA',
                '--c4': '#C8F4E9',
                '--bg': 'radial-gradient(circle at var(--center-x) var(--center-y), var(--c0) 0%, var(--c1) 13%, var(--c2) 47%, var(--c3) 78%, var(--c4) 100%)',
                '--tint-alpha': 0.85,
                '--boost': 1.9,
                width: '100%',
                aspectRatio: '1 / 1',
                animation: 'ringPulse 6s ease-in-out infinite',
              }}
            >
              <div className="ring-boost" />
            </div>
          </S.BCBlobTL>
          <S.BCBlobTR>
            <div className="blob" style={{
              '--center-x': '62%',
              '--center-y': '27%',
              '--start': '50%',
              '--end': '99%',
              '--blur': '53px',
              '--feather': '12%',
              '--inner-blur': '20px',
              '--rim-tilt': '30deg',
              '--c0': '#F7F7E8','--c1':'#F4E9D7','--c2':'#F79CBF','--c3':'#C5F7EA','--c4':'#C8F4E9',
              '--bg': 'radial-gradient(circle at var(--center-x) var(--center-y), var(--c0) 0%, var(--c1) 13%, var(--c2) 47%, var(--c3) 78%, var(--c4) 100%)',
              '--tint-alpha': 0.85,'--boost':1.9, width:'100%', aspectRatio:'1/1', animation:'ringPulse 6s ease-in-out infinite'
            }}><div className="ring-boost" /></div>
          </S.BCBlobTR>
          <S.BCBlobBL>
            <div className="blob" style={{
              '--center-x': '36%',
              '--center-y': '73%',
              '--start': '50%',
              '--end': '99%',
              '--blur': '53px',
              '--feather': '12%',
              '--inner-blur': '20px',
              '--rim-tilt': '30deg',
              '--c0': '#F7F7E8','--c1':'#F4E9D7','--c2':'#F79CBF','--c3':'#C5F7EA','--c4':'#C8F4E9',
              '--bg': 'radial-gradient(circle at var(--center-x) var(--center-y), var(--c0) 0%, var(--c1) 13%, var(--c2) 47%, var(--c3) 78%, var(--c4) 100%)',
              '--tint-alpha': 0.85,'--boost':1.9, width:'100%', aspectRatio:'1/1', animation:'ringPulse 6s ease-in-out infinite'
            }}><div className="ring-boost" /></div>
          </S.BCBlobBL>
          <S.BCBlobBR>
            <div className="blob" style={{
              '--center-x': '64%',
              '--center-y': '74%',
              '--start': '50%',
              '--end': '99%',
              '--blur': '53px',
              '--feather': '12%',
              '--inner-blur': '20px',
              '--rim-tilt': '30deg',
              '--c0': '#F7F7E8','--c1':'#F4E9D7','--c2':'#F79CBF','--c3':'#C5F7EA','--c4':'#C8F4E9',
              '--bg': 'radial-gradient(circle at var(--center-x) var(--center-y), var(--c0) 0%, var(--c1) 13%, var(--c2) 47%, var(--c3) 78%, var(--c4) 100%)',
              '--tint-alpha': 0.85,'--boost':1.9, width:'100%', aspectRatio:'1/1', animation:'ringPulse 6s ease-in-out infinite'
            }}><div className="ring-boost" /></div>
          </S.BCBlobBR>
        </S.SmallBlobsLayer>
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




