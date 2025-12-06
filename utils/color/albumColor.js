// 곡명별 conic-gradient 매핑 (좌측 패널 배경용)
const TRACK_GRADIENT_MAP = {
  'lifeis': {
    colors: ['#D54C47', '#E89D4F', '#F5E266', '#486ECE', '#7C79A8'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'glow': {
    colors: ['#5BE0CD', '#EDBED0', '#88F0E7', '#F1DCD3', '#EFF3DD'],
    stops: [0, 121.15, 223.27, 270, 360],
  },
  'cleansoul': {
    colors: ['#512715', '#B56C34', '#F5E7C5', '#7FC7C1', '#013639'],
    stops: [0, 136.73, 223.27, 287.31, 360],
  },
  'borealis': {
    colors: ['#6C91AD', '#ABC7E4', '#EED8CA', '#C0DBB2', '#F0EFDD'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'happystroll': {
    colors: ['#F9B800', '#FF6B00', '#B35D1B', '#C8C291', '#F0EFDD'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'ukuleledance': {
    colors: ['#F25828', '#F7C8A8', '#FEFCEA', '#F3E4A6', '#E1DED1'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'happyalley': {
    colors: ['#62D8DD', '#AEABE4', '#FDFA8C', '#E2FBD5', '#A2D6AE'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'sunnysideup': {
    colors: ['#FF6F4B', '#ABC7E4', '#A2D6AE', '#E2FBD5', '#F0EFDD'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'newbeginnings': {
    colors: ['#B1C9AC', '#EDE2BA', '#F28700', '#F44600', '#A6A33B'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'solstice': {
    colors: ['#BE7D52', '#CAD6D8', '#DECCA1', '#FEF5F3', '#FDF8E8'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'solace': {
    colors: ['#2069CA', '#ABC7E4', '#D7DDE5', '#E2E2E2', '#E4E3FA'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'thetravellingsymphony': {
    colors: ['#334971', '#A5B6C1', '#BAD1C7', '#E5EDE0', '#355162'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'amberlight': {
    colors: ['#B5E3E8', '#ABC7E4', '#D6EFD8', '#FFE2BE', '#F7F7F7'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'echoes': {
    colors: ['#67A752', '#C3C9C3', '#E1C8C9', '#D2C3C3', '#E6DFB4'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'shouldersofgiants': {
    colors: ['#3F501F', '#74A654', '#E0A72F', '#EDD51D', '#F0EFDD'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
  'akindofhope': {
    colors: ['#2F3057', '#5182A0', '#9795BC', '#B8A1BE', '#ECEBCD'],
    stops: [0, 136.73, 223.27, 270, 360],
  },
};

// 곡명 정규화: 소문자 변환, 공백/특수문자 제거
function normalizeTrackName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '')
    .trim();
}

// 곡명으로 conic-gradient 정보 가져오기
export function getAlbumGradientForTrack(trackName) {
  if (!trackName) return null;
  
  // 여러 방법으로 정규화 시도
  const normalized1 = normalizeTrackName(trackName);
  const normalized2 = String(trackName).toLowerCase().trim();
  
  // 디버깅: 매칭 시도 로그
  if (typeof window !== 'undefined') {
    console.log('[TV2 Album Color] Matching track:', trackName);
    console.log('[TV2 Album Color] Normalized (no spaces):', normalized1);
    console.log('[TV2 Album Color] Normalized (lowercase only):', normalized2);
  }
  
  // 방법 1: 공백 제거 후 매칭
  let gradient = TRACK_GRADIENT_MAP[normalized1];
  if (gradient) {
    if (typeof window !== 'undefined') {
      console.log('[TV2 Album Color] ✓ Matched with normalized1:', normalized1);
    }
    return gradient;
  }
  
  // 방법 2: 원본 소문자로 직접 매칭 (공백 유지)
  gradient = TRACK_GRADIENT_MAP[normalized2];
  if (gradient) {
    if (typeof window !== 'undefined') {
      console.log('[TV2 Album Color] ✓ Matched with normalized2:', normalized2);
    }
    return gradient;
  }
  
  // 방법 3: 부분 매칭 시도 (공백 제거 버전)
  for (const [key, value] of Object.entries(TRACK_GRADIENT_MAP)) {
    if (normalized1.includes(key) || key.includes(normalized1)) {
      if (typeof window !== 'undefined') {
        console.log('[TV2 Album Color] ✓ Partially matched:', key);
      }
      return value;
    }
  }
  
  if (typeof window !== 'undefined') {
    console.log('[TV2 Album Color] ✗ No match for:', trackName);
    console.log('[TV2 Album Color] Available keys:', Object.keys(TRACK_GRADIENT_MAP));
  }
  
  return null;
}

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


