// Simple sanitizer for emotion labels (Korean UI)
// - normalize to NFC
// - remove emoji/symbols
// - detect profanity/abusive/sexual words → replace with "불쾌해"
// - clamp to 2–5 Korean characters; fallback to "불쾌해" if empty

const PROFANITY_PATTERNS = [
  // Korean common profanities/slurs (partial, case-insensitive Latin variants included)
  /씨발|시발|씹|좆|존나|존내|병신|븅신|개새|개새끼|개색기|개년|니애미|니엄마|애미|엄마[^가-힣A-Za-z0-9]?죽|꺼져/i,
  /fuck|shit|bitch|asshole|bastard|dick|cunt|motherfucker|mf|wtf|suck/i,
  /sex|porno|porn|섹스|야동|야사/i,
];

function toNFC(text = '') {
  try { return text.normalize('NFC'); } catch { return text; }
}

function stripEmojiAndSymbols(text = '') {
  // Remove emoji and most symbols that are not letters/numbers/space/Korean
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^\p{Script=Hangul}\p{Letter}\p{Number}\s]/gu, '')
    .trim();
}

function containsProfanity(text = '') {
  const s = String(text || '');
  return PROFANITY_PATTERNS.some((re) => re.test(s));
}


function clampLenKorean(text = '') {
  // Keep 2–5 visible chars. If shorter than 2, try to pad/reduce smartly.
  const s = toNFC(String(text || '').trim());
  if (!s) return '';
  let out = s;
  // If longer than 5, try common reductions: remove particles/endings
  if (out.length > 5) {
    out = out
      .replace(/(하다|합니다|합니다요|했어요|했어|했음|임|임다|이에요|예요|네요|요)$/u, '')
      .replace(/(한|한가|다는|라는|으로|으로서|으로써)$/u, '')
      .trim();
  }
  if (out.length > 5) out = out.slice(0, 5);
  if (out.length < 2) {
    // If too short, return neutral safe label (not offensive)
    return '차분';
  }
  return out;
}

export function sanitizeEmotion(input, { strict = true } = {}) {
  let s = toNFC(String(input || '')).trim();
  s = stripEmojiAndSymbols(s);
  if (!s) return '차분';

  if (containsProfanity(s)) return '불쾌해';

  // Quick interjection mapping (Korean emotive tokens)
  const interjection = classifyInterjection(s);
  if (interjection) return interjection;

  // If contains any Latin-only or numbers-only
function classifyInterjection(text = '') {
  const s = String(text || '').trim();
  if (!s) return '';
  // Sad group: crying letters, interjections
  if (/(ㅠ+|ㅜ+|힝+|흑+|엉엉|슬퍼|서운|서럽|우울|속상)/.test(s)) return '슬픔';
  // Joy/laughing
  if (/(ㅎㅎ+|ㅋㅋ+|헤헷|하하|호호|캬+|꺄+|기쁨|행복|즐거|신남|설레)/.test(s)) return '기쁨';
  // Anger/annoyance
  if (/(빡치|열받|화나|분노|짜증|성남)/.test(s)) return '짜증';
  // Anxiety/worry
  if (/(불안|초조|걱정|긴장|두근두근|근심)/.test(s)) return '불안';
  // Tired/exhausted
  if (/(피곤|지침|힘들|녹초|고단|탈진)/.test(s)) return '피곤';
  // Bored
  if (/(지루|무료|심심)/.test(s)) return '지루함';
  // Surprise
  if (/(헉|헐|어머|어이구|세상에)/.test(s)) return '놀람';
  // Calm/relief
  if (/(편안|여유|차분|평온|안심)/.test(s)) return '차분';
  // Affection/love
  if (/(사랑|좋아해|호감|설레|두근)/.test(s)) return '설렘';
  return '';
}
  const hasKorean = /[가-힣]/.test(s);
  if (!hasKorean && strict) {
    // Try simple English cues
    const ls = s.toLowerCase();
    if (/sad|sorrow|depress|blue|cry/.test(ls)) return '슬픔';
    if (/happy|joy|glad|lol|haha|lmao/.test(ls)) return '기쁨';
    if (/angry|mad|annoy|rage/.test(ls)) return '짜증';
    if (/anx|worry|nerv|tense/.test(ls)) return '불안';
    if (/tired|exhaust|sleepy|fatigue/.test(ls)) return '피곤';
    if (/bored|dull/.test(ls)) return '지루함';
    if (/surprise|omg|wow/.test(ls)) return '놀람';
    // Unknown non-Korean → neutral
    return '차분';
  }

  // Common conversational endings → noun-ish
  s = s
    .replace(/(같아|같음|같다|같네요|같아요|같음)$/u, '')
    .replace(/(해요|했어요|했음|할래|하고싶|하고 싶|하고 싶다)$/u, '')
    .replace(/(기분|느낌|마음|상태)$/u, '') // reduce to core emotion
    .trim();

  s = clampLenKorean(s);
  if (!s) s = '차분';
  return s;
}

// Convert noun-ish labels to spoken/adjective style for UI
export function toSpokenEmotion(label = '') {
  const s = String(label || '').trim();
  if (!s) return '';
  // If already ends with common spoken endings, keep
  if (/(해|해요|했어|했어요|워|워요|나|났어|났어요|왔어|왔어요)$/u.test(s)) return s;
  const map = {
    '슬픔': '슬퍼',
    '기쁨': '기뻐',
    '행복': '행복해',
    '즐거움': '즐거워',
    '신남': '신나',
    '짜증': '짜증나',
    '분노': '화나',
    '불안': '불안해',
    '피곤': '피곤해',
    '지루함': '지루해',
    '놀람': '놀랐어',
    '차분': '차분해',
    '설렘': '설레',
    '우울': '우울해',
    '불쾌해': '불쾌해',
  };
  if (map[s]) return map[s];
  // Heuristic conversion: 끝이 '함/음/움' → '해/워'
  if (s.endsWith('함')) return s.slice(0, -1) + '해';
  if (s.endsWith('음') || s.endsWith('움')) return s.slice(0, -1) + '워';
  // Fallback
  return s + '해';
}

export default sanitizeEmotion;


