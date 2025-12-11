import { useEffect, useMemo, useState } from 'react'
import * as S from './styles'
import useIsIOS from '../hooks/useIsIOS'

const MOOD_WORDS = ['즐거워', '상쾌해', '지루해', '찝찝해', '불쾌해']

export default function BackgroundCanvas({ cameraMode = 'default', showMoodWords = true }) {
  const isIOS = useIsIOS()
  const [mounted, setMounted] = useState(false)
  const [pressProgress, setPressProgress] = useState(0)
  const [isListeningFlag, setIsListeningFlag] = useState(false)
  const [mainBlobStatic, setMainBlobStatic] = useState(false)
  const [blobAlpha, setBlobAlpha] = useState(1)
  const [blobOpacityMs, setBlobOpacityMs] = useState(600)
  const [blobScale, setBlobScale] = useState(1)
  const [blobScaleMs, setBlobScaleMs] = useState(600)
  const [showOrbits, setShowOrbits] = useState(false)
  const [clusterSpin, setClusterSpin] = useState(false)
  const [orbitRadiusScale, setOrbitRadiusScale] = useState(1)
  const [mainBlobFade, setMainBlobFade] = useState(false)
  const [newOrbEnter, setNewOrbEnter] = useState(false)
  const [showFinalOrb, setShowFinalOrb] = useState(false)
  const [showCenterGlow, setShowCenterGlow] = useState(false)
  const [keywordLabels, setKeywordLabels] = useState([])
  const [showKeywords, setShowKeywords] = useState(false)
  const [hasShownKeywords, setHasShownKeywords] = useState(false)
  const [keywordsPulse, setKeywordsPulse] = useState(false)
  const [showMoodWordsDelayed, setShowMoodWordsDelayed] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const moodLoop = useMemo(() => [...MOOD_WORDS, MOOD_WORDS[0]], [])
  const [blobSettings, setBlobSettings] = useState({
    centerX: 38,
    centerY: 23,
    start: 50,
    end: 99,
    blurPx: 53,
    rimTilt: 30,
    feather: 12,
    innerBlur: 20,
    // Five-stop palette from reference: 0,13,47,78,100
    color0: '#F7F7E8', // 0%
    color1: '#F4E9D7', // 13%
    color2: '#F79CBF', // 47%
    color3: '#C5F7EA', // 78%
    color4: '#C8F4E9', // 100%
    tintAlpha: 0.85,
    boost: 1.9,
  })
  const [bgSettings, setBgSettings] = useState({
    top: '#ECF8FA',
    mid: '#FAFDFF',
    low: '#FFE0F8',
    bottom: '#FFF0FB',
    midStop: 23,
    lowStop: 64,
  })
  const [mirrorSettings, setMirrorSettings] = useState({
    centerX: 68,
    centerY: 84,
    start: 50,
    end: 63,
    blurPx: 88,
    rimTilt: 23,
    feather: 15,
    innerBlur: 23,
    color0: '#F7F7E8',
    color1: '#F4E9D7',
    color2: '#F79CBF',
    color3: '#C5F7EA',
    color4: '#C8F4E9',
    tintAlpha: 0.85,
    boost: 1.9,
  })
  const [maskSettings, setMaskSettings] = useState({
    enabled: true,
    color: '#FFFFFF',
    opacity: 0.6,
    blurPx: 20,
    radius: 120,
    centerX: 50,
    centerY: 50,
    blend: 'normal',
    showPanel: false,
  })
  const [wobbleStrength, setWobbleStrength] = useState(1)

  useEffect(() => {
    setMounted(true)

    const loop = () => {
      if (typeof window !== 'undefined') {
        if (window.pressProgress !== undefined) {
          setPressProgress(window.pressProgress)
        }
        if (window.blobSettings) {
          const bs = window.blobSettings
          setBlobSettings(prev => ({
            centerX: bs.centerX ?? prev.centerX,
            centerY: bs.centerY ?? prev.centerY,
            start: bs.start ?? prev.start,
            end: bs.end ?? prev.end,
            blurPx: bs.blurPx ?? prev.blurPx,
            rimTilt: bs.rimTilt ?? prev.rimTilt,
            feather: bs.feather ?? prev.feather,
            innerBlur: bs.innerBlur ?? prev.innerBlur,
            color0: bs.color0 ?? prev.color0,
            color1: bs.color1 ?? prev.color1,
            color2: bs.color2 ?? prev.color2,
            color3: bs.color3 ?? prev.color3,
            color4: bs.color4 ?? prev.color4,
            tintAlpha: bs.tintAlpha ?? prev.tintAlpha,
            boost: bs.boost ?? prev.boost,
          }))
        }
        if (window.isListening !== undefined) {
          setIsListeningFlag(Boolean(window.isListening))
          setIsVoiceActive(Boolean(window.isListening))
        }
        if (window.blobOpacity !== undefined) {
          const a = Number(window.blobOpacity)
          if (!Number.isNaN(a)) setBlobAlpha(Math.max(0, Math.min(1, a)))
        }
        if (window.blobOpacityMs !== undefined) {
          const ms = Number(window.blobOpacityMs)
          if (!Number.isNaN(ms)) setBlobOpacityMs(ms)
        }
        if (window.blobScale !== undefined) {
          const s = Number(window.blobScale)
          if (!Number.isNaN(s)) setBlobScale(Math.max(0.1, Math.min(2, s)))
        }
        if (window.blobScaleMs !== undefined) {
          const ms2 = Number(window.blobScaleMs)
          if (!Number.isNaN(ms2)) setBlobScaleMs(ms2)
        }
        if (window.showOrbits !== undefined) setShowOrbits(Boolean(window.showOrbits))
        if (window.clusterSpin !== undefined) setClusterSpin(Boolean(window.clusterSpin))
        if (window.orbitRadiusScale !== undefined) {
          const rs = Number(window.orbitRadiusScale)
          if (!Number.isNaN(rs)) setOrbitRadiusScale(Math.max(0.5, Math.min(1.4, rs)))
        }
        if (window.mainBlobFade !== undefined) setMainBlobFade(Boolean(window.mainBlobFade))
        if (window.mainBlobStatic !== undefined) setMainBlobStatic(Boolean(window.mainBlobStatic))
        if (window.newOrbEnter !== undefined) setNewOrbEnter(Boolean(window.newOrbEnter))
        if (window.showFinalOrb !== undefined) setShowFinalOrb(Boolean(window.showFinalOrb))
        if (window.showCenterGlow !== undefined) setShowCenterGlow(Boolean(window.showCenterGlow))
        if (window.keywordLabels !== undefined) setKeywordLabels(Array.isArray(window.keywordLabels) ? window.keywordLabels : [])
        if (window.showKeywords !== undefined) setShowKeywords(Boolean(window.showKeywords))
        if (window.bgSettings) {
          const bg = window.bgSettings
          setBgSettings(prev => ({
            top: typeof bg.top === 'string' ? bg.top : prev.top,
            mid: typeof bg.mid === 'string' ? bg.mid : prev.mid,
            low: typeof bg.low === 'string' ? bg.low : prev.low,
            bottom: typeof bg.bottom === 'string' ? bg.bottom : prev.bottom,
            ...(() => {
              const maybeMid = Number(bg.midStop)
              const maybeLow = Number(bg.lowStop)
              let newMid = Number.isFinite(maybeMid) ? maybeMid : prev.midStop
              let newLow = Number.isFinite(maybeLow) ? maybeLow : prev.lowStop
              newMid = Math.max(0, Math.min(newMid, 99))
              newLow = Math.max(1, Math.min(newLow, 100))
              if (newLow <= newMid) {
                newLow = Math.min(100, newMid + 1)
              }
              newMid = Math.min(newMid, newLow - 1)
              return { midStop: newMid, lowStop: newLow }
            })(),
          }))
        }
        if (window.mirrorSettings) {
          const ms = window.mirrorSettings
          setMirrorSettings(prev => ({
            centerX: ms.centerX ?? prev.centerX,
            centerY: ms.centerY ?? prev.centerY,
            start: ms.start ?? prev.start,
            end: ms.end ?? prev.end,
            blurPx: ms.blurPx ?? prev.blurPx,
            rimTilt: ms.rimTilt ?? prev.rimTilt,
            feather: ms.feather ?? prev.feather,
            innerBlur: ms.innerBlur ?? prev.innerBlur,
            color0: ms.color0 ?? prev.color0,
            color1: ms.color1 ?? prev.color1,
            color2: ms.color2 ?? prev.color2,
            color3: ms.color3 ?? prev.color3,
            color4: ms.color4 ?? prev.color4,
            tintAlpha: ms.tintAlpha ?? prev.tintAlpha,
            boost: ms.boost ?? prev.boost,
          }))
        }
        if (window.maskSettings) {
          const ms = window.maskSettings
          setMaskSettings(prev => ({
            enabled: ms.enabled ?? prev.enabled,
            color: typeof ms.color === 'string' ? ms.color : prev.color,
            opacity: Number.isFinite(Number(ms.opacity)) ? Math.max(0, Math.min(1, Number(ms.opacity))) : prev.opacity,
            blurPx: Number.isFinite(Number(ms.blurPx)) ? Math.max(0, Math.min(200, Number(ms.blurPx))) : prev.blurPx,
            radius: Number.isFinite(Number(ms.radius)) ? Math.max(10, Math.min(600, Number(ms.radius))) : prev.radius,
            centerX: Number.isFinite(Number(ms.centerX)) ? Math.max(0, Math.min(100, Number(ms.centerX))) : prev.centerX,
            centerY: Number.isFinite(Number(ms.centerY)) ? Math.max(0, Math.min(100, Number(ms.centerY))) : prev.centerY,
            blend: typeof ms.blend === 'string' ? ms.blend : prev.blend,
            showPanel: Boolean(ms.showPanel ?? prev.showPanel),
          }))
        }
        // Smoothly approach wobble target (default 1)
        {
          const target = (window.wobbleTarget != null) ? Math.max(0, Math.min(1, Number(window.wobbleTarget))) : 1
          setWobbleStrength(prev => {
            const next = prev + (target - prev) * 0.1
            return Math.abs(next - prev) > 0.001 ? next : prev
          })
        }
      }

      if (isIOS) {
        timeoutId = setTimeout(loop, 60)
      } else {
        frameId = requestAnimationFrame(loop)
      }
    }

    let frameId = null
    let timeoutId = null
    loop()

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      if (timeoutId !== null) clearTimeout(timeoutId)
    }
  }, [isIOS])

  useEffect(() => {
    if (!mounted) return
    let timer
    if (showMoodWords) {
      timer = setTimeout(() => setShowMoodWordsDelayed(true), 2000)
    } else {
      setShowMoodWordsDelayed(false)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showMoodWords, mounted])

  // Latch keyword visibility: trigger only after all 4 labels are ready, and on the next frame
  const labelsReady = (keywordLabels?.filter(Boolean).length || 0) >= 4
  useEffect(() => {
    if (showKeywords && labelsReady && !hasShownKeywords) {
      const id = requestAnimationFrame(() => setHasShownKeywords(true))
      return () => cancelAnimationFrame(id)
    }
    return undefined
  }, [showKeywords, labelsReady, hasShownKeywords])

  // When keywords are turned off (e.g., soft reset), clear latched state and pulse
  useEffect(() => {
    if (!showKeywords) {
      setHasShownKeywords(false)
      setKeywordsPulse(false)
    }
  }, [showKeywords])


  // After staggered reveal completes, run one-time group pulse (fade to 0 then back to 1)
  useEffect(() => {
    if (!hasShownKeywords || keywordsPulse) return
    const ITEM_FADE_MS = 900
    const DELAY_STEP_MS = 900
    const LAST_DELAY_MS = DELAY_STEP_MS * 3
    const totalRevealMs = LAST_DELAY_MS + ITEM_FADE_MS
    const HOLD_AFTER_REVEAL_MS = 3000
    const t = setTimeout(() => setKeywordsPulse(true), totalRevealMs + HOLD_AFTER_REVEAL_MS + 60)
    return () => clearTimeout(t)
  }, [hasShownKeywords, keywordsPulse])

  if (!mounted) {
    return (
      <S.PreMountCover
        $bg={
          'linear-gradient(to bottom, #FFF5F7 0%, #F5E6F5 30%, #E8D5E0 60%, rgb(125, 108, 118) 100%)'
        }
        $isIOS={isIOS}
      />
    )
  }

  // 꾹 누르기 이징 (사용하되 비주얼 변화는 제거)
  const pressEase = pressProgress * pressProgress * (3.0 - 2.0 * pressProgress)
  
  // 모바일 페이지에서 크기와 위치 (fixed)
  // T5(최종 결과) 단계에서는 화면 정중앙(50%)에 배치되도록 조정
  const blobTop = showFinalOrb ? '50%' : (hasShownKeywords ? '56%' : '60%')
  
  const baseBlobSize = 350
  const idleScaleFactor = 320 / baseBlobSize
  const listeningScaleFactor = 1
  const uiScaleFactor = isVoiceActive ? listeningScaleFactor : idleScaleFactor
  // 프레스 시 화이트아웃 제거: 블러/밝기 증가 사용하지 않음
  const blurIncrease = 0
  const brightnessIncrease = 1
  const saturationValue = isVoiceActive ? 1.35 : 1
  const boostedTintAlpha = Math.min(1, blobSettings.tintAlpha * (isVoiceActive ? 1.05 : 1))
  const boostedOuterBoost = Math.min(2.2, blobSettings.boost * (isVoiceActive ? 1.08 : 1))
  const mirrorTintAlpha = Math.min(1, mirrorSettings.tintAlpha * (isVoiceActive ? 1.05 : 1))
  const mirrorOuterBoost = Math.min(2.2, mirrorSettings.boost * (isVoiceActive ? 1.08 : 1))
  const uiScaleTransitionMs = 240
  // Figma-provided orbit shapes scale helpers
  const designBase = 350
  // T5(최종 결과)에서는 미니 블롭(오빗)이 더 잘 보이도록 블러를 조금 더 줄인다.
  const blurBase = hasShownKeywords ? 30 : 50
  const blurPx = Math.round(blurBase * (baseBlobSize / designBase))
  const shape1W = baseBlobSize * 0.534 // ≈ 187/350
  const shape1H = baseBlobSize * 0.554 // ≈ 194/350
  const shape2W = baseBlobSize * 0.735 // ≈ 257/350
  const shape2H = baseBlobSize * 0.763 // ≈ 267/350
  const blobSize = baseBlobSize

  const bgGradient = `linear-gradient(to bottom, ${bgSettings.top} 0%, ${bgSettings.mid} ${bgSettings.midStop}%, ${bgSettings.low} ${bgSettings.lowStop}%, ${bgSettings.bottom} 100%)`

  const blobTransition = isIOS
    ? `transform ${uiScaleTransitionMs}ms ease, opacity ${blobOpacityMs}ms ease`
    : `transform ${uiScaleTransitionMs}ms ease, opacity ${blobOpacityMs}ms ease, filter ${blobOpacityMs}ms ease`

  return (
    <>
      <S.Root $bg={bgGradient} $isIOS={isIOS}>
        <S.KeyframesGlobal
          $blurIncrease={0}
          $blobSize={blobSize}
          $orbitRadiusScale={orbitRadiusScale}
          $isIOS={isIOS}
        />
        <S.BlobCssGlobal />
        <S.BlobWrapper
          $top={blobTop}
          $size={blobSize}
          $opacity={blobAlpha}
          $opacityMs={blobOpacityMs}
          $brightness={brightnessIncrease}
            style={{ '--cluster-offset-y': showFinalOrb ? '0%' : '14%', '--wobble-strength': wobbleStrength }}
        >
          {!showFinalOrb && <S.BGGlow $isIOS={isIOS} />}
          {/* showOrbits가 true인 동안에는 항상 회전.
              최종 키워드 단계(hasShownKeywords=true)에서는 회전 속도를 살짝 올린다. */}
          <S.Cluster
            $spin={false}  // 메인 블롭이 중심축을 기준으로 회전하지 않도록 클러스터 회전은 항상 비활성화
          >
            {showOrbits && (
              <>
                {/* Orbit A - Figma spec: linear gradient #000 -> #0D3664 -> #E096E2 with 50px blur */}
                <S.OrbitWrap $d={blobSize * 0.92} $anim={'orbitCW 12s linear infinite'}>
                  <S.OrbitShape $rotate={-176.444} $w={shape1W} $h={shape1H} $blur={blurPx} $bg={'linear-gradient(180deg, #000000 0%, #0D3664 50%, #E096E2 98.08%)'} />
                </S.OrbitWrap>
                {/* Orbit B - Figma spec: pink gradient with 50px blur */}
                <S.OrbitWrap $d={blobSize * 0.84} $anim={'orbitCCW 14s linear infinite'}>
                  <S.OrbitShape $rotate={-144.552} $w={shape2W} $h={shape2H} $blur={blurPx} $bg={'linear-gradient(180deg, #FC8AD6 0%, #FFD8E0 75.48%)'} />
                </S.OrbitWrap>
                {/* New entering orb (from outside, then joins rotation) */}
                {newOrbEnter && (
                  <S.NewOrbWrap $d={blobSize * 0.92}>
                    <S.NewOrbShape $w={Math.round(blobSize * 0.834)} $h={Math.round(blobSize * 0.866)} $br={Math.round(blobSize * 0.866)} $enterMs={Math.max(700, blobOpacityMs)} />
                  </S.NewOrbWrap>
                )}

                {/* Final phase: extra orb and center glow */}
                {showFinalOrb && (
                  <S.FinalOrbWrap $w={blobSize * 1.02} $h={blobSize * 1.06}>
                    <S.FinalOrbShape $w={Math.round(blobSize * 1.01)} $h={Math.round(blobSize * 1.05)} $br={Math.round(blobSize * 1.05)} />
                  </S.FinalOrbWrap>
                )}
                
              </>
            )}
            <div
              className={`blob${(isListeningFlag || mainBlobStatic) ? ' frozen' : ''}`}
              style={{
                '--center-x': `${blobSettings.centerX}%`,
                '--center-y': `${blobSettings.centerY}%`,
                '--start': `${blobSettings.start}%`,
                '--end': `${blobSettings.end}%`,
                '--blur': `${blobSettings.blurPx + blurIncrease}px`,
                '--feather': `${blobSettings.feather}%`,
                '--inner-blur': `${blobSettings.innerBlur}px`,
                '--rim-tilt': `${blobSettings.rimTilt}deg`,
                '--c0': `${blobSettings.color0}`,
                '--c1': `${blobSettings.color1}`,
                '--c2': `${blobSettings.color2}`,
                '--c3': `${blobSettings.color3}`,
                '--c4': `${blobSettings.color4}`,
                '--bg': `radial-gradient(circle at var(--center-x) var(--center-y), var(--c0) 0%, var(--c1) 13%, var(--c2) 47%, var(--c3) 78%, var(--c4) 100%)`,
                '--tint-alpha': boostedTintAlpha,
                '--boost': boostedOuterBoost,
                width: `${blobSize}px`,
                aspectRatio: '1 / 1',
                transform: `translateZ(0) scale(${blobScale * uiScaleFactor})`,
                transition: blobTransition,
                opacity: mainBlobFade ? 0 : 1,
                filter: (() => {
                  const filters = []
                  if (mainBlobFade) filters.push('blur(10px)')
                  if (saturationValue !== 1) filters.push(`saturate(${saturationValue})`)
                  return filters.length ? filters.join(' ') : 'none'
                })(),
                ...(isListeningFlag ? {
                  animation: 'none',
                  '--start-wobble': 'calc(12% - var(--start))',
                  '--end-wobble': 'calc(86% - var(--end))',
                  '--feather-wobble': '3%',
                  '--blur-wobble': 'calc(8px - var(--blur))'
                } : {})
              }}
            >
              <div className="ring-boost" />
            </div>
          </S.Cluster>
          {showCenterGlow && (
            <S.CenterGlow $d={Math.round(blobSize * 1.10)} />
          )}
          {/* T5: 중앙에 고정된 화이트 블롭 레이어 (회전 없이 빛만 남도록) */}
          {showFinalOrb && (
            <S.FinalCenterWhiteBlob $d={Math.round(blobSize * 0.86)} $isIOS={isIOS} />
          )}
          {/* Mirrored mask blob: same size and levers as the main blob, opposite rim direction */}
          <div
            className={`blob mirror${(isListeningFlag || mainBlobStatic) ? ' frozen' : ''}`}
            style={{
              '--center-x': `${mirrorSettings.centerX}%`,
              '--center-y': `${mirrorSettings.centerY}%`,
              '--start': `${mirrorSettings.start}%`,
              '--end': `${mirrorSettings.end}%`,
              '--blur': `${mirrorSettings.blurPx + blurIncrease}px`,
              '--feather': `${mirrorSettings.feather}%`,
              '--inner-blur': `${mirrorSettings.innerBlur}px`,
              '--rim-tilt': `${mirrorSettings.rimTilt}deg`,
              '--c0': `${mirrorSettings.color0}`,
              '--c1': `${mirrorSettings.color1}`,
              '--c2': `${mirrorSettings.color2}`,
              '--c3': `${mirrorSettings.color3}`,
              '--c4': `${mirrorSettings.color4}`,
              '--bg': `radial-gradient(circle at var(--center-x) var(--center-y), var(--c0) 0%, var(--c1) 13%, var(--c2) 47%, var(--c3) 78%, var(--c4) 100%)`,
              '--tint-alpha': mirrorTintAlpha,
              '--boost': mirrorOuterBoost,
              width: `${blobSize}px`,
              aspectRatio: '1 / 1',
              transform: `translateZ(0) scale(${blobScale * uiScaleFactor})`,
              transition: blobTransition,
              opacity: mainBlobFade ? 0 : 1,
              filter: (() => {
                const filters = []
                if (mainBlobFade) filters.push('blur(10px)')
                if (saturationValue !== 1) filters.push(`saturate(${saturationValue})`)
                return filters.length ? filters.join(' ') : 'none'
              })(),
              ...(isListeningFlag ? {
                animation: 'none',
                '--start-wobble': 'calc(12% - var(--start))',
                '--end-wobble': 'calc(86% - var(--end))',
                '--feather-wobble': '3%',
                '--blur-wobble': 'calc(8px - var(--blur))'
              } : {})
            }}
          />
        {showMoodWords && (
          <S.MoodWords $visible={showMoodWordsDelayed} style={{ '--loop-steps': moodLoop.length - 1, '--cycle-duration': '7.2s' }}>
            <S.MoodTrack>
              {moodLoop.map((word, idx) => (
                <S.MoodWord key={`${word}-${idx}`}>
                  {word}
                </S.MoodWord>
              ))}
            </S.MoodTrack>
          </S.MoodWords>
        )}
        <S.KeywordLayer
          $visible={hasShownKeywords}
          $pulse={keywordsPulse}
          style={{
            // 최종 키워드가 보일 때만 중심을 살짝 위로 올린다.
            '--kw-center-y': hasShownKeywords ? '31%' : '34%',
          }}
        >
          <S.KeywordItem $pos="top" $visible={hasShownKeywords} style={{ left: 'var(--kw-center-x)', top: 'var(--kw-center-y)', transform: 'translate(-50%, -50%) translateY(calc(-1.5 * var(--kw-spacing-y))) translateX(calc(-0.5 * var(--kw-spacing-x)))' }}>
            {keywordLabels[0] ?? ''}
          </S.KeywordItem>
          <S.KeywordItem $pos="right" $visible={hasShownKeywords} style={{ left: 'var(--kw-center-x)', top: 'var(--kw-center-y)', transform: 'translate(-50%, -50%) translateY(calc(-0.5 * var(--kw-spacing-y))) translateX(calc(0.5 * var(--kw-spacing-x)))' }}>
            {keywordLabels[3] ?? ''}
          </S.KeywordItem>
          <S.KeywordItem $pos="bottom" $visible={hasShownKeywords} style={{ left: 'var(--kw-center-x)', top: 'var(--kw-center-y)', transform: 'translate(-50%, -50%) translateY(calc(0.5 * var(--kw-spacing-y))) translateX(calc(-0.5 * var(--kw-spacing-x)))' }}>
            {keywordLabels[2] ?? ''}
          </S.KeywordItem>
          <S.KeywordItem $pos="left" $visible={hasShownKeywords} style={{ left: 'var(--kw-center-x)', top: 'var(--kw-center-y)', transform: 'translate(-50%, -50%) translateY(calc(1.5 * var(--kw-spacing-y))) translateX(calc(0.5 * var(--kw-spacing-x)))' }}>
            {keywordLabels[1] ?? ''}
          </S.KeywordItem>
        </S.KeywordLayer>
        </S.BlobWrapper>
      </S.Root>
      {/* Panel removed: mirrored blob follows main blob levers automatically */}
    </>
  )
}

