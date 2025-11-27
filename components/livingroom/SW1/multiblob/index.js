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
    innerRingColor: { value: '#b5fbde' },  // 하얀 중심 바로 바깥쪽 링
    mid1Color:    { value: '#dba6a6' },
    mid2Color:    { value: '#b8ccbe' },
    outerColor:   { value: '#f9ffdc' },
    extraColor:   { value: '#d4f5ff' },
    innerAlpha:      { value: 1.00, min: 0, max: 1, step: 0.01 },
    innerRingAlpha:  { value: 0.76, min: 0, max: 1, step: 0.01 },
    mid1Alpha:       { value: 1.00, min: 0, max: 1, step: 0.01 },
    mid2Alpha:       { value: 0.42, min: 0, max: 1, step: 0.01 },
    outerAlpha:      { value: 0.47, min: 0, max: 1, step: 0.01 },
    extraAlpha:      { value: 0.13, min: 0, max: 1, step: 0.01 },
    innerStop:       { value: 27,  min: 0, max: 100 },
    innerRingStop:   { value: 0,   min: 0, max: 100 },
    mid1Stop:        { value: 42,  min: 0, max: 100 },
    mid2Stop:        { value: 97,  min: 0, max: 100 },
    extraStop:       { value: 99,  min: 0, max: 100 },
    outerStop:       { value: 57,  min: 0, max: 100 },
    blur:            { value: 30,  min: 0, max: 120 }, // px
    centerBrightness:{ value: 1.34, min: 0.7, max: 1.8, step: 0.01 },
    outerGlowRadius: { value: 600, min: 0, max: 600 }, // px, 가운데 원 가장 바깥쪽 빛 번짐
    outerGlowAlpha:  { value: 0.56, min: 0, max: 1, step: 0.01 },
  });

  const background = useControls('SW1 Background', {
    baseColor:    { value: '#ffffff' },
    topColor:     { value: '#f4f7ff' },
    midColor:     { value: '#ffffff' },
    bottomColor:  { value: '#ffffff' },
    angle:        { value: 84, min: 0, max: 360 },
    midStop:      { value: 100, min: 0, max: 100 },
    midStop2:     { value: 63, min: 0, max: 100 },
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
    const cRing = toRgba(centerGlow.innerRingColor, centerGlow.innerRingAlpha);
    const c2 = toRgba(centerGlow.mid1Color, centerGlow.mid1Alpha);
    const c3 = toRgba(centerGlow.mid2Color, centerGlow.mid2Alpha);
    const c4 = toRgba(centerGlow.outerColor, centerGlow.outerAlpha);
    const cExtra = toRgba(centerGlow.extraColor, centerGlow.extraAlpha);

    const gradient = `radial-gradient(47.13% 47.13% at 50% 50%, ${
      c1
    } ${centerGlow.innerStop}%, ${
      cRing
    } ${centerGlow.innerRingStop}%, ${
      c2
    } ${centerGlow.mid1Stop}%, ${
      c3
    } ${centerGlow.mid2Stop}%, ${
      cExtra
    } ${centerGlow.extraStop}%, ${
      c4
    } ${centerGlow.outerStop}%)`;

    return {
      background: gradient,
      filter: `blur(${centerGlow.blur}px) brightness(${centerGlow.centerBrightness})`,
      boxShadow:
        centerGlow.outerGlowRadius > 0 && centerGlow.outerGlowAlpha > 0
          ? `0 0 ${centerGlow.outerGlowRadius}px rgba(255, 255, 255, ${centerGlow.outerGlowAlpha})`
          : 'none',
    };
  }, [centerGlow]);

  const rootBackgroundStyle = useMemo(() => {
    const gradient = `linear-gradient(${background.angle}deg, ${background.topColor} 0%, ${background.topColor} ${background.midStop}%, ${background.midColor} ${background.midStop2}%, ${background.bottomColor} 100%)`;
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
        <S.CenterPulse />
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




