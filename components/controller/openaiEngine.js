import { decideEnv } from '@/src/services/openai.service';
import { DEFAULT_ENV } from './stateStore';
import { normalizeEnv } from './logic/controllerMerge';
import { CONTROLLER_SYSTEM_PROMPT, USER_PREFERENCE_PROMPT, SW2_MAPPING_PROMPT } from '@/ai/prompts/controller';

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
  const locks = { temp: false, humidity: false };

  // Apply decisive targets (do not let later diversification move these)
  if (isCold) { out.temp = 28; locks.temp = true; }   // very warm within comfort
  if (isHot)  { out.temp = 20; locks.temp = true; }   // very cool within comfort
  if (isDry)  { out.humidity = 70; locks.humidity = true; }
  if (isHumid){ out.humidity = 35; locks.humidity = true; }

  return { env: out, locks };
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const v = m[1];
  return { r: parseInt(v.slice(0,2),16), g: parseInt(v.slice(2,4),16), b: parseInt(v.slice(4,6),16) };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(clamp(x, 0, 255)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

function diversifyEnv(env, userId = '', locks = { temp: false, humidity: false, lightColor: false }, timestamp = Date.now()) {
  const h = stableHash(String(userId || '0'));
  // Stronger, discretized, deterministic variance to make personal results clearly different
  const mix = (n) => {
    let x = n >>> 0;
    x ^= x >>> 16; x = (x * 0x7feb352d) >>> 0;
    x ^= x >>> 15; x = (x * 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const tempSteps = [-5, -2, +2, +5];     // °C
  const humSteps = [-25, -15, +15, +25];  // %
  const ti = mix(h) % tempSteps.length;
  const hi = mix(h * 1337) % humSteps.length;
  const tempDelta = tempSteps[ti];
  const humDelta = humSteps[hi];
  const out = { ...env };
  if (typeof out.temp === 'number') {
    out.temp = locks?.temp ? out.temp : clamp(out.temp + tempDelta, 18, 30);
  }
  if (typeof out.humidity === 'number') {
    out.humidity = locks?.humidity ? out.humidity : clamp(out.humidity + humDelta, 20, 80);
  }
  
  // Diversify lightColor based on userId and timestamp
  if (!locks?.lightColor && out.lightColor) {
    const rgb = hexToRgb(out.lightColor);
    if (rgb) {
      // Use userId and timestamp to create color variation (milliseconds for better variety)
      const colorSeed = mix(h * 7331 + timestamp);
      // Shift RGB values by small amounts (±20-30) to create variety while keeping it pleasant
      const rShift = (colorSeed % 41) - 20; // -20 to +20
      const gShift = (mix(colorSeed * 173) % 41) - 20;
      const bShift = (mix(colorSeed * 271) % 41) - 20;
      
      const originalColor = out.lightColor;
      out.lightColor = rgbToHex(
        clamp(rgb.r + rShift, 150, 255), // Keep in soft, pleasant range
        clamp(rgb.g + gShift, 150, 255),
        clamp(rgb.b + bShift, 150, 255)
      );
      
      console.log('🎨 [diversifyEnv] Light color diversification:', {
        userId,
        timestamp,
        originalColor,
        colorSeed,
        rShift,
        gShift,
        bShift,
        finalColor: out.lightColor
      });
    }
  }
  
  return out;
}

export async function requestControllerDecision({ userId, userContext, lastDecision, systemPrompt }) {
  // 사용자별 이전 음악 추적 (개인 디시전에서 사용)
  const userPreviousMusic = userContext?.lastDecision?.individual?.music || 
                            userContext?.lastPreference?.music || 
                            lastDecision?.env?.music || 
                            '';
  
  const result = await decideEnv({
    // Prefer provided override; default to USER_PREFERENCE_PROMPT so that
    // SW2 개인 결정도 컨트롤러용 기본 프롬프트를 공유한다.
    systemPrompt: systemPrompt || USER_PREFERENCE_PROMPT,
    latestConversation: [],
    currentProgram: {
      version: lastDecision?.version || 0,
      text: lastDecision?.reason || '',
      env: {
        ...(lastDecision?.env || DEFAULT_ENV),
        music: userPreviousMusic, // 사용자별 이전 음악 전달
      },
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
  const { env: withOverrides, locks } = applyClimateOverrides(initial, userContext?.lastVoice?.text || '');
  const timestamp = Date.now();
  
  console.log('🎵 [requestControllerDecision] Before diversification:', {
    userId,
    timestamp,
    music: result?.params?.music,
    lightColor: result?.params?.lightColor,
    temp: result?.params?.temp,
    humidity: result?.params?.humidity
  });
  
  const diversified = diversifyEnv(withOverrides, userId, { ...locks, lightColor: false }, timestamp);
  const finalEnv = normalizeEnv(diversified, userContext?.lastVoice?.emotion || '', { season: 'winter' });

  console.log('🎵 [requestControllerDecision] After diversification:', {
    userId,
    timestamp,
    music: finalEnv?.music,
    lightColor: finalEnv?.lightColor,
    temp: finalEnv?.temp,
    humidity: finalEnv?.humidity
  });

  return {
    env: finalEnv,
    reason: result?.reason || 'AI generated',
    flags: result?.flags || { offTopic: false, abusive: false },
    emotionKeyword: result?.emotionKeyword || '',
  };
}

