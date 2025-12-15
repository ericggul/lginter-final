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
        // TV2-only: apply a "wave" (random order + random timing) so bulbs don't change simultaneously.
        // TV2 marks requests with { source: "tv2" } in the body.
        const isTv2 = String(req.body?.source || "").toLowerCase() === "tv2";
        if (!isTv2) {
          result = await setLightColor({ color, brightness: bri, configOverride });
          break;
        }

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
      if (io && result?.ok && result?.mode !== "tv2-wave") {
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

