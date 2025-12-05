// Simple dominant color picker from an image URL.
// Strategy: downscale to small canvas, average pixels weighted by saturation.
export async function getDominantColorFromImage(src, { sample = 24 } = {}) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
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
          // weight more saturated pixels
          const wgt = 0.5 + s;
          sumH += hVal * wgt;
          sumS += (s * 100) * wgt;
          sumL += (l * 100) * wgt;
          weight += wgt;
        }
        if (weight <= 0) return resolve({ h: 200, s: 40, l: 60 });
        resolve({ h: sumH / weight, s: sumS / weight, l: sumL / weight });
      };
      img.onerror = () => resolve({ h: 200, s: 40, l: 60 });
      img.src = src;
    } catch {
      resolve({ h: 200, s: 40, l: 60 });
    }
  });
}


