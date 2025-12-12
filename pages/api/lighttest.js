import {
  initHue,
  isHueEnabled,
  setLightBrightness,
  setLightColor,
  setLightOnOff,
} from "../../lib/hue/hueClient";

function normalizeBrightness(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(254, Math.max(1, Math.round(n)));
}

export default async function handler(req, res) {
  // Debug: 확인용 로그 (서버 콘솔에서 env 값 확인)
  console.log("HUE DEBUG", {
    HUE_ENABLED: process.env.HUE_ENABLED,
    HUE_BRIDGE_IP: process.env.HUE_BRIDGE_IP,
    HUE_USERNAME_SET: !!process.env.HUE_USERNAME,
  });

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!isHueEnabled()) {
    return res.status(200).json({ ok: false, disabled: true, error: "Hue disabled" });
  }

  await initHue().catch(() => {});

  const { action, color, brightness } = req.body || {};
  try {
    let result;
    switch (action) {
      case "color": {
        if (!color) {
          return res.status(400).json({ ok: false, error: "Color value is required" });
        }
        const bri = brightness != null ? normalizeBrightness(brightness) : undefined;
        result = await setLightColor({ color, brightness: bri });
        break;
      }
      case "brightness": {
        const value = normalizeBrightness(brightness);
        if (value == null) {
          return res.status(400).json({ ok: false, error: "Invalid brightness value" });
        }
        result = await setLightBrightness(value);
        break;
      }
      case "on":
      case "off": {
        result = await setLightOnOff(action === "on");
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

