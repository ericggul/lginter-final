import { useCallback, useEffect, useRef } from "react";

// Centralize MW1 video switching logic
export function useMW1VideoLogic({ isActive, setIsActive, setSrc, setVideoKey, idleSrc, activeSrc, onActivated }) {
  const activeRef = useRef(isActive);
  useEffect(() => { activeRef.current = isActive; }, [isActive]);

  const handleEnded = useCallback(() => {
    if (activeRef.current) {
      setIsActive(false);
      setSrc(idleSrc);
      setVideoKey('idle-' + Date.now());
    }
  }, [setIsActive, setSrc, setVideoKey, idleSrc]);

  const onEntranceNewUser = useCallback(() => {
    setIsActive(true);
    setSrc(activeSrc);
    setVideoKey('active-' + Date.now());
    if (typeof onActivated === 'function') {
      onActivated();
    }
  }, [setIsActive, setSrc, setVideoKey, activeSrc, onActivated]);

  return { handleEnded, onEntranceNewUser };
}
