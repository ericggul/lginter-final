import {
  initHue,
  setLightBrightness,
  setLightColor,
  setLightOnOff,
} from "../../lib/hue/hueClient";



// NOTE: Hardcoding secrets in source code is risky.
// Prefer `.env.local` in the project root. If you still want a fallback,
// set these to your local values (and DO NOT commit).
const HUE_ENABLED_FALLBACK = true; // true/false
const HUE_BRIDGE_IP_FALLBACK = "172.20.10.3"; // e.g. "192.168.x.x"
const HUE_USERNAME_FALLBACK = "3o0JbZdgvZ8c3XayXnDuSs2N-1qxFta3laQKRz7Q";

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
  const lightIds = (process.env.HUE_LIGHT_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));

  return { enabled, ip, username, groupId, lightIds };
}

function normalizeBrightness(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(254, Math.max(1, Math.round(n)));
}

export default async function handler(req, res) {
  const configOverride = resolveHueConfig();
  if (process.env.NODE_ENV !== "production") {
    console.log("HUE DEBUG", {
      enabled: configOverride.enabled,
      ipSet: !!configOverride.ip,
      usernameSet: !!configOverride.username,
      groupId: configOverride.groupId,
      lightIdsCount: configOverride.lightIds?.length || 0,
      envEnabledRaw: process.env.HUE_ENABLED,
    });
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
    return res.status(statusCode).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Unexpected Hue error" });
  }
}

