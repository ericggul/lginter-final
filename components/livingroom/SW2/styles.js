import styled, { keyframes } from 'styled-components';

export const Root = styled.div`
  width: 100vw;
  height: 56.25vw; /* 2160 / 3840 * 100 */
  aspect-ratio: 3840 / 2160;
  background: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

export const Container = styled.div`
  max-width: 15.625vw;
  width: 100%;
`;

export const Panel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(0.520833vw);
  border-radius: 0.651042vw;
  padding: 1.25vw 0.833333vw;
  box-shadow: 0 0.520833vw 1.5625vw rgba(147, 51, 234, 0.15);
  border: 0.026042vw solid rgba(147, 51, 234, 0.1);
`;

export const Title = styled.h1`
  font-size: 1.041667vw;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  margin-bottom: 0.208333vw;
  text-align: center;
`;

export const Subtitle = styled.p`
  color: #9333EA;
  font-size: 0.416667vw;
  opacity: 0.7;
  text-align: center;
  margin-bottom: 0.833333vw;
`;

export const TopStatus = styled.div`
  position: absolute;
  top: 2.8125vw;
  left: 50%;
  transform: translateX(-50%);
  color: #334155;
  font-weight: 600;
  letter-spacing: -0.005208vw;
  text-align: center;
  font-size: clamp(0.651042vw, 3.6vmin, 1.119792vw);
  text-shadow: 0 0.052083vw 0.3125vw rgba(0,0,0,0.08);
  pointer-events: none;
  z-index: 10;
`;

export const Dots = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 0.2em;
`;

export const Dot = styled.span`
  transition: opacity 120ms linear;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;

/* Full-bleed background image for selected Figma frame */
export const FrameBg = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: ${({ $url }) =>
    $url ? `url(${$url}) center / cover no-repeat` : 'transparent'};
  opacity: 0.8;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: linear-gradient(162.91deg, #FFEBC3 5.4%, #EBFFDF 33.4%, #EDECEB 81.12%);
    transform: rotate(90deg);
    transform-origin: center;
  }
`;

/* === Mobile blob motion (adapted) ===================================== */
export const CenterImage = styled.img`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(23.567708vw * 1.1);
  height: calc(23.567708vw * 1.1);
  object-fit: cover;
  border-radius: 2.604167vw;
  box-shadow: 0 0.78125vw 2.34375vw rgba(0, 0, 0, 0.28);
  z-index: 3;
`;

export const CaptionWrap = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(40% + 22vmin); /* position relative to small album card */
  text-align: center;
  pointer-events: none;
  z-index: 6;
`;

export const HeadText = styled.div`
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 600; /* Semi Bold */
  font-size: clamp(0.729167vw, 4.8vmin, 2.5vw);
  color: #111827;
  letter-spacing: 0.02em;
`;

export const SubText = styled.div`
  margin-top: 0.375vw; /* more space between head and sub text */
  font-family: Pretendard, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400; /* Regular */
  font-size: clamp(0.416667vw, 2.6vmin, 1.458333vw);
  color: #374151;
  letter-spacing: 0.02em;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625vw;
`;

export const Tile = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.390625vw;
  padding: 0.833333vw;
  border: 0.052083vw solid #F3E8FF;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625vw;
  margin-bottom: 0.625vw;
`;

export const ColorBox = styled.div`
  width: 2.083333vw;
  height: 2.083333vw;
  border-radius: 0.390625vw;
  background: ${(p) => p.$color};
  box-shadow: 0 0.208333vw 0.625vw ${(p) => (p.$color ? `${p.$color}80` : '#00000000')};
  border: 0.078125vw solid white;
`;

export const Flex1 = styled.div`
  flex: 1;
`;

export const LabelSmall = styled.div`
  font-size: 0.416667vw;
  color: #9333EA;
  opacity: 0.7;
  margin-bottom: 0.208333vw;
`;

export const ValueLarge = styled.div`
  font-size: 0.625vw;
  font-weight: 700;
  color: #9333EA;
`;

export const AssignedTag = styled.div`
  font-size: 0.375vw;
  color: #EC4899;
  font-weight: 600;
  margin-top: 0.3125vw;
  padding: 0.3125vw;
  background: rgba(236, 72, 153, 0.1);
  border-radius: 0.260417vw;
`;

export const Divider = styled.div`
  border-top: 0.052083vw solid #F3E8FF;
  padding-top: 0.625vw;
`;

export const SongTitle = styled.div`
  font-size: 0.541667vw;
  font-weight: 700;
  color: #9333EA;
  line-height: 1.4;
  margin-bottom: 0.416667vw;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const driftGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const LoadingBlock = styled.div`
  text-align: center;
  padding: 0.833333vw;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 0.3125vw;
`;

export const Spinner = styled.div`
  width: 1.041667vw;
  height: 1.041667vw;
  border: 0.078125vw solid #F3E8FF;
  border-top: 0.078125vw solid #9333EA;
  border-radius: 50%;
  margin: 0 auto;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingNote = styled.p`
  color: #9333EA;
  font-size: 0.375vw;
  margin-top: 0.416667vw;
  opacity: 0.7;
`;

export const PlayerWrap = styled.div`
  border-radius: 0.3125vw;
  overflow: hidden;
  box-shadow: 0 0.208333vw 0.625vw rgba(147, 51, 234, 0.15);
