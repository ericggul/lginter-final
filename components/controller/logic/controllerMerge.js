// Pure merge/normalize utils for Controller (inlined; no external policies)
import { DEFAULT_ENV } from '../stateStore';

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function normalizeTemperature(value, context = {}) {
  return clamp(typeof value === 'number' ? value : DEFAULT_ENV.temp ?? 24, -20, 40);
}

function normalizeWindLevel(value, emotionHint = '') {
  const base = clamp(Math.round(Number(value) || 3), 1, 5);
  const energetic = /활력|흥분|상쾌|경쾌|열정|active|energetic|excited|lively|upbeat|brisk|vibrant|charged|amped|stimulated|hype|euphoric|ecstatic|high[-\s]?energy/i.test(
    String(emotionHint || '')
  );
  return clamp(base + (energetic ? 1 : 0), 1, 5);
}

function normalizeHumidity(value, _emotionHint = '') {
  return clamp(typeof value === 'number' ? value : DEFAULT_ENV.humidity ?? 50, 20, 80);
}

function decidePurifierSettings(humidity, _emotionHint = '') {
  const h = clamp(humidity, 0, 100);
  if (h < 40) return { purifierOn: true, purifierMode: 'humidify' };
  if (h > 60) return { purifierOn: true, purifierMode: 'purify' };
  return { purifierOn: true, purifierMode: 'humidify_plus_purify' };
}

function normalizeLightColor(color, { soft = false } = {}) {
  if (typeof color === 'string' && /^#?[0-9a-fA-F]{6}$/.test(color)) {
    const hex = color.startsWith('#') ? color.toUpperCase() : ('#' + color.toUpperCase());
    return hex;
  }
  return DEFAULT_ENV.lightColor || '#FFFFFF';
}

function hexComplement(hex) {
  const v = (hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return normalizeLightColor(hex);
  const r = 255 - parseInt(v.slice(0, 2), 16);
  const g = 255 - parseInt(v.slice(2, 4), 16);
  const b = 255 - parseInt(v.slice(4, 6), 16);
  return rgbToHex(r, g, b);
}

function isNegativeEmotion(s = '') {
  const t = String(s || '').toLowerCase();
  return /(슬픔|우울|화|분노|짜증|불안|피곤|지침|스트레스|우울감|슬퍼|화나|짜증나|불편|불쾌|불행|불만|절망|좌절|angry|mad|upset|annoyed|irritated|stressed|anxious|anxiety|sad|depress|depressed|gloomy|frustrat|rage|furious|bad|terrible|awful|negative)/i.test(
    t
  );
}
function isMoodyEmotion(s = '') {
  const t = String(s || '').toLowerCase();
  return /(무드|무드있|mood|moody|차분|calm|chill|lofi|low[\s-]?key|melancholy|ambient|soothing|relax|relaxed|serene|peaceful|tranquil|mellow)/i.test(
    t
  );
}

function normalizeMusic(id, _emotionHint = '') {
  if (typeof id === 'string' && id.trim().length > 0) return id.trim();
  return DEFAULT_ENV.music || 'ambient';
}

export function normalizeEnv(params, emotionHint, context = {}) {
  if (!params) return { ...DEFAULT_ENV };
  const temp = normalizeTemperature(params.temp, context);
  const humidity = normalizeHumidity(params.humidity, emotionHint);
  const softTone = /부드럽|편안|휴식|따뜻|soft|calm|cozy|warm|relax|gentle|soothing|serene|peaceful|mellow|comfy/i.test(
    String(emotionHint || '')
  );
  const baseColor = normalizeLightColor(params.lightColor, { soft: softTone });
  // Rule: if emotion is negative → use complementary color; if moody/calm → keep; otherwise keep
  const lightColor = isNegativeEmotion(emotionHint) && !isMoodyEmotion(emotionHint) ? hexComplement(baseColor) : baseColor;
  const music = normalizeMusic(params.music, emotionHint);
  // Controller env is strictly 4 params
  return { temp, humidity, lightColor, music };
}

export function computeFairAverage(entries) {
  if (!entries.length) return { ...DEFAULT_ENV };

  const temps = entries.map((entry) => entry.params.temp ?? DEFAULT_ENV.temp);
  const humidities = entries.map((entry) => entry.params.humidity ?? DEFAULT_ENV.humidity);
  const colors = entries.map((entry) => entry.params.lightColor || DEFAULT_ENV.lightColor);
  const musicVotes = entries.map((entry) => entry.params.music || DEFAULT_ENV.music);

  const avgTemp = Math.round(temps.reduce((acc, value) => acc + value, 0) / temps.length);
  const avgHumidity = Math.round(humidities.reduce((acc, value) => acc + value, 0) / humidities.length);
  const avgColor = averageColors(colors);
  const music = majorityVote(musicVotes, DEFAULT_ENV.music);

  return { temp: avgTemp, humidity: avgHumidity, lightColor: avgColor, music };
}

function averageColors(colors) {
  if (!colors.length) return DEFAULT_ENV.lightColor;
  const rgbs = colors.map(hexToRgb);
  const avgR = Math.round(rgbs.reduce((sum, c) => sum + c.r, 0) / rgbs.length);
  const avgG = Math.round(rgbs.reduce((sum, c) => sum + c.g, 0) / rgbs.length);
  const avgB = Math.round(rgbs.reduce((sum, c) => sum + c.b, 0) / rgbs.length);
  return rgbToHex(avgR, avgG, avgB);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function majorityVote(items, fallback) {
  if (!items.length) return fallback;
  const counts = {};
  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });
  let winner = fallback;
  let maxCount = 0;
  Object.entries(counts).forEach(([key, count]) => {
    if (count > maxCount) {
      maxCount = count;
      winner = key;
    }
  });
  return winner;
}


