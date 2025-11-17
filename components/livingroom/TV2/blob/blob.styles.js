import styled, { keyframes } from 'styled-components';

export const Root = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

const breathe = keyframes`
  0% { flex-basis: 24%; }
  50% { flex-basis: 26%; }
  100% { flex-basis: 24%; }
`;

export const PanelRow = styled.div`
  position: absolute; inset: 0;
  display: flex; gap: 0;
`;

export const Panel = styled.div`
  position: relative;
  flex: 0 0 auto;
  contain: layout paint;
  overflow: hidden;
  /* springy transition (quick overshoot/settle) + ~10s freeze per state (44s loop total) */
  /* States: A(0%)→B(25%)→C(50%)→D(75%)→A(100%) */
  @keyframes p1 {
    /* A: 36% */ 0%{ width:36%; }
    2%{ width:27%; } 3.5%{ width:29.5%; } 5%{ width:28%; } /* spring to B (28%) */
    25%{ width:28%; } /* freeze ~10s */
    27%{ width:23%; } 28.5%{ width:21%; } 30%{ width:22%; } /* to C (22%) */
    50%{ width:22%; }
    52%{ width:31.5%; } 53.5%{ width:29%; } 55%{ width:30%; } /* to D (30%) */
    75%{ width:30%; }
    77%{ width:37.5%; } 78.5%{ width:34%; } 80%{ width:36%; } /* back to A (36%) */
    100%{ width:36%; }
  }
  @keyframes p2 {
    /* A: 18% */ 0%{ width:18%; }
    2%{ width:36%; } 3.5%{ width:32%; } 5%{ width:34%; } /* B: 34% */
    25%{ width:34%; }
    27%{ width:19.5%; } 28.5%{ width:17%; } 30%{ width:18%; } /* C: 18% */
    50%{ width:18%; }
    52%{ width:13%; } 53.5%{ width:15.5%; } 55%{ width:14%; } /* D: 14% */
    75%{ width:14%; }
    77%{ width:20.5%; } 78.5%{ width:17.5%; } 80%{ width:18%; } /* A: 18% */
    100%{ width:18%; }
  }
  @keyframes p3 {
    /* A: 16% */ 0%{ width:16%; }
    2%{ width:14%; } 3.5%{ width:17.5%; } 5%{ width:16%; } /* B: 16% (almost same, light spring) */
    25%{ width:16%; }
    27%{ width:45%; } 28.5%{ width:39%; } 30%{ width:42%; } /* C: 42% */
    50%{ width:42%; }
    52%{ width:12%; } 53.5%{ width:16.5%; } 55%{ width:14%; } /* D: 14% */
    75%{ width:14%; }
    77%{ width:17.5%; } 78.5%{ width:15%; } 80%{ width:16%; } /* A: 16% */
    100%{ width:16%; }
  }
  @keyframes p4 {
    /* A: 30% */ 0%{ width:30%; }
    2%{ width:20%; } 3.5%{ width:24%; } 5%{ width:22%; } /* B: 22% */
    25%{ width:22%; }
    27%{ width:16%; } 28.5%{ width:20%; } 30%{ width:18%; } /* C: 18% */
    50%{ width:18%; }
    52%{ width:45%; } 53.5%{ width:39%; } 55%{ width:42%; } /* D: 42% */
    75%{ width:42%; }
    77%{ width:27%; } 78.5%{ width:31%; } 80%{ width:30%; } /* A: 30% */
    100%{ width:30%; }
  }
  /* grow variable synced with width for child blob intensity */
  @keyframes g1 {
    0%{ --grow:.9; --blur:3px; }
    5%{ --grow:.7; --blur:4px; }
    25%{ --grow:.6; --blur:5px; }
    30%{ --grow:.25; --blur:6px; }
    50%{ --grow:.25; --blur:6px; }
    55%{ --grow:.7; --blur:4px; }
    75%{ --grow:.7; --blur:4px; }
    80%{ --grow:.9; --blur:3px; }
    100%{ --grow:.9; --blur:3px; }
  }
  @keyframes g2 {
    0%{ --grow:.35; --blur:6px; }
    5%{ --grow:.95; --blur:3px; }
    25%{ --grow:.95; --blur:3px; }
    30%{ --grow:.35; --blur:6px; }
    50%{ --grow:.35; --blur:6px; }
    55%{ --grow:.15; --blur:6px; }
    75%{ --grow:.15; --blur:6px; }
    80%{ --grow:.35; --blur:6px; }
    100%{ --grow:.35; --blur:6px; }
  }
  @keyframes g3 {
    0%{ --grow:.25; --blur:6px; }
    25%{ --grow:.25; --blur:6px; }
    30%{ --grow:1.0; --blur:3px; }
    50%{ --grow:1.0; --blur:3px; }
    55%{ --grow:.15; --blur:6px; }
    75%{ --grow:.15; --blur:6px; }
    80%{ --grow:.25; --blur:6px; }
    100%{ --grow:.25; --blur:6px; }
  }
  @keyframes g4 {
    0%{ --grow:.7; --blur:4px; }
    5%{ --grow:.35; --blur:6px; }
    25%{ --grow:.35; --blur:6px; }
    30%{ --grow:.25; --blur:6px; }
    50%{ --grow:.25; --blur:6px; }
    55%{ --grow:1.0; --blur:3px; }
    75%{ --grow:1.0; --blur:3px; }
    80%{ --grow:.7; --blur:4px; }
    100%{ --grow:.7; --blur:4px; }
  }
  &:nth-child(1){ animation: p1 40s linear infinite, g1 40s linear infinite; --delay: 0s; }
  &:nth-child(2){ animation: p2 40s linear infinite, g2 40s linear infinite; --delay: .15s; }
  &:nth-child(3){ animation: p3 40s linear infinite, g3 40s linear infinite; --delay: .3s; }
  &:nth-child(4){ animation: p4 40s linear infinite, g4 40s linear infinite; --delay: .45s; }
`;

