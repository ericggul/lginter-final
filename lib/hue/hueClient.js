// Lightweight Hue client for server-side usage (Next.js API routes)
// - Feature toggle via HUE_ENABLED
// - Connects once per process and reuses API instance
// - Accepts hex (#RRGGBB) or rgb(r,g,b) strings
// - Converts to CIE xy and applies to lights or group
// NOTE: Use CommonJS build of node-hue-api to avoid ESM directory import issues.

import { createRequire } from "module";
const requireModule = createRequire(import.meta.url);
const { v3 } = requireModule("node-hue-api"); // CJS entry
const LightState = v3.lightStates.LightState;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let hueApi = null;
let cachedConfig = null;
let remoteAuthCache = {
  accessToken: "",
  refreshToken: "",
  expiresAt: 0, // epoch ms
  updatedAt: 0, // epoch ms
};

function readEnvConfig() {
  const enabled = String(process.env.HUE_ENABLED || "").toLowerCase() === "true";
  const ip = process.env.HUE_BRIDGE_IP || "";
  const username = process.env.HUE_USERNAME || "";
  // Hue Remote API needs a Bridge ID (not the local API username).
  // Support explicit env keys; fall back to HUE_USERNAME for backward compatibility.
  const bridgeId = process.env.HUE_BRIDGE_ID || process.env.HUE_REMOTE_BRIDGE_ID || "";
  const groupId = process.env.HUE_GROUP_ID ? Number(process.env.HUE_GROUP_ID) : undefined;
  // Support both:
  // - HUE_LIGHT_IDS=1,2,3 (preferred)
  // - HUE_LIGHT_ID=1 (user-provided)
  // Note: Hue light IDs are typically 1-based. "0" is not a valid light id.
  const rawLightIds = process.env.HUE_LIGHT_IDS || process.env.HUE_LIGHT_ID || "";
  const lightIds = String(rawLightIds)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 1);

  // Hue Remote API (cloud) OAuth config
  // Prefer explicit enable flag; fallback to Render+refresh-token if flag omitted.
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

function isProbablyRender() {
  // Render sets RENDER=true for services.
  return String(process.env.RENDER || "").toLowerCase() === "true";
}

function isPrivateLanIp(ip) {
  const s = String(ip || "").trim();
  if (!s) return false;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 127) return true;
  return false;
}

