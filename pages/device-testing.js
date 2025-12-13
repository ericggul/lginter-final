import { useState } from "react";

const initialStatus = {
  airconditioner: "대기 중",
  airpurifierfan: "대기 중",
};

const initialResponse = {
  airconditioner: null,
  airpurifierfan: null,
};

function stringify(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (err) {
    return String(value);
  }
}

export default function DeviceTestingPage() {
  const [status, setStatus] = useState(initialStatus);
  const [lastResponse, setLastResponse] = useState(initialResponse);
  const [airconMode, setAirconMode] = useState("");
  const [airconTemp, setAirconTemp] = useState(24);
  const [fanMode, setFanMode] = useState("");

  const sendCommand = async (deviceType, payload) => {
    setStatus((prev) => ({ ...prev, [deviceType]: "전송 중..." }));
    try {
      const res = await fetch("/api/device-testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceType, payload }),
      });
      const data = await res.json();

      if (data.ok) {
        setStatus((prev) => ({
          ...prev,
          [deviceType]: `성공 (상태 ${data.upstreamStatus})`,
        }));
      } else {
        setStatus((prev) => ({
          ...prev,
          [deviceType]: data.error || "실패했습니다",
        }));
      }
      setLastResponse((prev) => ({ ...prev, [deviceType]: data.data ?? data }));
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        [deviceType]: err?.message || "요청 오류",
      }));
    }
  };

  const handlePower = (deviceType, on) => {
    sendCommand(deviceType, { power: on ? "on" : "off" });
  };

  const handleMode = (deviceType, modeValue) => {
    const mode = (modeValue || "").trim().toUpperCase();
    if (!mode) {
      setStatus((prev) => ({
        ...prev,
        [deviceType]: "모드를 입력해주세요 (대문자)",
      }));
      return;
    }
    sendCommand(deviceType, { mode });
  };

  const handleTemperature = (value) => {
    const temperature = Number(value);
    if (!Number.isFinite(temperature)) {
      setStatus((prev) => ({
        ...prev,
        airconditioner: "온도는 숫자로 입력해주세요",
      }));
      return;
    }
    sendCommand("airconditioner", { temperature });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Device Testing</h1>
          <p style={styles.subtitle}>
            한 번에 하나의 파라미터만 전송됩니다. (power / mode /
            temperature)
          </p>
        </div>
      </header>

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <p style={styles.label}>에어컨</p>
              <h2 style={styles.cardTitle}>Air Conditioner</h2>
            </div>
            <span style={styles.status}>{status.airconditioner}</span>
          </div>

          <div style={styles.controls}>
            <div style={styles.controlGroup}>
              <p style={styles.controlLabel}>전원</p>
              <div style={styles.row}>
                <button
                  style={styles.primaryButton}
                  onClick={() => handlePower("airconditioner", true)}
                >
                  Power ON
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => handlePower("airconditioner", false)}
                >
                  Power OFF
                </button>
              </div>
            </div>

            <div style={styles.controlGroup}>
              <p style={styles.controlLabel}>모드 (대문자 입력)</p>
              <div style={styles.row}>
                <input
                  style={styles.input}
                  placeholder="예: COOL / HEAT"
                  value={airconMode}
                  onChange={(e) => setAirconMode(e.target.value)}
                />
                <button
                  style={styles.primaryButton}
                  onClick={() => handleMode("airconditioner", airconMode)}
                >
                  Apply Mode
                </button>
              </div>
            </div>

            <div style={styles.controlGroup}>
              <p style={styles.controlLabel}>온도 설정</p>
              <div style={styles.row}>
                <input
                  type="number"
                  style={styles.input}
                  value={airconTemp}
                  onChange={(e) => setAirconTemp(e.target.value)}
                />
                <button
                  style={styles.primaryButton}
                  onClick={() => handleTemperature(airconTemp)}
                >
                  Set Temperature
                </button>
              </div>
            </div>
          </div>

          <div style={styles.responseBox}>
            <p style={styles.responseLabel}>최근 응답</p>
            <pre style={styles.pre}>
              {stringify(lastResponse.airconditioner) || "아직 응답 없음"}
            </pre>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHead}>
            <div>
              <p style={styles.label}>공기청정팬</p>
              <h2 style={styles.cardTitle}>Air Purifier Fan</h2>
            </div>
            <span style={styles.status}>{status.airpurifierfan}</span>
          </div>

          <div style={styles.controls}>
            <div style={styles.controlGroup}>
              <p style={styles.controlLabel}>전원</p>
              <div style={styles.row}>
                <button
                  style={styles.primaryButton}
                  onClick={() => handlePower("airpurifierfan", true)}
                >
                  Power ON
                </button>
                <button
                  style={styles.secondaryButton}
                  onClick={() => handlePower("airpurifierfan", false)}
                >
                  Power OFF
                </button>
              </div>
            </div>

            <div style={styles.controlGroup}>
              <p style={styles.controlLabel}>모드 (대문자 입력)</p>
              <div style={styles.row}>
                <input
                  style={styles.input}
                  placeholder="예: AUTO / TURBO"
                  value={fanMode}
                  onChange={(e) => setFanMode(e.target.value)}
                />
                <button
                  style={styles.primaryButton}
                  onClick={() => handleMode("airpurifierfan", fanMode)}
                >
                  Apply Mode
                </button>
              </div>
            </div>
          </div>

          <div style={styles.responseBox}>
            <p style={styles.responseLabel}>최근 응답</p>
            <pre style={styles.pre}>
              {stringify(lastResponse.airpurifierfan) || "아직 응답 없음"}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0d1117, #0b132b)",
    color: "#e4ecff",
    fontFamily: "'Inter', 'Pretendard', system-ui, sans-serif",
    padding: "3rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "2.6rem",
    letterSpacing: "0.02em",
  },
  subtitle: {
    margin: "0.4rem 0 0",
    color: "rgba(228, 236, 255, 0.75)",
    fontSize: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "1rem",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  label: {
    margin: 0,
    color: "rgba(228, 236, 255, 0.8)",
    fontSize: "0.95rem",
    letterSpacing: "0.05em",
  },
  cardTitle: {
    margin: "0.1rem 0 0",
    fontSize: "1.6rem",
  },
  status: {
    padding: "0.4rem 0.8rem",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "0.6rem",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  controlLabel: {
    margin: 0,
    fontSize: "1rem",
    color: "rgba(228, 236, 255, 0.85)",
  },
  row: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "0.75rem 1.2rem",
    borderRadius: "0.75rem",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    color: "#0d1117",
    background:
      "linear-gradient(120deg, rgba(108,99,255,0.95), rgba(255,136,0,0.9))",
  },
  secondaryButton: {
    padding: "0.75rem 1.2rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    background: "transparent",
    color: "#e4ecff",
    cursor: "pointer",
    fontWeight: 600,
  },
  input: {
    flex: 1,
    minWidth: "10rem",
    padding: "0.75rem 0.9rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#e4ecff",
  },
  responseBox: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "0.8rem",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "1rem",
  },
  responseLabel: {
    margin: "0 0 0.4rem",
    fontSize: "0.95rem",
    color: "rgba(228, 236, 255, 0.8)",
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    color: "rgba(228, 236, 255, 0.9)",
  },
};

