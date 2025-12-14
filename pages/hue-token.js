import { useEffect, useState } from "react";

// Minimal helper page to exchange a Hue authorization code for tokens.
// The code is taken from the URL (?code=...) or can be pasted manually.
// Uses backend endpoint /api/hue/token which reads env secrets server-side.

export default function HueTokenPage() {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    if (codeParam) {
      setCode(codeParam);
    }
  }, []);

  const exchange = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/hue/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        setError(data?.error || "Token exchange failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err?.message || "Unexpected error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hue Token Exchange</h1>
        <p style={styles.text}>
          Paste or auto-fill the <code>code</code> from the redirect URL, then exchange it for
          access/refresh tokens. The request uses backend env vars (client id/secret, redirect).
        </p>
        <form onSubmit={exchange} style={styles.form}>
          <label style={styles.label}>
            Authorization code
            <input
              style={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 89M5Gio"
              required
            />
          </label>
          <button style={styles.button} type="submit" disabled={pending || !code}>
            {pending ? "Exchanging..." : "Exchange code"}
          </button>
        </form>
        {error ? <div style={styles.error}>Error: {error}</div> : null}
        {result ? (
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b0f19",
    color: "#e6ebff",
    padding: "2rem",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "min(720px, 100%)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "24px",
  },
  text: {
    margin: "0 0 16px",
    lineHeight: 1.5,
    color: "rgba(230,235,255,0.8)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "12px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "14px",
    color: "rgba(230,235,255,0.9)",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.04)",
    color: "#e6ebff",
    fontSize: "14px",
  },
  button: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #ff8800, #ff3d81)",
    color: "#0b0f19",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "15px",
  },
  error: {
    marginTop: "8px",
    color: "#ff8a8a",
    fontSize: "14px",
  },
  pre: {
    marginTop: "12px",
    padding: "12px",
    background: "rgba(0,0,0,0.35)",
    borderRadius: "10px",
    overflowX: "auto",
    fontSize: "13px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};

