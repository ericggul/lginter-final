// Refresh Hue OAuth access token using the stored refresh token.
// Protected endpoint because it returns sensitive tokens.
//
// Env required:
// - HUE_CLIENT_ID
// - HUE_CLIENT_SECRET
// - HUE_REFRESH_TOKEN
// - HUE_ADMIN_TOKEN (shared secret for this endpoint)
//
// Call:
// - POST /api/hue/refresh
//   Header: x-hue-admin-token: <HUE_ADMIN_TOKEN>

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const adminToken = process.env.HUE_ADMIN_TOKEN || "";
  if (!adminToken) {
    return res.status(400).json({ ok: false, error: "Missing HUE_ADMIN_TOKEN" });
  }
  const incoming = req.headers?.["x-hue-admin-token"];
  if (incoming !== adminToken) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const clientId = process.env.HUE_CLIENT_ID || "";
  const clientSecret = process.env.HUE_CLIENT_SECRET || "";
  const refreshToken = process.env.HUE_REFRESH_TOKEN || "";
  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(400).json({
      ok: false,
      error: "Missing HUE_CLIENT_ID / HUE_CLIENT_SECRET / HUE_REFRESH_TOKEN",
    });
  }

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", refreshToken);
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);

  try {
    const hueRes = await fetch("https://api.meethue.com/v2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await hueRes.json().catch(() => ({}));
    if (!hueRes.ok) {
      return res.status(hueRes.status).json({
        ok: false,
        status: hueRes.status,
        error: data?.error_description || data?.error || "Hue token refresh failed",
        raw: data,
      });
    }

    // Hue may rotate refresh tokens; return both so you can update Render env vars.
    // Also update process.env for this process lifetime (best effort).
    if (data?.access_token) process.env.HUE_ACCESS_TOKEN = String(data.access_token);
    if (data?.refresh_token) process.env.HUE_REFRESH_TOKEN = String(data.refresh_token);

    return res.status(200).json({ ok: true, ...data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Token refresh error" });
  }
}


