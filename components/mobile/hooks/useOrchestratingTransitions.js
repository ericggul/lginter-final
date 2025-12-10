import { useEffect, useRef } from 'react';
import { playMobileOrchestratingStart } from '@/utils/data/soundeffect';

export default function useOrchestratingTransitions({ loading, orchestratingLock, setOrchestratingLock, orchestrateMinMs = 5500 }) {
  const startAtRef = useRef(null);

  // when loading (orchestrating) begins, fade blob back in over 2s
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (loading) {
      console.log('[Orchestrating] loading started – fade blob in and lock orchestrating');
      // Mobile ORCHESTRATING 텍스트 시퀀스가 시작되는 시점에 효과음 1회 재생
      playMobileOrchestratingStart();
      window.blobOpacityMs = 2000;
      window.blobOpacity = 1;
      window.showOrbits = true;
      window.blobScale = 1; window.blobScaleMs = 300;
      window.clusterSpin = false;
      window.mainBlobFade = false;
      window.newOrbEnter = false;
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
        console.log('[Orchestrating] runMerge called – triggering final blob merge');
        window.blobOpacityMs = 900;
        window.mainBlobFade = true;
        window.newOrbEnter = true;
        window.clusterSpin = true;
        setTimeout(() => {
          console.log('[Orchestrating] merge animation complete – unlocking orchestrating');
          setOrchestratingLock(false);
        }, 1000);
      };
      if (remaining > 0) {
        const t = setTimeout(runMerge, remaining);
        return () => clearTimeout(t);
      }
      runMerge();
    }
  }, [loading, orchestratingLock, setOrchestratingLock, orchestrateMinMs]);
}


