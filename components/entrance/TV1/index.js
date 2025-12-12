import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useSocketTV1 from "@/utils/hooks/useSocketTV1";
import { playTv1BackgroundLoop } from '@/utils/data/soundeffect';
import useTTS from "@/utils/hooks/useTTS";
import * as S from './styles';
import * as B from './blobtextbox/@boxes';
import { calculateBlobWidth } from './blobtextbox/@boxes';
import { createSocketHandlers, initializeFixedBlobs } from './logic';

// 새로 생성된 블롭을 화면 밖(하단)에서 위로 슬라이딩하며 나타나게 하는 래퍼 컴포넌트
// + 내용 단계: T1(빈 블롭, 감정 컬러, 최소 폭) 2초 → T2('...' 모션, 중립 컬러, 최소 폭 유지) 4초 → T3(감정 텍스트, 감정 컬러, 텍스트 길이에 맞게 오른쪽으로 확장)
function BlobFadeInWrapper({ blob, BlobComponent, unifiedFont, canvasRef, dotCount, onTextVisible }) {
  // visible이 false면 렌더링하지 않음 (fadeout)
  if (blob.visible === false) {
    return null;
  }
  
  const targetTop = parseFloat(blob.top);
  const isNewBlob = blob.isNew === true;
  
  // 새로 생성된 블롭만 하단에서 올라오는 애니메이션 적용
  // 이미 존재하는 블롭이 이동할 때는 CSS transition만 사용
  const [startTop, setStartTop] = useState(() => {
    if (isNewBlob) {
      // 새로 생성된 블롭: 화면 밖 하단에서 시작
      return 100;
    } else {
      // 이미 존재하는 블롭: 현재 위치에서 시작
      return targetTop;
    }
  });
  const [isAnimating, setIsAnimating] = useState(!isNewBlob); // 새 블롭만 애니메이션 시작 대기

  // 새 블롭 내용 단계: 'empty' → 'dots' → 'text'
  const [contentPhase, setContentPhase] = useState(isNewBlob ? 'empty' : 'text');
  const announcedRef = useRef(false);
  // Lightweight typewriter for T3→T4→T5 전환 시 텍스트 표시
  const [typedText, setTypedText] = useState(isNewBlob ? '' : (blob.text || ''));
  
  useEffect(() => {
    // 새로 생성된 블롭만 하단에서 올라오는 애니메이션 적용
    if (!isNewBlob) {
      // 이미 존재하는 블롭은 현재 위치에서 새 위치로 이동 (CSS transition 사용)
      setStartTop(targetTop);
      return;
    }
    
    // 화면의 실제 하단 위치 계산 (vw 단위)
    const calculateStartTop = () => {
      if (!canvasRef?.current) {
        return 100;
      }
      
      if (typeof window !== 'undefined' && window.innerWidth > 0) {
        const canvas = canvasRef.current;
        const canvasHeightPx = canvas.clientHeight;
        const viewportWidth = window.innerWidth;
        const canvasHeightVw = (canvasHeightPx / viewportWidth) * 100;
        return canvasHeightVw + 5;
      }
      
      return 100;
    };
    
    const calculatedStartTop = calculateStartTop();
    setStartTop(calculatedStartTop);
    
    // startTop이 설정된 후 다음 프레임에서 애니메이션 시작
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }, 50);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [canvasRef, targetTop, isNewBlob]);

  // 새로 생성된 블롭의 내용 단계 전환 (T1/T2/T3 모션)
  useEffect(() => {
    if (!isNewBlob) {
      setContentPhase('text');
      return;
    }

    // T1: 0~2초 빈 블롭 (감정 컬러, 최소 폭)
    const t3 = setTimeout(() => {
      setContentPhase('dots');
    }, 2000);

    // T2: 2~6초 '...' 모션 (중립 컬러, 최소 폭 유지) → 이후 감정 텍스트
    const t4 = setTimeout(() => {
      setContentPhase('text');
    }, 6000);

    return () => {
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isNewBlob]);

  // Typewriter: contentPhase가 text로 전환될 때 한 번만 실행
  useEffect(() => {
    if (!isNewBlob) {
      setTypedText(blob.text || '');
      return;
    }
    if (contentPhase !== 'text') return;
    const full = String(blob.text || '');
    if (!full) {
      setTypedText('');
      return;
    }
    setTypedText('');
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedText(full.slice(0, i));
      if (i >= full.length) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [contentPhase, isNewBlob, blob.text]);

  // T4 시점(텍스트 등장)에서 TTS 호출
  useEffect(() => {
    if (contentPhase === 'text' && isNewBlob && !announcedRef.current && typeof onTextVisible === 'function') {
      announcedRef.current = true;
      try { onTextVisible(blob.text); } catch {}
    }
  }, [contentPhase, isNewBlob, onTextVisible, blob.text]);
  
  // 새 블롭: isAnimating이 true면 targetTop으로, false면 startTop 위치에 있음
  // 기존 블롭: 항상 targetTop 위치 (CSS transition으로 이동)
  const currentTop = isNewBlob ? (isAnimating ? targetTop : startTop) : targetTop;

  // 단계별 width 제어를 위한 텍스트 (BlobBase는 $text 길이에 따라 width 계산)
  // - 'empty' / 'dots' 단계에서는 고정 최소 폭(8vw)만 사용하도록 빈 문자열 전달
  // - 'text' 단계에서만 실제 감정 키워드 길이에 맞게 오른쪽으로 확장
  const widthTextForPhase = contentPhase === 'text' ? (blob.text || '') : '';

  // 단계별 컬러 제어
  // - T1(empty), T3(text): 감정 고유 그라데이션 사용 (blob.gradient)
  // - T2(dots): 고유색을 제거한 중립 그라데이션 사용
  //   → 중앙은 화이트 글로우, 우측 끝에는 옅은 핑크가 남도록 조정
  const neutralGradient = 'linear-gradient(253deg, hsl(345, 92%, 72%) 0%, hsl(10, 100%, 97%) 32%, hsl(345, 92%, 75%) 100%)';
  const gradientForPhase =
    contentPhase === 'dots'
      ? neutralGradient
      : (blob.gradient || neutralGradient);
  
  return (
    <BlobComponent
      $fontFamily={unifiedFont}
      $visible={blob.visible !== false}
      $gradient={gradientForPhase}
      $text={widthTextForPhase}
      $top={`${currentTop}vw`}
      $left={`${blob.left}vw`}
      $isAnimating={isAnimating || !isNewBlob} // 이동하는 블롭도 애니메이션 적용
    >
      {/* 내용 단계에 따라: 빈 블롭 → '...' 모션 → 감정 텍스트 */}
      {contentPhase === 'empty' && (
        <span style={{ opacity: 0, position: 'relative', zIndex: 100 }}>{'\u00A0'}</span>
      )}
      {contentPhase === 'dots' && (
        <span style={{ position: 'relative', zIndex: 100, display: 'inline-flex', alignItems: 'center' }}>
          <S.Dots aria-hidden="true">
            <S.Dot $visible={dotCount >= 1}>.</S.Dot>
            <S.Dot $visible={dotCount >= 2}>.</S.Dot>
            <S.Dot $visible={dotCount >= 3}>.</S.Dot>
          </S.Dots>
        </span>
      )}
      {contentPhase === 'text' && (
        <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{typedText}</span>
      )}
    </BlobComponent>
  );
}

export default function TV1Controls() {
  const [keywords, setKeywords] = useState([]);
  const [tv2Color, setTv2Color] = useState('#FFD166');
  const [dotCount, setDotCount] = useState(0);
  const unifiedFont = '\'Pretendard\', \'Pretendard Variable\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
  const { play: playTts } = useTTS({ voice: 'marin', model: 'gpt-4o-mini-tts', format: 'mp3' });
  // Top row 4 containers (left→right) dynamic texts; newest always goes to first
  const [topTexts, setTopTexts] = useState([]);
  
  // 실제 감정 키워드 기반 블롭 표시 상태 관리
  // 각 블롭 타입별로 { visible: boolean, text: string, gradient: string, timestamp: number } 형태로 저장
  // 초기 디폴트 블롭 5개: 짜증, 무기력, 설렘, 맑음, 상쾌함
  const [visibleBlobs, setVisibleBlobs] = useState({
    Annoyed: {
      visible: true,
      text: '짜증나',
      gradient: 'linear-gradient(220deg, hsl(345, 92%, 72%) 0%, hsl(0, 100%, 60%) 10%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)',
      timestamp: Date.now()
    },
    Sad: {
      visible: false,
      text: '무기력',
      gradient: 'linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(242, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)',
      timestamp: Date.now()
    },
    Happy: {
      visible: false,
      text: '설렘',
      gradient: 'linear-gradient(249deg, hsl(345, 92%, 72%) 0%, hsl(302, 100%, 68.6%) 10%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)',
      timestamp: Date.now()
    },
    Interest: {
      visible: true,
      text: '지금 날씨 되게 맑아',
      gradient: 'linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(156, 75%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)',
      timestamp: Date.now()
    },
    Playful: {
      visible: true,
      text: '여기 공기가 되게 상쾌함',
      gradient: 'linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(242, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)',
      timestamp: Date.now()
    },
    SelfConfident: {
      visible: false,
      text: '자기확신',
      gradient: 'linear-gradient(226deg, hsl(345, 92%, 72%) 0%, hsl(86, 100%, 60%) 16%, hsl(345, 92%, 72%) 55%, hsl(10, 100%, 94%) 95%)',
      timestamp: Date.now()
    }
  });
  
  // 새로운 감정 키워드 블롭 배열 (고정 블롭 + 동적 블롭)
  // 각 블롭: { id, blobType, text, gradient, top, left, rowIndex, column, timestamp, hour, isFixed }
  const [newBlobs, setNewBlobs] = useState(() => {
    // 초기 마운트 시 고정 블롭 24개 생성
    return initializeFixedBlobs(visibleBlobs, calculateBlobWidth);
  });
  
  // 시간 표시 배열 (블롭 생성 시 시간대 변경 시 자동 생성)
  // 각 시간 표시: { hour: number, top: number, visible: boolean, timestamp: number }
  const [timeMarkers, setTimeMarkers] = useState([]);
  
  // 블롭 타입을 컴포넌트로 매핑하는 함수
  const getBlobComponent = (blobType) => {
    const componentMap = {
      'Interest': B.InterestBox,
      'Playful': B.PlayfulBox,
      'Happy': B.HappyBox,
      'Upset': B.UpsetBox,
      'Proud': B.ProudBox,
      'Shy': B.ShyBox,
      'Chaotic': B.ChaoticBox,
      'Sad': B.SadBox,
      'Wonder': B.WonderBox,
      'Annoyed': B.AnnoyedBox,
      'Hungry': B.HungryBox,
      'SelfConfident': B.SelfConfidentBox
    };
    return componentMap[blobType] || B.InterestBox; // 기본값
  };

  // Canvas ref for auto-scroll animation
  const canvasRef = useRef(null);
  
  // LeftLineImage ref and dynamic height state
  const lineImageRef = useRef(null);
  const [lineImageHeight, setLineImageHeight] = useState(null); // null이면 기본 100%
  const [canvasHeightVw, setCanvasHeightVw] = useState(56.25); // Canvas의 실제 높이 (vw 단위)

  // Scaling handled via CSS (viewport width) in styles.Canvas

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  // ---------------------------------------------------------------------------
  // TV1 화면용 백그라운드 음악 (lg_tv1_251211.mp3)
  // - 화면이 마운트된 동안 아주 낮은 볼륨으로 loop 재생
  // ---------------------------------------------------------------------------
  const bgAudioRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (bgAudioRef.current) return; // 이미 재생 중이면 중복 방지
    const audio = playTv1BackgroundLoop(0.2);
    bgAudioRef.current = audio || null;
    return () => {
      try {
        if (bgAudioRef.current) {
          bgAudioRef.current.pause();
        }
      } catch {}
      bgAudioRef.current = null;
    };
  }, []);

  // 자동 스크롤 애니메이션 제거됨 - 화면은 고정된 채로 블롭만 움직임

  // Canvas 콘텐츠 높이에 맞춰 줄 이미지 높이 업데이트
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateLineHeight = () => {
      // Canvas의 실제 콘텐츠 높이 (scrollHeight) 계산
      const scrollHeightPx = canvas.scrollHeight;
      const canvasHeightPx = canvas.clientHeight;
      
      // scrollHeight를 vw 단위로 변환
      // Canvas의 width가 100vw이므로, viewportWidth를 기준으로 변환
      if (typeof window !== 'undefined' && window.innerWidth > 0) {
        const viewportWidth = window.innerWidth;
        const scrollHeightVw = (scrollHeightPx / viewportWidth) * 100;
        const canvasHeightVwValue = (canvasHeightPx / viewportWidth) * 100;
        
        // Canvas의 실제 높이 저장 (mask-image 계산용)
        setCanvasHeightVw(canvasHeightVwValue);
        
        // Canvas의 기본 높이 (56.25vw)보다 크면 동적 높이 적용
        const canvasBaseHeightVw = 56.25;
        if (scrollHeightVw > canvasBaseHeightVw) {
          setLineImageHeight(scrollHeightVw);
        } else {
          // 기본 높이 사용 (100%)
          setLineImageHeight(null);
        }
      }
    };

    // 초기 업데이트
    updateLineHeight();

    // ResizeObserver로 Canvas 크기 변경 감지
    const resizeObserver = new ResizeObserver(() => {
      updateLineHeight();
    });

    resizeObserver.observe(canvas);

    // MutationObserver로 Canvas 내부 콘텐츠 변경 감지
    const mutationObserver = new MutationObserver(() => {
      updateLineHeight();
    });

    mutationObserver.observe(canvas, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [newBlobs, timeMarkers]); // newBlobs나 timeMarkers가 변경되면 높이 재계산

  const speakKeyword = useCallback((kw) => {
    const txt = String(kw || '').trim();
    if (!txt) return;
    try {
      playTts(`새로운 데이터가 추가되었어요. ${txt}`);
    } catch {}
  }, [playTts]);

  const handlers = useMemo(
    () => createSocketHandlers({ 
      setKeywords, 
      unifiedFont, 
      setTv2Color, 
      setTopTexts, 
      setVisibleBlobs,
      setNewBlobs,
      calculateBlobWidth,
      setTimeMarkers,
    }),
    [setKeywords, unifiedFont, setTv2Color, setTopTexts, setVisibleBlobs]
  );

  const { socket } = useSocketTV1({
    onEntranceNewVoice: handlers.onEntranceNewVoice,
    onDeviceDecision: handlers.onDeviceDecision,
    onDeviceNewDecision: handlers.onDeviceNewDecision,
  });

  // visible한 블롭들의 left 위치를 동적으로 계산 (블롭 간 간격 동일하게)
  const blobPositions = useMemo(() => {
    const startLeft = 19.610417; // Annoyed 시작 위치 (vw)
    const endRight = 84; // 오른쪽 끝 위치 (vw)
    const availableWidth = endRight - startLeft; // 사용 가능한 전체 너비
    
    // visible한 블롭들만 필터링
    const visibleBlobKeys = [
      { key: 'Annoyed', text: visibleBlobs.Annoyed?.text || '' },
      { key: 'Sad', text: visibleBlobs.Sad?.text || '' },
      { key: 'Interest', text: visibleBlobs.Interest?.text || '' },
      { key: 'Happy', text: visibleBlobs.Happy?.text || '' },
      { key: 'Playful', text: visibleBlobs.Playful?.text || '' },
      { key: 'SelfConfident', text: visibleBlobs.SelfConfident?.text || '' }
    ].filter(item => visibleBlobs[item.key]?.visible === true);
    
    // visible한 블롭들의 너비 계산
    const blobWidths = visibleBlobKeys.map(item => ({
      key: item.key,
      width: calculateBlobWidth(item.text)
    }));
    
    const totalBlobWidth = blobWidths.reduce((sum, item) => sum + item.width, 0);
    
    // visible한 블롭 사이에는 (visible한 블롭 개수 - 1)개의 간격이 있음 (동일한 간격)
    const gapCount = visibleBlobKeys.length - 1;
    
    // 최소 간격 보장 (1vw 이상)
    const minSpacing = 1.0;
    const remainingWidth = availableWidth - totalBlobWidth;
    const calculatedSpacing = gapCount > 0 ? remainingWidth / gapCount : 0;
    const uniformSpacing = Math.max(minSpacing, calculatedSpacing);
    
    // 각 블롭의 left 위치 계산 (블롭 너비 + 간격)
    const positions = {};
    let currentLeft = startLeft;
    
    visibleBlobKeys.forEach((item, index) => {
      const blobWidth = blobWidths[index].width;
      positions[item.key] = `${currentLeft}vw`;
      // 현재 블롭의 오른쪽 끝 + 간격 = 다음 블롭의 시작 위치
      currentLeft += blobWidth + (index < gapCount ? uniformSpacing : 0);
    });
    
    // visible하지 않은 블롭들은 기본 위치 설정 (렌더링되지 않지만 에러 방지)
    const allKeys = ['Annoyed', 'Sad', 'Interest', 'Happy', 'Playful', 'SelfConfident'];
    allKeys.forEach(key => {
      if (!positions[key]) {
        positions[key] = `${startLeft}vw`;
      }
    });
    
    return positions;
  }, [visibleBlobs.Annoyed?.text, visibleBlobs.Annoyed?.visible, visibleBlobs.Sad?.text, visibleBlobs.Sad?.visible, visibleBlobs.Interest?.text, visibleBlobs.Interest?.visible, visibleBlobs.Happy?.text, visibleBlobs.Happy?.visible, visibleBlobs.Playful?.text, visibleBlobs.Playful?.visible, visibleBlobs.SelfConfident?.text, visibleBlobs.SelfConfident?.visible]);

  return (
    <S.Root $fontFamily={unifiedFont}>
      <S.Canvas ref={canvasRef}>
        <S.LeftLineImage ref={lineImageRef} $height={lineImageHeight} $canvasHeight={canvasHeightVw} />
        <S.LeftNow>Now</S.LeftNow>
        <S.LeftShape />
        
        {/* 동적 시간 표시 (블롭 생성 시 시간대 변경 시 자동 생성) */}
        {timeMarkers.map((marker) => (
          <React.Fragment key={`time-${marker.hour}`}>
            <S.LeftTime2 
              $top={`${marker.top}vw`}
              $visible={marker.visible}
            >
              {String(marker.hour).padStart(2, '0')}:00
            </S.LeftTime2>
            <S.LeftWhiteShape 
              $top={`${marker.top}vw`}
              $visible={marker.visible}
            />
          </React.Fragment>
        ))}
        <S.TopText $fontFamily={unifiedFont}>
          <S.Bold>오늘</S.Bold>
          <span>의 감정들은</span>
          <S.Dots aria-hidden="true">
            <S.Dot $visible={dotCount >= 1}>.</S.Dot>
            <S.Dot $visible={dotCount >= 2}>.</S.Dot>
            <S.Dot $visible={dotCount >= 3}>.</S.Dot>
          </S.Dots>
        </S.TopText>
        <B.InterestBox $fontFamily={unifiedFont} $visible={!!visibleBlobs.Interest?.visible} $gradient={visibleBlobs.Interest?.gradient} $text={visibleBlobs.Interest?.text || ''} $left={blobPositions.Interest}>
          <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{visibleBlobs.Interest?.text || ''}</span>
        </B.InterestBox>
        <B.PlayfulBox $fontFamily={unifiedFont} $visible={!!visibleBlobs.Playful?.visible} $gradient={visibleBlobs.Playful?.gradient} $text={visibleBlobs.Playful?.text || ''} $left={blobPositions.Playful}>
          <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{visibleBlobs.Playful?.text || ''}</span>
        </B.PlayfulBox>
        <B.SelfConfidentBox $fontFamily={unifiedFont} $visible={!!visibleBlobs.SelfConfident?.visible} $gradient={visibleBlobs.SelfConfident?.gradient} $text={visibleBlobs.SelfConfident?.text || ''} $left={blobPositions.SelfConfident}>
          <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{visibleBlobs.SelfConfident?.text || ''}</span>
        </B.SelfConfidentBox>
        <B.HappyBox $fontFamily={unifiedFont} $visible={!!visibleBlobs.Happy?.visible} $gradient={visibleBlobs.Happy?.gradient} $text={visibleBlobs.Happy?.text || ''} $left={blobPositions.Happy}>
          <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{visibleBlobs.Happy?.text || ''}</span>
        </B.HappyBox>
        <B.SadBox $fontFamily={unifiedFont} $visible={!!visibleBlobs.Sad?.visible} $gradient={visibleBlobs.Sad?.gradient} $text={visibleBlobs.Sad?.text || ''} $left={blobPositions.Sad}>
          <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{visibleBlobs.Sad?.text || ''}</span>
        </B.SadBox>
        <B.AnnoyedBox $fontFamily={unifiedFont} $visible={!!visibleBlobs.Annoyed?.visible} $gradient={visibleBlobs.Annoyed?.gradient} $text={visibleBlobs.Annoyed?.text || ''} $left={blobPositions.Annoyed}>
          <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{visibleBlobs.Annoyed?.text || ''}</span>
        </B.AnnoyedBox>
        
        {/* 고정 블롭 + 동적 블롭 렌더링 */}
        {newBlobs.map((blob) => {
          const BlobComponent = getBlobComponent(blob.blobType);
          // 고정 블롭은 애니메이션 없이 바로 렌더링,
          // 단, shift 로직에서 visible=false 로 표시된 경우에는 페이드아웃/숨기기 위해 $visible 플래그를 반영
          if (blob.isFixed) {
            return (
              <BlobComponent
                key={blob.id}
                $fontFamily={unifiedFont}
                $visible={blob.visible !== false}
                $gradient={blob.gradient}
                $text={blob.text}
                $top={`${blob.top}vw`}
                $left={`${blob.left}vw`}
              >
                <span style={{ opacity: 1, position: 'relative', zIndex: 100 }}>{blob.text}</span>
              </BlobComponent>
            );
          }
          // 동적 블롭: visible이 false면 fadeout (렌더링 안 함)
          // 새로 생성된 블롭은 화면 하단에서 위로 슬라이드 애니메이션
          // 이동하는 블롭은 top 값 변경 시 CSS transition으로 자동 애니메이션
          if (blob.visible === false) {
            return null; // fadeout된 블롭은 렌더링하지 않음
          }
          return (
            <BlobFadeInWrapper
              key={blob.id}
              blob={blob}
              BlobComponent={BlobComponent}
              unifiedFont={unifiedFont}
              canvasRef={canvasRef}
              dotCount={dotCount}
              onTextVisible={speakKeyword}
            />
          );
        })}
        
      </S.Canvas>
    </S.Root>
  );
}
