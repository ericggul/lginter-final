import { USER_PREFERENCE_PROMPT, CONTROLLER_SYSTEM_MIN_PROMPT } from '@/ai/prompts/controller';
import { DecisionZ } from '@/ai/schemas/decision';
import { callControllerTool } from '@/ai/adapters/openai';
import { MUSIC_CATALOG } from '@/utils/data/musicCatalog';

// Helpers to keep music deterministic and aligned to catalog (no rotation)
const CATALOG_TITLES = (MUSIC_CATALOG || []).map((m) => m.title);
function normalizeTitle(s = '') {
  return String(s).toLowerCase().replace(/[\s_\-]+/g, '').replace(/[^a-z0-9가-힣]/g, '');
}
function hashString(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return h;
}
function pickCatalogTitle({ baseTitle, previousTitle, emotion }) {
  if (!CATALOG_TITLES.length) return baseTitle || previousTitle || 'Solace';
  const titles = CATALOG_TITLES;
  const baseN = normalizeTitle(baseTitle || '');

  // If baseTitle is a valid catalog title, use it as-is (no forced rotation)
  if (baseN) {
    const baseIdx = titles.findIndex((t) => normalizeTitle(t) === baseN);
    if (baseIdx >= 0) return titles[baseIdx];
  }

  // Otherwise, deterministically map emotion → one title (stable across calls)
  const seed = emotion || baseTitle || 'music';
  const idx = hashString(seed) % titles.length;
  return titles[idx];
}

export async function decideController({ currentProgram = {}, currentUser = {}, previousMusicId = '', systemPrompt } = {}) {
  const payload = {
    currentProgram,
    currentUser,
    context: { previousMusicId },
  };
  // 기본은 사용자 개별 선호 프롬프트를 사용
  const sys = systemPrompt || USER_PREFERENCE_PROMPT || CONTROLLER_SYSTEM_MIN_PROMPT;
  const result = await callControllerTool({ systemPrompt: sys, conversation: [], userPayload: payload });

  // Validate with Zod, fallback minimally on failure
  let parsed = null;
  try {
    parsed = DecisionZ.parse(result);
  } catch {
    // minimal fallback mapped to expected shape
    return {
      params: { temp: 24, humidity: 50, lightColor: '#FFFFFF', music: 'solace' },
      reason: 'fallback',
      flags: { offTopic: false, abusive: false },
      emotionKeyword: '',
    };
  }

  // Map structured result -> internal params
  const temp = Math.round(Number(parsed.temperature_celsius));
  const humidity = Math.round(Number(parsed.humidity_percent));
  const lightColor = parsed.hex;
  const prevTitle = String(previousMusicId || currentProgram?.env?.music || '').trim();
  const baseTitle = String(parsed.music_title || '').trim();
  const music = pickCatalogTitle({ baseTitle, previousTitle: prevTitle, emotion: parsed.emotion });
  const lightingMode = parsed.lighting_mode;
  const lightingR = parsed.lighting_r ?? null;
  const lightingG = parsed.lighting_g ?? null;
  const lightingB = parsed.lighting_b ?? null;
  const lightingTempK = parsed.lighting_temp_k ?? null;

  return {
    params: { temp, humidity, lightColor, music, lightingMode, lightingR, lightingG, lightingB, lightingTempK },
    reason: parsed.similarity_reason || '',
    flags: { offTopic: false, abusive: false },
    emotionKeyword: parsed.emotion || '',
  };
}


