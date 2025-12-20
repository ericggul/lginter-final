// Styles for the mobile press overlay using styled-components

import styled from 'styled-components';
import { spacing } from '../styles/tokens';
import { z } from '../styles/shared/elevation';

export const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${z.overlay};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: ${spacing.press.bottom};
  pointer-events: ${(p) => (p.$active ? 'none' : 'auto')};
  -webkit-tap-highlight-color: transparent;
`;

export const HitArea = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const Dot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 16px rgba(255,255,255,0.95), 0 0 36px rgba(255,255,255,0.7);
  animation: ${(p) => p.$anim || 'none'};
`;

export const RingPulse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,255,255,0) 58%, rgba(255,255,255,0.9) 68%, rgba(255,255,255,0.55) 74%, rgba(255,255,255,0) 86%);
  filter: blur(8px);
  mix-blend-mode: screen;
  opacity: 0;
  animation: ${(p) => p.$anim || 'none'};
`;



