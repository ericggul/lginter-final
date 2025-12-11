export * from "../../SW1/logic/color";

// Tier helpers: inner/mid/outer saturation & lightness 조정
export function tierToSaturation(tier, baseS) {
  const s = typeof baseS === "number" ? baseS : 70;
  // 중앙(inner)은 훨씬 쨍하게, 바깥으로 갈수록 빠르게 무채색에 가까워지도록
  if (tier === "inner") return s * 1.35;    // 가장 안쪽: 기본보다 더 강하게
  if (tier === "mid") return s * 0.75;      // 중간: 한 단계 더 쨍하게
  return s * 0.25;                          // 바깥: 살짝 색이 보이는 정도로 상향
}

export function tierToLightness(tier, baseL) {
  const l = typeof baseL === "number" ? baseL : 66;
  // 채도가 강해진 inner는 살짝 더 어둡게 해서 대비를 키움
  if (tier === "inner") return Math.max(0, l - 4);
  if (tier === "mid") return Math.min(100, l + 8);
  return Math.min(100, l + 20);
}

export function applyTierToHsl(h, s, l, tier) {
  const sat = tierToSaturation(tier, s);
  const light = tierToLightness(tier, l);
  return { h, s: sat, l: light };
}
