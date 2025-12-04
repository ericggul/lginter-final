import { useEffect, useMemo, useState } from "react";
import { useControls } from "leva";
import { KeyframesGlobal as BGKeyframesGlobal, BlobCssGlobal as BGBlobCssGlobal } from "@/components/mobile/BackgroundCanvas/styles";
import * as S from './styles';
import { useSW1Logic } from "../logic/mainlogic";
import { computeBigBlobHues, computeBackgroundHsl, computeMiniWarmHue, pulseMidAlpha, toHsla } from "../logic/color";

// 중앙 화이트 영역을 약간 일렁이는 유기적 형태로 만드는 SVG Path 생성 유틸
function useOrganicCenterPath() {
  const [phase, setPhase] = useState(0);

  // 천천히 phase를 증가시켜서 시간이 지남에 따라 살짝 형태가 변하도록 함
  useEffect(() => {
    let frame;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = now - lastTime;
      lastTime = now;
      // 약 14초에 한 바퀴 정도 도는 속도로, 숨쉬는 느낌이 더 잘 느껴지도록 조정
      const speed = (2 * Math.PI) / 14000; // rad/ms
      setPhase((prev) => prev + speed * dt);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const pathD = useMemo(() => {
    const cx = 0;
    const cy = 0;
    const baseR = 50; // 기준 반경
    const steps = 80;
    // 숨쉬는 느낌이 눈에 띄게 보이도록 흔들림 강도를 조금 더 키움
    const epsilon = 0.12;
    const harmonic = 5; // 물결 개수

    let d = "";
    for (let i = 0; i <= steps; i += 1) {
      const t = (2 * Math.PI * i) / steps;
      const wobble = 1 + epsilon * Math.sin(harmonic * t + phase);
      const r = baseR * wobble;
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      const cmd = i === 0 ? "M" : "L";
      d += `${cmd}${x.toFixed(2)},${y.toFixed(2)} `;
    }
    d += "Z";
    return d;
  }, [phase]);

  return pathD;
}

export default function SW1Controls() {
  const BACKGROUND_URL = null; // remove background PNG (big pink blobs)
  const ELLIPSE_URL = "/sw1_blobimage/sw1-ellipse.png"; // ellipse image moved to public/sw1_blobimage/sw1-ellipse.png

  const { blobConfigs, centerTemp, centerHumidity, participantCount, dotCount, decisionTick, timelineState, bloomTick, typeTick } = useSW1Logic();
  const organicCenterPath = useOrganicCenterPath();
  const [midPulseAlpha, setMidPulseAlpha] = useState(1);
  const [bloomActive, setBloomActive] = useState(false);
  useEffect(() => {
    setBloomActive(true);
    const id = setTimeout(() => setBloomActive(false), 2000);
    return () => clearTimeout(id);
  }, [bloomTick]);
  useEffect(() => {
    // new decision → brief alpha pulse
    pulseMidAlpha(setMidPulseAlpha, { down: 0.24, durationMs: 1000 });
  }, [decisionTick]);

  // HUE/BG를 부드럽게 보간하기 위한 이징 유틸
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const initialHue = computeBigBlobHues(centerTemp).mid2H;
  const initialBg = computeBackgroundHsl(centerTemp);
  const [animHue, setAnimHue] = useState(initialHue);
  const [animBg, setAnimBg] = useState(initialBg); // {h,s,l}
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 800; // ms
    const fromHue = animHue;
    const toHue = computeBigBlobHues(centerTemp).mid2H;
    const fromBg = animBg;
    const toBg = computeBackgroundHsl(centerTemp);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const k = easeInOutCubic(t);
      const lerp = (a, b) => a + (b - a) * k;
      setAnimHue(lerp(fromHue, toHue));
      setAnimBg({
        h: lerp(fromBg.h, toBg.h),
        s: lerp(fromBg.s, toBg.s),
        l: lerp(fromBg.l, toBg.l),
      });
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerTemp]);

  // Leva controls (HSL) for live-tuning center glow & background gradient
  const centerGlow = useControls('SW1 Center Glow (HSL)', {
    // inner (white)
    innerH:          { value: 0,   min: 0, max: 360, step: 1 },
    innerS:          { value: 0,   min: 0, max: 100, step: 1 },
    innerL:          { value: 100, min: 0, max: 100, step: 1 },
    innerAlpha:      { value: 1.0, min: 0, max: 1,   step: 0.01 },
    // inner ring (#b0f6ff ≈ h:189 s:100 l:84)
    innerRingH:      { value: 189, min: 0, max: 360, step: 1 },
    innerRingS:      { value: 100, min: 0, max: 100, step: 1 },
    innerRingL:      { value: 84,  min: 0, max: 100, step: 1 },
    innerRingAlpha:  { value: 1.0, min: 0, max: 1,   step: 0.01 },
    // mid1 (#ff679a ≈ h:340) - 요청에 따른 S/L 기본값 조정
    mid1H:           { value: 340, min: 0, max: 360, step: 1 },
    mid1S:           { value: 98,  min: 0, max: 100, step: 1 },
    mid1L:           { value: 66,  min: 0, max: 100, step: 1 },
    mid1Alpha:       { value: 0.89,min: 0, max: 1,   step: 0.01 },
    // mid2 (#f8cfc1 ≈ h:15 s:82 l:87)
    mid2H:           { value: 15,  min: 0, max: 360, step: 1 },
    mid2S:           { value: 82,  min: 0, max: 100, step: 1 },
    mid2L:           { value: 87,  min: 0, max: 100, step: 1 },
    mid2Alpha:       { value: 0.76,min: 0, max: 1,   step: 0.01 },
    // outer (#fff3ef ≈ h:15 s:100 l:96)
    outerH:          { value: 15,  min: 0, max: 360, step: 1 },
    outerS:          { value: 100, min: 0, max: 100, step: 1 },
    outerL:          { value: 96,  min: 0, max: 100, step: 1 },
    outerAlpha:      { value: 0.50,min: 0, max: 1,   step: 0.01 },
    // extra (#ffffff ≈ h:0 s:0 l:100)
    extraH:          { value: 0,   min: 0, max: 360, step: 1 },
    extraS:          { value: 0,   min: 0, max: 100, step: 1 },
    extraL:          { value: 100, min: 0, max: 100, step: 1 },
    extraAlpha:      { value: 0.51,min: 0, max: 1,   step: 0.01 },
    // stops
    innerStop:       { value: 29,  min: 0, max: 100 },
    innerRingStop:   { value: 38,  min: 0, max: 100 },
    mid1Stop:        { value: 42,  min: 0, max: 100 },
    mid2Stop:        { value: 86,  min: 0, max: 100 },
    extraStop:       { value: 100, min: 0, max: 100 },
    outerStop:       { value: 83,  min: 0, max: 100 },
    // post-processing
    blur:            { value: 32,  min: 0, max: 120 }, // px
    centerBrightness:{ value: 1.13, min: 0.7, max: 1.8, step: 0.01 },
    outerGlowRadius: { value: 600, min: 0, max: 600 }, // px
    outerGlowAlpha:  { value: 0.0,  min: 0, max: 1, step: 0.01 },
  });

  const background = useControls('SW1 Background (HSL)', {
    baseH:   { value: 198, min: 0, max: 360, step: 1 },
    baseS:   { value: 90,  min: 0, max: 100, step: 1 },
    baseL:   { value: 98,  min: 0, max: 100, step: 1 },
    topH:    { value: 184, min: 0, max: 360, step: 1 },
    topS:    { value: 42,  min: 0, max: 100, step: 1 },
    topL:    { value: 88,  min: 0, max: 100, step: 1 },
    midH:    { value: 66,  min: 0, max: 360, step: 1 },
    midS:    { value: 34,  min: 0, max: 100, step: 1 },
    midL:    { value: 96,  min: 0, max: 100, step: 1 },
    bottomH: { value: 44,  min: 0, max: 360, step: 1 },
    bottomS: { value: 88,  min: 0, max: 100, step: 1 },
    bottomL: { value: 97,  min: 0, max: 100, step: 1 },
    angle:   { value: 228, min: 0, max: 360 },
    midStop:  { value: 63, min: 0, max: 100 },
    midStop2: { value: 100, min: 0, max: 100 },
  });

  const animation = useControls('SW1 Animation', {
    // 공전 속도를 좀 더 느리게: 기본값을 크게 늘려서 천천히 도는 느낌으로
    rotationDuration: { value: 40, min: 10, max: 180, step: 1 },
  });

  // Mini blob color (HSL) — apply to all mini blobs for quick tuning
  const miniColor = useControls('SW1 Mini Blob Color (HSL)', {
    h: { value: 340, min: 0, max: 360, step: 1 },
    s: { value: 62,  min: 0, max: 100, step: 1 },
    l: { value: 66,  min: 0, max: 100, step: 1 },
    // warm outer tone (two stops)
    warmH:  { value: 45, min: 0, max: 360, step: 1 },
    warmS1: { value: 98, min: 0, max: 100, step: 1 },
    warmL1: { value: 85, min: 0, max: 100, step: 1 },
    warmS2: { value: 100, min: 0, max: 100, step: 1 },
    warmL2: { value: 88, min: 0, max: 100, step: 1 },
    warmStart: { value: 60, min: 50, max: 90, step: 1 }, // 퍼지는 구간 시작 퍼센트 (더 넓게)
  });
  const edgeBlur = useControls('SW1 Edge Blur', {
    strength: { value: 3.8, min: 0, max: 4, step: 0.05 },
    opacity:  { value: 0.13, min: 0, max: 1, step: 0.01 },
  });

  const edgeGlass = useControls('SW1 Edge Glass', {
    blur:    { value: 69,  min: 0, max: 80, step: 1 },
    opacity: { value: 0.29, min: 0, max: 1,  step: 0.01 },
  });

  const toHsla = (h, s, l, a) => `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;

  // Display current HSLA strings (for quick copy/reference)
  const rgbDisplay = useMemo(() => {
    const innerRingH = Math.round(animHue);
    const mid2H = Math.round(animHue);
    return {
      inner: toHsla(centerGlow.innerH, centerGlow.innerS, centerGlow.innerL, centerGlow.innerAlpha),
      innerRing: toHsla(innerRingH, centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha),
      mid1: toHsla(centerGlow.mid1H, centerGlow.mid1S, centerGlow.mid1L, centerGlow.mid1Alpha * midPulseAlpha),
      mid2: toHsla(mid2H, centerGlow.mid2S, centerGlow.mid2L, centerGlow.mid2Alpha),
      outer: toHsla(centerGlow.outerH, centerGlow.outerS, centerGlow.outerL, centerGlow.outerAlpha),
    };
  }, [
    animHue, midPulseAlpha,
    centerGlow.innerH, centerGlow.innerS, centerGlow.innerL, centerGlow.innerAlpha,
    centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha,
    centerGlow.mid1H, centerGlow.mid1S, centerGlow.mid1L, centerGlow.mid1Alpha,
    centerGlow.mid2S, centerGlow.mid2L, centerGlow.mid2Alpha,
    centerGlow.outerH, centerGlow.outerS, centerGlow.outerL, centerGlow.outerAlpha,
  ]);
  const centerGlowStyle = useMemo(() => {
    const innerRingH = Math.round(animHue);
    const mid2H = Math.round(animHue);
    const c1     = toHsla(centerGlow.innerH,     centerGlow.innerS,     centerGlow.innerL,     centerGlow.innerAlpha);
    const cRing  = toHsla(innerRingH,            centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha);
    const c2     = toHsla(centerGlow.mid1H,      centerGlow.mid1S,      centerGlow.mid1L,      centerGlow.mid1Alpha * midPulseAlpha);
    const c3     = toHsla(mid2H,                 centerGlow.mid2S,      centerGlow.mid2L,      centerGlow.mid2Alpha);
    const c4     = toHsla(centerGlow.outerH,     centerGlow.outerS,     centerGlow.outerL,     centerGlow.outerAlpha);
    const cExtra = toHsla(centerGlow.extraH,     centerGlow.extraS,     centerGlow.extraL,     centerGlow.extraAlpha);

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
      filter: `blur(${centerGlow.blur + (timelineState === 't2' ? 8 : 0)}px) brightness(${centerGlow.centerBrightness})`,
      // T3/T4: 잠시 블룸 확장
      transform: `translate(-50%, -50%) rotate(-90deg) scale(${bloomActive ? 1.08 : 1})`,
      transition: 'background 600ms ease-in-out, transform 1200ms cubic-bezier(0.22,1,0.36,1), filter 600ms ease',
      boxShadow:
        centerGlow.outerGlowRadius > 0 && centerGlow.outerGlowAlpha > 0
          ? `0 0 ${centerGlow.outerGlowRadius}px rgba(255, 255, 255, ${centerGlow.outerGlowAlpha})`
          : 'none',
    };
  }, [centerGlow, animHue, midPulseAlpha, bloomActive, timelineState]);

  const rootBackgroundStyle = useMemo(() => {
    const wrap = (h, s, l) => `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    // 요청: S/L은 고정값(Leva baseS/baseL)을 사용하고, H만 변화(=animHue 기반)하도록 설정
    const H = Math.round(animHue);
    const S = background.baseS;
    const L = background.baseL;
    const solid = wrap(H, S, L);
    return {
      backgroundColor: solid,
      backgroundImage: 'none',
      transition: 'background-color 700ms ease-in-out',
    };
  }, [animHue, background.baseS, background.baseL]);

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
                $radiusFactor={b.radiusFactorDynamic ?? b.radiusFactor}
                $zSeed={b.zSeed}
                data-new={b.isNew ? 'true' : 'false'}
                style={{
                  // HSL variables for gradient in styles
                  '--blob-h': miniColor.h,
                  '--blob-s': `${miniColor.s}%`,
                  '--blob-l': `${miniColor.l}%`,
                  '--blob-warm-h': computeMiniWarmHue(typeof b.temp === 'number' ? b.temp : centerTemp),
                  '--blob-warm-s1': `${miniColor.warmS1}%`,
                  '--blob-warm-l1': '85%',
                  '--blob-warm-s2': `${miniColor.warmS2}%`,
                  '--blob-warm-l2': '88%',
                  '--blob-warm-start': '60%',
                  '--size-boost': b.sizeBoost ?? 1,
                  // 각 블롭마다 호흡 강도를 미세하게 다르게
                  '--orbit-radius-amp': (() => {
                    if (b.depthLayer === 0) return '0.22';
                    if (b.depthLayer === 1) return '0.18';
                    return '0.16';
                  })(),
                }}
              >
                {b.isNew && <S.NewBlobOverlay />}
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
        {/* 항상 흐릿하게 돌아다니는 자유 블롭 4개 (데이터 무관, 아주 부드럽고 은은) */}
        <S.FreeBlur1 />
        <S.FreeBlur2 />
        <S.FreeBlur3 />
        <S.FreeBlur4 />
        {/* 유기적으로 일렁이는 중앙 화이트 코어 (기존 GradientEllipse 아래에 베이스로 깔림) */}
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
          viewBox="-60 -60 120 120"
        >
          <defs>
            <radialGradient id="sw1CenterOrganicFill" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="45%" stopColor="#FFE4F0" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#FAD4E6" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </radialGradient>
          </defs>
          <g>
            <path
              d={organicCenterPath}
              fill="url(#sw1CenterOrganicFill)"
            />
          </g>
        </svg>
        <S.GradientEllipse style={centerGlowStyle} />
        {/* 결정 시 한 번만 강하게 퍼지는 링(화이트 블롭이 분리되어 나오는 느낌 강화) */}
        {bloomActive && <S.CenterPulseOnce key={bloomTick} />}
        {/* 완전한 화이트 코어 버스트(불투명) */}
        {bloomActive && <S.CenterWhiteBurst key={`wb-${bloomTick}`} />}
        {/* T2: 중앙 처리 인디케이터 */}
        {timelineState === 't2' && <S.CenterIndicator />}
        {/* 가운데 원 mid1Color 채도 펄스 오버레이 */}
        <S.CenterSaturationPulse />
        {/* 중앙 작은 코어: 아주 은은한 호흡 애니메이션 */}
        <S.CenterInnerCore />
        <S.CenterMark src="/figma/Ellipse%202767.png" alt="" />
        <S.EllipseLayer>
          <S.Ellipse $ellipseUrl={ELLIPSE_URL} />
        </S.EllipseLayer>
        <S.CenterTextWrap>
          <S.CenterTemp>{`${centerTemp}°C`}</S.CenterTemp>
          <S.CenterMode>{/* show mode from humidity */}{centerHumidity >= 0 ? (centerHumidity >= 65 ? '강력 제습' : centerHumidity >= 55 ? '적정 제습' : centerHumidity >= 45 ? '기본 제습' : centerHumidity >= 35 ? '적정 가습' : '강력 가습') : ''}</S.CenterMode>
        </S.CenterTextWrap>
        {/* 디버그 모달 숨김 */}
        {false && (
          <S.ColorDebug>
            inner: {rgbDisplay.inner}<br/>
            innerRing: {rgbDisplay.innerRing}<br/>
            mid1: {rgbDisplay.mid1}<br/>
            mid2: {rgbDisplay.mid2}<br/>
            outer: {rgbDisplay.outer}
          </S.ColorDebug>
        )}
      </S.Stage>
    </S.Root>
  );
}
