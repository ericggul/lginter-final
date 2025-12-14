# Philips Hue Integration

Feature toggle via `HUE_ENABLED`. When disabled, server skips Hue calls but continues broadcasting socket events.

## Environment
Copy `docs/hue.env.example` to `.env.local` in project root and fill values:

- `HUE_ENABLED=true`
- `HUE_BRIDGE_IP=192.168.0.xxx`
- `HUE_USERNAME=your-bridge-username`
- `HUE_LIGHT_IDS=1,2,3` (optional)
- `HUE_GROUP_ID=1` (optional, overrides light IDs)

## Remote control from Render (Hue Remote API)
Render cannot reach your home bridge IP (e.g. `192.168.x.x`). To control Hue **directly from Render**, use the Hue Remote API:

- Set `HUE_ENABLED=true`
- Set `HUE_REMOTE_ENABLED=true`
- Set `HUE_USERNAME=<your-bridge-username/id>`
- Set `HUE_CLIENT_ID`, `HUE_CLIENT_SECRET`, `HUE_REDIRECT_URL`
- Exchange auth code for tokens via `/hue-token` (UI) which calls `POST /api/hue/token`
- Store `HUE_ACCESS_TOKEN` + `HUE_REFRESH_TOKEN` in Render env

### Refreshing tokens
Hue may rotate refresh tokens. This repo includes:
- `POST /api/hue/refresh` (protected) to refresh and return the latest tokens.
  - Requires `HUE_ADMIN_TOKEN`
  - Send header `x-hue-admin-token: <HUE_ADMIN_TOKEN>`
  - Update Render env vars with the returned `access_token` and `refresh_token`

## Usage (runtime)
- Controller decision with `params.lightColor` applies to Hue automatically.
- SW2 can emit direct color:
  ```js
  emitLightColor('#FF8800', { transitionMs: 700 });
  ```

## Test notes
1. Start dev server, ensure `/api/socket` is warmed by clients.
2. With `HUE_ENABLED=true` and valid bridge settings, trigger a decision containing `lightColor`.
3. Observe bulbs change and clients receiving `light-applied` ack.
4. Set `HUE_ENABLED=false` to disable hardware control for local demos.


