// 곡명별 conic-gradient는 albumData.js에서 관리
// 호환성을 위해 re-export
export { getAlbumGradient as getAlbumGradientForTrack } from '@/utils/data/albumData';

// Simple dominant color picker from an image URL.
// Strategy: downscale to small canvas, average pixels weighted by saturation.
export async function getDominantColorFromImage(src, { sample = 24 } = {}) {
  const fallback = { h: 200, s: 40, l: 60, isFallback: true };

  // Helper to sample from an Image element (already loaded)
  const sampleImage = (img) => {
    try {
      const w = Math.max(1, Math.min(sample, img.naturalWidth));
      const h = Math.max(1, Math.min(sample, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let sumH = 0, sumS = 0, sumL = 0, weight = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let hVal = 0, s = 0;
        const d = max - min;
        if (d !== 0) {
          s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
          switch (max) {
            case r: hVal = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: hVal = ((b - r) / d + 2); break;
            case b: hVal = ((r - g) / d + 4); break;
          }
          hVal *= 60;
        }
        const wgt = 0.5 + s; // weight saturated pixels more
        sumH += hVal * wgt;
        sumS += (s * 100) * wgt;
        sumL += (l * 100) * wgt;
        weight += wgt;
      }
      if (weight <= 0) return fallback;
      return { h: sumH / weight, s: sumS / weight, l: sumL / weight, isFallback: false };
    } catch {
      return fallback;
    }
  };

  // Strategy: fetch as blob to avoid canvas taint, fallback to direct image load
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      try {
        const img = await new Promise((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = objectUrl;
        });
        const color = sampleImage(img);
        URL.revokeObjectURL(objectUrl);
        return color;
      } catch {
        URL.revokeObjectURL(objectUrl);
      }
    }
  } catch {
    // ignore and fall through
  }

  // Fallback: legacy crossOrigin path
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(sampleImage(img));
      img.onerror = () => resolve(fallback);
      img.src = src;
    } catch {
      resolve(fallback);
    }
  });
}


