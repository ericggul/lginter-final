export function createSocketHandlers({ setKeywords, unifiedFont, setTv2Color, setTopTexts }) {
  // track unique users to shift top row only when a brand-new user speaks
  const seenUserIds = new Set();
  const onEntranceNewVoice = (data) => {
    console.log('📺 TV1 Component received entrance-new-voice:', data);
    const text = data.text || data.emotion || '알 수 없음';
    const fontSize = (Math.random() * 0.35 + 0.95).toFixed(2);
    const fontFamily = unifiedFont;
    const fontStyle = 'normal';
    const fontWeight = 800;
    setKeywords(prev => [{
      id: Date.now() + Math.random(),
      text: text,
      fontSize: `${fontSize}rem`,
      fontFamily,
      fontStyle,
      fontWeight,
      timestamp: Date.now()
    }, ...prev].slice(0, 18));

    // Play keyword blob sfx once per new keyword
    try {
      if (typeof window !== 'undefined') {
        const sfx = new Audio('/api/sfx?name=keywordblobtv1');
        // Let the browser policy decide if playback is allowed (may require prior user gesture)
        sfx.play().catch(() => {});
      }
    } catch {}

    // newest keyword goes to the leftmost top container; shift right
    const uid = String(data?.userId || '');
    const isNewUser = uid && !seenUserIds.has(uid);
    if (isNewUser) {
      seenUserIds.add(uid);
      setTopTexts((prev) => [text, prev[0], prev[1], prev[2]].slice(0, 4));
    } else {
      // for existing users, just update the first container text
      setTopTexts((prev) => [text, prev[1], prev[2], prev[3]]);
    }
  };

  const onDeviceDecision = (data) => {
    if (data?.device === 'sw2' && data.lightColor) setTv2Color(data.lightColor);
  };

  const onDeviceNewDecision = (msg) => {
    const env = msg?.env;
    if (!env) return;
    if ((msg?.target === 'tv2' || msg?.target === 'sw2') && env.lightColor) setTv2Color(env.lightColor);
  };

  return { onEntranceNewVoice, onDeviceDecision, onDeviceNewDecision };
}


