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

  const {
    blobConfigs,
    entryBlob,
    centerTemp,
    centerHumidity,
    participantCount,
    dotCount,
    decisionTick,
    timelineState,
    bloomTick,
    typeTick,
    miniTextMode,
    miniTextVisible,
    hasDecision,
  } = useSW1Logic();
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
  // 인풋 없는 초기 상태에서는 기존 디자인에 맞춘 따뜻한 핑크톤(H≈340)을 사용
  const initialHue = 340;
  const [animHue, setAnimHue] = useState(initialHue);
  const [animBg, setAnimBg] = useState(() => computeBackgroundHsl(centerTemp)); // {h,s,l}
  const [bgFlashTick, setBgFlashTick] = useState(0);
  useEffect(() => {
    // 아직 어떤 디시전도 들어오기 전이면 항상 기본 핑크 톤 유지
    if (!hasDecision) {
      setAnimHue(initialHue);
      setAnimBg(computeBackgroundHsl(centerTemp));
      return;
    }

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
    // 메인 블롭 컬러 변경 시 BG 플래시 오버레이 한 번 재생
    setBgFlashTick((x) => x + 1);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerTemp, hasDecision]);

  // Leva controls (HSL) for live-tuning center glow & background gradient
  const centerGlow = useControls('SW1 Center Glow (HSL)', {
    // inner (white)
    innerH:          { value: 0,   min: 0, max: 360, step: 1 },
    innerS:          { value: 0,   min: 0, max: 100, step: 1 },
    innerL:          { value: 100, min: 0, max: 100, step: 1 },
    innerAlpha:      { value: 1.0, min: 0, max: 1,   step: 0.01 },
    // inner ring (#b0f6ff ≈ h:189 s:100 l:84)
    innerRingH:      { value: 158, min: 0, max: 360, step: 1 },
    innerRingS:      { value: 100, min: 0, max: 100, step: 1 },
    innerRingL:      { value: 83,  min: 0, max: 100, step: 1 },
    innerRingAlpha:  { value: 1.0, min: 0, max: 1,   step: 0.01 },
    // mid1 (#ff679a ≈ h:340) - 요청에 따른 S/L 기본값 조정
    mid1H:           { value: 340, min: 0, max: 360, step: 1 },
    mid1S:           { value: 100, min: 0, max: 100, step: 1 },
    mid1L:           { value: 66,  min: 0, max: 100, step: 1 },
    mid1Alpha:       { value: 0.81,min: 0, max: 1,   step: 0.01 },
    // mid2: 큰 블롭 색상용 – S는 83으로 고정해서 채도 유지, L은 기존 설정 유지
    mid2H:           { value: 360, min: 0, max: 360, step: 1 },
    mid2S:           { value: 83,  min: 0, max: 100, step: 1 },
    mid2L:           { value: 88,  min: 0, max: 100, step: 1 },
    mid2Alpha:       { value: 0.87,min: 0, max: 1,   step: 0.01 },
    // outer (#fff3ef ≈ h:15 s:100 l:96)
    outerH:          { value: 34,  min: 0, max: 360, step: 1 },
    outerS:          { value: 100, min: 0, max: 100, step: 1 },
    outerL:          { value: 100, min: 0, max: 100, step: 1 },
    outerAlpha:      { value: 0.55,min: 0, max: 1,   step: 0.01 },
    // extra (#ffffff ≈ h:0 s:0 l:100)
    extraH:          { value: 67,  min: 0, max: 360, step: 1 },
    extraS:          { value: 0,   min: 0, max: 100, step: 1 },
    extraL:          { value: 96,  min: 0, max: 100, step: 1 },
    extraAlpha:      { value: 0.58,min: 0, max: 1,   step: 0.01 },
    // stops
    innerStop:       { value: 41,  min: 0, max: 100 },
    innerRingStop:   { value: 26,  min: 0, max: 100 },
    mid1Stop:        { value: 0,   min: 0, max: 100 },
    mid2Stop:        { value: 89,  min: 0, max: 100 },
    extraStop:       { value: 100, min: 0, max: 100 },
    outerStop:       { value: 91,  min: 0, max: 100 },
    // post-processing
    blur:            { value: 31,  min: 0, max: 120 }, // px
    centerBrightness:{ value: 1.12, min: 0.7, max: 1.8, step: 0.01 },
    outerGlowRadius: { value: 378, min: 0, max: 600 }, // px
    outerGlowAlpha:  { value: 0.82,  min: 0, max: 1, step: 0.01 },
  });

  const background = useControls('SW1 Background (HSL)', {
    baseH:   { value: 198, min: 0, max: 360, step: 1 },
    baseS:   { value: 90,  min: 0, max: 100, step: 1 },
    // 요청: baseL은 80으로 고정
    baseL:   { value: 80,  min: 80, max: 80, step: 1 },
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
    rotationDuration: { value: 55, min: 10, max: 180, step: 1 },
  });

  // Mini blob color (HSL) — apply to all mini blobs for quick tuning
  const miniColor = useControls('SW1 Mini Blob Color (HSL)', {
    h: { value: 340, min: 0, max: 360, step: 1 },
    s: { value: 72,  min: 0, max: 100, step: 1 },
    l: { value: 66,  min: 0, max: 100, step: 1 },
    // warm outer tone (two stops)
    warmH:  { value: 49, min: 0, max: 360, step: 1 },
    warmS1: { value: 100,min: 0, max: 100, step: 1 },
    warmL1: { value: 86, min: 0, max: 100, step: 1 },
    warmS2: { value: 100, min: 0, max: 100, step: 1 },
    warmL2: { value: 87, min: 0, max: 100, step: 1 },
    warmStart: { value: 60, min: 50, max: 90, step: 1 }, // 퍼지는 구간 시작 퍼센트 (더 넓게)
  });
  const edgeBlur = useControls('SW1 Edge Blur', {
    strength: { value: 3.75, min: 0, max: 4, step: 0.05 },
    opacity:  { value: 0.33, min: 0, max: 1, step: 0.01 },
  });

  const edgeGlass = useControls('SW1 Edge Glass', {
    blur:    { value: 71,  min: 0, max: 80, step: 1 },
    opacity: { value: 0.31, min: 0, max: 1,  step: 0.01 },
  });

  const toHsla = (h, s, l, a) => `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;

  // Display current HSLA strings (for quick copy/reference)
  const rgbDisplay = useMemo(() => {
    const hue = Math.round(animHue);
    const innerRingH = hue;
    const midH = hue;
    const mid2H = hue;
    return {
      inner: toHsla(centerGlow.innerH, centerGlow.innerS, centerGlow.innerL, centerGlow.innerAlpha),
      innerRing: toHsla(innerRingH, centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha),
      // midH: 큰 블롭의 중심 영역 색상 – 온도에 따라 hue 가 변함
      mid1: toHsla(midH, centerGlow.mid1S, centerGlow.mid1L, centerGlow.mid1Alpha * midPulseAlpha),
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
    const hue = Math.round(animHue);
    const innerRingH = hue;
    const midH = hue;
    const mid2H = hue;
    const c1     = toHsla(centerGlow.innerH,     centerGlow.innerS,     centerGlow.innerL,     centerGlow.innerAlpha);
    const cRing  = toHsla(innerRingH,            centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha);
    // c2: midH – 큰 블롭의 mid 영역 컬러 (온도 기반 hue)
    const c2     = toHsla(midH,                  centerGlow.mid1S,      centerGlow.mid1L,      centerGlow.mid1Alpha * midPulseAlpha);
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
    const wrap = (h, s, l, a = 1) => `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
    const H = Math.round(animHue);
    // animHue 기반 톤을 유지하되, 전체 배경은 약간 푸른 회색 계열로 스냅
    const coolH = Math.round((H + 210) / 2); // 원래 hue 와 블루톤(≈210)을 섞어서 너무 튀지 않게
    // 상단/베이스: 살짝 파란기가 도는 밝은 회색
    const top = wrap(coolH, 10, 82, 1);
    // 중간부: 약간 더 채도가 있는 푸른 회색
    const midTone = wrap(coolH, 14, 74, 1);
    // 하단: 가장 어두운 푸른 회색
    const bottom = wrap(coolH, 20, 66, 1);

    // 화면 중앙 쪽은 살짝 더 푸른 기가 돌도록, 중심부에만 얇은 블루톤 레이어를 한 겹 추가
    const centerCool1 = wrap(coolH + 8, 24, 78, 0.9);
    const centerCool2 = wrap(coolH + 4, 20, 70, 0.0);

    return {
      backgroundColor: top,
      backgroundImage: `
        radial-gradient(
          70% 70% at 50% 45%,
          ${centerCool1} 0%,
          ${centerCool1} 40%,
          ${centerCool2} 85%
        ),
        linear-gradient(to bottom, ${top} 0%, ${midTone} 40%, ${bottom} 100%)
      `,
      transition: 'background 700ms ease-in-out',
    };
  }, [animHue]);

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
        {/* 메인 블롭 컬러 변경 시 전체 배경이 한 번 강하게 물들었다가 사라지는 플래시 오버레이 */}
        <S.BgFlashOverlay key={bgFlashTick} $h={animHue} />
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
        {/* T4: 배경 채도/광량 펄스 */}
        {timelineState === 't4' && <S.BackgroundPulse />}
        {/* 신입 블롭을 BlobRotator 밖에 렌더링 (회전 영향 없음, 고정된 하단→중앙 경로) */}
        {entryBlob && (timelineState === 't3' || timelineState === 't4') && (
          <S.NewEntryBlob
            key={`entry-${entryBlob.id}`}
            data-stage={timelineState}
            style={{
              '--blob-h': hasDecision ? Math.round(animHue) : miniColor.h,
              '--blob-s': `${miniColor.s}%`,
              '--blob-l': `${miniColor.l}%`,
              '--blob-warm-h': hasDecision
                ? computeMiniWarmHue(typeof entryBlob.temp === 'number' ? entryBlob.temp : centerTemp)
                : miniColor.warmH,
              '--blob-warm-s1': `${miniColor.warmS1}%`,
              '--blob-warm-l1': '85%',
              '--blob-warm-s2': `${miniColor.warmS2}%`,
              '--blob-warm-l2': '88%',
              '--blob-warm-start': '60%',
            }}
          >
            <S.ContentRotator $duration={animation.rotationDuration}>
              <strong>{entryBlob.temp != null ? `${entryBlob.temp}℃` : ''}</strong>
              <span>{entryBlob.humidity != null ? `${Math.round(entryBlob.humidity)}%` : ''}</span>
            </S.ContentRotator>
          </S.NewEntryBlob>
        )}
        <S.BlobRotator $duration={animation.rotationDuration}>
          {blobConfigs
            .map((b, index) => {
              const Component = S[b.componentKey];
              const useLabel = miniTextMode === 'label';
              const showLabel = hasDecision && useLabel;
              const topText = hasDecision
                ? (showLabel
                    ? (b.topLabel || b.topValue || '')
                    : (b.topValue || b.topLabel || ''))
                : '...';
              const bottomText = hasDecision
                ? (showLabel
                    ? (b.bottomLabel || b.bottomValue || '')
                    : (b.bottomValue || b.bottomLabel || ''))
                : '...';

              return (
                <Component
                  key={b.id}
                  $angleDeg={b.angleDeg}
                  $depthLayer={b.depthLayer}
                  $radiusFactor={b.radiusFactorDynamic ?? b.radiusFactor}
                  $zSeed={b.zSeed}
                  $order={index}
                  data-stage={timelineState}
                  style={{
                    // 초기(인풋 전)에는 내부/외곽 모두 기본 핑크 톤을 사용
                    '--blob-h': hasDecision ? Math.round(animHue) : miniColor.h,
                    '--blob-s': `${miniColor.s}%`,
                    '--blob-l': `${miniColor.l}%`,
                    // 외곽 컬러: 디시전 이후에는 각 미니 블롭의 temp 기반, 그 전에는 기본 warmH 사용
                    '--blob-warm-h': hasDecision
                      ? computeMiniWarmHue(typeof b.temp === 'number' ? b.temp : centerTemp)
                      : miniColor.warmH,
                    '--blob-warm-s1': `${miniColor.warmS1}%`,
                    '--blob-warm-l1': '85%',
                    '--blob-warm-s2': `${miniColor.warmS2}%`,
                    '--blob-warm-l2': '88%',
                    '--blob-warm-start': '60%',
                    '--size-boost': b.sizeBoost ?? 1,
                    // 각 블롭마다 호흡 강도를 미세하게 다르게
                    '--orbit-radius-amp': (() => {
                      const base =
                        b.depthLayer === 0 ? 0.24 :
                        b.depthLayer === 1 ? 0.19 : 0.16;
                      const noise = ((b.zSeed ?? 0) - 0.5) * 0.06; // ±0.03
                      const v = Math.max(0.12, Math.min(0.30, base + noise));
                      return String(v);
                    })(),
                  }}
                >
                  {/* 신규 블롭도 T4에서 별도 화이트 오버레이 없이 동일 룩 유지 */}
                  <S.ContentRotator $duration={animation.rotationDuration}>
                    <S.MiniTopText $visible={miniTextVisible}>{topText}</S.MiniTopText>
                    <S.MiniBottomText $visible={miniTextVisible}>{bottomText}</S.MiniBottomText>
                  </S.ContentRotator>
                </Component>
              );
            })}
          {/* 데이터와 무관하게 항상 함께 도는 작은 장식용 원 3개 */}
          <S.Sw1SmallOrbitDot1 data-stage={timelineState} />
          <S.Sw1SmallOrbitDot2 data-stage={timelineState} />
          <S.Sw1SmallOrbitDot3 data-stage={timelineState} />
        </S.BlobRotator>
        {/* 항상 흐릿하게 돌아다니는 자유 블롭 4개 (데이터 무관, 아주 부드럽고 은은)
            - T4에서는 중앙 집중 연출을 위해 잠시 투명 처리 (styles에서 data-stage 기반으로 제어) */}
        <S.FreeBlur1 data-stage={timelineState} />
        <S.FreeBlur2 data-stage={timelineState} />
        <S.FreeBlur3 data-stage={timelineState} />
        <S.FreeBlur4 data-stage={timelineState} />
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
        {/* SW2 상단 원형 파동을 SW1 중앙에 맞게 이식한 컬러 원형 파동 */}
        <S.CenterRadialWaveCircle $variant={1} $duration={12} />
        <S.CenterRadialWaveCircle $variant={2} $duration={12} $delay={5} />
        <S.CenterRadialWaveCircle $variant={3} $duration={12} $delay={9} />
        {/* 중앙 화이트 코어에서 시작해 밖으로 퍼져 나가는 얇은 화이트 링 파동 (SW2 선형 파동 이식) */}
        <S.CenterLinearWaveCircle />
        <S.CenterLinearWaveCircle $delay={3} />
        <S.CenterLinearWaveCircle $delay={6} />
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
          {hasDecision ? (
            <>
              <S.CenterTemp>{`${centerTemp}°C`}</S.CenterTemp>
              <S.CenterMode>
                {centerHumidity >= 0
                  ? (centerHumidity >= 65 ? '강력 제습'
                    : centerHumidity >= 55 ? '적정 제습'
                    : centerHumidity >= 45 ? '기본 제습'
                    : centerHumidity >= 35 ? '적정 가습'
                    : '강력 가습')
                  : ''}
              </S.CenterMode>
            </>
          ) : (
            <S.LoadingDots $color="rgba(255,192,220,0.85)">
              <span />
              <span />
              <span />
            </S.LoadingDots>
          )}
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
