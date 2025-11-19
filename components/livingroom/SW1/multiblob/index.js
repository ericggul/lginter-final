import { useState, useEffect, useCallback } from "react";
import { KeyframesGlobal as BGKeyframesGlobal, BlobCssGlobal as BGBlobCssGlobal } from "@/components/mobile/BackgroundCanvas/styles";
import useSocketSW1 from "@/utils/hooks/useSocketSW1";
import * as S from './styles';

export default function SW1Controls() {
  const [climateData, setClimateData] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [individuals, setIndividuals] = useState([]); // [{userId,temp,humidity,ts}]
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

  const handleDeviceNewDecision = useCallback((msg) => {
    if (!msg || msg.target !== 'sw1') return;
    const env = msg.env || {};
    setClimateData({ temperature: env.temp, humidity: env.humidity });
    // participant count (if provided later on server)
    if (typeof msg.participantCount === 'number') {
      setParticipantCount(msg.participantCount);
    }
    // collect individuals (prefer array; fallback to single)
    const now = Date.now();
    const addList = Array.isArray(msg.individuals) && msg.individuals.length
      ? msg.individuals.map((it) => ({ userId: it.userId, temp: it.temp, humidity: it.humidity, ts: now }))
      : (msg.individual ? [{ userId: msg.individual.userId, temp: msg.individual.temp, humidity: msg.individual.humidity, ts: now }] : []);
    if (addList.length) {
      setIndividuals((prev) => {
        const map = new Map(prev.map((p) => [p.userId, p]));
        addList.forEach((p) => map.set(String(p.userId || now), p));
        // keep most recent 3
        const arr = Array.from(map.values()).sort((a,b) => (b.ts||0)-(a.ts||0)).slice(0,3);
        return arr;
      });
    }
  }, []);

  const { socket } = useSocketSW1({ onDeviceDecision: handleDeviceDecision, onDeviceNewDecision: handleDeviceNewDecision });

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
        {/* User bubbles mapped to corners TL/TR/BL; newest first */}
        {individuals[0] && <S.LabelTL>{`${individuals[0].temp ?? '-'}° / ${individuals[0].humidity ?? '-'}%`}</S.LabelTL>}
        {individuals[1] && <S.LabelTR>{`${individuals[1].temp ?? '-'}° / ${individuals[1].humidity ?? '-'}%`}</S.LabelTR>}
        {individuals[2] && <S.LabelBL>{`${individuals[2].temp ?? '-'}° / ${individuals[2].humidity ?? '-'}%`}</S.LabelBL>}
      </S.Stage>
    </S.Root>
  );
}




