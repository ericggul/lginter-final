## Cursor Global Rules (lginter-final)

This document is the global source of truth for stage naming, timing, and socket event names across server and clients. It exists in the repo so everyone, including tools, uses the exact same names.

### Timeline

- t1 — welcome
- t2 — Voice Start
- t3 — Voice Input
- t4 — Orchestrated
- t5 — Result

Default durations (tunable via `.env.local`):

- t1 → t2: 6000 ms (`T1_TO_T2_MS`)
- t2 → t3: user action (press voice)
- t3 → t4: 6500 ms fallback (`T3_TO_T4_MS`) — actual decision may arrive earlier
- t4 → t5: 8000 ms (`T4_TO_T5_MS`)

The code-level source of truth lives in `src/core/timeline.js` with:

- `STAGES` enum (`welcome`, `voiceStart`, `voiceInput`, `orchestrated`, `result`)
- `DURATIONS` object
- `buildStagePayload(stage, meta)`
- `createTimelineScheduler()` helper used by the server

The server broadcasts stage changes on `timeline-stage` to both `entrance` and `livingroom` rooms.

### Socket Event Names

Canonical events (see `src/core/events.js`):

- Mobile → Server:
  - `mobile-new-user`
  - `mobile-new-name`
  - `mobile-new-voice`
- Controller → Server:
  - `controller-new-decision`
- Server → Devices:
  - `device-decision` (canonical)
  - `device-new-decision` (temporary alias for backward compatibility)
  - `device-new-voice`
  - `light-applied`
  - `timeline-stage`
- Server → Entrance:
  - `entrance-new-user`
  - `entrance-new-name`
- Server → Mobile (to user room):
  - `mobile-new-decision`

### Architecture

- Use Next.js API route only (`pages/api/socket.js`) for Socket.IO.
- No separate servers.
- Socket URL must be host-detected on clients.
- Environment variables belong in `.env.local` and must not be committed. A template lives in `.env.local.example`.


