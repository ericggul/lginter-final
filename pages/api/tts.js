// Korean TTS proxy using OpenAI Audio API.
// Keeps response streaming to minimize latency.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not set' });
    return;
  }

  try {
    const { text, voice = 'marin', model = 'gpt-4o-mini-tts', format = 'mp3' } = req.body || {};
    const trimmed = (text || '').trim();
    if (!trimmed) {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    // TTS speaking style (kept separate from `input` so the spoken content stays the same)
    const instructions = 'Speak calm and kind. Like an exhibition docent. Bright tone.';

    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: trimmed,
        voice,
        format,
        instructions,
      }),
    });

    if (!upstream.ok) {
      let detail = '';
      try {
        detail = await upstream.text();
      } catch {}
      res
        .status(upstream.status)
        .json({ error: 'OpenAI TTS error', detail: detail || 'upstream error' });
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');

    if (!upstream.body) {
      res.status(500).json({ error: 'Empty upstream body' });
      return;
    }

    for await (const chunk of upstream.body) {
      res.write(Buffer.from(chunk));
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'OpenAI TTS proxy error', detail: String(err) });
  }
}