`;

export const PlayerNote = styled.p`
  font-size: 0.354167vw;
  color: #9333EA;
  margin-top: 0.208333vw;
  text-align: center;
  opacity: 0.7;
`;

export const SearchBlock = styled.div`
  padding: 0.416667vw;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 0.3125vw;
  text-align: center;
`;

export const SearchTitle = styled.p`
  color: #9333EA;
  font-size: 0.375vw;
  margin-bottom: 0.3125vw;
  opacity: 0.7;
`;

export const SearchLink = styled.a`
  display: inline-block;
  padding: 0.3125vw 0.625vw;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  color: white;
  text-decoration: none;
  border-radius: 0.260417vw;
  font-size: 0.395833vw;
  font-weight: 600;
  box-shadow: 0 0.104167vw 0.3125vw rgba(147, 51, 234, 0.3);
  transition: transform 0.2s;
  &:hover { transform: scale(1.05); }
`;

export const StatusCard = styled.div`
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  border-radius: 0.390625vw;
  padding: 0.625vw;
  text-align: center;
  color: white;
`;

export const StatusCaption = styled.div`
  font-size: 0.416667vw;
  opacity: 0.9;
  margin-bottom: 0.208333vw;
`;

export const StatusText = styled.div`
  font-size: 0.541667vw;
  font-weight: 700;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 1.25vw 0.833333vw;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.390625vw;
  border: 0.052083vw dashed rgba(147, 51, 234, 0.3);
`;

export const EmptyIcon = styled.div`
  font-size: 1.666667vw;
  margin-bottom: 0.416667vw;
  opacity: 0.5;
`;

export const EmptyText = styled.p`
  color: #9333EA;
  font-size: 0.5vw;
  opacity: 0.6;
`;

/* === Compact album card (square) ========================================= */
export const AlbumCard = styled.div`
  --album-size: min(60vmin, 18.5vw);
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--album-size);
  height: var(--album-size);
  border-radius: 1.929167vw;
  background: white;
  box-shadow: 0 0.625vw 1.822917vw rgba(0, 0, 0, 0.18);
  z-index: 4;
  overflow: hidden;
`;

export const AlbumImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const AlbumPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: white;
`;

export const Sw2InterestBox = styled.div`
  position: absolute;
  top: var(--blob-top, 28vw);
  left: var(--blob-left, 74vw);
  transform: translate(-50%, -50%);
  width: var(--blob-size, 52vw);
  height: var(--blob-size, 52vw);
  border-radius: 50%;
  border: 0.026042vw solid #FFF;
  background: linear-gradient(
    110deg,
    rgba(91, 76, 255, 0.42) 10%,
    rgba(255, 255, 255, 0.88) 28%,
    rgba(255, 132, 94, 0.42) 52%,
    rgba(55, 255, 252, 0.32) 74%,
    rgba(66, 255, 142, 0.38) 92%
  );
  background-size: 320% 320%;
  will-change: background-position, transform;
  box-shadow:
    0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38) inset,
    0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69) inset;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #A3A298;
  font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: 2.083333vw;
  letter-spacing: 0.01em;
  z-index: 1;
  animation: ${driftGradient} 9.3s ease-in-out infinite;

  &::before {
    content: '흥미로움';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.15625vw);
    -webkit-backdrop-filter: blur(0.15625vw);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }
`;

export const Sw2WonderBox = styled.div`
  position: absolute;
  top: var(--blob-top, 48vw);
  left: var(--blob-left, 20vw);
  transform: translate(-50%, -50%);
  width: var(--blob-size, 38vw);
  height: var(--blob-size, 38vw);
  border-radius: 50%;
  border: 0.026042vw solid #FFFFFF;
  background: linear-gradient(
    259.38deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(0, 0, 255, 0.5) 32%,
    rgba(170, 0, 255, 0.38) 56%,
    rgba(0, 255, 179, 0.52) 82%
  );
  background-size: 320% 320%;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #A3A298;
  font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: 2.083333vw;
  letter-spacing: 0.01em;
  z-index: 1;
  will-change: background-position, transform;
  animation: ${driftGradient} 9.8s ease-in-out infinite;

  &::before {
    content: '신기함';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
  }
`;

export const Sw2HappyBox = styled.div`
  position: absolute;
  top: var(--blob-top, 22vw);
  left: var(--blob-left, 28vw);
  transform: translate(-50%, -50%);
  width: var(--blob-size, 40vw);
  height: var(--blob-size, 40vw);
  border-radius: 50%;
  border: 0.026042vw solid #FFFFFF;
  background: linear-gradient(
    131.16deg,
    rgba(255, 255, 255, 0.92) 12%,
    rgba(255, 74, 158, 0.58) 34%,
    rgba(255, 255, 255, 0.88) 62%,
    rgba(255, 60, 120, 0.52) 88%
  );
  background-size: 320% 320%;
  box-shadow:
    inset 0 0.416667vw 0.268229vw rgba(255, 255, 255, 0.38),
    inset 0 -0.729167vw 0.804688vw rgba(255, 255, 255, 0.69);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #A3A298;
  font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
  font-size: 2.083333vw;
  letter-spacing: 0.01em;
  z-index: 1;
  will-change: background-position, transform;
  animation: ${driftGradient} 8.9s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    backdrop-filter: blur(0.078125vw);
    -webkit-backdrop-filter: blur(0.078125vw);
    background: rgba(255,255,255,0.0001);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0) 100%);
  }

  &::before {
    content: '행복함';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
  }
`;

