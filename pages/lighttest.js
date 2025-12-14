import { useMemo, useState } from "react";

const hexToRgb = (hex) => {
  const value = hex?.replace("#", "");
  if (!value || value.length !== 6) return { r: 255, g: 136, b: 0 };
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
};

export default function LightTestPage() {
  const [color, setColor] = useState("#ff8800");
  const [brightnessBri, setBrightnessBri] = useState(200);
  const [pendingAction, setPendingAction] = useState(null);
  const [status, setStatus] = useState("대기 중");
  const [lights, setLights] = useState([]);

  const rgbPreview = useMemo(() => {
    const { r, g, b } = hexToRgb(color);
    return `rgb(${r}, ${g}, ${b})`;
  }, [color]);

  const sendCommand = async (body) => {
    setPendingAction(body.action);
    setStatus("전송 중...");
    try {
      const response = await fetch("/api/lighttest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log("body and data", {body, data});

      
      if (data.disabled) {
        setStatus("Hue 비활성화 상태입니다. .env 설정을 확인하세요.");
      } else if (!data.ok) {
        setStatus(data.error || "명령 실행 실패");
      } else {
        if (body.action === "list-lights") {
          setStatus("조명 목록을 가져왔습니다.");
        } else {
          setStatus("완료! 조명에 적용되었습니다.");
        }
      }

      return data;
    } catch (err) {
      setStatus(`에러: ${err.message}`);
      return { ok: false, error: err.message };
    } finally {
      setPendingAction(null);
    }
  };

  const handleColorApply = () =>
    sendCommand({
      action: "color",
      color,
    });

  const handleOnOff = (on) => sendCommand({ action: on ? "on" : "off" });

  const handleBrightnessApply = () =>
    sendCommand({
      action: "brightness",
      brightness: brightnessBri,
    });

  const handleListLights = async () => {
    const data = await sendCommand({ action: "list-lights" });
    if (data?.ok && Array.isArray(data?.lights)) {
      setLights(data.lights);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <h1 style={styles.heading}>Light Test</h1>
        <p style={styles.subtext}>
          /lighttest 페이지에서 Philips Hue 조명을 직접 제어하세요.
        </p>
      </div>

      <div style={styles.grid}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>0. 조명 ID 목록</h2>
          <p style={styles.subtext}>
            먼저 목록을 불러와서 <strong>ID</strong>를 확인하세요.
          </p>
          <div style={styles.buttonRow}>
            <button
              style={styles.primaryButton}
              onClick={handleListLights}
              disabled={pendingAction === "list-lights"}
            >
              {pendingAction === "list-lights" ? "불러오는 중..." : "조명 목록 불러오기"}
            </button>
          </div>
          <div style={styles.lightsBox}>
            {lights?.length ? (
              <ul style={styles.lightsList}>
                {lights.map((l) => (
                  <li key={String(l?.id)} style={styles.lightRow}>
                    <strong style={styles.lightId}>#{l?.id}</strong>{" "}
                    <span style={styles.lightName}>{l?.name || "Unnamed"}</span>
                    <span style={styles.lightMeta}>
                      {l?.type ? ` · ${l.type}` : ""}
                      {l?.modelId ? ` · ${l.modelId}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span style={styles.lightsEmpty}>
                아직 목록이 없습니다. 위 버튼을 눌러주세요.
              </span>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. 색상 팔레트 (RGB)</h2>
          <div style={styles.colorRow}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={styles.colorInput}
            />
            <div style={styles.colorInfo}>
              <span style={styles.colorLabel}>현재 값</span>
              <strong style={styles.colorCode}>{rgbPreview}</strong>
              <span style={styles.hexCode}>{color.toUpperCase()}</span>
            </div>
          </div>
          <button
            style={styles.primaryButton}
            onClick={handleColorApply}
            disabled={pendingAction === "color"}
          >
            {pendingAction === "color" ? "적용 중..." : "색상 적용"}
          </button>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. 전원 제어</h2>
          <div style={styles.buttonRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => handleOnOff(true)}
              disabled={pendingAction === "on"}
            >
              {pendingAction === "on" ? "켜는 중..." : "ON"}
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => handleOnOff(false)}
              disabled={pendingAction === "off"}
            >
              {pendingAction === "off" ? "끄는 중..." : "OFF"}
            </button>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. 밝기</h2>
          <p style={styles.subtext}>
            Hue 밝기(bri): {brightnessBri} / 254 (약{" "}
            {Math.round((brightnessBri / 254) * 100)}%)
          </p>
          <div style={styles.brightnessRow}>
            <input
              type="range"
              min={1}
              max={254}
              value={brightnessBri}
              onChange={(e) => setBrightnessBri(Number(e.target.value))}
              style={styles.brightnessSlider}
            />
            <input
              type="number"
              min={1}
              max={254}
              value={brightnessBri}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                setBrightnessBri(Math.min(254, Math.max(1, Math.round(next))));
              }}
              style={styles.brightnessInput}
            />
          </div>
          <div style={styles.buttonRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => setBrightnessBri(254)}
              disabled={pendingAction === "brightness"}
            >
              100%
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => setBrightnessBri(128)}
              disabled={pendingAction === "brightness"}
            >
              50%
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => setBrightnessBri(32)}
              disabled={pendingAction === "brightness"}
            >
              12%
            </button>
            <button
              style={styles.primaryButton}
              onClick={handleBrightnessApply}
              disabled={pendingAction === "brightness"}
            >
              {pendingAction === "brightness" ? "적용 중..." : "밝기 적용"}
            </button>
          </div>
        </section>
      </div>

      <div style={styles.statusBar}>
        <span style={styles.statusLabel}>상태</span>
        <span style={styles.statusValue}>{status}</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #10131a 0%, #06070a 60%)",
    padding: "5vw",
    color: "#f5f7ff",
    fontFamily: "'Pretendard', 'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "2vw",
  },
  panel: {
    padding: "2vw",
    borderRadius: "1.5vw",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(0.8vw)",
  },
  heading: {
    margin: 0,
    fontSize: "3vw",
    letterSpacing: "0.1vw",
  },
  subtext: {
    margin: "0.5vw 0 0",
    fontSize: "1.2vw",
    color: "rgba(255, 255, 255, 0.7)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(22vw, 1fr))",
    gap: "1.5vw",
  },
  section: {
    padding: "2vw",
    borderRadius: "1.2vw",
    background: "rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "1.2vw",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.4vw",
    letterSpacing: "0.05vw",
  },
  colorRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.5vw",
  },
  colorInput: {
    width: "10vw",
    height: "10vw",
    border: "0.25vw solid rgba(255, 255, 255, 0.2)",
    borderRadius: "1vw",
    background: "transparent",
    cursor: "pointer",
  },
  colorInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4vw",
  },
  colorLabel: {
    fontSize: "1vw",
    color: "rgba(255, 255, 255, 0.7)",
  },
  colorCode: {
    fontSize: "1.3vw",
  },
  hexCode: {
    fontSize: "1.1vw",
    letterSpacing: "0.1vw",
    color: "rgba(255, 255, 255, 0.8)",
  },
  buttonRow: {
    display: "flex",
    gap: "1vw",
    flexWrap: "wrap",
  },
  brightnessRow: {
    display: "grid",
    gridTemplateColumns: "1fr 7vw",
    gap: "1vw",
    alignItems: "center",
  },
  brightnessSlider: {
    width: "100%",
  },
  brightnessInput: {
    width: "100%",
    fontSize: "1.1vw",
    padding: "0.8vw 0.9vw",
    borderRadius: "0.8vw",
    border: "0.15vw solid rgba(255, 255, 255, 0.4)",
    background: "transparent",
    color: "#f5f7ff",
  },
  primaryButton: {
    fontSize: "1.1vw",
    padding: "1vw 2vw",
    borderRadius: "0.8vw",
    border: "none",
    cursor: "pointer",
    background:
      "linear-gradient(120deg, rgba(255,136,0,0.9), rgba(255,64,129,0.9))",
    color: "#06070a",
    fontWeight: 600,
  },
  secondaryButton: {
    fontSize: "1.1vw",
    padding: "1vw 2vw",
    borderRadius: "0.8vw",
    border: "0.15vw solid rgba(255, 255, 255, 0.4)",
    background: "transparent",
    color: "#f5f7ff",
    cursor: "pointer",
  },
  statusBar: {
    marginTop: "1vw",
    padding: "1.4vw 2vw",
    borderRadius: "1vw",
    background: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: "1.2vw",
    letterSpacing: "0.08vw",
    color: "rgba(255, 255, 255, 0.7)",
  },
  statusValue: {
    fontSize: "1.4vw",
    fontWeight: 600,
  },
  lightsBox: {
    padding: "1.2vw",
    borderRadius: "1vw",
    border: "0.15vw solid rgba(255, 255, 255, 0.15)",
    background: "rgba(0, 0, 0, 0.25)",
  },
  lightsEmpty: {
    fontSize: "1.05vw",
    color: "rgba(255, 255, 255, 0.7)",
  },
  lightsList: {
    margin: 0,
    paddingLeft: "1.2vw",
    display: "flex",
    flexDirection: "column",
    gap: "0.6vw",
  },
  lightRow: {
    fontSize: "1.05vw",
    color: "rgba(255, 255, 255, 0.9)",
  },
  lightId: {
    fontSize: "1.05vw",
    letterSpacing: "0.05vw",
  },
  lightName: {
    fontSize: "1.05vw",
  },
  lightMeta: {
    fontSize: "0.95vw",
    color: "rgba(255, 255, 255, 0.65)",
  },
};

