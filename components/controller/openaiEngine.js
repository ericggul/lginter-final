import { decideEnv } from '@/src/services/openai.service';
import { DEFAULT_ENV } from './stateStore';
import { normalizeEnv } from './logic/controllerMerge';
import { CONTROLLER_SYSTEM_PROMPT } from '@/ai/prompts/controller';

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function stableHash(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

function applyClimateOverrides(env, text = '') {
  const raw = String(text || '');
  const s = raw.toLowerCase();
  // Strong, explicit climate words → decisive extremes
  const isCold = /춥|추워|차갑|쌀쌀|cold|freez|chill|frigid/.test(s);
  const isHot = /덥|더워|후끈|hot|swelter|heatwave|boiling/.test(s);
  const isDry = /건조|마름|dry|parch|dehydrat/.test(s);
  const isHumid = /습|눅눅|꿉꿉|후텁지근|humid|muggy|sticky/.test(s);

  const out = { ...env };
  if (isCold) out.temp = Math.max(out.temp ?? 24, 28); // warmest comfort
  if (isHot) out.temp = Math.min(out.temp ?? 24, 20); // coolest comfort
  if (isDry) out.humidity = Math.max(out.humidity ?? 50, 68);
  if (isHumid) out.humidity = Math.min(out.humidity ?? 50, 38);
  return out;
}

function diversifyEnv(env, userId = '') {
  const h = stableHash(String(userId || '0'));
  // Deterministic, noticeable but safe variance
  const tempDelta = ((h % 7) - 3); // -3..+3 °C
  const humDelta = (((Math.floor(h / 7) % 31) - 15)); // -15..+15 %
  const out = { ...env };
  if (typeof out.temp === 'number') out.temp = clamp(out.temp + tempDelta, 18, 30);
  if (typeof out.humidity === 'number') out.humidity = clamp(out.humidity + humDelta, 20, 80);
  return out;
}

export async function requestControllerDecision({ userId, userContext, lastDecision, systemPrompt }) {
  const result = await decideEnv({
    // Prefer provided override; fall back to existing legacy prompt (used only in non-structured mode)
    systemPrompt: systemPrompt || CONTROLLER_SYSTEM_PROMPT,
    latestConversation: [],
    currentProgram: {
      version: lastDecision?.version || 0,
      text: lastDecision?.reason || '',
      env: lastDecision?.env || DEFAULT_ENV,
    },
    currentUser: {
      id: userId,
      name: userContext?.name || '',
      lastVoice: userContext?.lastVoice || null,
    },
  });

  // Normalize → apply decisive overrides from explicit user language → diversify per user → normalize again
  const initial = normalizeEnv(
    result?.params,
    userContext?.lastVoice?.emotion || '',
    { season: 'winter' }
  );
  const withOverrides = applyClimateOverrides(initial, userContext?.lastVoice?.text || '');
  const diversified = diversifyEnv(withOverrides, userId);
  const finalEnv = normalizeEnv(diversified, userContext?.lastVoice?.emotion || '', { season: 'winter' });

  return {
    env: finalEnv,
    reason: result?.reason || 'AI generated',
    flags: result?.flags || { offTopic: false, abusive: false },
    emotionKeyword: result?.emotionKeyword || '',
  };
}

