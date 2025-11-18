import { MUSIC_CATALOG } from '../data/musicCatalog';

// Centralized music category mapping and simple tokenizer (moved from ai/policies/music.map.js)
const MUSIC_CATEGORY_MAP = {
  '잔잔/위로': ['clean-soul', 'life-is-scott', 'borealis', 'echoes'],
  '사색/평정/시네마틱': ['echoes', 'borealis', 'solstice', 'travelling-symphony'],
  '산책/낮은에너지/어쿠스틱': ['happy-stroll', 'sunny-side-up', 'ukulele-dance'],
  '휴식/여유/편안': ['clean-soul', 'life-is-scott', 'glow-scott'],
  '희망/새로운시작/긍정': ['a-kind-of-hope', 'glow-scott', 'life-is-scott'],
  '몰입/웅장': ['shoulders-of-giants', 'travelling-symphony'],
  '정화/정리': ['solace', 'solstice', 'echoes'],
};

function categoryCandidates(emotion = '') {
  const e = String(emotion || '').replace(/\s+/g, '').toLowerCase();
  const picks = [];
  const rules = [
    ['잔잔/위로', ['잔잔', '위로', '차분', '평온', '진정']],
    ['사색/평정/시네마틱', ['사색', '평정', '고요', '시네마틱']],
    ['산책/낮은에너지/어쿠스틱', ['산책', '낮은에너지', '어쿠스틱']],
    ['휴식/여유/편안', ['휴식', '여유', '편안']],
    ['희망/새로운시작/긍정', ['희망', '새로운시작', '긍정']],
    ['몰입/웅장', ['몰입', '웅장']],
    ['정화/정리', ['정화', '정리']],
  ];
  rules.forEach(([key, tokens]) => {
    if (tokens.some((t) => e.includes(t))) picks.push(...(MUSIC_CATEGORY_MAP[key] || []));
  });
  return picks;
}

function seededShuffle(arr, seed = 1) {
  const a = [...arr];
  let x = Math.abs(seed) + 1;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 1664525 + 1013904223) % 4294967296;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function avoidPrevious(list, prev) {
  const uniq = list.filter((id, idx) => list.indexOf(id) === idx);
  if (!prev) return uniq;
  const i = uniq.indexOf(prev);
  if (i > -1 && uniq.length > 1) {
    const [hit] = uniq.splice(i, 1);
    uniq.push(hit);
  }
  return uniq;
}

export function pickMusicByEmotion(emotionText, previousMusicId = '', seed = Date.now()) {
  const e = String(emotionText || '').toLowerCase();
  const byCategory = categoryCandidates(e);
  const byTags = MUSIC_CATALOG.filter(
    (t) =>
      (t.mood || []).some((m) => e.includes(String(m).toLowerCase())) ||
      (t.tags || []).some((tag) => e.includes(String(tag).toLowerCase()))
  ).map((t) => t.id);
  const candidates = seededShuffle([...byCategory, ...byTags], Math.floor(seed / 60000)); // rotate each minute
  const ordered = avoidPrevious(candidates, previousMusicId);
  return ordered[0] || MUSIC_CATALOG[0]?.id;
}

export function normalizeMusic(input, emotionText, context = {}) {
  const ids = new Set(MUSIC_CATALOG.map((t) => t.id));
  if (ids.has(input)) return input;
  const prev = context?.previousMusicId || '';
  return pickMusicByEmotion(emotionText, prev);
}


