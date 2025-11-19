import { USER_PREFERENCE_PROMPT, CONTROLLER_SYSTEM_MIN_PROMPT } from '@/ai/prompts/controller';
import { DecisionZ } from '@/ai/schemas/decision';
import { callControllerTool } from '@/ai/adapters/openai';

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
  const music = String(parsed.music_title || '').trim() || 'solace';
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


