import { useMemo } from "react";
import { useControls } from "leva";
import { KeyframesGlobal as BGKeyframesGlobal, BlobCssGlobal as BGBlobCssGlobal } from "@/components/mobile/BackgroundCanvas/styles";
import * as S from './styles';
import { useSW1Logic } from "./logic";

export default function SW1Controls() {
  const BACKGROUND_URL = null; // remove background PNG (big pink blobs)
  const ELLIPSE_URL = "/sw1_blobimage/sw1-ellipse.png"; // ellipse image moved to public/sw1_blobimage/sw1-ellipse.png

  const { blobConfigs, centerTemp, centerHumidity, participantCount, dotCount } = useSW1Logic();

  // Leva controls for live-tuning center glow & background gradient (front-end only)
  const centerGlow = useControls('SW1 Center Glow', {
    innerColor:   { value: '#ffffff' },
    mid1Color:    { value: '#bfffff' },
    mid2Color:    { value: '#ffe1ef' },
    outerColor:   { value: '#faffec' },
    innerAlpha:   { value: 1,    min: 0, max: 1, step: 0.01 },
    mid1Alpha:    { value: 0.45, min: 0, max: 1, step: 0.01 },
    mid2Alpha:    { value: 0.74, min: 0, max: 1, step: 0.01 },
    outerAlpha:   { value: 0.9,  min: 0, max: 1, step: 0.01 },
    innerStop:    { value: 41,  min: 0, max: 100 },
    mid1Stop:     { value: 60,  min: 0, max: 100 },
    mid2Stop:     { value: 100, min: 0, max: 100 },
    outerStop:    { value: 100, min: 0, max: 100 },
    blur:         { value: 38, min: 0, max: 120 }, // px
  });

  const background = useControls('SW1 Background', {
    baseColor:    { value: '#a7a0a7' },
    topColor:     { value: '#fcffff' },
    bottomColor:  { value: '#ffffff' },
    angle:        { value: 0, min: 0, max: 360 },
    midStop:      { value: 77, min: 0, max: 100 },
  });

  const hexToRgb = (hex) => {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;
    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const toRgba = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const centerGlowStyle = useMemo(() => {
    const c1 = toRgba(centerGlow.innerColor, centerGlow.innerAlpha);
    const c2 = toRgba(centerGlow.mid1Color, centerGlow.mid1Alpha);
    const c3 = toRgba(centerGlow.mid2Color, centerGlow.mid2Alpha);
    const c4 = toRgba(centerGlow.outerColor, centerGlow.outerAlpha);

    const gradient = `radial-gradient(47.13% 47.13% at 50% 50%, ${c1} ${centerGlow.innerStop}%, ${c2} ${centerGlow.mid1Stop}%, ${c3} ${centerGlow.mid2Stop}%, ${c4} ${centerGlow.outerStop}%)`;

    return {
      background: gradient,
      filter: `blur(${centerGlow.blur}px)`,
    };
  }, [centerGlow]);

  const rootBackgroundStyle = useMemo(() => {
    const gradient = `linear-gradient(${background.angle}deg, ${background.topColor} 0%, ${background.topColor} ${background.midStop}%, ${background.bottomColor} 100%)`;
    return {
      backgroundColor: background.baseColor,
      backgroundImage: gradient,
    };
  }, [background]);

  return (
    <S.Root $backgroundUrl={BACKGROUND_URL} style={rootBackgroundStyle}>
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
        {blobConfigs.map((b) => {
          const Component = S[b.componentKey];
          return (
            <Component key={b.id}>
              <strong>{b.top}</strong>
              <span>{b.bottom}</span>
            </Component>
          );
        })}
        <S.GradientEllipse style={centerGlowStyle} />
        <S.CenterMark src="/figma/Ellipse%202767.png" alt="" />
        <S.EllipseLayer>
          <S.Ellipse $ellipseUrl={ELLIPSE_URL} />
        </S.EllipseLayer>
        <S.CenterTextWrap>
          <S.CenterTemp>{`${centerTemp}°C`}</S.CenterTemp>
          <S.CenterMode>{/* show mode from humidity */}{centerHumidity >= 0 ? (centerHumidity >= 65 ? '강력 제습' : centerHumidity >= 55 ? '적정 제습' : centerHumidity >= 45 ? '기본 제습' : centerHumidity >= 35 ? '적정 가습' : '강력 가습') : ''}</S.CenterMode>
        </S.CenterTextWrap>
      </S.Stage>
    </S.Root>
  );
}




