export function playSfx(nameOrFile, options = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const { volume = 1.0, loop = false } = options || {};
    const isFile = /\.[a-z0-9]+$/i.test(String(nameOrFile || ''));
    const src = isFile
      ? `/api/sfx?file=${encodeURIComponent(String(nameOrFile))}`
      : `/api/sfx?name=${encodeURIComponent(String(nameOrFile))}`;
    const audio = new Audio(src);
    const vol = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1.0;
    audio.volume = vol;
    audio.loop = !!loop;
    // Non-blocking; browsers may require a prior user gesture to allow autoplay
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
    return audio;
  } catch {
    return null;
  }
}


