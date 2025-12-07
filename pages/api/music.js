// Music file provider with Range support
// Maps a song name or catalog id to utils/data/music/<index>.mp3
// Query: /api/music?name=<title> or /api/music?id=<catalogId>

import fs from "fs";
import path from "path";
import { MUSIC_CATALOG } from "../../utils/data/musicCatalog";
import { getAlbumNumberByTrackName } from "../../utils/data/albumData";

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

  let num = 0;
  
  // Try albumData first (번호 기반 매핑)
  if (name) {
    const albumNum = getAlbumNumberByTrackName(name);
    if (albumNum) {
      num = albumNum;
    }
  }
  
  // Fallback to catalog index (legacy support)
  if (!num) {
    const idx = findCatalogIndex(String(name), String(id));
    if (idx < 0) {
      res.status(404).json({ error: "music-not-found" });
      return;
    }
    num = idx + 1; // fallback: array order (legacy)
  }

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

