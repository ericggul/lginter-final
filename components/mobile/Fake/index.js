import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import useSocketMobile from "@/utils/hooks/useSocketMobile";
import useSocketSW1 from "@/utils/hooks/useSocketSW1";

const DEFAULT_USERS = [
  { userId: "M1", name: "사용자1" },
  { userId: "M2", name: "사용자2" },
  { userId: "M3", name: "사용자3" },
  { userId: "M4", name: "사용자4" },
  { userId: "M5", name: "사용자5" },
  { userId: "M6", name: "사용자6" },
];

export default function FakeMobile() {
  const [users, setUsers] = useState(() =>
    DEFAULT_USERS.map((u) => ({
      ...u,
      mood: "",
      lastDecision: null,
      initialized: false,
      isSending: false,
    }))
  );

  const { socket, emitNewName, emitNewVoice } = useSocketMobile({
    onMobileDecision: (payload) => {
      const assignedUser = payload?.userId || payload?.meta?.userId;
      if (!assignedUser) return;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.userId !== assignedUser) return u;
          const aggregated = payload?.params || null;
          // Fallback: if per-user result is missing, show aggregated as a temporary personal view
          const individual = payload?.individual || (aggregated ? { ...aggregated } : null);
          return { ...u, lastDecision: { individual, aggregated }, isSending: false };
        })
      );
    },
  });

  // SW1 테스트 송출 훅 (타임라인/디시전)
  const {
    emitTimelineStage,
    emitDecisionWithIndividuals,
  } = useSocketSW1();

  const ensureInitForUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, initialized: true } : u))
    );
    try {
      socket?.emit("mobile-init", { userId });
    } catch {}
  };

  const handleChange = (userId, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, [field]: value } : u))
    );
  };

  const handleSend = async (user) => {
    const trimmedName = (user.name || "").trim();
    const trimmedMood = (user.mood || "").trim();
    if (!trimmedMood) return;

    if (!user.initialized) {
      ensureInitForUser(user.userId);
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.userId === user.userId ? { ...u, isSending: true } : u
      )
    );

    const effectiveName = trimmedName || user.userId;
    try {
      emitNewName(effectiveName, { userId: user.userId });
    } catch {}
    try {
      emitNewVoice(trimmedMood, trimmedMood, 0.8, {
        userId: user.userId,
        name: effectiveName,
      });
    } catch {}
  };

  const handleBroadcast = () => {
    users.forEach((u) => {
      if (u.mood?.trim()) handleSend(u);
    });
  };

  // ===== SW1 테스트 패널 상태 =====
  const [sw1Temp, setSw1Temp] = useState(23);
  const [sw1Hum, setSw1Hum] = useState(50);
  const [sw1UserCount, setSw1UserCount] = useState(3);
  const sendSw1Decision = () => {
    const clamp = (t) => Math.max(18, Math.min(30, Math.round(t)));
    const cnt = Math.max(0, Math.min(10, Number(sw1UserCount) || 0));
    const baseTemp = clamp(Number(sw1Temp) || 23);
    const baseHum = Number(sw1Hum) || 50;
    const individuals = Array.from({ length: cnt }).map((_, i) => ({
      userId: `U${i + 1}`,
      temp: clamp(baseTemp + (i - Math.floor(cnt / 2)) * 2),
      humidity: baseHum,
    }));
    const mergedFrom = individuals.map((x) => x.userId);
    const env = { temp: baseTemp, humidity: baseHum };
    emitDecisionWithIndividuals({ env, mergedFrom, individuals, target: 'sw1' });
  };

  return (
    <Wrap>
      <Header>테스트용 모바일 (가짜 입력)</Header>
      <Desc>텍스트만 입력해 전체 디바이스 오케스트레이션을 트리거합니다.</Desc>

      <Grid>
          {users.map((u) => {
          const sIndividual = summarizeDecision(u.lastDecision?.individual);
          const sAggregated = summarizeDecision(u.lastDecision?.aggregated);
          return (
            <Card key={u.userId}>
              <Title>{u.userId}</Title>
              <Field>
                <Label>이름</Label>
                <Input
                  type="text"
                  placeholder={`${u.userId} (선택사항)`}
                  value={u.name}
                  onChange={(e) => handleChange(u.userId, "name", e.target.value)}
                />
              </Field>
              <Field>
                <Label>기분 / 텍스트</Label>
                <Input
                  type="text"
                  placeholder="예: 차분하고 포근한 분위기"
                  value={u.mood}
                  onChange={(e) => handleChange(u.userId, "mood", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend(u);
                  }}
                />
              </Field>
              <Row>
                <Button onClick={() => handleSend(u)} disabled={!u.mood?.trim() || u.isSending}>
                  {u.isSending ? "전송 중..." : "전송"}
                </Button>
                <InitBadge $active={u.initialized}>
                  {u.initialized ? "INIT됨" : "미INIT"}
                </InitBadge>
              </Row>
              <DecisionBox>
                <DecisionTitle>개인 결과</DecisionTitle>
                <DecisionText>
                  {sIndividual || "아직 결과 없음"}
                </DecisionText>
              </DecisionBox>
              <DecisionBox>
                <DecisionTitle>오케스트레이션 결과</DecisionTitle>
                <DecisionText>
                  {sAggregated || "아직 결과 없음"}
                </DecisionText>
              </DecisionBox>
            </Card>
          );
        })}
      </Grid>

      <FooterRow>
        <ButtonPrimary onClick={handleBroadcast}>모두 전송</ButtonPrimary>
        <Small>엔터키로 개별 전송 가능</Small>
      </FooterRow>

      {/* ===== SW1 무빙/컬러 테스트 패널 ===== */}
      <Section>
        <SectionTitle>SW1 테스트 패널</SectionTitle>
        <Row>
          <TinyButton onClick={() => emitTimelineStage('t1')}>T1</TinyButton>
          <TinyButton onClick={() => emitTimelineStage('t2')}>T2</TinyButton>
          <TinyButton onClick={() => emitTimelineStage('t3')}>T3</TinyButton>
          <TinyButton onClick={() => emitTimelineStage('t4')}>T4</TinyButton>
          <TinyButton onClick={() => emitTimelineStage('t5')}>T5</TinyButton>
        </Row>
        <Row>
          <SmallInput
            type="number"
            value={sw1Temp}
            onChange={(e) => setSw1Temp(e.target.value)}
            placeholder="중앙 temp"
          />
          <SmallInput
            type="number"
            value={sw1Hum}
            onChange={(e) => setSw1Hum(e.target.value)}
            placeholder="중앙 humidity"
          />
          <SmallInput
            type="number"
            value={sw1UserCount}
            onChange={(e) => setSw1UserCount(e.target.value)}
            placeholder="개수(3~10)"
          />
          <Button onClick={sendSw1Decision}>SW1 디시전 보내기</Button>
        </Row>
      </Section>
    </Wrap>
  );
}

