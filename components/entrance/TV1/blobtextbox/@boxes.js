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

export const InterestBox = styled.div`
  position: absolute;
  top: 1820px;
  left: 250px;
  transform: translateY(-50%);
  width: 780px;
  height: 320px;
  border-radius: 300px;
  border: 1px solid #FFF;
  background: linear-gradient(99deg, rgba(91, 76, 255, 0.09) 23.61%, rgba(55, 255, 252, 0.05) 73.24%, rgba(66, 255, 142, 0.07) 92.2%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: 0 16px 10.3px 0 rgba(255, 255, 255, 0.38) inset, 0 -28px 30.9px 0 rgba(255, 255, 255, 0.69) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
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

export const PlayfulBox = styled.div`
  position: absolute;
  top: 1820px;
  left: 1150px; /* to the right of InterestBox */
  transform: translateY(-50%);
  width: 930px;
  height: 320px;
  border-radius: 300px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(243.46deg, rgba(255, 120, 37, 0.1932) 3.42%, rgba(255, 254, 172, 0.168) 65.14%, rgba(127, 225, 255, 0.1344) 88.72%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
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

export const UpsetBox = styled.div`
  position: absolute;
  top: 850px; 
  left: 250px; 
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(151.58deg, rgba(152, 195, 231, 0.22) 9.45%, rgba(115, 75, 180, 0.22) 53.21%, rgba(223, 141, 255, 0.22) 80.72%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`;

export const ProudBox = styled.div`
  position: absolute;
  top: 850px;
  left: 990px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(223.05deg, rgba(88, 197, 255, 0.3) 13.85%, rgba(255, 245, 166, 0.3) 53.4%, rgba(198, 255, 141, 0.3) 90.85%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`;

export const ShyBox = styled.div`
  position: absolute;
  top: 850px;
  left: 1730px;
  transform: translateY(-50%);
  width: 720px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(223.05deg, rgba(249, 255, 162, 0.35) 18.66%, rgba(198, 255, 141, 0.35) 49.39%, rgba(140, 255, 215, 0.35) 90.85%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`;

export const ChaoticBox = styled.div`
  position: absolute;
  top: 850px;
  left: 2570px;
  transform: translateY(-50%);
  width: 720px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(223.05deg, rgba(140, 255, 215, 0.31) 13.85%, rgba(255, 160, 141, 0.31) 90.85%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`;

export const HappyBox = styled.div`
  position: absolute;
  top: 1820px;
  left: 2200px; /* same gap to the right of PlayfulBox */
  transform: translateY(-50%);
  width: 700px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(131.16deg, rgba(255, 0, 217, 0.1855) 17.16%, rgba(104, 255, 182, 0.07) 72.86%, rgba(234, 255, 127, 0.182) 94.13%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
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

export const AnnoyedBox = styled.div`
  position: absolute;
  top: 2296px;
  left: 250px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(98.92deg, rgba(91, 76, 255, 0.092) 23.61%, rgba(55, 255, 252, 0.046) 73.24%, rgba(66, 255, 142, 0.069) 92.2%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    background: rgba(255,255,255,0.0001);
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

export const HungryBox = styled.div`
  position: absolute;
  top: 2296px;
  left: 990px; /* 250 + 620 + 120 */
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(243.46deg, rgba(255, 120, 37, 0.1932) 3.42%, rgba(255, 254, 172, 0.168) 65.14%, rgba(127, 225, 255, 0.1344) 88.72%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  opacity: 0.69;
  overflow: hidden; /* clip blur overlays to rounded shape */
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    background: rgba(255,255,255,0.0001);
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
    z-index: 2;
  }
`;

export const SadBox = styled.div`
  position: absolute;
  top: 1350px;
  left: 250px;
  transform: translateY(-50%);
  width: 480px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(243.46deg, rgba(208, 136, 168, 0.35) 3.42%, rgba(107, 128, 255, 0.35) 45%, rgba(129, 198, 255, 0.35) 78%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`;

export const WonderBox = styled.div`
  position: absolute;
  top: 1350px;
  left: 870px;
  transform: translateY(-50%);
  width: 620px;
  height: 320px;
  border-radius: 400px;
  border: 1px solid #FFFFFF;
  background: linear-gradient(259.38deg, rgba(0, 0, 255, 0.1696) 14.53%, rgba(0, 98, 255, 0.064) 59.58%, rgba(0, 255, 179, 0.064) 86.83%);
  background-size: 280% 280%;
  animation: ${driftX} 10.4s ease-in-out infinite;
  will-change: background-position;
  box-shadow: inset 0px 16px 10.3px rgba(255, 255, 255, 0.38), inset 0px -28px 30.9px rgba(255, 255, 255, 0.69);
  color: #000000;
  font-family: ${(p) => p.$fontFamily};
  font-size: 150px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
`;

