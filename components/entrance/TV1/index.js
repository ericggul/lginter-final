import React, { useState, useMemo, useEffect, useRef } from "react";
import useSocketTV1 from "@/utils/hooks/useSocketTV1";
import * as S from './styles';
import * as B from './blobtextbox/@boxes';
import { calculateBlobWidth } from './blobtextbox/@boxes';
import { createSocketHandlers } from './logic';

export default function TV1Controls() {
  const [keywords, setKeywords] = useState([]);
  const [tv2Color, setTv2Color] = useState('#FFD166');
  const [dotCount, setDotCount] = useState(0);
  const unifiedFont = '\'Pretendard\', \'Pretendard Variable\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
  // Top row 4 containers (left→right) dynamic texts; newest always goes to first
  const [topTexts, setTopTexts] = useState([]);
  
  // 실제 감정 키워드 기반 블롭 표시 상태 관리
  // 각 블롭 타입별로 { visible: boolean, text: string, gradient: string, timestamp: number } 형태로 저장
  // 초기 디폴트 블롭 5개: 짜증, 무기력, 설렘, 맑음, 상쾌함
  const [visibleBlobs, setVisibleBlobs] = useState({
    Annoyed: {
      visible: true,
      text: '짜증',
      gradient: 'linear-gradient(220deg, hsl(328, 95%, 77%) 0%, hsl(0, 100%, 60%) 10%, hsl(328, 95%, 77%) 55%, hsl(297, 84%, 97%) 95%)',
      timestamp: Date.now()
    },
    Sad: {
      visible: true,
      text: '무기력',
      gradient: 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
      timestamp: Date.now()
    },
    Happy: {
      visible: true,
      text: '설렘',
      gradient: 'linear-gradient(249deg, hsl(328, 95%, 77%) 0%, hsl(302, 100%, 68.6%) 10%, hsl(328, 95%, 77%) 55%, hsl(262, 84%, 97%) 95%)',
      timestamp: Date.now()
    },
    Interest: {
      visible: true,
      text: '맑음',
      gradient: 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(156, 75%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
      timestamp: Date.now()
    },
    Playful: {
      visible: true,
      text: '상쾌함',
      gradient: 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(242, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
      timestamp: Date.now()
    },
    SelfConfident: {
      visible: true,
      text: '자기확신',
      gradient: 'linear-gradient(226deg, hsl(328, 95%, 77%) 0%, hsl(86, 100%, 60%) 16%, hsl(328, 95%, 77%) 55%, hsl(295, 84%, 97%) 95%)',
      timestamp: Date.now()
    }
  });
  
  // 새로운 감정 키워드 블롭 배열 (spawn point에서 시작하는 블롭들)
  // 각 블롭: { id, blobType, text, gradient, top, left, rowIndex, timestamp, hour }
  const [newBlobs, setNewBlobs] = useState([]);
  
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

  // Scaling handled via CSS (viewport width) in styles.Canvas

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDotCount((count) => (count >= 3 ? 0 : count + 1));
    }, 500);
    return () => clearInterval(intervalId);
  }, []);

  // 자동 스크롤 애니메이션: 상단→하단→상단 왕복 (17.5초)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const duration = 17500; // 17.5초 (왕복 시간)
    let startTime = null;
    let animationFrameId = null;

    // Easing function (ease-in-out)
    const easeInOut = (t) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration; // 0 to 1 반복

      // 왕복: 0-0.5는 하강, 0.5-1은 상승
      let scrollProgress;
      if (progress < 0.5) {
        // 하강: 0 → 1
        scrollProgress = easeInOut(progress * 2);
      } else {
        // 상승: 1 → 0
        scrollProgress = easeInOut(2 - progress * 2);
      }

      const maxScroll = canvas.scrollHeight - canvas.clientHeight;
      if (maxScroll > 0) {
        canvas.scrollTop = scrollProgress * maxScroll;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // 애니메이션 시작 (약간의 지연 후)
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [newBlobs]); // newBlobs가 변경되면 애니메이션 재시작

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

  const handlers = useMemo(
    () => createSocketHandlers({ 
      setKeywords, 
      unifiedFont, 
      setTv2Color, 
      setTopTexts, 
      setVisibleBlobs,
      setNewBlobs,
      calculateBlobWidth,
      setTimeMarkers
    }),
    [setKeywords, unifiedFont, setTv2Color, setTopTexts, setVisibleBlobs]
  );

  const { socket } = useSocketTV1({
    onEntranceNewVoice: handlers.onEntranceNewVoice,
    onDeviceDecision: handlers.onDeviceDecision,
    onDeviceNewDecision: handlers.onDeviceNewDecision,
  });

  // 6개 디폴트 블롭의 left 위치를 동적으로 계산 (모든 블롭 간 간격 동일하게, 짜증 블롭 기준)
  const blobPositions = useMemo(() => {
    const startLeft = 19.610417; // Annoyed 시작 위치 (vw)
    const endRight = 84; // 오른쪽 끝 위치 (vw) - 간격을 더 좁히기 위해 값 축소
    const availableWidth = endRight - startLeft; // 사용 가능한 전체 너비
    
    const annoyedText = visibleBlobs.Annoyed?.text || '';
    const sadText = visibleBlobs.Sad?.text || '';
    const interestText = visibleBlobs.Interest?.text || '';
    const happyText = visibleBlobs.Happy?.text || '';
    const playfulText = visibleBlobs.Playful?.text || '';
    const selfConfidentText = visibleBlobs.SelfConfident?.text || '';
    
    const annoyedWidth = calculateBlobWidth(annoyedText);
    const sadWidth = calculateBlobWidth(sadText);
    const interestWidth = calculateBlobWidth(interestText);
    const happyWidth = calculateBlobWidth(happyText);
    const playfulWidth = calculateBlobWidth(playfulText);
    const selfConfidentWidth = calculateBlobWidth(selfConfidentText);
    
    // 6개 블롭의 총 너비
    const totalBlobWidth = annoyedWidth + sadWidth + interestWidth + happyWidth + playfulWidth + selfConfidentWidth;
    
    // 6개 블롭 사이에는 5개의 간격이 있음 (동일한 간격)
    const uniformSpacing = (availableWidth - totalBlobWidth) / 4.5;
    
    // 각 블롭의 left 위치 계산
    const annoyedLeft = startLeft;
    const sadLeft = annoyedLeft + annoyedWidth + uniformSpacing;
    const interestLeft = sadLeft + sadWidth + uniformSpacing;
    const happyLeft = interestLeft + interestWidth + uniformSpacing;
    const playfulLeft = happyLeft + happyWidth + uniformSpacing;
    const selfConfidentLeft = playfulLeft + playfulWidth + uniformSpacing;
    
    return {
      Annoyed: `${annoyedLeft}vw`,
      Sad: `${sadLeft}vw`,
      Interest: `${interestLeft}vw`,
      Happy: `${happyLeft}vw`,
      Playful: `${playfulLeft}vw`,
      SelfConfident: `${selfConfidentLeft}vw`,
    };
  }, [visibleBlobs.Annoyed?.text, visibleBlobs.Sad?.text, visibleBlobs.Interest?.text, visibleBlobs.Happy?.text, visibleBlobs.Playful?.text, visibleBlobs.SelfConfident?.text]);

  return (
    <S.Root $fontFamily={unifiedFont}>
      <S.Canvas ref={canvasRef}>
        <S.LeftLineImage ref={lineImageRef} $height={lineImageHeight} />
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
        
      </S.Canvas>
    </S.Root>
  );
}
