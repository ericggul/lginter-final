import { CONTROLLER_SYSTEM_MIN_PROMPT } from '@/ai/prompts/controller';
import { DecisionZ } from '@/ai/schemas/decision';
import { callControllerTool } from '@/ai/adapters/openai';

export async function decideController({ currentProgram = {}, currentUser = {}, previousMusicId = '', systemPrompt } = {}) {
  const payload = {
    currentProgram,
    currentUser,
    context: { previousMusicId },
  };
  const sys = systemPrompt || CONTROLLER_SYSTEM_MIN_PROMPT;
  const result = await callControllerTool({ systemPrompt: sys, conversation: [], userPayload: payload });

  // Validate with Zod, fallback minimally on failure
  let safe = null;
  try {
    safe = DecisionZ.parse(result);
  } catch {
    // minimal fallback
    safe = {
      params: { temp: 24, humidity: 50, lightColor: '#FFFFFF', music: 'life-is-scott' },
      reason: 'fallback',
      flags: { offTopic: false, abusive: false },
      emotionKeyword: '',
    };
  }
  return safe;
}


