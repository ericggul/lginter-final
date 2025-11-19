// Music file provider with Range support
// Maps a song name or catalog id to utils/data/music/<index>.mp3
// Query: /api/music?name=<title> or /api/music?id=<catalogId>

import fs from "fs";
import path from "path";
import { MUSIC_CATALOG } from "../../utils/data/musicCatalog";

export const config = {
  api: { bodyParser: false },
};

function normalize(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/[\s_\-]+/g, "")
    .replace(/[^a-z0-9가-힣]/g, "");
}

const ALIASES = new Map([
  ["lifeis", "life is"],
  ["glow", "glow"],
  ["cleansoulcalming", "clean soul"], // catalog title is simplified
  ["borealis", "borealis"],
  ["solstice", "solstice"],
  ["newbeginnings", "new beginnings"],
  ["solace", "solace"],
  ["thetravellingsymphony", "the travelling symphony"],
  ["happystroll", "happy stroll"],
  ["ukuleledance", "ukulele dance"],
  ["happyalley", "happy alley"],
  ["sunnysideup", "sunny side up"],
  ["amberlight", "amberlight"],
  ["shouldersofgiants", "shoulders of giants"],
  ["echoes", "echoes"],
  ["akindofhope", "a kind of hope"],
]);

function findCatalogIndex(queryName = "", queryId = "") {
  const qId = String(queryId || "").trim();
  if (qId) {
    const idx = MUSIC_CATALOG.findIndex((m) => m.id === qId);
    if (idx >= 0) return idx;
  }
  const raw = String(queryName || "").trim();
  if (!raw) return -1;
  const n = normalize(raw);
  const aliasTitle = ALIASES.get(n);
  // Try title exact/normalized, then alias, then id normalized
  const idxTitle = MUSIC_CATALOG.findIndex((m) => normalize(m.title) === n);
  if (idxTitle >= 0) return idxTitle;
  if (aliasTitle) {
    const idxAlias = MUSIC_CATALOG.findIndex((m) => normalize(m.title) === normalize(aliasTitle));
    if (idxAlias >= 0) return idxAlias;
  }
  const idxById = MUSIC_CATALOG.findIndex((m) => normalize(m.id) === n);
  return idxById;
}

export default async function handler(req, res) {
  const { name = "", id = "" } = req.query || {};
  const idx = findCatalogIndex(String(name), String(id));
  if (idx < 0) {
    res.status(404).json({ error: "music-not-found" });
    return;
  }
  const num = idx + 1; // files are 1-based
  const filePath = path.join(process.cwd(), "utils", "data", "music", `${num}.mp3`);
  try {
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "file-not-found" });
      return;
    }
    const stat = fs.statSync(filePath);
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d+)-(\d+)?$/.exec(range);
      if (m) {
        const start = parseInt(m[1], 10);
        const end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
        if (start >= stat.size || end >= stat.size) {
          res.status(416).setHeader("Content-Range", `bytes */${stat.size}`);
          res.end();
          return;
        }
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", String(end - start + 1));
        res.setHeader("Content-Type", "audio/mpeg");
        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
    res.status(200);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(stat.size));
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=3600, immutable");
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "music-serve-error", detail: e?.message || String(e) });
  }
}

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
    const musicDir = path.join(root, 'utils', 'data', 'music');
    let files = [];
    try { files = await fsp.readdir(musicDir); } catch {}

    const simplify = (s) => String(s).toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
    const want = simplify(name);

    // Allow numeric filenames (1.mp3 ~ 16.mp3) via mapping from canonical names/ids
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
      const nPath = path.join(musicDir, `${mapped}.mp3`);
      try { await fsp.access(nPath); chosen = nPath; } catch {}
    }

    for (const f of files) {
      if (!f.toLowerCase().endsWith('.mp3')) continue;
      const base = f.slice(0, -4);
      const simple = simplify(base);
      if (simple === want) { chosen = path.join(musicDir, f); break; }
    }
    if (!chosen) {
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.mp3')) continue;
        const base = f.slice(0, -4);
        const simple = simplify(base);
        if (simple.includes(want) || want.includes(simple)) { chosen = path.join(musicDir, f); break; }
      }
    }

    if (!chosen) {
      // 마지막 폴백: 아무 mp3나 스트리밍 (없으면 404)
      const first = files.find(f => f.toLowerCase().endsWith('.mp3'));
      if (first) chosen = path.join(musicDir, first);
    }

    if (!chosen) {
      res.status(404).json({ error: 'music not found' });
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    createReadStream(chosen).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'music serve error', detail: String(err) });
  }
}


