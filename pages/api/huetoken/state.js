import { getHueStateAverageHex } from "../../../lib/hue/hueClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const result = await getHueStateAverageHex();
    const status = result?.ok ? 200 : result?.disabled ? 200 : 500;
    return res.status(status).json(result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Hue state error" });
  }
}