function ensureNumberInRange(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clamp01(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function fromLinear(c) {
  const v = clamp01(c);
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function xyBriToRgb(x, y, bri) {
  const xx = Number(x);
  const yy = Number(y);
  if (!Number.isFinite(xx) || !Number.isFinite(yy) || yy <= 0) return null;

  // Hue bri is 1..254. Use it as relative luminance Y in [0,1] (approx).
  const Y = clamp01((Number(bri) || 0) / 254);
  const X = (Y / yy) * xx;
  const Z = (Y / yy) * (1 - xx - yy);

  // Convert XYZ -> linear RGB (Hue xy conversion approximation).
  let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  let b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;

  // Normalize if needed
  const max = Math.max(r, g, b);
  if (max > 1) {
    r /= max;
    g /= max;
    b /= max;
  }

  const R = Math.round(clamp01(fromLinear(r)) * 255);
  const G = Math.round(clamp01(fromLinear(g)) * 255);
  const B = Math.round(clamp01(fromLinear(b)) * 255);
  return { r: R, g: G, b: B };
}

function rgbToHex({ r, g, b }) {
  const to2 = (n) => Math.max(0, Math.min(255, Number(n) || 0)).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
}

function syncRemoteAuthFromConfig(cfg) {
  if (!cfg) return;
  if (!remoteAuthCache.accessToken && cfg.remoteAccessToken) {
    remoteAuthCache.accessToken = String(cfg.remoteAccessToken || "");
  }
  if (!remoteAuthCache.refreshToken && cfg.remoteRefreshToken) {
    remoteAuthCache.refreshToken = String(cfg.remoteRefreshToken || "");
  }
  remoteAuthCache.accessToken = remoteAuthCache.accessToken || String(process.env.HUE_ACCESS_TOKEN || "");
  remoteAuthCache.refreshToken = remoteAuthCache.refreshToken || String(process.env.HUE_REFRESH_TOKEN || "");
}

async function refreshRemoteAccessToken(cfg) {
  syncRemoteAuthFromConfig(cfg);
  if (!cfg?.remoteClientId || !cfg?.remoteClientSecret || !remoteAuthCache.refreshToken) {
    return {
      ok: false,
      error: "Missing HUE_CLIENT_ID / HUE_CLIENT_SECRET / HUE_REFRESH_TOKEN for remote refresh",
    };
  }

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", remoteAuthCache.refreshToken);
  params.set("client_id", cfg.remoteClientId);
  params.set("client_secret", cfg.remoteClientSecret);

  const res = await fetch("https://api.meethue.com/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error_description || data?.error || "Hue token refresh failed",
      raw: data,
    };
  }

  const now = Date.now();
  const nextAccess = String(data?.access_token || "");
  const nextRefresh = String(data?.refresh_token || "");
  const expiresIn = Number(data?.expires_in || 0);

  if (nextAccess) remoteAuthCache.accessToken = nextAccess;
  if (nextRefresh) remoteAuthCache.refreshToken = nextRefresh;
  remoteAuthCache.expiresAt = expiresIn ? now + expiresIn * 1000 : now + 55 * 60 * 1000;
  remoteAuthCache.updatedAt = now;

  // Update env for this running process only (Render env vars will NOT be updated automatically).
  if (nextAccess) process.env.HUE_ACCESS_TOKEN = nextAccess;
  if (nextRefresh) process.env.HUE_REFRESH_TOKEN = nextRefresh;

  return { ok: true, ...remoteAuthCache };
}

async function ensureRemoteReady(cfg) {
  syncRemoteAuthFromConfig(cfg);
  const bridgeId = cfg?.bridgeId || cfg?.username;
  if (!bridgeId) {
    return {
      ok: false,
      error:
        "Missing HUE_BRIDGE_ID (preferred) or HUE_USERNAME (legacy fallback). " +
        "Hue Remote API requires a Bridge ID for routing.",
    };
  }
  if (!cfg?.remoteClientId || !cfg?.remoteClientSecret) {
    return { ok: false, error: "Missing HUE_CLIENT_ID / HUE_CLIENT_SECRET for Hue Remote API" };
  }
  if (!remoteAuthCache.refreshToken) return { ok: false, error: "Missing HUE_REFRESH_TOKEN for Hue Remote API" };

  if (!remoteAuthCache.accessToken) {
    const refreshed = await refreshRemoteAccessToken(cfg);
    if (!refreshed.ok) return { ok: false, error: refreshed.error, details: refreshed };
    return { ok: true };
  }

  const now = Date.now();
  if (remoteAuthCache.expiresAt && remoteAuthCache.expiresAt - now < 60_000) {
    const refreshed = await refreshRemoteAccessToken(cfg);
    if (!refreshed.ok) return { ok: false, error: refreshed.error, details: refreshed };
  }
  return { ok: true };
}

async function remoteRequest(cfg, path, { method = "GET", body } = {}) {
  const ensured = await ensureRemoteReady(cfg);
  if (!ensured.ok) return { ok: false, error: ensured.error, details: ensured };

  const bridgeId = cfg?.bridgeId || cfg?.username;
  const base = `https://api.meethue.com/bridge/${encodeURIComponent(String(bridgeId || ""))}`;
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const doReq = async () => {
    const res = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${remoteAuthCache.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    const retryAfterRaw = res.headers?.get?.("retry-after") || "";
    const retryAfter = retryAfterRaw ? Number(retryAfterRaw) : null;
    return { res, json, retryAfter: Number.isFinite(retryAfter) ? retryAfter : null };
  };

  const first = await doReq();
  if (first.res.status === 401) {
    const refreshed = await refreshRemoteAccessToken(cfg);
    if (!refreshed.ok) {
      return { ok: false, status: 401, error: "Unauthorized and refresh failed", details: refreshed };
    }
    const second = await doReq();
    if (!second.res.ok) {
      return {
        ok: false,
        status: second.res.status,
        retryAfter: second.retryAfter,
        error: second.json?.error?.description || second.json?.message || "Hue Remote API request failed",
        raw: second.json,
      };
    }
    return { ok: true, status: second.res.status, data: second.json };
  }

  if (!first.res.ok) {
    return {
      ok: false,
      status: first.res.status,
      retryAfter: first.retryAfter,
      error: first.json?.error?.description || first.json?.message || "Hue Remote API request failed",
      raw: first.json,
    };
  }
  return { ok: true, status: first.res.status, data: first.json };
}

// sRGB -> linear
function toLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToXyBri(r, g, b) {
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  // Wide RGB D65 conversion to XYZ
  const X = R * 0.664511 + G * 0.154324 + B * 0.162028;
  const Y = R * 0.283881 + G * 0.668433 + B * 0.047685; // also used for brightness proxy
  const Z = R * 0.000088 + G * 0.072310 + B * 0.986039;
  const sum = X + Y + Z || 1;
  const x = X / sum;
  const y = Y / sum;
  // Y is roughly relative luminance in [0,1]; map to [1,254]
  const bri = ensureNumberInRange(Math.round(Y * 254), 1, 254, 200);
  return { x, y, bri };
}

function parseColor(color) {
  if (!color || typeof color !== "string") throw new Error("Invalid color");
  const hex = color.trim();
  const mHex = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (mHex) {
    const v = mHex[1];
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return { r, g, b };
  }
  const mRgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(hex);
  if (mRgb) {
    const r = ensureNumberInRange(mRgb[1], 0, 255, 255);
    const g = ensureNumberInRange(mRgb[2], 0, 255, 255);
    const b = ensureNumberInRange(mRgb[3], 0, 255, 255);
    return { r, g, b };
  }
  // Accept hsl() / hsla(), e.g., hsl(200, 70%, 50%)
  const mHsl = /^hsla?\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*,\s*([+-]?\d+(?:\.\d+)?)%\s*(?:,\s*([+-]?\d+(?:\.\d+)?|\.\d+)\s*)?\)$/i.exec(hex);
  if (mHsl) {
    const hDeg = Number(mHsl[1]);
    const sPct = Number(mHsl[2]);
    const lPct = Number(mHsl[3]);
    const h = ((Number.isFinite(hDeg) ? hDeg : 0) % 360 + 360) % 360;
    const s = Math.min(100, Math.max(0, Number.isFinite(sPct) ? sPct : 100)) / 100;
    const l = Math.min(100, Math.max(0, Number.isFinite(lPct) ? lPct : 50)) / 100;
    // HSL to RGB (0..255)
    // Algorithm adapted from W3C: https://www.w3.org/TR/css-color-4/#hsl-to-rgb
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hPrime = h / 60;
    const x = c * (1 - Math.abs((hPrime % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hPrime >= 0 && hPrime < 1) { r1 = c; g1 = x; b1 = 0; }
    else if (hPrime >= 1 && hPrime < 2) { r1 = x; g1 = c; b1 = 0; }
    else if (hPrime >= 2 && hPrime < 3) { r1 = 0; g1 = c; b1 = x; }
    else if (hPrime >= 3 && hPrime < 4) { r1 = 0; g1 = x; b1 = c; }
    else if (hPrime >= 4 && hPrime < 5) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    const m = l - c / 2;
    const r = Math.round((r1 + m) * 255);
    const g = Math.round((g1 + m) * 255);
    const b = Math.round((b1 + m) * 255);
    return { r: ensureNumberInRange(r, 0, 255, 255), g: ensureNumberInRange(g, 0, 255, 255), b: ensureNumberInRange(b, 0, 255, 255) };
  }
  throw new Error("Unsupported color format. Use #RRGGBB, rgb(r,g,b), or hsl(h,s%,l%)");
}

export async function getHueStateAverageHex(options = {}) {
  const cfg = options?.configOverride || cachedConfig || readEnvConfig();
  if (!cfg.enabled) return { ok: false, disabled: true, error: "Hue disabled" };

  const updatedAt = Date.now();

  if (cfg.remoteEnabled) {
    const resp = await remoteRequest(cfg, "/lights", { method: "GET" });
    if (!resp.ok) {
      return { ok: false, error: resp.error || "Failed to fetch Hue lights", raw: resp.raw };
    }
    const lightsObj = resp.data || {};

    const onRgbs = [];
    for (const id of Object.keys(lightsObj)) {
      const light = lightsObj?.[id];
      const state = light?.state || light?.action || light?.state?.state || light?.action?.action || light;
      if (!state?.on) continue;

      const bri = Number(state?.bri ?? 254);
      const xy = Array.isArray(state?.xy) ? state.xy : null;
      const x = xy ? xy[0] : state?.x;
      const y = xy ? xy[1] : state?.y;
      const rgb = xyBriToRgb(x, y, bri) || { r: 255, g: 255, b: 255 };
      onRgbs.push(rgb);
    }

    if (!onRgbs.length) {
      return { ok: true, on: false, hex: "#000000", updatedAt, count: 0 };
    }

    const sum = onRgbs.reduce(
      (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
      { r: 0, g: 0, b: 0 }
    );
    const avg = {
      r: Math.round(sum.r / onRgbs.length),
      g: Math.round(sum.g / onRgbs.length),
      b: Math.round(sum.b / onRgbs.length),
    };
    return { ok: true, on: true, hex: rgbToHex(avg), updatedAt, count: onRgbs.length };
  }

  // Local bridge: best-effort (can be slow; used mainly for dev).
  const ensured = await ensureHueActive(cfg);
  if (!ensured.ok) return ensured;

  const lights = await hueApi.lights.getAll();
  const onRgbs = [];
  for (const l of lights || []) {
    const id = Number(l?.id);
    if (!Number.isFinite(id)) continue;
    // eslint-disable-next-line no-await-in-loop
    const full = await hueApi.lights.getLight(id);
    const state = full?.state;
    if (!state?.on) continue;
    const bri = Number(state?.bri ?? 254);
    const xy = Array.isArray(state?.xy) ? state.xy : null;
    const rgb = xyBriToRgb(xy?.[0], xy?.[1], bri) || { r: 255, g: 255, b: 255 };
    onRgbs.push(rgb);
  }

  if (!onRgbs.length) {
    return { ok: true, on: false, hex: "#000000", updatedAt, count: 0 };
  }

  const sum = onRgbs.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
    { r: 0, g: 0, b: 0 }
  );
  const avg = {
    r: Math.round(sum.r / onRgbs.length),
    g: Math.round(sum.g / onRgbs.length),
    b: Math.round(sum.b / onRgbs.length),
  };
  return { ok: true, on: true, hex: rgbToHex(avg), updatedAt, count: onRgbs.length };
}

export async function initHue(configOverride = undefined) {
  const cfg = configOverride || readEnvConfig();
  cachedConfig = cfg;
  if (!cfg.enabled) {
    console.warn("[hue] init skipped: HUE_ENABLED is not true");
    return { ok: false, disabled: true, message: "HUE_ENABLED is not true" };
  }
  if (cfg.remoteEnabled) {
    const ensured = await ensureRemoteReady(cfg);
    if (!ensured.ok) {
      return { ok: false, message: ensured.error };
    }
    hueApi = { __remote: true };
    return { ok: true, message: "Hue remote ready", mode: "remote" };
  }

  if (hueApi) return { ok: true, message: "Hue already initialized" };

  if (!cfg.ip || !cfg.username) {
    console.warn("[hue] local missing ip/username");
    return { ok: false, message: "Missing HUE_BRIDGE_IP or HUE_USERNAME" };
  }
  if (isProbablyRender() && isPrivateLanIp(cfg.ip)) {
    return {
      ok: false,
      message:
        `Hue Bridge IP (${cfg.ip}) looks like a private LAN address. ` +
        "Render cannot directly reach devices on your home LAN. " +
        "Run the Hue controller on the same network as the bridge and set HUE_CONTROL_PROXY_URL on Render to that tunnel/controller host.",
    };
  }
  try {
    const api = await v3.api.createLocal(cfg.ip).connect(cfg.username);
    hueApi = api;
    return { ok: true, message: "Hue connected" };
  } catch (err) {
    return { ok: false, message: err?.message || String(err) };
  }
}

function transitionToDeciSeconds(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(1, Math.round(n / 100));
}

function resolveTargets(targets) {
  const base = cachedConfig || readEnvConfig();
  const t = targets || {};

  const hasExplicitGroupId = Object.prototype.hasOwnProperty.call(t, "groupId");
  const hasExplicitLightIds = Object.prototype.hasOwnProperty.call(t, "lightIds");

  // If caller explicitly provides lightIds, honor them (unless caller also explicitly provides groupId).
  const lightIds = hasExplicitLightIds
    ? Array.isArray(t.lightIds) && t.lightIds.length
      ? t.lightIds.map((n) => Number(n))
      : []
    : base.lightIds;

  // Prefer groupId when available.
  // - If caller explicitly sets groupId, use it (even if lightIds are also passed).
  // - Else, if caller explicitly sets lightIds, do NOT implicitly use base.groupId.
  // - Else, if base.groupId exists, use it (docs expectation: group overrides light IDs).
  const groupId = hasExplicitGroupId
    ? t.groupId != null
      ? Number(t.groupId)
      : undefined
    : hasExplicitLightIds
      ? undefined
      : base.groupId;

  return { lightIds, groupId };
}

async function ensureHueActive(configOverride) {
  // Prefer explicit override, then cached, then fresh env read.
  const cfg = configOverride || cachedConfig || readEnvConfig();
  if (!cachedConfig && configOverride) {
    cachedConfig = configOverride;
  }
  if (!cfg.enabled) {
    return { ok: false, disabled: true, error: "Hue disabled" };
  }
  if (cfg.remoteEnabled) {
    const ensured = await ensureRemoteReady(cfg);
    if (!ensured.ok) return { ok: false, error: ensured.error, details: ensured.details };
    hueApi = hueApi && hueApi.__remote ? hueApi : { __remote: true };
    return { ok: true, mode: "remote" };
  }
  if (!hueApi || !hueApi.lights) {
    console.log("[hue] ensureHueActive: re-init hueApi");
    const result = await initHue(configOverride || cfg);
    if (!result.ok) {
      console.error("[hue] ensureHueActive init failed", result.message);
      return { ok: false, error: result.message, disabled: result.disabled };
    }
    // Defensive: if init reported ok but hueApi is still missing, fail loudly.
    if (!hueApi) {
      return {
        ok: false,
        error:
          "Hue API not initialized after init (no API instance available). " +
          "If you are running on Render, you likely need HUE_CONTROL_PROXY_URL to a LAN controller.",
      };
    }
  }
  if (!hueApi || !hueApi.lights) {
    console.error("[hue] ensureHueActive: hueApi still missing after init");
    return { ok: false, error: "Hue API not initialized after init" };
  }
  return { ok: true };
}

async function applyHueState(state, targets) {
  const cfg = cachedConfig || readEnvConfig();
  const { lightIds, groupId } = resolveTargets(targets);

  const toRemoteBody = (s) => {
    if (!s) return {};
    if (typeof s === "object" && !("payload" in s) && !("getPayload" in s)) return s;
    if (typeof s?.getPayload === "function") return s.getPayload();
    if (typeof s?.payload === "function") return s.payload();
    return s;
  };

  if (cfg.remoteEnabled) {
    const applyRemoteLights = async (ids) => {
      const results = [];
      const errors = [];
      const body = toRemoteBody(state);
      // Hue Remote API can 429 easily; add a small spacing between requests.
      const spacingMs = 250;
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(spacingMs);
        // eslint-disable-next-line no-await-in-loop
        const resp = await remoteRequest(cfg, `/lights/${encodeURIComponent(String(id))}/state`, {
          method: "PUT",
          body,
        });
        if (resp.ok) results.push({ id: Number(id), ok: true, result: resp.data });
        else
          errors.push({
            id: Number(id),
            ok: false,
            status: resp.status,
            retryAfter: resp.retryAfter,
            error: resp.status ? `(${resp.status}) ${resp.error}` : resp.error,
            raw: resp.raw,
            details: resp.details,
          });
      }
      if (results.length === 0) {
        const first = errors[0];
        const e = new Error(
          `Hue Remote API request failed${first?.status ? ` (${first.status})` : ""}: ` +
            (first?.error || "No lights were updated")
        );
        e.details = { first, sampleErrors: errors.slice(0, 5) };
        throw e;
      }
      return { mode: "lights", results, errors };
    };

    const applyRemoteAllKnownLights = async () => {
      const resp = await remoteRequest(cfg, "/lights", { method: "GET" });
      if (!resp.ok) throw new Error(resp.error || "Failed to fetch lights");
      const ids = Object.keys(resp.data || {})
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n) && n >= 1);
      if (!ids.length) throw new Error("No lights found on remote bridge");
      return await applyRemoteLights(ids);
    };

    const applyRemoteGroup = async (gid) => {
      const resp = await remoteRequest(cfg, `/groups/${encodeURIComponent(String(gid))}/action`, {
        method: "PUT",
        body: toRemoteBody(state),
      });
      if (!resp.ok) {
        const e = new Error(
          `Hue Remote API request failed${resp?.status ? ` (${resp.status})` : ""}: ` +
            (resp.error || "Remote group apply failed")
        );
        e.details = {
          status: resp.status,
          retryAfter: resp.retryAfter,
          error: resp.error,
          raw: resp.raw,
          details: resp.details,
        };
        throw e;
      }
      return resp.data;
    };

    const apply = async () => {
      if (groupId != null && Number.isFinite(groupId)) return await applyRemoteGroup(groupId);
      if (Array.isArray(lightIds) && lightIds.length > 0) {
        // Remote optimization: try "all lights" group 0 first (single request) to avoid 429 from many per-light requests.
        // If group 0 isn't supported, fall back to per-light updates.
        try {
          return await applyRemoteGroup(0);
        } catch (err) {
          // If we hit 429, don't keep spamming per-light requests.
          if (String(err?.message || "").includes("(429)")) throw err;
          // Otherwise, fall back.
        }
        return await applyRemoteLights(lightIds);
      }
      return await applyRemoteAllKnownLights();
    };

    try {
      const result = await apply();
      return { ok: true, applied: true, result };
    } catch (err) {
      return { ok: false, applied: false, error: err?.message || String(err), details: err?.details };
    }
  }

  if (!hueApi || !hueApi.lights) {
    console.error("[hue] applyHueState: hueApi not initialized");
    return { ok: false, applied: false, error: "Hue API not initialized" };
  }

  const applyLights = async () => {
    const results = [];
    const errors = [];
    for (const id of lightIds) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await hueApi.lights.setLightState(Number(id), state);
        results.push({ id: Number(id), ok: true, result });
      } catch (err) {
        errors.push({ id: Number(id), ok: false, error: err?.message || String(err) });
      }
    }
    if (results.length === 0) {
      // If nothing applied, treat as failure.
      throw new Error(errors[0]?.error || "No lights were updated");
    }
    return { mode: "lights", results, errors };
  };

  const applyAllKnownLights = async () => {
    const lights = await hueApi.lights.getAll();
    const ids = (lights || [])
      .map((l) => Number(l?.id))
      .filter((n) => Number.isFinite(n) && n >= 1);
    if (!ids.length) {
      throw new Error("No lights found on bridge");
    }
    return await applyLights({ lightIds: ids });
  };

  const apply = async () => {
    // Prefer group if explicitly requested and valid.
    if (groupId != null && Number.isFinite(groupId)) {
      try {
        return await hueApi.groups.setGroupState(groupId, state);
      } catch (err) {
        // Some bridges don't have the requested group id (e.g. group 1),
        // but lights may still exist; fall back when possible.
        const message = err?.message || String(err);
        const looksLikeMissingGroup =
          /\/groups\/\d+\/action/i.test(message) || /resource.*\/groups/i.test(message);
        if (looksLikeMissingGroup && Array.isArray(lightIds) && lightIds.length > 0) {
          return await applyLights();
        }
        throw err;
      }
    }

    if (Array.isArray(lightIds) && lightIds.length > 0) {
      return await applyLights();
    }

    // If no explicit targets are configured, some bridges don't reliably honor group 0.
    // Prefer explicitly enumerating lights and applying the state directly.
    try {
      return await applyAllKnownLights();
    } catch (err) {
      // Last resort: all lights in all-lights group 0 (not always supported)
      return await hueApi.groups.setGroupState(0, state);
    }
  };

  try {
    const result = await apply();
    return { ok: true, applied: true, result };
  } catch (e) {
    try {
      const result = await apply();
      return { ok: true, applied: true, result, retried: true };
    } catch (err) {
      return { ok: false, applied: false, error: err?.message || String(err) };
    }
  }
}

