export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name') || '';
    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const { createReadStream, promises: fsp } = await import('fs');
    const path = await import('path');

    const root = process.cwd();
    const albumDir = path.join(root, 'utils', 'data', 'album');
    const publicDir = path.join(root, 'public', 'sw2_albumcover');
    let files = [];
    try { files = await fsp.readdir(albumDir); } catch {}

    const simplify = (s) => String(s).toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
    const want = simplify(name);

    // Allow numeric filenames (1.png ~ 16.png) via mapping from canonical names/ids
    const NAME_TO_NUM = {
      lifeisscott: '1', lifeis: '1',
      glowscott: '2', glow: '2',
      cleansoulcalming: '3', cleansoul: '3',
      borealis: '4',
      happystroll: '5',
      ukuleledance: '6', ukeleledance: '6',
      happyalley: '7',
      sunnysideup: '8',
      newbeginnings: '9',
      solstice: '10',
      solace: '11',
      thetravellingsymphony: '12', travellingsymphony: '12', travelingsymphony: '12',
      amberlight: '13',
      echoes: '14',
      shouldersofgiants: '15',
      akindofhope: '16'
    };

    let chosen = null;

    // 0) Try numeric mapping first
    const mapped = NAME_TO_NUM[want];
    if (mapped) {
      const asData = path.join(albumDir, `${mapped}.png`);
      try { await fsp.access(asData); chosen = asData; } catch {}
      if (!chosen) {
        const asPublic = path.join(publicDir, `${mapped}.png`);
        try { await fsp.access(asPublic); chosen = asPublic; } catch {}
      }
    }

    for (const f of files) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      const base = f.slice(0, -4);
      const simple = simplify(base);
      if (simple === want) { chosen = path.join(albumDir, f); break; }
    }
    if (!chosen) {
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.png')) continue;
        const base = f.slice(0, -4);
        const simple = simplify(base);
        if (simple.includes(want) || want.includes(simple)) { chosen = path.join(albumDir, f); break; }
      }
    }

    if (!chosen) {
      // 폴백: public/sw2_albumcover에서 시도
      let pubFiles = [];
      try { pubFiles = await fsp.readdir(publicDir); } catch {}
      for (const f of pubFiles) {
        if (!f.toLowerCase().endsWith('.png')) continue;
        const base = f.slice(0, -4);
        const simple = simplify(base);
        if (simple === want) { chosen = path.join(publicDir, f); break; }
      }
      if (!chosen) {
        for (const f of pubFiles) {
          if (!f.toLowerCase().endsWith('.png')) continue;
          const base = f.slice(0, -4);
          const simple = simplify(base);
          if (simple.includes(want) || want.includes(simple)) { chosen = path.join(publicDir, f); break; }
        }
      }
    }

    if (!chosen) {
      res.status(204).end();
      return;
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    createReadStream(chosen).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'album serve error', detail: String(err) });
  }
}


