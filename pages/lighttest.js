import { useMemo, useState } from "react";

const percentToBri = (percent) => {
  const num = Number(percent);
  if (!Number.isFinite(num)) return 200;
  const clamped = Math.min(100, Math.max(0, num));
  return Math.max(1, Math.round((clamped / 100) * 254));
};

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
  const [brightnessPercent, setBrightnessPercent] = useState(70);
  const [pendingAction, setPendingAction] = useState(null);
  const [status, setStatus] = useState("대기 중");

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
      console.log("data", data);

      
      if (data.disabled) {
        setStatus("Hue 비활성화 상태입니다. .env 설정을 확인하세요.");
      } else if (!data.ok) {
        setStatus(data.error || "명령 실행 실패");
      } else {
        setStatus("완료! 조명에 적용되었습니다.");
      }
    } catch (err) {
      setStatus(`에러: ${err.message}`);
    } finally {
      setPendingAction(null);
    }
  };

  const handleColorApply = () =>
    sendCommand({
      action: "color",
      color,
      brightness: percentToBri(brightnessPercent),
    });

  const handleOnOff = (on) => sendCommand({ action: on ? "on" : "off" });

  const handleQuickBrightness = (percent) => {
    setBrightnessPercent(percent);
    return sendCommand({
      action: "brightness",
      brightness: percentToBri(percent),
    });
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
          <h2 style={styles.sectionTitle}>3. 조도 (Light / Dark)</h2>
          <p style={styles.subtext}>
            현재 밝기: {brightnessPercent.toFixed(0)}%
          </p>
          <div style={styles.buttonRow}>
            <button
              style={styles.secondaryButton}
              onClick={() => handleQuickBrightness(80)}
              disabled={pendingAction === "brightness" && brightnessPercent === 80}
            >
              {pendingAction === "brightness" && brightnessPercent === 80
                ? "Light 적용 중..."
                : "Light (80%)"}
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => handleQuickBrightness(25)}
              disabled={pendingAction === "brightness" && brightnessPercent === 25}
            >
              {pendingAction === "brightness" && brightnessPercent === 25
                ? "Dark 적용 중..."
                : "Dark (25%)"}
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
};

