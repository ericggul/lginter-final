# Philips Hue Integration

Feature toggle via `HUE_ENABLED`. When disabled, server skips Hue calls but continues broadcasting socket events.

## Environment
Copy `docs/hue.env.example` to `.env.local` in project root and fill values:

- `HUE_ENABLED=true`
- `HUE_BRIDGE_IP=192.168.0.xxx`
- `HUE_USERNAME=your-bridge-username`
- `HUE_LIGHT_IDS=1,2,3` (optional)
- `HUE_GROUP_ID=1` (optional, overrides light IDs)

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


