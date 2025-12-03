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
    innerColor:      { value: '#ffffff' },
    innerRingColor:  { value: '#b0f6ff' },
    mid1Color:       { value: '#db9db0' },
    mid2Color:       { value: '#f8cfc1' },
    outerColor:      { value: '#fff3ef' },
    extraColor:      { value: '#ffffff' },
    innerAlpha:      { value: 1.0,  min: 0, max: 1, step: 0.01 },
    innerRingAlpha:  { value: 1.0,  min: 0, max: 1, step: 0.01 },
    mid1Alpha:       { value: 0.89, min: 0, max: 1, step: 0.01 },
    mid2Alpha:       { value: 0.76, min: 0, max: 1, step: 0.01 },
    outerAlpha:      { value: 0.50, min: 0, max: 1, step: 0.01 },
    extraAlpha:      { value: 0.51, min: 0, max: 1, step: 0.01 },
    innerStop:       { value: 29,  min: 0, max: 100 },
    innerRingStop:   { value: 38,  min: 0, max: 100 },
    mid1Stop:        { value: 42,  min: 0, max: 100 },
    mid2Stop:        { value: 86,  min: 0, max: 100 },
    extraStop:       { value: 100, min: 0, max: 100 },
    outerStop:       { value: 83,  min: 0, max: 100 },
    blur:            { value: 32,  min: 0, max: 120 }, // px
    centerBrightness:{ value: 1.13, min: 0.7, max: 1.8, step: 0.01 },
    outerGlowRadius: { value: 600, min: 0, max: 600 }, // px, 가운데 원 가장 바깥쪽 빛 번짐
    outerGlowAlpha:  { value: 0.0,  min: 0, max: 1, step: 0.01 },
  });

  const background = useControls('SW1 Background', {
    baseColor:    { value: '#f3fbff' },
    topColor:     { value: '#edfffe' },
    midColor:     { value: '#f8f8ec' },
    bottomColor:  { value: '#fffcec' },
    angle:        { value: 228, min: 0, max: 360 },
    midStop:      { value: 63, min: 0, max: 100 },
    midStop2:     { value: 100, min: 0, max: 100 },
  });

  const animation = useControls('SW1 Animation', {
    rotationDuration: { value: 15, min: 0, max: 120, step: 1 },
  });

  const edgeBlur = useControls('SW1 Edge Blur', {
    strength: { value: 3.8, min: 0, max: 4, step: 0.05 },
    opacity:  { value: 0.13, min: 0, max: 1, step: 0.01 },
  });

  const edgeGlass = useControls('SW1 Edge Glass', {
    blur:    { value: 69,  min: 0, max: 80, step: 1 },
    opacity: { value: 0.29, min: 0, max: 1,  step: 0.01 },
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
        {/* 화면 가장자리를 따라 깔리는 글라스모피즘 레이어 (backdrop-filter) */}
        <S.EdgeGlassLayer
          $blur={edgeGlass.blur}
          $opacity={edgeGlass.opacity}
        />
        {/* 화면 가장자리를 따라 깔리는 보조 블러 레이어 (Leva로 강도/투명도 조절) */}
        <S.EdgeBlurLayer
          $strength={edgeBlur.strength}
          $opacity={edgeBlur.opacity}
        />
        <S.BlobRotator $duration={animation.rotationDuration}>
          {blobConfigs.map((b) => {
            const Component = S[b.componentKey];
            return (
              <Component
                key={b.id}
                $angleDeg={b.angleDeg}
                $depthLayer={b.depthLayer}
                $zSeed={b.zSeed}
              >
                <S.ContentRotator $duration={animation.rotationDuration}>
                  <strong>{b.top}</strong>
                  <span>{b.bottom}</span>
                </S.ContentRotator>
              </Component>
            );
          })}
          {/* 데이터와 무관하게 항상 함께 도는 작은 장식용 원 3개 */}
          <S.Sw1SmallOrbitDot1 />
          <S.Sw1SmallOrbitDot2 />
          <S.Sw1SmallOrbitDot3 />
        </S.BlobRotator>
        <S.GradientEllipse style={centerGlowStyle} />
        {/* 가운데 원 mid1Color 채도 펄스 오버레이 */}
        <S.CenterSaturationPulse />
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
