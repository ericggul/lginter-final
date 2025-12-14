import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
