import { useEffect, useMemo, useRef, useState } from 'react';
import useSocketSBM1 from '@/utils/hooks/useSocketSBM1';

import useResize from '@/utils/hooks/useResize';
const URL = 'https://www.naver.com'

const DEFAULT_TOP_MESSAGE = 'QR코드 스캔을 통해\n전시 관람을 시작하세요!';
const DEFAULT_FURON_PATH = '/image.png';


function getViewportVars(width, height) {
  if (typeof window === 'undefined') return { '--kiss': '12vmin' };
  const qrPx = Math.min(Math.round(width * 0.25), Math.round(height * 0.28));
  return { '--kiss': '12vmin', '--qr-size': `${qrPx}px` };
}

export function useSbm1() {
  const { width, height } = useResize();
  const vars = useMemo(() => getViewportVars(width, height), [width, height]);
  const [qrUrl, setQrUrl] = useState(URL);
  const topMessage = DEFAULT_TOP_MESSAGE;
  const furonPath = DEFAULT_FURON_PATH;
  const [userCount, setUserCount] = useState(0);
  const seenUserIdsRef = useRef(new Set());

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
      } catch {}
    },
  });


  return useMemo(() => ({ vars, qrUrl, topMessage, furonPath, userCount }), [vars, qrUrl, userCount]);
}