export async function listLights(options = {}) {
  const ensured = await ensureHueActive(options?.configOverride);
  if (!ensured.ok) return ensured;
  const cfg = options?.configOverride || cachedConfig || readEnvConfig();
  if (cfg.remoteEnabled) {
    const resp = await remoteRequest(cfg, "/lights", { method: "GET" });
    if (!resp.ok) return { ok: false, status: resp.status, error: resp.error, raw: resp.raw, details: resp.details };
    const data = resp.data || {};
    const lights = Object.keys(data).map((id) => ({
      id: Number(id),
      name: data?.[id]?.name,
      type: data?.[id]?.type,
      modelId: data?.[id]?.modelid,
    }));
    return { ok: true, lights };
  }
  const lights = await hueApi.lights.getAll();
  return {
    ok: true,
    lights: (lights || []).map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
      modelId: l.modelid,
    })),
  };
}

export async function setLightColor(options) {
  const { color, brightness, transitionMs, targets, configOverride } = options || {};
  const ensured = await ensureHueActive(configOverride);
  if (!ensured.ok) return ensured;
  const { r, g, b } = parseColor(color);
  const { x, y, bri } = rgbToXyBri(r, g, b);
  const tt = transitionToDeciSeconds(transitionMs);
  const briFinal = brightness != null ? ensureNumberInRange(brightness, 1, 254, 200) : bri;

  const cfg = configOverride || cachedConfig || readEnvConfig();
  const state = cfg.remoteEnabled
    ? {
        on: true,
        xy: [x, y],
        ...(brightness != null ? { bri: briFinal } : {}),
        ...(tt != null ? { transitiontime: tt } : {}),
      }
    : (() => {
        // If brightness is not explicitly provided, preserve current brightness.
        // (Changing color shouldn't unexpectedly change intensity.)
        const s = new LightState().on().xy(x, y);
        if (brightness != null) {
          // node-hue-api `brightness()` expects percentage (0..100).
          // We use Hue bri scale (1..254), so use `bri()` instead.
          s.bri(briFinal);
        }
        if (tt != null) s.transitiontime(tt);
        return s;
      })();

  const applied = await applyHueState(state, targets);
  if (!applied.ok) return applied;
  return { ...applied, xy: { x, y }, bri: brightness != null ? briFinal : undefined };
}

