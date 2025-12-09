import { useEffect, useMemo, useRef, useState } from 'react';
import useSocketSBM1 from '@/utils/hooks/useSocketSBM1';

import useResize from '@/utils/hooks/useResize';

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
  const [blobZoom, setBlobZoom] = useState(1);

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
        // 순간 채도/대비 부스트
        setBoost(true);
        setTimeout(() => setBoost(false), 2000);
        // 연핑크 배경 플래시 (서서히 들어왔다 나감)
        setFlash(true);
        setTimeout(() => setFlash(false), 2000);
        // 블롭들 잠깐 작아졌다 다시 커지는 펄스
        setBlobZoom(0.55);
        setTimeout(() => setBlobZoom(1), 750);
        // Tip 문구 7초 표시 (애니메이션 길이와 정확히 맞춤)
        setTopMessage(TIP_TEXT);
        setTip(true);
        setTimeout(() => { setTip(false); setTopMessage(DEFAULT_TOP_MESSAGE); }, 7000);
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
        // 이름 들어와도 동일하게 부스트
        setBoost(true);
        setTimeout(() => setBoost(false), 2000);
        // 연핑크 배경 플래시
        setFlash(true);
        setTimeout(() => setFlash(false), 2000);
        // 블롭들 잠깐 작아졌다 다시 커지는 펄스
        setBlobZoom(0.55);
        setTimeout(() => setBlobZoom(1), 750);
        // Tip 문구 7초 표시 (애니메이션 길이와 정확히 맞춤)
        setTopMessage(TIP_TEXT);
        setTip(true);
        setTimeout(() => { setTip(false); setTopMessage(DEFAULT_TOP_MESSAGE); }, 7000);
      } catch {}
    },
  });


  const styleVars = useMemo(() => ({
    ...vars,
    '--sbm-boost-filter': boost ? 'saturate(1.22) contrast(1.12) brightness(1.04)' : 'none',
    // Idle: 1.0, Active 이벤트 시 잠시 0.55까지 줄어들었다 다시 1로 복귀
    '--sbm-blob-zoom': blobZoom,
    '--sbm-bgflash-opacity': flash ? 1 : 0,
    '--sbm-border-glow-opacity': tip ? 1 : 0,
  }), [vars, boost, flash, tip, blobZoom]);

  return useMemo(() => ({ vars: styleVars, qrUrl, topMessage, furonPath, userCount, tip }), [styleVars, qrUrl, topMessage, userCount, tip]);
}


