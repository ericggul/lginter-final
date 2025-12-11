import { useEffect, useRef } from 'react';

export default function useOrchestratingTransitions({ loading, orchestratingLock, setOrchestratingLock, orchestrateMinMs = 5500 }) {
  const startAtRef = useRef(null);

  // when loading (orchestrating) begins, fade blob back in over 2s
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (loading) {
      console.log('[Orchestrating] loading started – fade blob in and lock orchestrating');
      window.blobOpacityMs = 2000;
      window.blobOpacity = 1;
      // 오케스트레이션 텍스트 단계에서는 회전 오빗/파이널 오브가 보이지 않도록 유지
      window.showOrbits = false;
      window.clusterSpin = false;
      window.mainBlobFade = false;
      window.newOrbEnter = false;
      window.showFinalOrb = false;
      window.showCenterGlow = false;
      window.blobScale = 1; window.blobScaleMs = 300;
      window.orbitRadiusScale = 1;
      startAtRef.current = Date.now();
      setOrchestratingLock(true);
    }
  }, [loading, setOrchestratingLock]);

  // orchestrating hold and merge transition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!loading && startAtRef.current && orchestratingLock) {
      const elapsed = Date.now() - startAtRef.current;
      const remaining = Math.max(0, orchestrateMinMs - elapsed);
      const runMerge = () => {
        console.log('[Orchestrating] runMerge called – unlocking orchestrating (no visual change)');
        setOrchestratingLock(false);
      };
      if (remaining > 0) {
        const t = setTimeout(runMerge, remaining);
        return () => clearTimeout(t);
      }
      runMerge();
    }
  }, [loading, orchestratingLock, setOrchestratingLock, orchestrateMinMs]);
}