function summarizeDecision(payload) {
  if (!payload) return null;
  const p = payload?.params || payload?.assignments || payload;
  const t =
    p?.temp ?? p?.temperature ?? payload?.temperature ?? payload?.temp;
  const h =
    p?.humidity ?? payload?.humidity;
  const c =
    p?.lightColor ?? p?.light ?? payload?.light ?? payload?.lightColor;
  const m =
    p?.music ?? payload?.song ?? payload?.music;
  const r = payload?.reason || payload?.meta?.reason;

  const parts = [];
  if (t != null) parts.push(`온도: ${t}°C`);
  if (h != null) parts.push(`습도: ${h}%`);
  if (c) parts.push(`조명: ${String(c)}`);
  if (m) parts.push(`음악: ${m}`);

  const main = parts.length ? parts.join(" / ") : null;
  if (main && r) return `${main}\n이유: ${r}`;
  if (main) return main;
  if (r) return `이유: ${r}`;
  return null;
}

const Wrap = styled.div`
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  padding: 24px;
  background: #0b0b12;
  color: #f3f3f7;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.h1`
  font-size: 20px;
  margin: 0;
`;

const Desc = styled.p`
  margin: 0 0 8px 0;
  color: #9aa3b2;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
`;

const Card = styled.div`
  background: #141420;
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.div`
  font-weight: 700;
  color: #c6c8ff;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #9aa3b2;
`;

const Input = styled.input`
  background: #0e0e18;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  color: #f3f3f7;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
  transition: border 120ms ease;
  &:focus {
    border-color: #7c3aed;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  border: none;
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:active {
    transform: translateY(1px);
  }
`;

const ButtonPrimary = styled(Button)`
  padding: 12px 18px;
`;

const InitBadge = styled.span`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #2a2a3a;
  background: ${(p) => (p.$active ? "#10281d" : "#2a1b1b")};
  color: ${(p) => (p.$active ? "#67e8a5" : "#e98a8a")};
`;

const DecisionBox = styled.div`
  border: 1px dashed #2a2a3a;
  border-radius: 8px;
  padding: 10px;
  min-height: 64px;
  background: #0e0e18;
`;

const DecisionTitle = styled.div`
  font-size: 12px;
  color: #9aa3b2;
  margin-bottom: 4px;
`;

const DecisionText = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #dfe3f0;
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`;

const Small = styled.span`
  color: #9aa3b2;
  font-size: 12px;
`;

/* ===== SW1 테스트 패널 스타일 ===== */
const Section = styled.div`
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  background: #151525;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.div`
  font-weight: 700;
  color: #c6c8ff;
`;

const TinyButton = styled.button`
  background: #1f1f2e;
  border: 1px solid #2a2a3a;
  color: #dfe3f0;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: #26263a; }
`;

const SmallInput = styled.input`
  width: 110px;
  background: #0e0e18;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  color: #f3f3f7;
  padding: 8px 10px;
  outline: none;
  font-size: 14px;
  &:focus { border-color: #7c3aed; }
`;


