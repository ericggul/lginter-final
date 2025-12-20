// Simple sanitizer for emotion labels (Korean UI)
// - normalize to NFC
// - remove emoji/symbols
// - detect profanity/abusive/sexual words → map to sentiment or "불쾌해"
// - otherwise return the original text (no shortening/mapping)

const PROFANITY_PATTERNS = [
  // Korean common profanities/slurs (partial, case-insensitive Latin variants included)
  /씨발|시발|씹|좆|존나|존내|병신|븅신|개새|개새끼|개색기|개년|니애미|니엄마|애미|엄마[^가-힣A-Za-z0-9]?죽|꺼져/i,
  /fuck|shit|bitch|asshole|bastard|dick|cunt|motherfucker|mf|wtf|suck/i,
  /sex|porno|porn|섹스|야동|야사/i,
];

// Conservative profane sentiment heuristics (only fire when very clear)
const PROFANE_POSITIVE = [
  /(기모찌|개?좋|개?맛|개?쩔|쩐다|지린다|지렸다|오진다|미쳤다|미쳤네|레전드)/i,
];
const PROFANE_SURPRISE = [
  /(와\s*씨발|와\s*시발|와\s*ㅅㅂ|헐\s*씨발|헐\s*시발)/i,
  /(오진다|대박|미쳤네|미쳤다|쩐다)/i,
];
const PROFANE_NEGATIVE = [
  /(개빡|빡치|짜증|ㅈ같|좆같|뭐야|최악|노답|혐)/i,
];
const PROFANE_INSULT_OR_SEXUAL = [
  // Strong insults/sexual → always fail closed to 불쾌해
  /(니엄마|니애미|애미죽|씨발년|씨발놈|창녀|강간|성폭력|sex|porno|porn|섹스|야동|야사)/i,
];

// Minimal, conservative patterns for self-harm/suicidal ideation (fail closed to '슬퍼')
const SELF_HARM_PATTERNS = [
  /죽고\s*싶(다|어|어요|네|음|당|다구)?/i,
  /자살|극단(적)?\s*선택|목숨\s*(을\s*)?(끊|버리)/i,
  /살기\s*싫(다|어|어요)/i,
];

// Minimal pattern for problematic '멘헤라' usage (map to '불쾌해')
const MENHERA_PATTERN = /(멘헤라)/i;

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

function classifyProfaneSentiment(text = '') {
  const s = String(text || '');
  if (!s) return null;
  // If strong insult/sexual content exists, do not attempt positive mapping
  if (PROFANE_INSULT_OR_SEXUAL.some((re) => re.test(s))) return null;
  if (PROFANE_POSITIVE.some((re) => re.test(s))) return '신나';
  if (PROFANE_SURPRISE.some((re) => re.test(s))) return '놀람';
  if (PROFANE_NEGATIVE.some((re) => re.test(s))) return '짜증';
  return null;
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

  // Self-harm / suicidal ideation → '슬퍼' (fail-closed, very conservative)
  try {
    if (SELF_HARM_PATTERNS.some((re) => re.test(s))) {
      return '슬퍼';
    }
  } catch {}

  // '멘헤라' usage → '불쾌해' (avoid showing stigmatizing term)
  try {
    if (MENHERA_PATTERN.test(s)) {
      return '불쾌해';
    }
  } catch {}

  // Filter ambiguous negative / rejection phrases that should not appear as-is.
  // Examples: "꺼지세요", "꺼져주세요" (interpersonal "go away", not a device command)
  try {
    const compact = s.replace(/\s+/g, '');
    const isGoAway =
      /^꺼지(세요|세여|세용|십시오|십쇼|라)?$/.test(compact) ||
      /^꺼져(요|주세요|주세|줘요|줘|라)?$/.test(compact);
    if (isGoAway) return '짜증';
  } catch {}

  // Profanity/sexual content → map or fail-closed
  if (containsProfanity(s)) {
    const profaneSentiment = classifyProfaneSentiment(s);
    if (profaneSentiment) return profaneSentiment;
    return '불쾌해';
  }

  // Non-problematic text: return as-is (normalized, emoji-stripped)
  return s;
}

// Retained for potential future use (not used by sanitizeEmotion)
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
