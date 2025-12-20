import { EV } from "@/src/core/events";

// Attach a hard-reset listener that reloads the page exactly once.
export function attachHardReset(socket) {
  if (!socket || typeof window === "undefined") return () => {};
  let reloading = false;
  let fallbackId = null;
  const handleReset = () => {
    if (reloading) return;
    reloading = true;
    try {
      window.location.reload();
    } catch {
      // ignore
    }
  };
  socket.on(EV.HARD_RESET, handleReset);

  // Optional client-side fallback timer (disabled by default)
  try {
    const raw = process.env.NEXT_PUBLIC_HARD_RESET_FALLBACK_MS || '0';
    const ms = Number(raw);
    if (Number.isFinite(ms) && ms > 0) {
      fallbackId = setInterval(() => {
        try { handleReset(); } catch {}
      }, ms);
    }
  } catch {}

  return () => {
    try {
      socket.off(EV.HARD_RESET, handleReset);
    } catch {
      // ignore
    }
    try {
      if (fallbackId) clearInterval(fallbackId);
    } catch {}
  };
}

export default attachHardReset;

