import { useEffect, useState } from 'react';

/**
 * Detects whether the current device is running iOS (including iPadOS and
 * iOS Safari on Apple Silicon with touch).
 *
 * - Runs only on the client (no SSR access to window/navigator).
 * - Returns false by default until the first effect pass completes.
 */
export default function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const ua = navigator.userAgent || '';

    // iPhone / iPad / iPod
    const iOSDevice = /iPhone|iPad|iPod/.test(ua);

    // iPadOS on Mac-like UA with touch (Safari on Apple Silicon with touch)
    const iPadOnMacLikeUA = ua.includes('Mac') && 'ontouchend' in window;

    setIsIOS(Boolean(iOSDevice || iPadOnMacLikeUA));
  }, []);

  return isIOS;
}


