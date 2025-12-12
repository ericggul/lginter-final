// Single entrypoint for OpenAI decisions. JS-only.

const DEFAULT_TIMEOUT_MS = 6000; // faster failover to avoid UX stalls
// const USE_STRUCTURED = String(process.env.NEXT_PUBLIC_AI_STRUCTURED || '').toLowerCase() === 'true';
const USE_STRUCTURED = true;
console.log('USE_STRUCTURED', USE_STRUCTURED);

async function decideWithStructured({ currentProgram, currentUser, systemPrompt }) {
  const { decideController } = await import('@/ai/deciders/controller');
  const safe = await decideController({
    currentProgram,
    currentUser,
    previousMusicId: currentProgram?.env?.music,
    systemPrompt,
  });
  const { params, reason, flags, emotionKeyword } = safe || {};
  
  console.log('safe', safe);

  return {
    updatedProgram: { text: reason || '', version: (currentProgram?.version || 0) + 1, reason: reason || 'ai-structured' },
    params,
    reason: reason || 'ai-structured',
    flags: flags || { offTopic: false, abusive: false },
    emotionKeyword: emotionKeyword || '',
  };
}

function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('OpenAI timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

export async function decideEnv({ systemPrompt, latestConversation, currentProgram, currentUser }) {
  if (USE_STRUCTURED) {
    try {
      return await withTimeout(decideWithStructured({ currentProgram, currentUser, systemPrompt }), DEFAULT_TIMEOUT_MS);
    } catch (e) {
      // fall through to legacy path
    }
  }
  // Build chat messages and call through Next.js API proxy to keep API key server-side
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt || 'You are an environment decision engine.' },
      ...(latestConversation || []),
      { role: 'user', content: `Current program: ${JSON.stringify(currentProgram || {})}; Current user: ${JSON.stringify(currentUser || {})}` },
    ],
  };

  const req = fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${r.status}`);
    const content = data?.choices?.[0]?.message?.content || '';
    // naive extraction of JSON block
    const m = content.match(/\{[\s\S]*\}/);
    let parsed = null;
    try { parsed = m ? JSON.parse(m[0]) : null; } catch {}
    const params = parsed?.params || parsed || { temp: 24, humidity: 50, lightColor: '#FFFFFF', music: 'ambient' };
    const reason = parsed?.reason || 'ai-generated';
    const flags = parsed?.flags || { offTopic: false, abusive: false };
    const emotionKeyword = parsed?.emotionKeyword || '';
    return { updatedProgram: { text: content, version: (currentProgram?.version || 0) + 1, reason }, params, reason, flags, emotionKeyword };
  });

  try {
    return await withTimeout(req, DEFAULT_TIMEOUT_MS);
  } catch (e) {
    // fallback on timeout/error
    return {
      updatedProgram: { text: currentProgram?.text || 'timeout', version: (currentProgram?.version || 0) + 1, reason: 'degraded mode' },
      params: { temp: currentProgram?.temp || 24, humidity: currentProgram?.humidity || 50, lightColor: '#FFFFFF', music: 'ambient' },
      reason: 'degraded mode',
    };
  }
}

// Lightweight helper to generate a single empathetic Korean sentence.
// Uses the same proxy route to keep the API key server-side.
export async function generateEmpathyLine({ mood = '', userText = '', reason = '', hex = '', song = '' } = {}) {
  const sanitizedMood = String(mood || '').slice(0, 16);
  const user = String(userText || '').slice(0, 64);
  const r = String(reason || '').slice(0, 160);
  const sys = [
    'You are a Korean UX copywriter creating ONE empathetic sentence.',
    'Rules:',
    '- Output: Korean, 1 short sentence (<= 60 chars).',
    '- No profanity or abusive/sexual content; never echo profanity.',
    '- If mood is present, reflect it subtly; avoid repeating the exact word in quotes.',
    '- Maintain warm, concise tone; avoid imperative/commanding phrasing.',
  ].join('\n');

  const context = `mood="${sanitizedMood}", userText="${user}", reason="${r}", color="${hex}", music="${song}"`;
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: `Write one empathetic sentence for: ${context}` },
    ],
    max_tokens: 80,
    temperature: 0.7,
  };

  try {
    const resp = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${resp.status}`);
    const text = data?.choices?.[0]?.message?.content || '';
    return (text || '').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return '';
  }
}


