import { useEffect, useRef } from 'react';

// Keeps AC/fan power aligned with presence: 0 devices => off, else on.
// Uses the same /api/device-testing endpoint (one param per request).
export default function useDevicePowerSync(deviceCount) {
  const lastStateRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasDevices = Number(deviceCount) > 0;
    if (lastStateRef.current === hasDevices) return;
    lastStateRef.current = hasDevices;
    const power = hasDevices ? 'on' : 'off';

    const sendPower = async (deviceType) => {
      try {
        await fetch('/api/device-testing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceType, payload: { power } }),
          keepalive: true,
        });
      } catch (err) {
        console.warn('[controller] device power sync failed', deviceType, err?.message);
      }
    };

    sendPower('airconditioner');
    sendPower('airpurifierfan');
  }, [deviceCount]);
}


