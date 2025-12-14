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

let hueApi = null;
let cachedConfig = null;

function readEnvConfig() {
  const enabled = String(process.env.HUE_ENABLED || "").toLowerCase() === "true";
  const ip = process.env.HUE_BRIDGE_IP || "";
  const username = process.env.HUE_USERNAME || "";
  const groupId = process.env.HUE_GROUP_ID ? Number(process.env.HUE_GROUP_ID) : undefined;
  const lightIds = (process.env.HUE_LIGHT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
  return { enabled, ip, username, groupId, lightIds };
}

function ensureNumberInRange(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
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

export async function initHue(configOverride = undefined) {
  const cfg = configOverride || readEnvConfig();
  cachedConfig = cfg;
  if (!cfg.enabled) {
    return { ok: false, disabled: true, message: "HUE_ENABLED is not true" };
  }
  if (hueApi) return { ok: true, message: "Hue already initialized" };
  if (!cfg.ip || !cfg.username) {
    return { ok: false, message: "Missing HUE_BRIDGE_IP or HUE_USERNAME" };
  }
  const api = await v3.api.createLocal(cfg.ip).connect(cfg.username);
  hueApi = api;
  return { ok: true, message: "Hue connected" };
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
  const cfg = cachedConfig || readEnvConfig();
  if (!cfg.enabled) {
    return { ok: false, disabled: true, error: "Hue disabled" };
  }
  if (!hueApi) {
    const result = await initHue(configOverride || cfg);
    if (!result.ok) {
      return { ok: false, error: result.message, disabled: result.disabled };
    }
  }
  return { ok: true };
}

async function applyHueState(state, targets) {
  const { lightIds, groupId } = resolveTargets(targets);

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

    // Fallback: all lights in all-lights group 0 (not always supported)
    return await hueApi.groups.setGroupState(0, state);
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

  // If brightness is not explicitly provided, preserve current brightness.
  // (Changing color shouldn't unexpectedly change intensity.)
  const state = new LightState().on().xy(x, y);
  if (brightness != null) {
    // node-hue-api `brightness()` expects percentage (0..100).
    // We use Hue bri scale (1..254), so use `bri()` instead.
    state.bri(briFinal);
  }
  if (tt != null) state.transitiontime(tt);

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
  const state = new LightState();
  if (on) {
    state.on();
  } else {
    state.off();
  }
  const result = await applyHueState(state, options.targets);
  return { ...result, on };
}

export async function setLightBrightness(brightness, options = {}) {
  const ensured = await ensureHueActive(options?.configOverride);
  if (!ensured.ok) return ensured;
  const value = ensureNumberInRange(brightness, 1, 254, 200);
  // node-hue-api `brightness()` expects percentage (0..100); we use Hue bri (1..254).
  const state = new LightState().on().bri(value);
  const result = await applyHueState(state, options.targets);
  return { ...result, brightness: value };
}


