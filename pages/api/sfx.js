// Sound Effects provider with basic Range support
// Serves files from utils/data/soundeffect
// Usage:
//   /api/sfx?name=keywordblobtv1           -> utils/data/soundeffect/keywordblobtv1.mp3
//   /api/sfx?file=keywordblobtv1.mp3       -> utils/data/soundeffect/keywordblobtv1.mp3
//
// This mirrors the approach in pages/api/music.js but simplified for SFX.

import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

function sanitizeBaseName(input = "") {
  const raw = String(input || "").trim();
  // strip any directory segments and keep only safe chars
  const base = path.basename(raw).toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  return base;
}

export default async function handler(req, res) {
  try {
    const q = req.query || {};
    let fileName = "";
    if (q.name) {
      const base = sanitizeBaseName(q.name);
      fileName = `${base.replace(/\.mp3$/i, "")}.mp3`;
    } else if (q.file) {
      const base = sanitizeBaseName(q.file);
      fileName = base.endsWith(".mp3") ? base : `${base}.mp3`;
    } else {
      res.status(400).json({ error: "missing-name-or-file" });
      return;
    }

    const filePath = path.join(process.cwd(), "utils", "data", "soundeffect", fileName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "sfx-not-found", file: fileName });
      return;
    }

    const stat = fs.statSync(filePath);
    const range = req.headers.range;
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=3600, immutable");

    if (range) {
      const m = /^bytes=(\d+)-(\d+)?$/.exec(range);
      if (m) {
        const start = parseInt(m[1], 10);
        const end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
        if (start >= stat.size || end >= stat.size || start > end) {
          res.status(416).setHeader("Content-Range", `bytes */${stat.size}`);
          res.end();
          return;
        }
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
        res.setHeader("Content-Length", String(end - start + 1));
        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }

    res.status(200);
    res.setHeader("Content-Length", String(stat.size));
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "sfx-serve-error", detail: e?.message || String(e) });
  }
}


