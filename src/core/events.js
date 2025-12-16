// Core event names (spec-compliant)
// Keep a single source of truth for events across client and server

export const EV = {
  // Mobile → Server
  MOBILE_NEW_USER: "mobile-new-user",
  MOBILE_NEW_NAME: "mobile-new-name",
  MOBILE_NEW_VOICE: "mobile-new-voice",
  // Mobile → Server (explicit leave so controller count drops immediately)
  MOBILE_EXIT: "mobile-exit",

  // Controller → Server
  CONTROLLER_NEW_DECISION: "controller-new-decision",
  CONTROLLER_NEW_NAME: "controller-new-name",
  CONTROLLER_NEW_VOICE: "controller-new-voice",

  // Server → Controller
  CONTROLLER_NEW_USER: "controller-new-user",
  CONTROLLER_USER_LEFT: "controller-user-left",

  // Server → LivingRoom (broadcast)
  // Canonical server emission for device updates
  DEVICE_DECISION: "device-decision",
  // Backward-compat alias (to be removed after client migration)
  DEVICE_NEW_DECISION: "device-new-decision",
  DEVICE_NEW_VOICE: "device-new-voice",

  // SW2 → Server (lighting)
  SW2_LIGHT_COLOR: "sw2-light-color",
  // Server → clients ack/notification
  LIGHT_APPLIED: "light-applied",

  // Global Timeline / Orchestrator control
  TIMELINE_STAGE: "timeline-stage",
  ORCHESTRATOR_TIMEOUT: "orchestrator-timeout",

  // Server → Entrance (broadcast)
  ENTRANCE_NEW_USER: "entrance-new-user",
  ENTRANCE_NEW_NAME: "entrance-new-name",
  ENTRANCE_USER_LEFT: "entrance-user-left",

  // Server → Mobile (targeted to user room)
  MOBILE_NEW_DECISION: "mobile-new-decision",

  // Init
  INIT_MOBILE: "mobile-init",
  INIT_ENTRANCE: "entrance-init",
  INIT_LIVINGROOM: "livingroom-init",
  INIT_CONTROLLER: "controller-init",

  // Admin hard reset (full page reload on all devices)
  HARD_RESET: "hard-reset",
};


