const DEVICE_CONFIG = {
    airconditioner: {
      url: "https://thinq.bytechtree.com/api/goldstar/karts/airconditioner",
      allowedParams: ["power", "mode", "temperature"],
      label: "airconditioner",
    },
    airpurifierfan: {
      url: "https://thinq.bytechtree.com/api/goldstar/karts/airpurifierfan",
      allowedParams: ["power", "mode"],
      label: "airpurifierfan",
    },
  };
  
  function pickSingleParameter(payload = {}) {
    const entries = Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    );
    if (entries.length === 0) {
      return { error: "At least one parameter is required" };
    }
    if (entries.length > 1) {
      return { error: "Only one parameter can be sent per request" };
    }
    const [param, value] = entries[0];
    return { param, value };
  }
  
  export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }
  
    const { deviceType, payload } = req.body || {};
    const device = DEVICE_CONFIG[deviceType];
  
    if (!device) {
      return res
        .status(400)
        .json({ ok: false, error: "Unknown deviceType provided" });
    }
  
    const { param, value, error } = pickSingleParameter(payload);
    if (error) {
      return res.status(400).json({ ok: false, error });
    }
  
    if (!device.allowedParams.includes(param)) {
      return res
        .status(400)
        .json({ ok: false, error: `Parameter '${param}' is not allowed` });
    }
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
  
    try {
      const upstream = await fetch(device.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [param]: value }),
        signal: controller.signal,
      });
  
      const raw = await upstream.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        // leave as text if JSON parsing fails
      }
  
      const statusCode = upstream.ok ? 200 : 502;
      return res.status(statusCode).json({
        ok: upstream.ok,
        upstreamStatus: upstream.status,
        data,
      });
    } catch (err) {
      const isAbort = err?.name === "AbortError";
      return res.status(isAbort ? 504 : 500).json({
        ok: false,
        error: isAbort ? "Upstream request timed out" : err?.message || "Error",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }
  