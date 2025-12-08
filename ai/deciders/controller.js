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
function pickCatalogTitle({ baseTitle, previousTitle, emotion, userId, timestamp, forceVariety = false }) {
  if (!CATALOG_TITLES.length) return baseTitle || previousTitle || 'Solace';
  const titles = CATALOG_TITLES;
  const baseN = normalizeTitle(baseTitle || '');

  // For personal decisions (forceVariety=true), ignore AI suggestion and always use userId+timestamp
  // This ensures maximum variety - different music per user and per call
  if (forceVariety && userId) {
    // Always use userId + timestamp (milliseconds) for variety, ignoring AI suggestion
    // Add multiple factors to ensure variety: userId, emotion, timestamp (ms), and baseTitle hash
    const baseHash = baseN ? hashString(baseN) : 0;
    // Add a counter-like factor based on userId hash to ensure different users get different music
    const userHash = hashString(userId);
    // Use microsecond precision (timestamp % 1000) for better variety in rapid requests
    const microSecond = timestamp % 1000;
    const seed = `${userId}:${emotion || 'music'}:${timestamp}:${microSecond}:${userHash}:${baseHash}`;
    let idx = hashString(seed) % titles.length;
    
    // Always try to avoid previous music if possible (even if previousTitle is empty, use userHash to vary)
    const prevNormalized = previousTitle ? normalizeTitle(previousTitle) : '';
    const selectedNormalized = normalizeTitle(titles[idx]);
    
    // If same as previous OR if no previous but we want variety, try to shift
    if ((prevNormalized && prevNormalized === selectedNormalized) || (!prevNormalized && titles.length > 1)) {
      // Use multiple factors to determine offset for maximum variety
      const offsetSeed = hashString(`${userId}:${timestamp}:${microSecond}:${userHash}`);
      const offset = (offsetSeed % (titles.length - 1)) + 1;
      idx = (idx + offset) % titles.length;
      
      // Double-check: if still same, try another offset
      const newSelected = normalizeTitle(titles[idx]);
      if (prevNormalized && prevNormalized === newSelected && titles.length > 2) {
        idx = (idx + 1) % titles.length;
      }
    }
    
    console.log('🎵 [pickCatalogTitle] Personal decision:', {
      userId,
      emotion,
      timestamp,
      microSecond,
      userHash,
      seed: seed.substring(0, 100) + '...',
      selectedIndex: idx,
      selectedTitle: titles[idx],
      previousTitle,
      baseTitle,
      forceVariety: true,
      totalTitles: titles.length
    });
    
    return titles[idx];
  }

  // For aggregated decisions, allow AI suggestion if valid
  if (baseN) {
    const baseIdx = titles.findIndex((t) => normalizeTitle(t) === baseN);
    if (baseIdx >= 0) return titles[baseIdx];
  }

  // Fallback: use emotion-based selection
  let seed = emotion || baseTitle || 'music';
  if (userId) {
    seed = `${userId}:${seed}`;
  }
  if (timestamp) {
    seed = `${seed}:${Math.floor(timestamp / (1000 * 60))}`;
  }
  
  const idx = hashString(seed) % titles.length;
  
  if (previousTitle) {
    const prevNormalized = normalizeTitle(previousTitle);
    const selectedNormalized = normalizeTitle(titles[idx]);
    if (prevNormalized === selectedNormalized && titles.length > 1) {
      const nextIdx = (idx + 1) % titles.length;
      return titles[nextIdx];
    }
  }
  
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
  
  // 1. Pick a canonical title from the catalog
  // For personal decisions, force variety by ignoring AI suggestion
  const userId = currentUser?.id || '';
  const timestamp = Date.now();
  console.log('🎵 [decideController] Starting music selection:', {
    userId,
    baseTitle,
    previousTitle: prevTitle,
    emotion: parsed.emotion,
    timestamp,
    hasUserId: !!userId
  });
  
  const musicTitle = pickCatalogTitle({ 
    baseTitle, 
    previousTitle: prevTitle, 
    emotion: parsed.emotion,
    userId: userId,
    timestamp: timestamp,
    forceVariety: !!userId // Force variety for personal decisions (ignore AI suggestion)
  });
  
  console.log('🎵 [decideController] Selected music:', {
    userId,
    musicTitle,
    baseTitle,
    forceVariety: !!userId
  });
  
  // 2. Append artist if found in catalog (ensure "Title - Artist" format for devices)
  const catalogEntry = MUSIC_CATALOG.find((m) => normalizeTitle(m.title) === normalizeTitle(musicTitle));
  const music = catalogEntry && catalogEntry.artist 
    ? `${catalogEntry.title} - ${catalogEntry.artist}`
    : musicTitle;

  // 3. Diversify lightColor for personal decisions
  let finalLightColor = lightColor;
  if (userId && timestamp && lightColor) {
    // Import color diversification logic (similar to diversifyEnv)
    const hexToRgb = (hex) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
      if (!m) return null;
      const v = m[1];
      return { r: parseInt(v.slice(0,2),16), g: parseInt(v.slice(2,4),16), b: parseInt(v.slice(4,6),16) };
    };
    
    const rgbToHex = (r, g, b) => {
      const clamp = (n, min, max) => Math.max(min, Math.min(max, Math.round(n)));
      return '#' + [r, g, b].map(x => {
        const hex = clamp(x, 0, 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('').toUpperCase();
    };
    
    const rgb = hexToRgb(lightColor);
    if (rgb) {
      // Create color variation based on userId and timestamp
      const hashUser = (s) => {
        let h = 0;
        for (let i = 0; i < s.length; i += 1) {
          h = (h * 31 + s.charCodeAt(i)) >>> 0;
        }
        return h;
      };
      
      const mix = (n) => {
        let x = n >>> 0;
        x ^= x >>> 16; x = (x * 0x7feb352d) >>> 0;
        x ^= x >>> 15; x = (x * 0x846ca68b) >>> 0;
        x ^= x >>> 16;
        return x >>> 0;
      };
      
      const h = hashUser(userId);
      // Use milliseconds for better variety across calls
      const colorSeed = mix(h * 7331 + timestamp);
      const rShift = (colorSeed % 41) - 20; // -20 to +20
      const gShift = (mix(colorSeed * 173) % 41) - 20;
      const bShift = (mix(colorSeed * 271) % 41) - 20;
      
      console.log('🎨 [decideController] Light color diversification:', {
        userId,
        timestamp,
        originalColor: lightColor,
        colorSeed,
        rShift,
        gShift,
        bShift,
        finalColor: finalLightColor
      });
      
      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
      finalLightColor = rgbToHex(
        clamp(rgb.r + rShift, 150, 255), // Keep in soft, pleasant range
        clamp(rgb.g + gShift, 150, 255),
        clamp(rgb.b + bShift, 150, 255)
      );
    }
  }

  const lightingMode = parsed.lighting_mode;
  const lightingR = parsed.lighting_r ?? null;
  const lightingG = parsed.lighting_g ?? null;
  const lightingB = parsed.lighting_b ?? null;
  const lightingTempK = parsed.lighting_temp_k ?? null;

  return {
    params: { temp, humidity, lightColor: finalLightColor, music, lightingMode, lightingR, lightingG, lightingB, lightingTempK },
    reason: parsed.similarity_reason || '',
    flags: { offTopic: false, abusive: false },
    emotionKeyword: parsed.emotion || '',
  };
}
