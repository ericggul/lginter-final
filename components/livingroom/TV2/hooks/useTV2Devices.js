import { useEffect, useRef } from 'react';

/**
 * Lightweight device orchestrator for TV2.
 * - Mirrors environment targets to upstream device-testing API.
 * - Respects "one parameter per request" contract of /api/device-testing.
 * - Fire-and-forget; de-dupes identical payloads to avoid spamming.
 */
const TARGET_TEMP = 21; // °C
const TEMP_DEADBAND = 0.3;

const TARGET_HUMIDITY = 55; // %
const HUM_DEADBAND = 3;

const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i;

const toNumberOrNull = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
};

function postDeviceCommand(deviceType, payload) {
  console.log('[TV2][devices] sending', deviceType, payload);
  try {
    fetch('/api/device-testing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceType, payload }),
      keepalive: true,
    }).then((res) => {
      if (!res.ok) {
        console.warn('[TV2][devices] command failed', deviceType, payload, res.status);
      } else {
        console.log('[TV2][devices] command ok', deviceType, payload, res.status);
      }
    }).catch((err) => {
      console.warn('[TV2][devices] command error', deviceType, payload, err?.message);
    });
  } catch (err) {
    console.warn('[TV2][devices] command threw', deviceType, payload, err?.message);
  }
}

function postHueCommand(body) {
  try {
    return fetch('/api/lighttest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      keepalive: true,
    }).then(async (res) => {
      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }
      if (!res.ok || data?.ok === false) {
        console.warn('[TV2][hue] /api/lighttest failed', res.status, body, data);
      } else {
        console.log('[TV2][hue] /api/lighttest ok', res.status, body?.action, data);
      }
      return data;
    });
  } catch (err) {
    console.warn('[TV2][hue] /api/lighttest threw', err?.message);
    return Promise.resolve(null);
  }
}

function normalizeHexStops(stops) {
  const out = [];
  const seen = new Set();
  (stops || []).forEach((h) => {
    const s = String(h || '').trim().toUpperCase();
    if (!HEX_COLOR_RE.test(s)) return;
    if (seen.has(s)) return;
    seen.add(s);
    out.push(s);
  });
  return out;
}

export function useTV2Devices(env, options = {}) {
  const lastHueSyncedColorRef = useRef('');
  const lastHueSyncedAtRef = useRef(0);
  const lastHueGradientKeyRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('[TV2][devices] window undefined (SSR), skip');
      return;
    }

    console.log('[TV2][devices] hook run', {
      temp: env?.temp,
      humidity: env?.humidity,
      lightColor: env?.lightColor,
      decisionToken: options?.decisionToken,
    });

    const temp = toNumberOrNull(env?.temp);
    const humidity = toNumberOrNull(env?.humidity);
    const hexColor = (env?.lightColor || '').toUpperCase();
    const hueGradientStops = normalizeHexStops(options?.hueGradientStops);
    const hueGradientKey = hueGradientStops.join('|');

    // --- Air conditioner (temperature control) ---
    // Always drive to ON + mode + env temp (one param per request).
    if (temp != null) {
      const targetTemp = temp; // use incoming env temp directly
      const targetMode = temp > 24 ? 'HEAT' : 'COOL'; // 24°C threshold
      // ensure power on before setting mode/temp

      postDeviceCommand('airconditioner', { temperature: targetTemp });

      postDeviceCommand('airconditioner', { mode: targetMode });

    }

    // --- Air purifier fan (humidity proxy control) ---
    // Always turn on + AUTO when humidity exists (one param per request).
    if (humidity != null) {
      // ensure power on before mode
     
      postDeviceCommand('airpurifierfan', { mode: 'AUTO' });
    }
    // --- Hue sync (lighting) ---
    // Drive physical Hue lights from the TV2 top-panel gradient (stops).
    // Debounce to avoid spamming if TV2 re-renders rapidly.
    const now = Date.now();
    const tooSoon = now - (lastHueSyncedAtRef.current || 0) < 700;

    // Prefer sending gradient stops when available (continuous hybrid mode).
    // Fall back to single color when stops are missing.
    if (hueGradientStops.length >= 3) {
      const changed = hueGradientKey && hueGradientKey !== lastHueGradientKeyRef.current;
      const tokenBump = options?.decisionToken && options?.decisionToken !== 0;
      if ((changed || tokenBump) && !tooSoon) {
        lastHueGradientKeyRef.current = hueGradientKey;
        lastHueSyncedAtRef.current = now;
        postHueCommand({
          action: 'gradient',
          source: 'tv2',
          mode: 'hybrid',
          continuous: true,
          // Use top-panel gradient colors
          stops: hueGradientStops,
          // Optional tuning knobs (server has defaults)
          tickMs: 2000,
          waveMinDelayMs: 60,
          waveMaxDelayMs: 240,
          // Visibility knobs (server has defaults)
          blinkEnabled: true,
        }).catch(() => {});
      }
      return;
    }

    if (HEX_COLOR_RE.test(hexColor) && hexColor !== lastHueSyncedColorRef.current && !tooSoon) {
      lastHueSyncedColorRef.current = hexColor;
      lastHueSyncedAtRef.current = now;
      postHueCommand({ action: 'color', color: hexColor, source: 'tv2' }).catch(() => {});
    }

  }, [env?.temp, env?.humidity, env?.lightColor, options?.decisionToken, options?.hueGradientStops]);
}


