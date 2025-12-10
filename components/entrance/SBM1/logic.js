import { useEffect, useMemo, useRef, useState } from 'react';
import useSocketSBM1 from '@/utils/hooks/useSocketSBM1';
import useResize from '@/utils/hooks/useResize';
import { playSbm1QrTipStart } from '@/utils/data/soundeffect';

export const DEFAULT_TOP_MESSAGE = 'QR코드 스캔을 통해\n전시 관람을 시작하세요!';
const TIP_TEXT = '오늘의 기분을 모바일을 통해 알려주세요!';
const DEFAULT_FURON_PATH = '/image.png';


function getViewportVars(width, height) {
  if (typeof window === 'undefined') return { '--kiss': '12vmin' };
  const qrPx = Math.min(Math.round(width * 0.25), Math.round(height * 0.28));
  return { '--kiss': '12vmin', '--qr-size': `${qrPx}px` };
}

// Build mobile URL dynamically from current host (no hardcoded domains)
function getMobileUrl() {
  if (typeof window === 'undefined') return '';
  const { protocol, host } = window.location;
  return `${protocol}//${host}/mobile`;
}

export function useSbm1() {
  const { width, height } = useResize();
  const vars = useMemo(() => getViewportVars(width, height), [width, height]);
  const [qrUrl, setQrUrl] = useState(getMobileUrl());
  const [topMessage, setTopMessage] = useState(DEFAULT_TOP_MESSAGE);
  const furonPath = DEFAULT_FURON_PATH;
  const [userCount, setUserCount] = useState(0);
  const seenUserIdsRef = useRef(new Set());
  const [boost, setBoost] = useState(false);
  const [tip, setTip] = useState(false);
  const [flash, setFlash] = useState(false);
  const boostTimeoutRef = useRef(null);
  const flashTimeoutRef = useRef(null);
  const tipTimeoutRef = useRef(null);
  const prevTipRef = useRef(false);

  useSocketSBM1({
    onEntranceNewUser: (payload) => {
      try {
        const uid = String(payload?.userId || '').trim();
        if (!uid) return;
        const seen = seenUserIdsRef.current;
        if (!seen.has(uid)) {
          seen.add(uid);
          setUserCount((c) => c + 1);
        }
        // 순간 채도/대비 부스트 (중복 이벤트 시 타이머 재설정으로 과도한 setState 방지)
        setBoost(true);
        if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
        boostTimeoutRef.current = setTimeout(() => {
          setBoost(false);
          boostTimeoutRef.current = null;
        }, 2000);
        // 연핑크 배경 플래시 (서서히 들어왔다 나감)
        setFlash(true);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          setFlash(false);
          flashTimeoutRef.current = null;
        }, 2000);
        // Tip 문구 7초 표시 (애니메이션 길이와 정확히 맞춤)
        setTopMessage((prev) => (prev === TIP_TEXT ? prev : TIP_TEXT));
        setTip(true);
        if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
        tipTimeoutRef.current = setTimeout(() => {
          setTip(false);
          setTopMessage((prev) => (prev === DEFAULT_TOP_MESSAGE ? prev : DEFAULT_TOP_MESSAGE));
          tipTimeoutRef.current = null;
        }, 7000);
      } catch {}
    },
    onEntranceNewName: (payload) => {
      try {
        const uid = String(payload?.userId || '').trim();
        if (!uid) return;
        const seen = seenUserIdsRef.current;
        if (!seen.has(uid)) {
          seen.add(uid);
          setUserCount((c) => c + 1);
        }
        // 이름 들어와도 동일하게 부스트 (타이머 재사용)
        setBoost(true);
        if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
        boostTimeoutRef.current = setTimeout(() => {
          setBoost(false);
          boostTimeoutRef.current = null;
        }, 2000);
        // 연핑크 배경 플래시
        setFlash(true);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          setFlash(false);
          flashTimeoutRef.current = null;
        }, 2000);
        // Tip 문구 7초 표시 (애니메이션 길이와 정확히 맞춤)
        setTopMessage((prev) => (prev === TIP_TEXT ? prev : TIP_TEXT));
        setTip(true);
        if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
        tipTimeoutRef.current = setTimeout(() => {
          setTip(false);
          setTopMessage((prev) => (prev === DEFAULT_TOP_MESSAGE ? prev : DEFAULT_TOP_MESSAGE));
          tipTimeoutRef.current = null;
        }, 7000);
      } catch {}
    },
  });


  const styleVars = useMemo(() => ({
    ...vars,
    '--sbm-boost-filter': boost ? 'saturate(1.22) contrast(1.12) brightness(1.04)' : 'none',
    // 블롭 스케일은 항상 1로 고정 (아이들/액티브 동일 크기)
    '--sbm-blob-zoom': 1,
    // 액티브(tip=true) 동안에는 배경 워시를 강한 마젠타로 유지
    '--sbm-bgflash-opacity': tip ? 1 : 0,
    '--sbm-border-glow-opacity': tip ? 1 : 0,
  }), [vars, boost, tip]);

  // 모바일 QR 스캔으로 상단 TIP 시퀀스가 시작될 때마다 1회만 효과음 재생
  useEffect(() => {
    const prev = prevTipRef.current;
    if (!prev && tip) {
      // TIP false → true 전환 시에만 재생
      playSbm1QrTipStart();
    }
    prevTipRef.current = tip;
  }, [tip]);

  // 언마운트 시 타이머 정리로 메모리/불필요한 setState 방지
  useEffect(() => {
    return () => {
      if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
    };
  }, []);

  return useMemo(
    () => ({ vars: styleVars, qrUrl, topMessage, furonPath, userCount, tip }),
    [styleVars, qrUrl, topMessage, userCount, tip]
  );
}


