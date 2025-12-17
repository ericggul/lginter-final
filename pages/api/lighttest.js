import {
  initHue,
  getHueStateAverageHex,
  listLights,
  setLightBrightness,
  setLightColor,
  setLightOnOff,
} from "../../lib/hue/hueClient";

// --- TV2 continuous hybrid gradient loop (process-local singleton) ---
// This relies on a long-lived Node process (e.g. Render `next start` or a LAN controller).
// It will reset on redeploy/restart and should be re-armed by TV2 on the next decision.
let tv2GradientLoop = {
  active: false,
  runningTick: false,
  gen: 0,
  timer: null,
  config: null,
};

let tv2PulseLoop = {
  active: false,
  runningTick: false,
  gen: 0,
  timer: null,
  config: null,
};

// NOTE: Hardcoding secrets in source code is risky.
// Prefer `.env.local` in the project root.
// (Fallbacks intentionally left empty to avoid secrets in source.)
const HUE_ENABLED_FALLBACK = undefined; // true/false
const HUE_BRIDGE_IP_FALLBACK = ""; // e.g. "192.168.x.x"
const HUE_USERNAME_FALLBACK = "";

function resolveHueConfig() {
  const enabledRaw =
    process.env.HUE_ENABLED != null && process.env.HUE_ENABLED !== ""
      ? process.env.HUE_ENABLED
      : HUE_ENABLED_FALLBACK;
  const enabled = String(enabledRaw || "").toLowerCase() === "true";

  const ip = process.env.HUE_BRIDGE_IP || HUE_BRIDGE_IP_FALLBACK;
  const username = process.env.HUE_USERNAME || HUE_USERNAME_FALLBACK;
  const bridgeId = process.env.HUE_BRIDGE_ID || process.env.HUE_REMOTE_BRIDGE_ID || "";

  const groupId =
    process.env.HUE_GROUP_ID != null && process.env.HUE_GROUP_ID !== ""
      ? Number(process.env.HUE_GROUP_ID)
      : undefined;
  // Support both:
  // - HUE_LIGHT_IDS=1,2,3 (preferred)
  // - HUE_LIGHT_ID=1 (legacy / common typo)
  // Note: Hue light IDs are typically 1-based. "0" is not a valid light id.
  const rawLightIds = process.env.HUE_LIGHT_IDS || process.env.HUE_LIGHT_ID || "";
  const lightIds = String(rawLightIds)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 1);

  // Remote config uses user-provided env keys.
  const remoteClientId = process.env.HUE_CLIENT_ID || "";
  const remoteClientSecret = process.env.HUE_CLIENT_SECRET || "";
  const remoteRefreshToken = process.env.HUE_REFRESH_TOKEN || "";
  const remoteAccessToken = process.env.HUE_ACCESS_TOKEN || "";
  const remoteEnabled =
    String(process.env.HUE_REMOTE_ENABLED || "").toLowerCase() === "true" ||
    (String(process.env.RENDER || "").toLowerCase() === "true" && !!remoteRefreshToken);

  return {
    enabled,
    ip,
    username,
    bridgeId,
    groupId,
    lightIds,
    remoteEnabled,
    remoteClientId,
    remoteClientSecret,
    remoteRefreshToken,
    remoteAccessToken,
  };
}

function normalizeBrightness(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(254, Math.max(1, Math.round(n)));
}

function normalizeBaseUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function safeUrlHost(url) {
  try {
    return new URL(url).host || "";
  } catch {
    return "";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffleInPlace(arr) {
  // Fisher–Yates
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function toUniqueNumericLightIds(ids) {
  const out = [];
  const seen = new Set();
  for (const v of ids || []) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function clamp01(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function clampInt(n, min, max) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const to2 = (n) => clampInt(n, 0, 255).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
}

function mixRgb(a, b, t) {
  const tt = clamp01(t);
  return {
    r: Math.round(a.r + (b.r - a.r) * tt),
    g: Math.round(a.g + (b.g - a.g) * tt),
    b: Math.round(a.b + (b.b - a.b) * tt),
  };
}

function rgbToHsl({ r, g, b }) {
  const rr = clamp01((Number(r) || 0) / 255);
  const gg = clamp01((Number(g) || 0) / 255);
  const bb = clamp01((Number(b) || 0) / 255);
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  const hh = ((Number(h) % 360) + 360) % 360;
  const ss = clamp01(s);
  const ll = clamp01(l);
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (hh < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (hh < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (hh < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (hh < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (hh < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return {
    r: Math.round(clamp01(r1 + m) * 255),
    g: Math.round(clamp01(g1 + m) * 255),
    b: Math.round(clamp01(b1 + m) * 255),
  };
}

function normalizeHueDegrees(h) {
  const hh = Number(h);
  if (!Number.isFinite(hh)) return 0;
  return ((hh % 360) + 360) % 360;
}

function clampHueDelta(from, to, maxDelta) {
  const a = normalizeHueDegrees(from);
  const b = normalizeHueDegrees(to);
  let d = b - a;
  // shortest path
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  const md = Math.max(0, Math.min(Number(maxDelta) || 0, 180));
  const dd = Math.max(-md, Math.min(md, d));
  return normalizeHueDegrees(a + dd);
}

function computeWarmAnalogHex(baseHex) {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return "";
  const hsl = rgbToHsl(rgb);

  // "Warm-ish but not complementary":
  // - For greens (≈80..160): shift toward yellow (≈60) but cap shift.
  // - For other hues: gently pull toward warm amber range (≈50) with small cap.
  const warmTarget = 55;
  const maxShift = (hsl.h >= 80 && hsl.h <= 160) ? 35 : 25;
  const warmHue = clampHueDelta(hsl.h, warmTarget, maxShift);

  // Keep it pleasant and LED-visible: slightly higher saturation + a bit brighter.
  const s = Math.min(1, Math.max(0.18, hsl.s * 1.1));
  const l = Math.min(0.82, Math.max(0.45, hsl.l + 0.12));
  return rgbToHex(hslToRgb({ h: warmHue, s, l }));
}

function enhanceStopsForVisibility(stops) {
  const list = (stops || []).map((s) => String(s || "").trim().toUpperCase()).filter(Boolean);
  const out = [];
  const seen = new Set();
  const push = (hex) => {
    const h = String(hex || "").trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(h)) return;
    if (seen.has(h)) return;
    seen.add(h);
    out.push(h);
  };

  list.forEach((hex) => {
    push(hex);
    // Insert a warm-analog accent near the base colors (but not for pure white/black).
    if (hex !== "#FFFFFF" && hex !== "#000000") {
      const warm = computeWarmAnalogHex(hex);
      push(warm);
    }
  });

  // If the palette is still too small, add a warm white to help create a visible gradient.
  if (out.length < 3) {
    push("#FFE6B3"); // warm white / amber-ish
    push("#FFFFFF");
  }

  return out;
}

function computeSpreadBaseHex(stopsHex, t) {
  const stops = (stopsHex || []).map(hexToRgb).filter(Boolean);
  if (!stops.length) return "";
  if (stops.length === 1) return rgbToHex(stops[0]);

  const segCount = stops.length - 1;
  const pos = clamp01(t) * segCount;
  const seg = Math.min(segCount - 1, Math.floor(pos));
  const local = pos - seg;
  return rgbToHex(mixRgb(stops[seg], stops[seg + 1], local));
}

function makeWeakCyclePalette(baseHex, strength = 0.08) {
  const base = hexToRgb(baseHex);
  if (!base) return [String(baseHex || "").toUpperCase()].filter(Boolean);

  // LED-friendly: cycling only via brightness is often hard to notice.
  // Add a small warm-analog hue nudge plus light/dark so the motion is visible but not complementary.
  const hsl = rgbToHsl(base);
  const s = clamp01(strength);
  const warmHue = clampHueDelta(hsl.h, 55, 22);
  const coolHue = clampHueDelta(hsl.h, 210, 18);

  const baseS = Math.min(1, Math.max(0.2, hsl.s));
  const baseL = Math.min(0.8, Math.max(0.42, hsl.l));
  const warm = rgbToHex(hslToRgb({ h: warmHue, s: Math.min(1, baseS + 0.08), l: Math.min(0.82, baseL + 0.10 * s) }));
  const cool = rgbToHex(hslToRgb({ h: coolHue, s: Math.min(1, baseS + 0.05), l: Math.max(0.38, baseL - 0.06 * s) }));
  const mid = rgbToHex(hslToRgb({ h: hsl.h, s: baseS, l: baseL }));

  return [cool, mid, warm];
}

async function resolveLightIdsSorted({ configOverride }) {
  const configured = toUniqueNumericLightIds(configOverride?.lightIds);
  let discovered = [];
  try {
    const listed = await listLights({ configOverride });
    if (listed?.ok && Array.isArray(listed?.lights)) {
      discovered = toUniqueNumericLightIds(listed.lights.map((l) => l?.id));
    }
  } catch {}

  // Use union so we can still control all lights even if HUE_LIGHT_IDS is incomplete.
  const all = toUniqueNumericLightIds([...(configured || []), ...(discovered || [])]);
  all.sort((a, b) => a - b);
  return all;
}

function stopTv2GradientLoop() {
  tv2GradientLoop.gen += 1;
  tv2GradientLoop.active = false;
  tv2GradientLoop.config = null;
  tv2GradientLoop.runningTick = false;
  if (tv2GradientLoop.timer) {
    clearInterval(tv2GradientLoop.timer);
    tv2GradientLoop.timer = null;
  }
}

function stopTv2PulseLoop() {
  tv2PulseLoop.gen += 1;
  tv2PulseLoop.active = false;
  tv2PulseLoop.config = null;
  tv2PulseLoop.runningTick = false;
  if (tv2PulseLoop.timer) {
    clearInterval(tv2PulseLoop.timer);
    tv2PulseLoop.timer = null;
  }
}

function brightnessPctToHueBri(pct, maxPct = 100) {
  const p = clampInt(pct, 0, clampInt(maxPct, 0, 100));
  if (p <= 0) return 0;
  return clampInt(Math.round((p / 100) * 254), 1, 254);
}

function pickSparklyBrightnessPct({ minPct = 1, maxPct = 100 } = {}) {
  const minP = clampInt(minPct, 0, 100);
  const maxP = clampInt(maxPct, minP, 100);
  if (maxP <= 0) return 0;

  // Keep ALL bulbs on (no "0/off") but still very sparkly:
  // - low twinkle band near min
  // - high flash band near max
  // - occasional mid values
  const r = Math.random();
  const lowHi = Math.min(maxP, minP + 3);
  const highLo = Math.max(minP, maxP - 3);

  if (r < 0.45) {
    return clampInt(minP + Math.floor(Math.random() * (lowHi - minP + 1)), minP, maxP);
  }
  if (r < 0.90) {
    return clampInt(highLo + Math.floor(Math.random() * (maxP - highLo + 1)), minP, maxP);
  }
  return clampInt(minP + Math.floor(Math.random() * (maxP - minP + 1)), minP, maxP);
}

async function tv2PulseTick(genAtStart) {
  if (!tv2PulseLoop.active) return;
  if (genAtStart !== tv2PulseLoop.gen) return;
  if (tv2PulseLoop.runningTick) return;

  const cfg = tv2PulseLoop.config;
  if (!cfg) return;

  tv2PulseLoop.runningTick = true;
  try {
    const now = Date.now();
    // Backoff window after 429s (Hue Remote rate limiting)
    if (cfg.backoffUntil && now < cfg.backoffUntil) return;

    const ids = cfg.lightIds || [];
    if (!ids.length) return;

    const waveMin = clampInt(cfg.waveMinDelayMs || 40, 0, 2000);
    const waveMax = clampInt(cfg.waveMaxDelayMs || 220, waveMin, 5000);
    // Default: baseline 30%, sparkle up to 100% (no OFF)
    const maxBrightnessPct = clampInt(cfg.maxBrightnessPct != null ? cfg.maxBrightnessPct : 100, 0, 100);
    const minBrightnessPct = clampInt(cfg.minBrightnessPct != null ? cfg.minBrightnessPct : 30, 0, maxBrightnessPct);

    // Hue Remote API is heavily rate-limited. In remote mode, update only a few bulbs per tick.
    const isRemote = !!cfg.remoteEnabled;
    const perTick = isRemote ? clampInt(cfg.remotePerTickCount || 2, 1, 6) : ids.length;

    // Pick a random brightness per bulb, 0..100.
    const plan = ids.map((id) => ({
      id,
      pct: pickSparklyBrightnessPct({ minPct: minBrightnessPct, maxPct: maxBrightnessPct }),
    }));

    const order = shuffleInPlace([...plan]);

    const targetsNow = order.slice(0, perTick);

    if (!isRemote) {
      // Local/proxy mode: parallel updates are OK and look sparkly.
      await Promise.all(
        targetsNow.map(async ({ id, pct }) => {
          if (!tv2PulseLoop.active) return;
          if (genAtStart !== tv2PulseLoop.gen) return;

          const jitter = Math.floor(waveMin + Math.random() * (waveMax - waveMin + 1));
          await sleep(jitter);
          if (!tv2PulseLoop.active) return;
          if (genAtStart !== tv2PulseLoop.gen) return;

          const bri = brightnessPctToHueBri(pct, maxBrightnessPct);
          await setLightBrightness(bri, {
            configOverride: cfg.configOverride,
            targets: { lightIds: [id], groupId: undefined },
          });
        })
      );
    } else {
      // Hue Remote mode: sequential + extra spacing to avoid 429.
      const extraSpacingMs = clampInt(cfg.remoteInterRequestMs || 250, 50, 2000);
      for (let i = 0; i < targetsNow.length; i += 1) {
        if (!tv2PulseLoop.active) break;
        if (genAtStart !== tv2PulseLoop.gen) break;

        const { id, pct } = targetsNow[i];
        const jitter = Math.floor(waveMin + Math.random() * (waveMax - waveMin + 1));
        // eslint-disable-next-line no-await-in-loop
        await sleep(jitter + (i === 0 ? 0 : extraSpacingMs));

        const bri = brightnessPctToHueBri(pct, maxBrightnessPct);
        // eslint-disable-next-line no-await-in-loop
        const r = await setLightBrightness(bri, {
          configOverride: cfg.configOverride,
          targets: { lightIds: [id], groupId: undefined },
        });
        if (!r?.ok && String(r?.error || "").includes("(429)")) {
          // Back off hard when we hit rate limit.
          cfg.backoffUntil = Date.now() + clampInt(cfg.remoteBackoffMs || 15_000, 1000, 120_000);
          break;
        }
      }
    }
  } catch (err) {
    console.warn("[lighttest][tv2-pulse] tick failed", err?.message || String(err));
  } finally {
    tv2PulseLoop.runningTick = false;
  }
}

async function startTv2PulseLoop({
  configOverride,
  color,
  tickMs,
  waveMinDelayMs,
  waveMaxDelayMs,
  maxBrightnessPct,
  minBrightnessPct,
}) {
  // Pulse mode replaces any previous loop(s) to avoid fighting.
  stopTv2GradientLoop();
  stopTv2PulseLoop();

  const ids = await resolveLightIdsSorted({ configOverride });
  if (!ids.length) return { ok: false, error: "No Hue lights found to control" };

  const c = String(color || "").trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(c)) {
    return { ok: false, error: "Invalid color hex. Expected '#RRGGBB'." };
  }

  // Default: baseline 30%, sparkle up to 100% (no OFF)
  const maxP = maxBrightnessPct != null ? clampInt(maxBrightnessPct, 0, 100) : 100;
  const minP = minBrightnessPct != null ? clampInt(minBrightnessPct, 0, maxP) : 30;
  const baseBri = brightnessPctToHueBri(Math.max(minP, maxP), maxP);

  // Set base color once across all bulbs (in a wave so it's obvious), and ensure a visible baseline brightness.
  // This avoids re-sending color on every brightness tick.
  const applyErrors = [];
  let appliedCount = 0;
  try {
    const order = shuffleInPlace(ids.map((id) => id));
    const isRemote = !!configOverride?.remoteEnabled;
    const spacingMs = isRemote ? 300 : 0;
    for (let i = 0; i < order.length; i += 1) {
      const id = order[i];
      const jitter = Math.floor(0 + Math.random() * 120);
      // eslint-disable-next-line no-await-in-loop
      await sleep(jitter + (i === 0 ? 0 : spacingMs));
      // eslint-disable-next-line no-await-in-loop
      const r = await setLightColor({
        color: c,
        brightness: baseBri,
        configOverride,
        targets: { lightIds: [id], groupId: undefined },
      });
      if (r?.ok) {
        appliedCount += 1;
      } else {
        applyErrors.push({
          id,
          error: r?.error || "Hue color apply failed",
          status: r?.status,
          details: r?.details,
          raw: r?.raw,
        });
        if (String(r?.error || "").includes("(429)")) break;
      }
    }
  } catch (err) {
    console.warn("[lighttest][tv2-pulse] initial color apply failed", err?.message || String(err));
    applyErrors.push({ id: null, error: err?.message || String(err), details: err?.details });
  }

  // If we couldn't set the base color on ANY bulb, don't start a loop that only changes brightness.
  if (appliedCount === 0) {
    return {
      ok: false,
      error:
        "Failed to apply base Hue color. Hue may be disabled, unreachable, or blocked by proxy/auth config.",
      details: { attempted: ids.length, applied: appliedCount, errors: applyErrors.slice(0, 10) },
    };
  }

  const tick = clampInt(tickMs || 350, 150, 10_000);
  const gen = tv2PulseLoop.gen + 1;
  tv2PulseLoop = {
    active: true,
    runningTick: false,
    gen,
    timer: null,
    config: {
      configOverride,
      lightIds: ids,
      color: c,
      tickMs: tick,
      waveMinDelayMs: waveMinDelayMs != null ? clampInt(waveMinDelayMs, 0, 5000) : 0,
      waveMaxDelayMs: waveMaxDelayMs != null ? clampInt(waveMaxDelayMs, 0, 8000) : 120,
      // Cap overall output brightness (percent 0..100)
      maxBrightnessPct: maxP,
      // Keep bulbs ON: never go below this percent.
      minBrightnessPct: minP,
      // Remote-specific throttling
      remoteEnabled: !!configOverride?.remoteEnabled,
      remotePerTickCount: 2,
      remoteInterRequestMs: 250,
      remoteBackoffMs: 15_000,
      backoffUntil: 0,
    },
  };

  void tv2PulseTick(gen);
  tv2PulseLoop.timer = setInterval(() => {
    void tv2PulseTick(gen);
  }, tick);

  return {
    ok: true,
    active: true,
    mode: "tv2-pulse",
    count: ids.length,
    tickMs: tick,
    baseColorApplied: { attempted: ids.length, applied: appliedCount, failed: applyErrors.length },
    ...(applyErrors.length ? { baseColorApplyErrors: applyErrors.slice(0, 10) } : {}),
  };
}

async function tv2GradientTick(genAtStart) {
  if (!tv2GradientLoop.active) return;
  if (genAtStart !== tv2GradientLoop.gen) return;
  if (tv2GradientLoop.runningTick) return;

  const cfg = tv2GradientLoop.config;
  if (!cfg) return;

  tv2GradientLoop.runningTick = true;
  try {
    const ids = cfg.lightIds || [];
    if (!ids.length) return;

    const now = Date.now();
    const periodMs = clampInt(cfg.periodMs || 6000, 1500, 60_000);
    const waveMin = clampInt(cfg.waveMinDelayMs || 60, 0, 2000);
    const waveMax = clampInt(cfg.waveMaxDelayMs || 240, waveMin, 5000);
    const cycleStrength = Number(cfg.cycleStrength != null ? cfg.cycleStrength : 0.08);
    const blinkEnabled = cfg.blinkEnabled !== false; // default true
    const blinkProbability = clamp01(cfg.blinkProbability != null ? cfg.blinkProbability : 0.35);
    const blinkOffMs = clampInt(cfg.blinkOffMs != null ? cfg.blinkOffMs : 140, 40, 800);
    const blinkMinIntervalMs = clampInt(cfg.blinkMinIntervalMs != null ? cfg.blinkMinIntervalMs : 3000, 500, 30_000);
    cfg._lastBlinkAtById = cfg._lastBlinkAtById || {};

    // Precompute per-bulb target color (spread + weak cycle).
    const perBulb = ids.map((id, idx) => {
      const t = ids.length <= 1 ? 0 : idx / (ids.length - 1);
      const baseHex = computeSpreadBaseHex(cfg.stops, t) || (cfg.stops?.[0] || "#FFFFFF");
      const palette = makeWeakCyclePalette(baseHex, cycleStrength);

      // Offset per segment and per bulb for gentle desync.
      const pos = t * Math.max(1, (cfg.stops?.length || 2) - 1);
      const seg = Math.max(0, Math.min((cfg.stops?.length || 2) - 2, Math.floor(pos)));
      const offsetMs = (idx * 333 + seg * 777) % periodMs;
      const step = Math.floor((now + offsetMs) / periodMs) % palette.length;
      return { id, hex: palette[step] || baseHex };
    });

    const order = shuffleInPlace([...perBulb]);
    for (let i = 0; i < order.length; i += 1) {
      if (!tv2GradientLoop.active) break;
      if (genAtStart !== tv2GradientLoop.gen) break;

      const { id, hex } = order[i];
      const jitter = Math.floor(waveMin + Math.random() * (waveMax - waveMin + 1));
      // eslint-disable-next-line no-await-in-loop
      await sleep(jitter);

      // Optional blink to make the change visible on LED bulbs.
      // Keep it gentle: only some bulbs, short off, and rate-limited per bulb.
      if (blinkEnabled && Math.random() < blinkProbability) {
        const lastBlinkAt = Number(cfg._lastBlinkAtById[id] || 0);
        if (!lastBlinkAt || now - lastBlinkAt >= blinkMinIntervalMs) {
          cfg._lastBlinkAtById[id] = now;
          // eslint-disable-next-line no-await-in-loop
          await setLightOnOff(false, { configOverride: cfg.configOverride, targets: { lightIds: [id], groupId: undefined } });
          // eslint-disable-next-line no-await-in-loop
          await sleep(blinkOffMs);
        }
      }
      // eslint-disable-next-line no-await-in-loop
      await setLightColor({
        color: hex,
        brightness: cfg.brightness,
        configOverride: cfg.configOverride,
        targets: { lightIds: [id], groupId: undefined },
      });
    }
  } catch (err) {
    console.warn("[lighttest][tv2-gradient] tick failed", err?.message || String(err));
  } finally {
    tv2GradientLoop.runningTick = false;
  }
}

async function startTv2GradientLoop({
  configOverride,
  stops,
  tickMs,
  periodMs,
  brightness,
  waveMinDelayMs,
  waveMaxDelayMs,
  cycleStrength,
  blinkEnabled,
  blinkProbability,
  blinkOffMs,
  blinkMinIntervalMs,
}) {
  stopTv2GradientLoop();

  const ids = await resolveLightIdsSorted({ configOverride });
  if (!ids.length) {
    return { ok: false, error: "No Hue lights found to control" };
  }

  const cleanStops = (stops || [])
    .map((s) => String(s || "").trim().toUpperCase())
    .filter((s) => /^#[0-9A-F]{6}$/.test(s));

  if (cleanStops.length < 2) {
    return { ok: false, error: "At least 2 valid hex stops are required" };
  }

  const enhancedStops = enhanceStopsForVisibility(cleanStops);

  const tick = clampInt(tickMs || 2000, 500, 30_000);
  const gen = tv2GradientLoop.gen + 1;

  tv2GradientLoop = {
    active: true,
    runningTick: false,
    gen,
    timer: null,
    config: {
      configOverride,
      lightIds: ids,
      stops: enhancedStops,
      tickMs: tick,
      periodMs: periodMs != null ? clampInt(periodMs, tick, 120_000) : Math.max(6000, tick * 3),
      brightness: brightness != null ? clampInt(brightness, 1, 254) : undefined,
      waveMinDelayMs: waveMinDelayMs != null ? clampInt(waveMinDelayMs, 0, 5000) : 60,
      waveMaxDelayMs: waveMaxDelayMs != null ? clampInt(waveMaxDelayMs, 0, 8000) : 240,
      // Slightly stronger by default so changes are actually visible on LED strips/bulbs.
      cycleStrength: cycleStrength != null ? Number(cycleStrength) : 0.18,
      // Blink settings (TV2-only, for visibility)
      blinkEnabled: blinkEnabled != null ? Boolean(blinkEnabled) : true,
      blinkProbability: blinkProbability != null ? Number(blinkProbability) : 0.35,
      blinkOffMs: blinkOffMs != null ? Number(blinkOffMs) : 140,
      blinkMinIntervalMs: blinkMinIntervalMs != null ? Number(blinkMinIntervalMs) : 3000,
    },
  };

  // Run immediately, then on interval.
  void tv2GradientTick(gen);
  tv2GradientLoop.timer = setInterval(() => {
    void tv2GradientTick(gen);
  }, tick);

  return { ok: true, active: true, count: ids.length, tickMs: tick };
}

export default async function handler(req, res) {
  // Allow Render → notebook proxying without exposing the token to the browser:
  // - Render sets HUE_CONTROL_PROXY_URL=https://<your-tunnel-domain>
  // - Render sets HUE_CONTROL_PROXY_TOKEN=<shared-secret>
  // - Notebook sets HUE_CONTROL_TOKEN=<same-secret> and does NOT set proxy URL.
  const proxyBaseUrl = normalizeBaseUrl(process.env.HUE_CONTROL_PROXY_URL);
  const proxyToken = process.env.HUE_CONTROL_PROXY_TOKEN || "";
  const hopHeader = "x-hue-proxy-hop";

  // If configured, proxy *server-to-server* to notebook controller.
  // Prevent infinite loops using a hop header.
  if (proxyBaseUrl && !req.headers?.[hopHeader]) {
    // Guard against accidental self-proxying (common misconfig on Render)
    const proxyHost = safeUrlHost(proxyBaseUrl);
    const requestHost = String(req.headers?.host || "").trim();
    if (proxyHost && requestHost && proxyHost.toLowerCase() === requestHost.toLowerCase()) {
      return res.status(500).json({
        ok: false,
        error:
          "HUE_CONTROL_PROXY_URL points to the same host as this request (self-proxy loop). " +
          "Set HUE_CONTROL_PROXY_URL to a tunnel/controller host that can reach your Hue Bridge.",
      });
    }
    try {
      const url = `${proxyBaseUrl}/api/lighttest`;
      const upstream = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(proxyToken ? { "x-hue-control-token": proxyToken } : {}),
          [hopHeader]: "1",
        },
        body: JSON.stringify(req.body || {}),
      });
      const data = await upstream.json().catch(() => null);
      const payload = data || { ok: false, error: "Upstream returned non-JSON response" };
      // If upstream rejects, add a hint so debugging is obvious.
      if (upstream.status === 401 && payload?.error === "Unauthorized") {
        return res.status(401).json({
          ...payload,
          hint:
            "Upstream (proxy target) returned Unauthorized. Check HUE_CONTROL_PROXY_TOKEN on Render and HUE_CONTROL_TOKEN/REQUIRE_TOKEN on the controller.",
        });
      }
      return res.status(upstream.status).json(payload);
    } catch (err) {
      return res.status(502).json({
        ok: false,
        error: `Hue proxy failed: ${err?.message || String(err)}`,
      });
    }
  }

  const configOverride = resolveHueConfig();
  // Optional auth for direct control.
  // NOTE: This breaks the public /lighttest UI unless the client also sends the header.
  // Make it opt-in via HUE_CONTROL_REQUIRE_TOKEN=true.
  const requireToken = String(process.env.HUE_CONTROL_REQUIRE_TOKEN || "").toLowerCase() === "true";
  const requiredToken = process.env.HUE_CONTROL_TOKEN || "";
  if (requireToken && requiredToken) {
    const incomingToken = req.headers?.["x-hue-control-token"];
    if (incomingToken !== requiredToken) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized",
        hint:
          "This API route requires x-hue-control-token. Either set HUE_CONTROL_REQUIRE_TOKEN=false (recommended for /lighttest UI), or add the header from the client.",
      });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { action, color, brightness } = req.body || {};
  try {
    // Always initialize using resolved config (env OR fallback).
    // This bypasses relying on process.env inside hueClient.
    const initResult = await initHue(configOverride);
    if (!initResult.ok) {
      // Keep the previous API contract: 200 with { disabled: true } when not enabled.
      if (initResult.disabled) {
        return res.status(200).json({ ok: false, disabled: true, error: initResult.message });
      }
      return res.status(500).json({ ok: false, error: initResult.message || "Hue init failed" });
    }

    let result;
    switch (action) {
      case "debug": {
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        const loop = {
          active: !!tv2GradientLoop.active,
          gen: tv2GradientLoop.gen,
          hasConfig: !!tv2GradientLoop.config,
          tickMs: tv2GradientLoop.config?.tickMs || null,
          periodMs: tv2GradientLoop.config?.periodMs || null,
          lightCount: Array.isArray(tv2GradientLoop.config?.lightIds) ? tv2GradientLoop.config.lightIds.length : 0,
          stopsCount: Array.isArray(tv2GradientLoop.config?.stops) ? tv2GradientLoop.config.stops.length : 0,
        };

        let lightsProbe = null;
        try {
          const listed = await listLights({ configOverride });
          lightsProbe = listed?.ok
            ? { ok: true, count: Array.isArray(listed?.lights) ? listed.lights.length : 0 }
            : { ok: false, error: listed?.error || "listLights failed" };
        } catch (e) {
          lightsProbe = { ok: false, error: e?.message || String(e) };
        }

        result = {
          ok: true,
          isTv2,
          proxy: {
            proxyBaseUrlConfigured: !!normalizeBaseUrl(process.env.HUE_CONTROL_PROXY_URL),
            requestHasHopHeader: !!req.headers?.[hopHeader],
          },
          hueConfig: {
            enabled: !!configOverride?.enabled,
            remoteEnabled: !!configOverride?.remoteEnabled,
            groupId: configOverride?.groupId ?? null,
            lightIdsConfiguredCount: Array.isArray(configOverride?.lightIds) ? configOverride.lightIds.length : 0,
          },
          loop,
          lightsProbe,
        };
        break;
      }
      case "list-lights": {
        result = await listLights({ configOverride });
        break;
      }
      case "color": {
        if (!color) {
          return res.status(400).json({ ok: false, error: "Color value is required" });
        }
        const bri = brightness != null ? normalizeBrightness(brightness) : undefined;
        // TV2-only: apply a "wave" (random order + random timing) so bulbs don't change simultaneously.
        // TV2 marks requests with { source: "tv2" } in the body.
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        if (!isTv2) {
          result = await setLightColor({ color, brightness: bri, configOverride });
          break;
        }

        // If a continuous gradient loop is running, stop it before applying a one-shot override.
        stopTv2GradientLoop();
        stopTv2PulseLoop();

        // Determine targets without hardcoding IDs:
        // - Prefer configured HUE_LIGHT_IDS (explicit list)
        // - Otherwise, enumerate via Hue API (listLights)
        let lightIds = toUniqueNumericLightIds(configOverride?.lightIds);
        if (!lightIds.length) {
          const listed = await listLights({ configOverride });
          if (listed?.ok && Array.isArray(listed?.lights)) {
            lightIds = toUniqueNumericLightIds(listed.lights.map((l) => l?.id));
          }
        }

        // If we still have no ids, fall back to existing behavior.
        if (!lightIds.length) {
          result = await setLightColor({ color, brightness: bri, configOverride });
          break;
        }

        // Schedule sequential per-bulb updates with random delays.
        // We respond immediately (TV2 doesn't consume the response) while the wave continues in the background.
        const ids = shuffleInPlace([...lightIds]);
        const io = res?.socket?.server?.io;
        void (async () => {
          try {
            // Tune these to taste; total wave time ~ N * avgDelay.
            const minDelayMs = 60;
            const maxDelayMs = 240;
            for (let i = 0; i < ids.length; i += 1) {
              const id = ids[i];
              const jitter = Math.floor(minDelayMs + Math.random() * (maxDelayMs - minDelayMs + 1));
              // eslint-disable-next-line no-await-in-loop
              await sleep(jitter);
              // eslint-disable-next-line no-await-in-loop
              await setLightColor({
                color,
                brightness: bri,
                configOverride,
                // Force per-light targeting (avoid group apply which changes simultaneously).
                targets: { lightIds: [id], groupId: undefined },
              });
            }

            // After the wave finishes, broadcast latest average Hue state (if socket server is present).
            try {
              if (io) {
                const state = await getHueStateAverageHex({ configOverride });
                if (state?.ok) {
                  io.to("livingroom").emit("hue-state", state);
                }
              }
            } catch {}
          } catch (err) {
            console.warn("[lighttest][tv2-wave] failed", err?.message || String(err));
          }
        })();

        result = { ok: true, scheduled: true, mode: "tv2-wave", count: ids.length };
        break;
      }
      case "pulse": {
        // TV2-only: set a single base color, then forever pulse brightness randomly 0-100 per bulb.
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        if (!isTv2) {
          return res.status(400).json({ ok: false, error: "pulse action is restricted to TV2" });
        }
        result = await startTv2PulseLoop({
          configOverride,
          color: req.body?.color,
          tickMs: req.body?.tickMs,
          waveMinDelayMs: req.body?.waveMinDelayMs,
          waveMaxDelayMs: req.body?.waveMaxDelayMs,
          maxBrightnessPct: req.body?.maxBrightnessPct,
          minBrightnessPct: req.body?.minBrightnessPct,
        });
        break;
      }
      case "stop-pulse": {
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        if (!isTv2) {
          return res.status(400).json({ ok: false, error: "stop-pulse is restricted to TV2" });
        }
        stopTv2PulseLoop();
        result = { ok: true, stopped: true };
        break;
      }
      case "gradient": {
        // TV2-only: start/replace a continuous hybrid loop driven by the top panel gradient stops.
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        if (!isTv2) {
          return res.status(400).json({ ok: false, error: "gradient action is restricted to TV2" });
        }
        const mode = String(req.body?.mode || "hybrid").toLowerCase();
        if (mode !== "hybrid") {
          return res.status(400).json({ ok: false, error: "Only mode='hybrid' is supported" });
        }
        const stops = Array.isArray(req.body?.stops) ? req.body.stops : [];
        const bri = brightness != null ? normalizeBrightness(brightness) : undefined;
        result = await startTv2GradientLoop({
          configOverride,
          stops,
          tickMs: req.body?.tickMs,
          periodMs: req.body?.periodMs,
          brightness: bri,
          waveMinDelayMs: req.body?.waveMinDelayMs,
          waveMaxDelayMs: req.body?.waveMaxDelayMs,
          cycleStrength: req.body?.cycleStrength,
          blinkEnabled: req.body?.blinkEnabled,
          blinkProbability: req.body?.blinkProbability,
          blinkOffMs: req.body?.blinkOffMs,
          blinkMinIntervalMs: req.body?.blinkMinIntervalMs,
        });
        break;
      }
      case "stop-gradient": {
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        if (!isTv2) {
          return res.status(400).json({ ok: false, error: "stop-gradient is restricted to TV2" });
        }
        stopTv2GradientLoop();
        result = { ok: true, stopped: true };
        break;
      }
      case "brightness": {
        const value = normalizeBrightness(brightness);
        if (value == null) {
          return res.status(400).json({ ok: false, error: "Invalid brightness value" });
        }
        result = await setLightBrightness(value, { configOverride });
        break;
      }
      case "on":
      case "off": {
        result = await setLightOnOff(action === "on", { configOverride });
        break;
      }
      default:
        return res.status(400).json({ ok: false, error: "Unknown action" });
    }
    const statusCode = result?.ok ? 200 : 500;
    // Push latest Hue state to livingroom clients (TV2) when socket server is present.
    try {
      const io = res?.socket?.server?.io;
      // For TV2 wave we emit at the end of the wave (above), not immediately.
      // For continuous gradient, average hue-state isn't representative; skip emitting to avoid UI churn.
      if (io && result?.ok && result?.mode !== "tv2-wave" && action !== "gradient") {
        const state = await getHueStateAverageHex({ configOverride });
        if (state?.ok) {
          io.to("livingroom").emit("hue-state", state);
        }
      }
    } catch {}
    return res.status(statusCode).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Unexpected Hue error" });
  }
}

