import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_CONFIG } from '../constants';
import { EV } from '@/src/core/events';
import attachHardReset from './useHardReset';

export default function useSocketController(options = {}) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const handlersRef = useRef({
    onNewUser: options.onNewUser,
    onNewName: options.onNewName,
    onNewVoice: options.onNewVoice,
    onUserLeft: options.onUserLeft,
    onDeviceHeartbeat: options.onDeviceHeartbeat,
  });

  // keep latest handlers without rebinding listeners
  useEffect(() => {
    handlersRef.current = {
      onNewUser: options.onNewUser,
      onNewName: options.onNewName,
      onNewVoice: options.onNewVoice,
      onUserLeft: options.onUserLeft,
      onDeviceHeartbeat: options.onDeviceHeartbeat,
    };
  }, [options.onNewUser, options.onNewName, options.onNewVoice, options.onUserLeft, options.onDeviceHeartbeat]);

  useEffect(() => {
    let mounted = true;
    let detachHardReset = () => {};

    // Warm up API route so the Socket.IO server is ready when we connect.
    fetch('/api/socket').catch(() => {});

    const s = io({ path: SOCKET_CONFIG.PATH, transports: SOCKET_CONFIG.TRANSPORTS });
    socketRef.current = s;
    setSocket(s);
    detachHardReset = attachHardReset(s);

    const handleConnect = () => {
      if (!mounted) return;
      setStatus('connected');
      s.emit('controller-init');
    };

    const handleDisconnect = () => {
      if (!mounted) return;
      setStatus('disconnected');
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    // Optional controller event listeners
    const handleNewUser = (payload) => handlersRef.current.onNewUser?.(payload);
    const handleNewName = (payload) => handlersRef.current.onNewName?.(payload);
    const handleNewVoice = (payload) => handlersRef.current.onNewVoice?.(payload);
    const handleUserLeft = (payload) => handlersRef.current.onUserLeft?.(payload);
    const handleDeviceHeartbeat = (payload) => handlersRef.current.onDeviceHeartbeat?.(payload);

    s.on(EV.CONTROLLER_NEW_USER, handleNewUser);
    s.on(EV.CONTROLLER_NEW_NAME, handleNewName);
    s.on(EV.CONTROLLER_NEW_VOICE, handleNewVoice);
    s.on(EV.CONTROLLER_USER_LEFT, handleUserLeft);
    s.on('device-heartbeat', handleDeviceHeartbeat);

    return () => {
      mounted = false;
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off(EV.CONTROLLER_NEW_USER, handleNewUser);
      s.off(EV.CONTROLLER_NEW_NAME, handleNewName);
      s.off(EV.CONTROLLER_NEW_VOICE, handleNewVoice);
      s.off(EV.CONTROLLER_USER_LEFT, handleUserLeft);
      s.off('device-heartbeat', handleDeviceHeartbeat);
      s.close();
      socketRef.current = null;
      setSocket(null);
      setStatus('disconnected');
      detachHardReset();
    };
  }, []);

  const emit = useCallback((event, payload) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const ensureConnected = useCallback((timeoutMs = 2500) => {
    const s = socketRef.current;
    if (!s) return Promise.reject(new Error('socket not initialized'));
    if (s.connected) return Promise.resolve(true);
    try {
      // start reconnect
      s.connect();
    } catch {}
    return new Promise((resolve, reject) => {
      let done = false;
      const t = setTimeout(() => {
        if (done) return;
        done = true;
        reject(new Error('connect timeout'));
      }, timeoutMs);
      const onConnect = () => {
        if (done) return;
        done = true;
        clearTimeout(t);
        resolve(true);
      };
      s.once('connect', onConnect);
    });
  }, []);

  const emitWithAck = useCallback((event, payload, { timeoutMs = 1200 } = {}) => {
    const s = socketRef.current;
    if (!s) return Promise.reject(new Error('socket not initialized'));
    return new Promise((resolve, reject) => {
      let done = false;
      const t = setTimeout(() => {
        if (done) return;
        done = true;
        reject(new Error('ack timeout'));
      }, timeoutMs);
      try {
        s.emit(event, payload, (ack) => {
          if (done) return;
          done = true;
          clearTimeout(t);
          resolve(ack);
        });
      } catch (e) {
        if (done) return;
        done = true;
        clearTimeout(t);
        reject(e);
      }
    });
  }, []);

  // Hard reset with reliability:
  // - warms /api/socket (ensures server io exists)
  // - ensures socket is connected
  // - emits with ACK and retries
  // - falls back to HTTP broadcast if socket path fails
  const hardResetAll = useCallback(async () => {
    const now = Date.now();
    const payload = { uuid: `hard-reset-${now}`, ts: now, source: 'controller' };

    // Warm server instance (important in production after controller reload)
    try {
      await fetch('/api/socket', { cache: 'no-store' });
    } catch {}

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await ensureConnected(3000);
        const ack = await emitWithAck(EV.HARD_RESET, payload, { timeoutMs: 1500 });
        if (ack && ack.ok) return { ok: true, via: 'socket', ack, attempt };
        // If server didn't ack properly, treat as failure and retry
        throw new Error('ack not ok');
      } catch (e) {
        // Backoff a bit and retry
        const backoff = 250 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    // Final fallback: HTTP broadcast (uses server io if already initialized)
    try {
      const res = await fetch('/api/hard-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
        keepalive: true,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) return { ok: true, via: 'http', data };
      return { ok: false, via: 'http', data };
    } catch (e) {
      return { ok: false, via: 'http', error: e?.message || String(e) };
    }
  }, [ensureConnected, emitWithAck]);

  const updateHandlers = useMemo(() => (next) => {
    handlersRef.current = { ...handlersRef.current, ...next };
  }, []);

  return { socket, status, emit, emitWithAck, ensureConnected, hardResetAll, updateHandlers };
}

