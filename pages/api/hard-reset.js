import { EV } from '@/src/core/events';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  // Socket.IO server instance is stored on the Next.js server object by /api/socket
  const io = res?.socket?.server?.io;
  if (!io) {
    res.status(503).json({
      ok: false,
      error: 'Socket server not initialized. Call /api/socket first.',
    });
    return;
  }

  const ts = Date.now();
  const body = req.body || {};
  const payload = {
    uuid: body?.uuid || `hard-reset-http-${ts}`,
    ts,
    source: body?.source || 'controller-hard-reset-http',
  };

  try {
    io.to('livingroom').emit(EV.HARD_RESET, payload);
    io.to('entrance').emit(EV.HARD_RESET, payload);
    io.to('controller').emit(EV.HARD_RESET, payload);
    res.status(200).json({ ok: true, payload });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}


