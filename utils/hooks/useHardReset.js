import { EV } from "@/src/core/events";

// Attach a hard-reset listener that reloads the page exactly once.
export function attachHardReset(socket) {
  if (!socket || typeof window === "undefined") return () => {};
  let reloading = false;
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
  return () => {
    try {
      socket.off(EV.HARD_RESET, handleReset);
    } catch {
      // ignore
    }
  };
}

export default attachHardReset;

