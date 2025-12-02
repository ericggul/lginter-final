import { useCallback, useState } from "react";

export default function LightTestPage() {
  const [color, setColor] = useState("#ff0000");
  const [brightness, setBrightness] = useState(200);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/lighttest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setResult(json);
      if (!res.ok || json?.ok === false) {
        setError(json?.error || `Request failed (${res.status})`);
      }
    } catch (e) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Hue Light Test (Client UI → /api/lighttest)</h1>

      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Color (#hex, rgb(), or hsl()):
        </label>
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#ff0000 or rgb(255,0,0) or hsl(0,100%,50%)"
          style={{ width: "100%", padding: 8, fontSize: 14 }}
        />
        <button
          onClick={() => post({ action: "color", color })}
          disabled={loading}
          style={{ marginTop: 8, padding: "8px 12px" }}
        >
          {loading ? "Applying..." : "Set Color"}
        </button>
      </section>

      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Brightness (1-254):
        </label>
        <input
          type="number"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          min={1}
          max={254}
          style={{ width: "100%", padding: 8, fontSize: 14 }}
        />
        <button
          onClick={() => post({ action: "brightness", brightness })}
          disabled={loading}
          style={{ marginTop: 8, padding: "8px 12px" }}
        >
          {loading ? "Applying..." : "Set Brightness"}
        </button>
      </section>

      <section style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => post({ action: "on" })}
          disabled={loading}
          style={{ padding: "8px 12px" }}
        >
          Turn On
        </button>
        <button
          onClick={() => post({ action: "off" })}
          disabled={loading}
          style={{ padding: "8px 12px" }}
        >
          Turn Off
        </button>
      </section>

      <section style={{ marginTop: 24 }}>
        {error && (
          <div style={{ color: "red", marginBottom: 8 }}>
            Error: {String(error)}
          </div>
        )}
        {result && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

