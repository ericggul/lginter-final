// Exchange a Hue OAuth authorization code for access/refresh tokens.
// Uses server-side env vars: HUE_CLIENT_ID, HUE_CLIENT_SECRET, HUE_REDIRECT_URL.
// Invoke with POST { code } or GET ?code=... (POST recommended).

export default async function handler(req, res) {
  const code = req.method === "POST" ? req.body?.code : req.query?.code;
  const clientId = process.env.HUE_CLIENT_ID;
  const clientSecret = process.env.HUE_CLIENT_SECRET;
  const redirectUri = process.env.HUE_REDIRECT_URL;

  if (!code) {
    return res.status(400).json({ ok: false, error: "Missing code" });
  }
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({
      ok: false,
      error: "Missing HUE_CLIENT_ID / HUE_CLIENT_SECRET / HUE_REDIRECT_URL",
    });
  }

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("client_id", clientId);
  params.set("client_secret", clientSecret);
  params.set("redirect_uri", redirectUri);

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
        error: data?.error_description || data?.error || "Hue token exchange failed",
        raw: data,
      });
    }

    // data includes access_token, refresh_token, expires_in, etc.
    // Return as-is so you can capture refresh_token and store in env.
    return res.status(200).json({ ok: true, ...data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Token exchange error" });
  }
}