export const BlobLayer = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  filter: none;
  display: grid;
  place-items: center; /* 항상 중앙 정렬 */
  transition: opacity 1200ms ease-in-out;
`;

// 블롭이 자연스럽게 커졌다가 작아지는 숨쉬는 모션
const blobBreath = keyframes`
  0%, 100% {
    /* 살짝 더 작아진 상태를 기준으로 시작/끝 */
    transform: translate(var(--blob-tx, 0), var(--blob-ty, 0))
               scale(calc(var(--blob-scale-base, 1) * 0.92));
  }
  50% {
    /* 정점에서 확실히 커졌다가 */
    transform: translate(var(--blob-tx, 0), var(--blob-ty, 0))
               scale(calc(var(--blob-scale-base, 1) * 1.12));
  }
`;

export const BlobCircle = styled.div`
  position: relative;
  /* 패널 비율이 바뀌어도 원형이 찌그러지지 않도록 고정 비율 유지 */
  aspect-ratio: 1 / 1;
  width: min(120%, 60vmin);
  border-radius: 50%;
  /* 기본 transform 은 애니메이션에서 제어 (Leva 값 포함) */
  transform-origin: center;
  /* 블롭 전체 외곽을 부드럽게 풀어주는 심플 블러 */
  filter: blur(var(--blob-blur, 14px));
  transition: background 900ms ease-in-out, filter 900ms ease-in-out;
  animation: ${blobBreath} 6s ease-in-out infinite;

  /* Figma 기준:
     - 중앙: 살짝 탁한 베이지/카키톤
     - 중간: 핑크빛이 강한 링
     - 바깥: 어두운 회색빛이 퍼지다가 투명해짐 */
  background:
    radial-gradient(circle at 50% 50%,
      var(--blob-inner-color, rgba(203, 198, 163, 1)) 0%,
      var(--blob-inner-color, rgba(203, 198, 163, 1)) var(--blob-inner-stop, 32%),
      var(--blob-ring-color, rgba(247, 187, 176, 1)) var(--blob-ring-inner-stop, 46%),
      var(--blob-ring-color, rgba(247, 187, 176, 1)) var(--blob-ring-outer-stop, 68%),
      rgba(0, 0, 0, 0.0) 100%);

  /* 더 이상 별도 halo 레이어는 사용하지 않음 – 단일 블롭만 블러 처리 */
`;


