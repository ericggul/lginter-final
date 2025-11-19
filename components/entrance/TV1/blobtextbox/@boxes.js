import styled, { keyframes } from 'styled-components';

const driftX = keyframes`
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
`;
const driftY = keyframes`
  0%   { background-position: 50%   0%; }
  50%  { background-position: 50% 100%; }
  100% { background-position: 50%   0%; }
`;
const driftDiag1 = keyframes`
  0%   { background-position:   0%   0%; }
  50%  { background-position: 100% 100%; }
  100% { background-position:   0%   0%; }
`;
const driftDiag2 = keyframes`
  0%   { background-position: 100%   0%; }
  50%  { background-position:   0% 100%; }
  100% { background-position: 100%   0%; }
`;
const driftDiag3 = keyframes`
  0%   { background-position:  20% -20%; }
  50%  { background-position: 120% 120%; }
  100% { background-position:  20% -20%; }
`;

// Shared base for all blob boxes to unify text style and padding
export const BlobBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  padding: 0 40px;
`;

export const InterestBox = styled(BlobBase)`
  position: absolute;
  top: 1820px;
  left: 250px;
  transform: translateY(-50%);
  width: 780px;
  height: 320px;
  border-radius: 300px;
  border: 1px solid #FFF;
  /* Boost contrast by introducing complementary warm hues and bright whites */
  background: linear-gradient(
    110deg,
    rgba(91, 76, 255, 0.42) 10%,
    rgba(255, 255, 255, 0.88) 28%,
    rgba(255, 132, 94, 0.42) 52%,
    rgba(55, 255, 252, 0.32) 74%,
    rgba(66, 255, 142, 0.38) 92%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: 0 16px 10.3px 0 rgba(255, 255, 255, 0.38) inset, 0 -28px 30.9px 0 rgba(255, 255, 255, 0.69) inset;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }
`;

export const PlayfulBox = styled(BlobBase)`
  position: absolute;
  top: 1820px;
  left: 1130px; /* to the right of InterestBox with 100px gap */
  transform: translateY(-50%);
  width: 930px;
  height: 320px;
  border-radius: 300px;
  border: 1px solid #FFFFFF;
  /* Increase contrast with bright whites and deeper oranges/sky */
  background: linear-gradient(
    240deg,
    rgba(255, 255, 255, 0.92) 10%,
    rgba(255, 148, 41, 0.58) 28%,
    rgba(255, 255, 255, 0.88) 48%,
    rgba(127, 225, 255, 0.52) 72%,
    rgba(255, 233, 110, 0.62) 92%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(3px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }
`;

export const UpsetBox = styled(BlobBase)`
  position: absolute;
  top: 850px; 
  left: 250px; 
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* Add warm amber to contrast the cool purples/blues */
  background: linear-gradient(
    151.58deg,
    rgba(152, 195, 231, 0.34) 8%,
    rgba(115, 75, 180, 0.38) 38%,
    rgba(255, 166, 102, 0.44) 66%,
    rgba(223, 141, 255, 0.36) 92%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
`;

export const ProudBox = styled(BlobBase)`
  position: absolute;
  top: 850px;
  left: 970px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* Stronger light/dark interplay with a magenta accent */
  background: linear-gradient(
    223.05deg,
    rgba(255, 255, 255, 0.92) 10%,
    rgba(88, 197, 255, 0.55) 28%,
    rgba(255, 130, 234, 0.42) 52%,
    rgba(198, 255, 141, 0.58) 76%,
    rgba(255, 255, 255, 0.88) 92%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
`;

export const ShyBox = styled(BlobBase)`
  position: absolute;
  top: 850px;
  left: 1690px;
  transform: translateY(-50%);
  width: 720px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* Gentle whites with playful pink against greens for contrast */
  background: linear-gradient(
    223.05deg,
    rgba(255, 255, 255, 0.92) 14%,
    rgba(249, 255, 162, 0.62) 30%,
    rgba(255, 125, 170, 0.45) 58%,
    rgba(140, 255, 215, 0.58) 82%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
`;

export const ChaoticBox = styled(BlobBase)`
  position: absolute;
  top: 850px;
  left: 2510px;
  transform: translateY(-50%);
  width: 720px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* High-contrast teal, violet, and salmon with white flashes */
  background: linear-gradient(
    223.05deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(140, 255, 215, 0.58) 32%,
    rgba(166, 120, 255, 0.45) 56%,
    rgba(255, 160, 141, 0.62) 82%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
`;

export const HappyBox = styled(BlobBase)`
  position: absolute;
  top: 1820px;
  left: 2160px; /* 100px gap to the right of PlayfulBox */
  transform: translateY(-50%);
  width: 700px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* Increase white vs pink contrast in the moving gradient */
  background: linear-gradient(
    131.16deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(255, 74, 158, 0.58) 34%,
    rgba(255, 255, 255, 0.88) 62%,
    rgba(255, 60, 120, 0.52) 88%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }
`;

export const AnnoyedBox = styled(BlobBase)`
  position: absolute;
  top: 2320px;
  left: 250px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  z-index: 1001;
  /* Sharper contrast with white flashes and warm tension */
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.88) 12%,
    rgba(91, 76, 255, 0.42) 36%,
    rgba(255, 80, 80, 0.35) 62%,
    rgba(55, 255, 252, 0.38) 84%,
    rgba(66, 255, 142, 0.42) 96%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
`;

export const HungryBox = styled(BlobBase)`
  position: absolute;
  top: 2320px;
  left: 970px; /* 250 + 620 + 100 */
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  z-index: 1001;
  /* More contrast for playful energy with white flashes */
  background: linear-gradient(
    243.46deg,
    rgba(255, 255, 255, 0.92) 8%,
    rgba(255, 120, 37, 0.6) 30%,
    rgba(255, 254, 172, 0.62) 56%,
    rgba(255, 72, 90, 0.45) 78%,
    rgba(127, 225, 255, 0.55) 94%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
`;

export const SadBox = styled(BlobBase)`
  position: absolute;
  top: 1330px;
  left: 250px;
  transform: translateY(-50%);
  width: 480px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* Add bright whites and deeper blues for stronger emotional contrast */
  background: linear-gradient(
    243.46deg,
    rgba(255, 255, 255, 0.92) 10%,
    rgba(30, 72, 255, 0.55) 34%,
    rgba(208, 136, 168, 0.55) 58%,
    rgba(129, 198, 255, 0.55) 82%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
`;

export const WonderBox = styled(BlobBase)`
  position: absolute;
  top: 1330px;
  left: 830px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  /* Add white shine and vivid blue/cyan for curiosity */
  background: linear-gradient(
    259.38deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(0, 0, 255, 0.5) 32%,
    rgba(170, 0, 255, 0.38) 56%,
    rgba(0, 255, 179, 0.52) 82%
  );
  background-size: 320% 320%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
`;

