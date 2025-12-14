import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #050505;
  color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
`;

export const VideoWrap = styled.div`
  width: min(92vw, 1280px);
  aspect-ratio: 16 / 9;
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 12px 42px rgba(0, 0, 0, 0.45);
  background: #000;
`;

export const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const VideoLabel = styled.div`
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #e5e5e5;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 320ms ease;
`;

export const StageBadge = styled.div`
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 260ms ease;
`;

export const StatusDot = styled.span`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: ${({ $state }) =>
    $state === "connected" ? "#4ade80" : "#f97316"};
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.25);
`;