export function isHueEnabled() {
  return String(process.env.HUE_ENABLED || "").toLowerCase() === "true";
}

export async function setLightOnOff(on, options = {}) {
  const ensured = await ensureHueActive(options?.configOverride);
  if (!ensured.ok) return ensured;
  const cfg = options?.configOverride || cachedConfig || readEnvConfig();
  const state = cfg.remoteEnabled
    ? { on: Boolean(on) }
    : (() => {
        const s = new LightState();
        if (on) s.on();
        else s.off();
        return s;
      })();
  const result = await applyHueState(state, options.targets);
  return { ...result, on };
}

export async function setLightBrightness(brightness, options = {}) {
  const ensured = await ensureHueActive(options?.configOverride);
  if (!ensured.ok) return ensured;
  const value = ensureNumberInRange(brightness, 1, 254, 200);
  // node-hue-api `brightness()` expects percentage (0..100); we use Hue bri (1..254).
  const cfg = options?.configOverride || cachedConfig || readEnvConfig();
  const state = cfg.remoteEnabled ? { on: true, bri: value } : new LightState().on().bri(value);
  const result = await applyHueState(state, options.targets);
  return { ...result, brightness: value };
}

export function getHueRemoteAuthDebug() {
  return {
    accessTokenPresent: !!remoteAuthCache.accessToken,
    refreshTokenPresent: !!remoteAuthCache.refreshToken,
    expiresAt: remoteAuthCache.expiresAt || null,
    updatedAt: remoteAuthCache.updatedAt || null,
  };
}


