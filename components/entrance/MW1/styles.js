import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #000000;
  display: block;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
`;

export const LayerVideo = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background: #000000; /* avoid white flash during decode */
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition: opacity 600ms ease;
  will-change: opacity;
  pointer-events: none;
`;

export const CenterTip = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 600;
  font-size: clamp(16px, 3.6vw, 36px); /* smaller */
  color: #FFFFFF; /* white text only */
  background: transparent; /* no modal */
  border: 0;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  text-align: center;
  white-space: nowrap; /* single line, no wrapping/indent */
  text-indent: 0;
  pointer-events: none;
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transform-origin: 50% 50%;
  transition: opacity 600ms ease, transform 600ms ease;
  ${(p) => p.$show ? 'transform: translate(-50%, -50%) scale(1);' : 'transform: translate(-50%, -50%) scale(0.98);'}
`;

