// Album cover provider (keep user's numeric mapping 1.png ~ 16.png)
// Query: /api/album?name=<songName-like>
import { getAlbumNumberByTrackName, getAlbumByNumber } from '@/utils/data/albumData';

export const config = { api: { bodyParser: false } };

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

    let chosen = null;

    // 0) Try numeric mapping first using albumData
    const albumNum = getAlbumNumberByTrackName(name);
    if (albumNum) {
      const albumData = getAlbumByNumber(albumNum);
      if (albumData) {
        const mapped = String(albumNum);
        const asData = path.join(albumDir, `${mapped}.png`);
        try { await fsp.access(asData); chosen = asData; } catch {}
        if (!chosen) {
          const asPublic = path.join(publicDir, `${mapped}.png`);
          try { await fsp.access(asPublic); chosen = asPublic; } catch {}
        }
      }
    }

    // 1) Try exact filename match in utils/data/album
    if (!chosen) {
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.png')) continue;
        const base = f.slice(0, -4);
        const simple = simplify(base);
        if (simple === want) { chosen = path.join(albumDir, f); break; }
      }
    }

    // 2) Try partial match
    if (!chosen) {
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.png')) continue;
        const base = f.slice(0, -4);
        const simple = simplify(base);
        if (simple.includes(want) || want.includes(simple)) { chosen = path.join(albumDir, f); break; }
      }
    }

    // 3) Fallback to public/sw2_albumcover
    if (!chosen) {
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

