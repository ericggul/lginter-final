// Source-of-truth Emotion → Color spec for SW2 mini blobs.
// Each entry defines an angle (deg) and three HSL stops (center, mid, outer).
// Center will be the main emotion color; mid keeps a yellowish band; outer keeps pinkish band.
// NOTE: Database is easily extendable; unlisted keywords fall back to '설렘'.
export const EMOTION_DB = {
  // 3️⃣ 고에너지-긍정 (대표 샘플)
  '설렘': { angle: 249, center: { h: 302, s: 100, l: 60 }, mid: { h: 310, s: 84, l: 77 }, outer: { h: 262, s: 84, l: 97 } },
  '기쁨': { angle: 19,  center: { h: 51,  s: 100, l: 60 }, mid: { h: 292, s: 84, l: 77 }, outer: { h: 231, s: 84, l: 97 } },
  '경쾌': { angle: 288, center: { h: 187, s: 100, l: 60 }, mid: { h: 309, s: 84, l: 77 }, outer: { h: 211, s: 84, l: 97 } },
  '발돋움': { angle: 341, center: { h: 337, s: 100, l: 60 }, mid: { h: 279, s: 84, l: 77 }, outer: { h: 235, s: 84, l: 97 } },
  '활력': { angle: 295, center: { h: 307, s: 100, l: 60 }, mid: { h: 161, s: 84, l: 77 }, outer: { h: 226, s: 84, l: 97 } },
  '자기확신': { angle: 135, center: { h: 86,  s: 100, l: 60 }, mid: { h: 284, s: 84, l: 77 }, outer: { h: 280, s: 84, l: 97 } },

  // 2️⃣ 고에너지-인지 (대표 샘플)
  '집중': { angle: 162, center: { h: 271, s: 100, l: 60 }, mid: { h: 257, s: 84, l: 77 }, outer: { h: 252, s: 84, l: 97 } },
  '명료': { angle: 327, center: { h: 300, s: 100, l: 60 }, mid: { h: 192, s: 84, l: 77 }, outer: { h: 254, s: 84, l: 97 } },
  '호기심': { angle: 250, center: { h: 267, s: 100, l: 60 }, mid: { h: 182, s: 84, l: 77 }, outer: { h: 83,  s: 84, l: 97 } },
  '영감': { angle: 135, center: { h: 214, s: 100, l: 60 }, mid: { h: 279, s: 84, l: 77 }, outer: { h: 275, s: 84, l: 97 } },

  // 1️⃣ 고에너지-부정 (대표 샘플)
  '분노': { angle: 196, center: { h: 0,   s: 100, l: 60 }, mid: { h: 325, s: 84, l: 77 }, outer: { h: 301, s: 84, l: 97 } },
  '긴장': { angle: 148, center: { h: 0,   s: 100, l: 60 }, mid: { h: 23,  s: 84, l: 77 }, outer: { h: 0,   s: 84, l: 97 } },
  '경계': { angle: 163, center: { h: 46,  s: 100, l: 60 }, mid: { h: 100, s: 84, l: 77 }, outer: { h: 229, s: 84, l: 97 } },

  // 6️⃣ 이완/안정 (대표 샘플)
  '평온': { angle: 103, center: { h: 200, s: 100, l: 60 }, mid: { h: 218, s: 84, l: 77 }, outer: { h: 172, s: 84, l: 97 } },
  '차분함': { angle: 209, center: { h: 74,  s: 100, l: 60 }, mid: { h: 217, s: 84, l: 77 }, outer: { h: 86,  s: 84, l: 97 } },
  '편안': { angle: 115, center: { h: 156, s: 100, l: 60 }, mid: { h: 147, s: 84, l: 77 }, outer: { h: 298, s: 84, l: 97 } },
};

export const DEFAULT_KEY = '설렘';

export function getEmotionEntry(keyword) {
  const k = String(keyword || '').trim();
  if (!k) return EMOTION_DB[DEFAULT_KEY];
  // exact match first
  if (EMOTION_DB[k]) return EMOTION_DB[k];
  // simple normalization (remove spaces)
  const n = k.replace(/\s+/g, '');
  if (EMOTION_DB[n]) return EMOTION_DB[n];
  return EMOTION_DB[DEFAULT_KEY];
}


