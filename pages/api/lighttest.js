import {
  initHue,
  getHueStateAverageHex,
  listLights,
  setLightBrightness,
  setLightColor,
  setLightOnOff,
} from "../../lib/hue/hueClient";

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
      case "list-lights": {
        result = await listLights({ configOverride });
        break;
      }
      case "color": {
        if (!color) {
          return res.status(400).json({ ok: false, error: "Color value is required" });
        }
        const bri = brightness != null ? normalizeBrightness(brightness) : undefined;
        result = await setLightColor({ color, brightness: bri, configOverride });
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
      if (io && result?.ok) {
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

