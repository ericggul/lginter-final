import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useControls } from "leva";
import { useBlobVars } from "./blob/blob.logic";
import * as S from './styles';
import { BlobCircle } from "./blob/blob.styles";
import useSocketTV2 from "@/utils/hooks/useSocketTV2";
import { MUSIC_CATALOG } from "@/utils/data/musicCatalog";

export default function TV2Controls() {
  const [env, setEnv] = useState({ temp: 24, humidity: 38, lightColor: '#6EA7FF', music: 'Solace' });
  const [albumUrl, setAlbumUrl] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [artist, setArtist] = useState('');

  const mapTitleToArtist = useCallback((title) => {
    if (!title) return '';
    const byTitle = MUSIC_CATALOG.find(m => m.title.toLowerCase() === String(title).toLowerCase());
    return byTitle?.artist || '';
  }, []);

  const onDeviceNewDecision = useCallback((msg) => {
    if (!msg || msg.target !== 'tv2') return;
    const e = msg.env || {};
    const next = {
      temp: e.temp ?? env.temp,
      humidity: e.humidity ?? env.humidity,
      lightColor: e.lightColor ?? env.lightColor,
      music: e.music ?? env.music,
    };
    setEnv(next);
    const title = next.music || '';
    setTrackTitle(title);
    setArtist(mapTitleToArtist(title));
    if (title) {
      const u = `/api/album?name=${encodeURIComponent(title)}`;
      setAlbumUrl(u);
    }
  }, [env, mapTitleToArtist]);

  useSocketTV2({
    onDeviceNewDecision,
  });

  const cssVars = useBlobVars(env);

  // Leva 패널로 TV2 우측 블롭의 그라데이션/크기/위치 조절
  const blobControl = useControls('TV2 Blob', {
    innerColor: { value: '#cbc6a3' },
    ringColor: { value: '#ffccc3' },
    haloColor: { value: '#ffffff00' },
    innerStop: { value: 20, min: 0, max: 100 },
    ringStart: { value: 53, min: 0, max: 100 },
    ringEnd:   { value: 26, min: 0, max: 100 },
    haloStart: { value: 55, min: 0, max: 100 },
    haloBlur:  { value: 50, min: 0, max: 100 }, // 이제 블롭 자체 블러 강도에 사용 (기본값 크게 상향)
    scaleBase: { value: 1.6, min: 0.5, max: 2.5 },
    offsetX:   { value: -23, min: -30, max: 30 },
    offsetY:   { value: -11, min: -30, max: 30 },
  });

  const blobStyle = {
    '--blob-inner-color': blobControl.innerColor,
    '--blob-ring-color': blobControl.ringColor,
    '--blob-outer-color': blobControl.haloColor,
    '--blob-inner-stop': `${blobControl.innerStop}%`,
    '--blob-ring-inner-stop': `${blobControl.ringStart}%`,
    '--blob-ring-outer-stop': `${blobControl.ringEnd}%`,
    '--blob-halo-start': `${blobControl.haloStart}%`, // (현재는 미사용이지만 값은 유지)
    '--blob-blur': `${blobControl.haloBlur}px`,
    '--blob-scale-base': blobControl.scaleBase,
    '--blob-tx': `${blobControl.offsetX}%`,
    '--blob-ty': `${blobControl.offsetY}%`,
  };

  return (
    <S.Root>
      <S.Header>
        <S.HeaderIcon>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 6.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11z" stroke="white" strokeWidth="1.8"/><path d="M12 1v3M12 20v3M23 12h-3M4 12H1M19.1 4.9l-2.1 2.1M7 17l-2.1 2.1M19.1 19.1L17 17M7 7L4.9 4.9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </S.HeaderIcon>
        <S.HeaderTitle>{env.lightLabel || 'Blue Light'}</S.HeaderTitle>
      </S.Header>
      <S.Content>
        <S.LeftPanel>
          <S.AngularSweep />
          <S.AngularSharp />
          <S.MusicRow>
            <S.MusicIcon>
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 17a3 3 0 1 1-2.5-2.96V6.5l11-2V14a3 3 0 1 1-2 2.83V8.6l-6 1.1V17z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/></svg>
            </S.MusicIcon>
            <div>{trackTitle || env.music}</div>
          </S.MusicRow>
          <S.AlbumCard style={albumUrl ? { backgroundImage: `url(${albumUrl})`, backgroundSize:'cover', backgroundPosition:'center' } : undefined} />
          <S.TrackTitle>{trackTitle || ' '}</S.TrackTitle>
          <S.Artist>{artist || ' '}</S.Artist>
        </S.LeftPanel>
        <S.RightPanel style={cssVars}>
          <S.ClimateGroup>
            <S.ClimateRow>
              <S.ClimateIcon>
                <svg viewBox="0 0 24 24" fill="none"><path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </S.ClimateIcon>
              <div>{env.temp}°C</div>
            </S.ClimateRow>
            <S.ClimateRow>
              <S.ClimateIcon>
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5C12 3.5 6 11 6 14.5a6 6 0 1 0 12 0c0-3.5-6-11-6-11z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              </S.ClimateIcon>
              <div>{env.humidity}%</div>
            </S.ClimateRow>
          </S.ClimateGroup>
          <S.BlobSpot>
            <BlobCircle style={blobStyle} />
          </S.BlobSpot>
        </S.RightPanel>
      </S.Content>
    </S.Root>
  );
}
