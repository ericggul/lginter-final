import { useEffect, useMemo, useRef, useState } from 'react';
import useSocketSBM1 from '@/utils/hooks/useSocketSBM1';
import useResize from '@/utils/hooks/useResize';
import { playSbm1QrTipStart } from '@/utils/data/soundeffect';

// Header stages
export const T1_HEAD_TEXT = 'QR 코드 스캔을 통해\n전시관람을 시작하세요!';
export const T2_HEAD_TEXT = '스캔 후, 모바일을 통해\n오늘의 감정을 이야기해보세요';
export const T3_HEAD_TEXT = '공간 안으로 입장하여\n조율된 공간을 경험하세요.';
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
  const furonPath = DEFAULT_FURON_PATH;
  const [userCount, setUserCount] = useState(0);
  const seenUserIdsRef = useRef(new Set());
  const [flashTick, setFlashTick] = useState(0); // increments to trigger a one-shot flash pulse
  const [stage, setStage] = useState('t1'); // 't1' | 't2' | 't3'
  const t1ToT2TimeoutRef = useRef(null);
  const t3TimeoutRef = useRef(null);

  // Timings (ms)
  const T1_TO_T2_MS = 7000;
  const T3_SHOW_MS = 8000;

  function clearT1ToT2Timer() {
    if (t1ToT2TimeoutRef.current) clearTimeout(t1ToT2TimeoutRef.current);
    t1ToT2TimeoutRef.current = null;
  }

  function clearT3Timer() {
    if (t3TimeoutRef.current) clearTimeout(t3TimeoutRef.current);
    t3TimeoutRef.current = null;
  }

  function startT1() {
    setStage('t1');
    clearT1ToT2Timer();
    t1ToT2TimeoutRef.current = setTimeout(() => {
      setStage('t2');
      t1ToT2TimeoutRef.current = null;
    }, T1_TO_T2_MS);
  }

  function startT3() {
    // When triggered, jump to t3 for 7s, then restart at t1
    setStage('t3');
    setFlashTick((t) => t + 1); // sudden flash at the same time as t3
    clearT3Timer();
    clearT1ToT2Timer();
    t3TimeoutRef.current = setTimeout(() => {
      clearT3Timer();
      startT1();
    }, T3_SHOW_MS);
  }

  // Initial: start t1 -> t2 schedule
  useEffect(() => {
    if (typeof window === 'undefined') return;
    startT1();
    return () => {
      clearT1ToT2Timer();
      clearT3Timer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Flash + t3 sequence
        // Trigger t3 sequence
        startT3();
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
        // Flash + t3 sequence
        // Trigger t3 sequence
        startT3();
      } catch {}
    },
  });


  const styleVars = useMemo(() => ({
    ...vars,
    // Keep visuals stable: no lingering boost filter (avoids "bright after-image" after flash)
    '--sbm-boost-filter': 'none',
    // 블롭 스케일은 항상 1로 고정 (아이들/액티브 동일 크기)
    '--sbm-blob-zoom': 1,
    // Flash is handled as a one-shot pulse overlay; keep persistent glows off.
    '--sbm-bgflash-opacity': 0,
    '--sbm-border-glow-opacity': 0,
  }), [vars, stage]);

  // t3 시작 시 1회 효과음 재생
  useEffect(() => {
    if (stage === 't3') {
      playSbm1QrTipStart();
    }
  }, [stage]);

  // 언마운트 시 타이머 정리로 메모리/불필요한 setState 방지
  useEffect(() => {
    return () => {
      clearT1ToT2Timer();
      clearT3Timer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({
      vars: styleVars,
      qrUrl,
      furonPath,
      userCount,
      stage,          // 't1' | 't2' | 't3'
      flashTick,      // pulse trigger for flash overlay
    }),
    [styleVars, qrUrl, userCount, stage, flashTick]
  );
}


