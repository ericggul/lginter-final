import { useEffect, useMemo, useState } from "react";
import { useControls, folder } from "leva";
import { KeyframesGlobal as BGKeyframesGlobal, BlobCssGlobal as BGBlobCssGlobal } from "@/components/mobile/BackgroundCanvas/styles";
import * as S from "./styles";
import { useSW1TestLogic } from "../logic/mainlogic";
import { computeBigBlobHues, computeBackgroundHsl, computeMiniWarmHue, pulseMidAlpha, toHsla, tierToSaturation, tierToLightness } from "../logic/color";

// 중앙 화이트 영역을 약간 일렁이는 유기적 형태로 만드는 SVG Path 생성 유틸
function useOrganicCenterPath() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let frame;
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = now - lastTime;
      lastTime = now;
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
    const baseR = 50;
    const steps = 80;
    const epsilon = 0.12;
    const harmonic = 5;

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

export default function SW1TestControls() {
  const BACKGROUND_URL = null;
  const ELLIPSE_URL = "/sw1_blobimage/sw1-ellipse.png";

  const {
    blobConfigs,
    entryBlob,
    entryAngle,
    centerTemp,
    centerHumidity,
    participantCount,
    dotCount,
    decisionTick,
    timelineState,
    bloomTick,
    typeTick,
    sceneZoomOutTick,
    edgeGlowTick,
    orchestrateTick,
    burstTick,
    miniTextMode,
    miniTextVisible,
    hasDecision,
  } = useSW1TestLogic();
  const organicCenterPath = useOrganicCenterPath();
  const [midPulseAlpha, setMidPulseAlpha] = useState(1);
  const [bloomActive, setBloomActive] = useState(false);
  const [bgBreathPhase, setBgBreathPhase] = useState(0);
  const [centerOrchestrating, setCenterOrchestrating] = useState(false);
  useEffect(() => {
    setBloomActive(true);
    const id = setTimeout(() => setBloomActive(false), 2000);
    return () => clearTimeout(id);
  }, [bloomTick]);
  useEffect(() => {
    pulseMidAlpha(setMidPulseAlpha, { down: 0.24, durationMs: 1000 });
  }, [decisionTick]);

  // 중앙 텍스트: 6초 주기로 모드 라인이 "Orchestrating" <-> 원래 모드 텍스트로 스위치
  useEffect(() => {
    const interval = setInterval(() => {
      setCenterOrchestrating((prev) => !prev);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // 배경 컬러가 조금 더 어두웠다가 현재 값으로 천천히 이동하는 '일렁임' 효과
  useEffect(() => {
    let frame;
    const start = performance.now();
    const loop = (now) => {
      const t = (now - start) / 10000; // 약 10초 주기로 조금 더 빠르게
      setBgBreathPhase(Math.sin(t * 2 * Math.PI));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const initialHue = 340;
  const [animHue, setAnimHue] = useState(initialHue);
  const [animBg, setAnimBg] = useState(() => computeBackgroundHsl(centerTemp));
  const [bgFlashTick, setBgFlashTick] = useState(0);
  useEffect(() => {
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
    setBgFlashTick((x) => x + 1);
    return () => cancelAnimationFrame(raf);
  }, [centerTemp, hasDecision]);

  const centerGlow = useControls("SW1 Center Glow (HSL)", {
    Core: folder({
      // 첨부된 파라미터 스크린샷에 맞춘 기본값 (이미지1 메인 블롭 기준)
      innerH: { value: 0, min: 0, max: 360, step: 1 },
      innerS: { value: 0, min: 0, max: 100, step: 1 },
      innerL: { value: 100, min: 0, max: 100, step: 1 },
      innerAlpha: { value: 1.0, min: 0, max: 1, step: 0.01 },
    }),
    InnerRing: folder({
      innerRingH: { value: 138, min: 0, max: 360, step: 1 },
      innerRingS: { value: 100, min: 0, max: 100, step: 1 },
      innerRingL: { value: 100, min: 0, max: 100, step: 1 },
      innerRingAlpha: { value: 0.41, min: 0, max: 1, step: 0.01 },
    }),
    MidRings: folder({
      mid1H: { value: 360, min: 0, max: 360, step: 1 },
      mid1S: { value: 100, min: 0, max: 100, step: 1 },
      mid1L: { value: 100, min: 0, max: 100, step: 1 },
      mid1Alpha: { value: 1.0, min: 0, max: 1, step: 0.01 },
      mid2H: { value: 360, min: 0, max: 360, step: 1 },
      mid2S: { value: 100, min: 0, max: 100, step: 1 },
      mid2L: { value: 60, min: 0, max: 100, step: 1 },
      mid2Alpha: { value: 0.73, min: 0, max: 1, step: 0.01 },
    }),
    OuterRing: folder({
      outerH: { value: 304, min: 0, max: 360, step: 1 },
      outerS: { value: 90, min: 0, max: 100, step: 1 },
      outerL: { value: 96, min: 0, max: 100, step: 1 },
      outerAlpha: { value: 0.65, min: 0, max: 1, step: 0.01 },
    }),
    ExtraGlow: folder({
      extraH: { value: 205, min: 0, max: 360, step: 1 },
      extraS: { value: 0, min: 0, max: 100, step: 1 },
      extraL: { value: 97, min: 0, max: 100, step: 1 },
      extraAlpha: { value: 0.6, min: 0, max: 1, step: 0.01 },
    }),
    StopsAndFX: folder({
      innerStop: { value: 41, min: 0, max: 100 },
      innerRingStop: { value: 26, min: 0, max: 100 },
      mid1Stop: { value: 0, min: 0, max: 100 },
      mid2Stop: { value: 89, min: 0, max: 100 },
      extraStop: { value: 100, min: 0, max: 100 },
      outerStop: { value: 91, min: 0, max: 100 },
      blur: { value: 24, min: 0, max: 120 },
      centerBrightness: { value: 1.08, min: 0.7, max: 1.8, step: 0.01 },
      outerGlowRadius: { value: 340, min: 0, max: 600 },
      outerGlowAlpha: { value: 0.7, min: 0, max: 1, step: 0.01 },
    }),
  });

  const background = useControls("SW1 Background (HSL)", {
    // 기본 톤: 한 단계 더 어두운 쿨 그레이 베이스
    baseH: { value: 210, min: 0, max: 360, step: 1 },
    baseS: { value: 14, min: 0, max: 100, step: 1 },
    baseL: { value: 74, min: 50, max: 100, step: 1 },
    topH: { value: 210, min: 0, max: 360, step: 1 },
    topS: { value: 10, min: 0, max: 100, step: 1 },
    topL: { value: 84, min: 0, max: 100, step: 1 },
    midH: { value: 340, min: 0, max: 360, step: 1 },
    midS: { value: 22, min: 0, max: 100, step: 1 },
    midL: { value: 74, min: 0, max: 100, step: 1 },
    bottomH: { value: 340, min: 0, max: 360, step: 1 },
    bottomS: { value: 26, min: 0, max: 100, step: 1 },
    bottomL: { value: 70, min: 0, max: 100, step: 1 },
    angle: { value: 230, min: 0, max: 360, step: 1 },
    midStop: { value: 56, min: 0, max: 100, step: 1 },
    midStop2: { value: 92, min: 0, max: 100, step: 1 },
  });

  const animation = useControls("SW1 Animation", {
    rotationDuration: { value: 55, min: 10, max: 180, step: 1 },
  });

  const miniColor = useControls("SW1 Mini Blob Color (HSL)", {
    h: { value: 340, min: 0, max: 360, step: 1 },
    s: { value: 72, min: 0, max: 100, step: 1 },
    l: { value: 66, min: 0, max: 100, step: 1 },
    // warm 파트도 연핑크 톤으로 보이도록 기본값을 핑크 계열로 설정
    warmH: { value: 345, min: 0, max: 360, step: 1 },
    warmS1: { value: 100, min: 0, max: 100, step: 1 },
    warmL1: { value: 88, min: 0, max: 100, step: 1 },
    warmS2: { value: 100, min: 0, max: 100, step: 1 },
    warmL2: { value: 92, min: 0, max: 100, step: 1 },
    warmStart: { value: 60, min: 50, max: 90, step: 1 },
  });
  const edgeBlur = useControls("SW1 Edge Blur", {
    strength: { value: 3.75, min: 0, max: 4, step: 0.05 },
    opacity: { value: 0.33, min: 0, max: 1, step: 0.01 },
  });

  const edgeGlass = useControls("SW1 Edge Glass", {
    blur: { value: 71, min: 0, max: 80, step: 1 },
    opacity: { value: 0.31, min: 0, max: 1, step: 0.01 },
  });

  const toHslaLocal = (h, s, l, a) => toHsla(h, s, l, a);

  const rgbDisplay = useMemo(() => {
    const hue = Math.round(animHue);
    const innerRingH = hue;
    const midH = hue;
    const mid2H = hue;
    return {
      inner: toHslaLocal(centerGlow.innerH, centerGlow.innerS, centerGlow.innerL, centerGlow.innerAlpha),
      innerRing: toHslaLocal(innerRingH, centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha),
      mid1: toHslaLocal(midH, centerGlow.mid1S, centerGlow.mid1L, centerGlow.mid1Alpha * midPulseAlpha),
      mid2: toHslaLocal(mid2H, centerGlow.mid2S, centerGlow.mid2L, centerGlow.mid2Alpha),
      outer: toHslaLocal(centerGlow.outerH, centerGlow.outerS, centerGlow.outerL, centerGlow.outerAlpha),
    };
  }, [animHue, midPulseAlpha, centerGlow]);

  const centerGlowStyle = useMemo(() => {
    const hue = Math.round(animHue);
    const innerRingH = hue;
    const midH = hue;
    const mid2H = hue;

    // 1) mid2S: 56 → 현재 mid2S 값(예: 100)까지 천천히 루프
    const osc = (bgBreathPhase + 1) / 2; // 0..1
    const mid2SMin = 56;
    const mid2SMax = centerGlow.mid2S; // Leva 슬라이더 값을 상한으로 사용
    const mid2SAnimated = mid2SMin + (mid2SMax - mid2SMin) * osc;

    // 3) innerStop: 더 작게/더 크게 모두 호흡하도록 32 → innerStopMax까지 루프
    const innerStopMin = 32;
    // 사용자가 원하는 최대 확장 값은 최소 93까지 확보
    const innerStopMax = Math.max(centerGlow.innerStop, 93);
    const innerStopAnimated = innerStopMin + (innerStopMax - innerStopMin) * osc;

    const c1 = toHslaLocal(centerGlow.innerH, centerGlow.innerS, centerGlow.innerL, centerGlow.innerAlpha);
    const cRing = toHslaLocal(innerRingH, centerGlow.innerRingS, centerGlow.innerRingL, centerGlow.innerRingAlpha);
    const c2 = toHslaLocal(midH, centerGlow.mid1S, centerGlow.mid1L, centerGlow.mid1Alpha * midPulseAlpha);
    const c3 = toHslaLocal(mid2H, mid2SAnimated, centerGlow.mid2L, centerGlow.mid2Alpha);
    const c4 = toHslaLocal(centerGlow.outerH, centerGlow.outerS, centerGlow.outerL, centerGlow.outerAlpha);
    const cExtra = toHslaLocal(centerGlow.extraH, centerGlow.extraS, centerGlow.extraL, centerGlow.extraAlpha);

    const gradient = `radial-gradient(47.13% 47.13% at 50% 50%, ${c1} ${innerStopAnimated}%, ${cRing} ${centerGlow.innerRingStop}%, ${c2} ${centerGlow.mid1Stop}%, ${c3} ${centerGlow.mid2Stop}%, ${cExtra} ${centerGlow.extraStop}%, ${c4} ${centerGlow.outerStop}%)`;

    return {
      background: gradient,
      filter: `blur(${centerGlow.blur + (timelineState === "t2" ? 8 : 0)}px) brightness(${centerGlow.centerBrightness})`,
      transform: `translate(-50%, -50%) rotate(-90deg) scale(${bloomActive ? 1.08 : 1})`,
      transition: "background 600ms ease-in-out, transform 1200ms cubic-bezier(0.22,1,0.36,1), filter 600ms ease",
      boxShadow: centerGlow.outerGlowRadius > 0 && centerGlow.outerGlowAlpha > 0 ? `0 0 ${centerGlow.outerGlowRadius}px rgba(255, 255, 255, ${centerGlow.outerGlowAlpha})` : "none",
    };
  }, [centerGlow, animHue, midPulseAlpha, bloomActive, timelineState, bgBreathPhase]);

  const mainOverlayStyle = useMemo(() => {
    const hue = Math.round(animHue);
    return {
      "--overlay-h": hue,
    };
  }, [animHue]);

  const rootBackgroundStyle = useMemo(() => {
    const wrap = (h, s, l, a = 1) => `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
    const top = wrap(background.topH, background.topS, background.topL, 1);
    const mid = wrap(background.midH, background.midS, background.midL, 1);

    // 하단 그라디언트는 항상 메인 블롭(animHue)의 컬러를 따라가도록 hue만 animHue로 교체
    const bottomHue = Math.round(animHue);

    // bgBreathPhase (-1..1)를 0..1 범위로 변환해서 어두운 쪽 → 현재 값으로 천천히 왕복
    const k = (bgBreathPhase + 1) / 2; // 0..1
    const darkBoost = 8; // 최대 8 정도까지 더 어둡게
    const satBoost = 6;  // 살짝 더 채도 올림

    const baseBottomL = background.bottomL - darkBoost * (1 - k);
    const baseBottomS =
      (!hasDecision ? background.bottomS * 1.25 : background.bottomS + satBoost * k);

    const bottom = wrap(
      bottomHue,
      Math.max(0, Math.min(100, baseBottomS)),
      Math.max(0, Math.min(100, baseBottomL)),
      1
    );

    return {
      backgroundColor: top,
      backgroundImage: `linear-gradient(${background.angle}deg, ${top} 0%, ${mid} ${background.midStop}%, ${bottom} ${background.midStop2}%)`,
      transition: "background 1200ms ease-in-out",
    };
  }, [background, animHue, bgBreathPhase, hasDecision]);

  const sceneScaleValue = timelineState === "t3" ? 0.94 : 1;

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
      <S.SceneScaleLayer style={{ "--scene-scale": sceneScaleValue }}>
        <S.Stage data-orchestrate={orchestrateTick > 0}>
        {/* 입력 감지: 화면 외곽 엣지 글로우 (색상은 새 블롭 hue 우선, 없으면 현재 hue) */}
        {edgeGlowTick > 0 && (
          <S.EdgeGlowOverlay
            key={edgeGlowTick}
            style={{
              "--edge-h": String(
                Math.round(
                  entryBlob?.temp != null
                    ? computeMiniWarmHue(entryBlob.temp)
                    : animHue
                )
              ),
            }}
          />
        )}
        {/* 전역 배경 반응 레이어 */}
        <S.BackgroundReactOverlay data-active={timelineState === "t4" || burstTick > 0} style={{ "--bgreact-h": Math.round(animHue) }} />
        <S.BgFlashOverlay key={bgFlashTick} $h={animHue} />
        <S.EdgeGlassLayer $blur={edgeGlass.blur} $opacity={edgeGlass.opacity} />
        <S.EdgeBlurLayer $strength={edgeBlur.strength} $opacity={edgeBlur.opacity} />
        {timelineState === "t4" && <S.BackgroundPulse />}
        {entryBlob && (timelineState === "t3" || timelineState === "t4") && (
          <S.Sw1TestEntryBlob
            key={`entry-${entryBlob.id}`}
            data-stage={timelineState}
            style={{
              "--entry-angle": `${entryAngle}deg`,
              "--blob-h": hasDecision ? Math.round(animHue) : miniColor.h,
              "--blob-s": `${miniColor.s}%`,
              "--blob-l": `${miniColor.l}%`,
              "--blob-warm-h": hasDecision ? computeMiniWarmHue(typeof entryBlob.temp === "number" ? entryBlob.temp : centerTemp) : miniColor.warmH,
              "--blob-warm-s1": `${miniColor.warmS1}%`,
              "--blob-warm-l1": "85%",
              "--blob-warm-s2": `${miniColor.warmS2}%`,
              "--blob-warm-l2": "88%",
              "--blob-warm-start": "60%",
            }}
          >
            <S.ContentRotator $duration={animation.rotationDuration}>
              <strong>{entryBlob.temp != null ? `${entryBlob.temp}℃` : ""}</strong>
              <span>{entryBlob.humidity != null ? `${Math.round(entryBlob.humidity)}%` : ""}</span>
            </S.ContentRotator>
          </S.Sw1TestEntryBlob>
        )}
        {/* 오케스트레이션 타이포(3초) */}
        {orchestrateTick > 0 && <S.OrchestrationBadge key={orchestrateTick}>Orchestration</S.OrchestrationBadge>}
        <S.BlobRotator $duration={animation.rotationDuration}>
          {blobConfigs.map((b, index) => {
            const Component = S[b.componentKey];
            const tier = b.tier || (b.depthLayer === 0 ? "inner" : b.depthLayer === 1 ? "mid" : "outer");
            const tierVars =
              tier === "inner"
                ? {
                    "--tier-sat": 1.2,
                    // 미니 블롭은 살짝 더 작게
                    "--tier-size": 0.34,
                    "--trail-opacity": 0.36,
                    "--trail-blur": "0.6vw",
                    // 가장 안쪽: 조금 더 빠른 호흡/부유 속도
                    "--parallaxDur": "36s",
                    "--zPulseDur": "12s",
                    "--radiusDur": "20s",
                    "--floatDur": "30s",
                    "--pull-blur": 0.7,
                    "--label-scale": 0.6,
                  }
                : tier === "mid"
                ? {
                    // 중간 블롭: 중앙에 가까운 쪽의 핑크가 더 강하게 느껴지도록 채도 업
                    "--tier-sat": 1.25,
                    // 중간 블롭은 살짝 더 크게
                    "--tier-size": 0.80,
                    "--trail-opacity": 0.46,
                    "--trail-blur": "0.95vw",
                    "--parallaxDur": "48s",
                    "--zPulseDur": "18s",
                    "--radiusDur": "28s",
                    "--floatDur": "40s",
                    "--pull-blur": 0.95,
                    "--label-scale": 0.9,
                  }
                : {
                    // 큰 블롭: 사이즈는 더 키우고, 시작 파트는 핑키쉬하게
                    "--tier-sat": 0.75,
                    "--tier-size": 1.65,
                    "--trail-opacity": 0.75,
                    "--trail-blur": "1.8vw",
                    // 가장 바깥: 전체적으로 더 느린 움직임
                    "--parallaxDur": "64s",
                    "--zPulseDur": "26s",
                    "--radiusDur": "38s",
                    "--floatDur": "56s",
                    "--pull-blur": 1.25,
                    "--label-scale": 1.15,
                  };
            const useLabel = miniTextMode === "label";
            // value/label 모드는 hasDecision 여부와 상관없이 주기적으로 스위치되도록 유지
            const showLabel = useLabel;
            // hasDecision 이전에도 엘립시스(...) 대신 더미 기온/습도 값/라벨이 바로 보이도록 설정
            const topText = showLabel ? b.topLabel || b.topValue || "" : b.topValue || b.topLabel || "";
            const bottomText = showLabel ? b.bottomLabel || b.bottomValue || "" : b.bottomValue || b.bottomLabel || "";
            return (
              <Component
                key={b.id}
                $angleDeg={b.angleDeg}
                $depthLayer={b.depthLayer}
                $radiusFactor={b.radiusFactorDynamic ?? b.radiusFactor}
                $zSeed={b.zSeed}
                $order={index}
                data-stage={timelineState}
                data-tier={tier}
                style={{
                  ...tierVars,
                  "--blob-h": hasDecision ? Math.round(animHue) : miniColor.h,
                  "--blob-s": `${Math.max(0, Math.min(100, tierToSaturation(tier, miniColor.s)))}%`,
                  "--blob-l": `${Math.min(100, tierToLightness(tier, miniColor.l))}%`,
                  // warm 파트도 메인 핑크 계열로 보이도록 hue를 animHue/miniColor에 맞춤
                  "--blob-warm-h": hasDecision ? Math.round(animHue) : miniColor.warmH,
                  "--blob-warm-s1": `${miniColor.warmS1}%`,
                  "--blob-warm-l1": `${miniColor.warmL1}%`,
                  "--blob-warm-s2": `${miniColor.warmS2}%`,
                  "--blob-warm-l2": `${miniColor.warmL2}%`,
                  // 빅 블롭(outer)의 이너 핑크 영역이 더 넓게 퍼지도록 start 지점을 더 안쪽으로 당김
                  "--blob-warm-start": tier === "outer" ? "42%" : tier === "mid" ? "56%" : "60%",
                  "--stroke-h": hasDecision ? Math.round(animHue) : miniColor.h,
                  "--size-boost": b.sizeBoost ?? 1,
                  // outer(빅 블롭) 4개 중 2개는 살짝 더 옅게 보이도록 opacity 조정
                  ...(tier === "outer"
                    ? {
                        "--z-opacity-base": index % 2 === 0 ? 1 : 0.72,
                      }
                    : {}),
                  "--orbit-radius-amp": (() => {
                    const base = b.depthLayer === 0 ? 0.12 : b.depthLayer === 1 ? 0.10 : 0.08;
                    const noise = ((b.zSeed ?? 0) - 0.5) * 0.04;
                    const v = Math.max(0.06, Math.min(0.18, base + noise));
                    return String(v);
                  })(),
                }}
              >
                <S.ContentRotator $duration={animation.rotationDuration}>
                  <S.MiniTopText $visible={miniTextVisible}>{topText}</S.MiniTopText>
                  <S.MiniBottomText $visible={miniTextVisible}>{bottomText}</S.MiniBottomText>
                </S.ContentRotator>
              </Component>
            );
          })}
          {/* SW1test에서는 장식용 작은 연핑크 오빗 점 3개는 사용하지 않음 */}
        </S.BlobRotator>
        <S.FreeBlur1 data-stage={timelineState} />
        <S.FreeBlur2 data-stage={timelineState} />
        <S.FreeBlur3 data-stage={timelineState} />
        <S.FreeBlur4 data-stage={timelineState} />
        <S.DebugCenter />
        <S.DebugBottomStart />
        {/* 빅 블롭 궤도를 따라가는 매우 연한 아크 라인 (블룸 스트로크) */}
        <S.Sw1TestOuterOrbitArc style={{ "--orbit-arc-h": Math.round(animHue) }} />
        <svg
          width="0"
          height="0"
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
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
            <path d={organicCenterPath} fill="url(#sw1CenterOrganicFill)" />
          </g>
        </svg>
        <S.Sw1TestGradientEllipse data-orchestrate={orchestrateTick > 0} style={centerGlowStyle} />
        {bloomActive && <S.CenterPulseOnce key={bloomTick} />}
        {bloomActive && <S.CenterWhiteBurst key={`wb-${bloomTick}`} />}
        {timelineState === "t2" && <S.CenterIndicator />}
        <S.Sw1TestCenterSaturationPulse />
        <S.Sw1TestCenterInnerCore />
        {/* 메인 블롭 핑크 컬러를 최상단 근처에서 씌우는 오버레이 블롭 */}
        <S.Sw1TestMainOverlayBlob style={mainOverlayStyle} />
        <S.CenterMark src="/figma/Ellipse%202767.png" alt="" />
        <S.EllipseLayer>
          <S.Ellipse $ellipseUrl={ELLIPSE_URL} />
        </S.EllipseLayer>
        {/* 중앙 버스트 파동 */}
        {burstTick > 0 && <S.CenterBurstWave key={burstTick} />}
        {/* 중앙 텍스트: 처음 스타트 시에도 더미 조율값이 항상 보이되,
            6초 주기로 모드 라인이 "Orchestrating"으로 스위치되었다가 돌아오도록 설정 */}
        <S.CenterTextWrap>
          <S.CenterTemp>{`${centerTemp}°C`}</S.CenterTemp>
          <S.CenterMode>
            {centerOrchestrating
              ? "Orchestrating"
              : centerHumidity >= 0
              ? centerHumidity >= 65
                ? "강력 제습"
                : centerHumidity >= 55
                ? "적정 제습"
                : centerHumidity >= 45
                ? "기본 제습"
                : centerHumidity >= 35
                ? "적정 가습"
                : "강력 가습"
              : ""}
          </S.CenterMode>
        </S.CenterTextWrap>
        </S.Stage>
      </S.SceneScaleLayer>
    </S.Root>
  );
}


