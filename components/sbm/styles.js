import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const modalIn = keyframes`
  0% { opacity: 0; transform: translateY(28px) scale(0.995); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
`;

const modalOut = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
  100% { opacity: 0; transform: translateY(-18px) scale(0.995); filter: blur(10px); }
`;

const arrowFlow = keyframes`
  0% { opacity: 0; transform: translateX(22px); filter: blur(4px); }
  18% { opacity: 0.92; filter: blur(0px); }
  78% { opacity: 0.75; }
  100% { opacity: 0; transform: translateX(-22px); filter: blur(4px); }
`;

const keywordMove = keyframes`
  0% { opacity: 0; transform: translate3d(30vw, -50%, 0) scale(0.995); filter: blur(16px); }
  12% { opacity: 1; transform: translate3d(0, -50%, 0) scale(1); filter: blur(0px); }
  88% { opacity: 1; transform: translate3d(-90vw, -50%, 0) scale(1); filter: blur(0px); }
  100% { opacity: 0; transform: translate3d(-130vw, -50%, 0) scale(0.995); filter: blur(14px); }
`;

export const Container = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  overflow: hidden;
  color: #fff;
`;

export const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding: 6vh 4vw;
`;

export const CenterText = styled.div`
  text-align: center;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: clamp(16px, 3vw, 32px) clamp(20px, 4vw, 48px);
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  max-width: 72vw;
  animation: ${fadeUp} 420ms ease;
  transition: transform 280ms ease, opacity 280ms ease;
  font-size: clamp(16px, 2.4vw, 26px);
  line-height: 1.15;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.55);
`;

export const QrWrap = styled.div`
  position: absolute;
  right: clamp(16px, 3vw, 32px);
  bottom: clamp(16px, 3vw, 32px);
  width: clamp(180px, 28vw, 300px);
  height: clamp(180px, 28vw, 300px);
  background: rgba(12, 12, 12, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 2.6vw, 18px);
  box-shadow:
    0 12px 26px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transform: ${({ $show }) => ($show ? "translateY(0)" : "translateY(10px)")};
  transition: opacity 320ms ease, transform 320ms ease;
  pointer-events: none;
`;

export const KeywordModalLayer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding: 6vh 4vw;
`;

export const KeywordModal = styled.div`
  pointer-events: none;
  text-align: center;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.20);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 34px;
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.58);
  padding: clamp(22px, 3.8vw, 46px) clamp(26px, 5.4vw, 72px);
  max-width: min(86vw, 980px);

  font-size: clamp(26px, 5vw, 64px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-shadow: 0 10px 36px rgba(0, 0, 0, 0.7);

  animation: ${({ $phase }) => ($phase === "out" ? modalOut : modalIn)} 520ms
    cubic-bezier(0.22, 1, 0.36, 1) forwards;
`;

export const ArrowGuideBar = styled.div`
  position: absolute;
  left: 50%;
  bottom: clamp(18px, 5.4vh, 46px);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: none;
  z-index: 40;
`;

export const Arrow = styled.div`
  width: 26px;
  height: 26px;
  position: relative;
  opacity: 0;
  animation: ${arrowFlow} 1200ms ease-in-out infinite;
  animation-delay: ${({ $delayMs }) => ($delayMs ? `${$delayMs}ms` : "0ms")};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-right: 4px solid rgba(255, 255, 255, 0.95);
    border-bottom: 4px solid rgba(255, 255, 255, 0.95);
    transform: rotate(135deg);
    border-radius: 2px;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))
      drop-shadow(0 0 24px rgba(255, 255, 255, 0.35));
  }
`;

export const MovingKeywordLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 18;
`;

export const MovingKeyword = styled.div`
  position: absolute;
  right: clamp(14px, 4vw, 34px);
  top: ${({ $topPct }) => (typeof $topPct === 'number' ? `${$topPct}%` : '44%')};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: min(78vw, 860px);
  padding: clamp(16px, 2.6vw, 28px) clamp(20px, 3.6vw, 40px);

  color: rgba(255, 255, 255, 0.98);
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  font-size: clamp(22px, 4.6vw, 54px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-shadow: 0 12px 40px rgba(255, 255, 255, 0.25), 0 10px 36px rgba(0, 0, 0, 0.65);
  box-shadow:
    0 26px 60px rgba(0, 0, 0, 0.52),
    0 0 26px rgba(255, 255, 255, 0.18);

  animation: ${keywordMove} ${({ $durationMs }) => (typeof $durationMs === 'number' ? `${$durationMs}ms` : '10000ms')}
    cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity, filter;
`;
