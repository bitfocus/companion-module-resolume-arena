// Copy this file to config.ts and adjust for your local Resolume setup.
// config.ts is gitignored.
// Use 127.0.0.1 explicitly — 'localhost' may resolve to IPv6 (::1) on modern Node
export const TEST_HOST = process.env.RESOLUME_HOST ?? '127.0.0.1'

// Resolume REST API port (Preferences > Web Server)
export const REST_PORT = +(process.env.RESOLUME_REST_PORT ?? 8080)

// Port Resolume is listening on for incoming OSC (Preferences > OSC > Input)
export const OSC_SEND_PORT = +(process.env.RESOLUME_OSC_SEND_PORT ?? 7000)

// Local port the integration test listens on for Resolume's OSC output.
export const OSC_LISTEN_PORT = +(process.env.RESOLUME_OSC_LISTEN_PORT ?? 9001)

// Layer / column used for write/trigger tests. Must exist and have a clip loaded.
export const TEST_LAYER = +(process.env.RESOLUME_TEST_LAYER ?? 1)
export const TEST_COLUMN = +(process.env.RESOLUME_TEST_COLUMN ?? 1)
export const TEST_GROUP = +(process.env.RESOLUME_TEST_GROUP ?? 1)
export const TEST_GROUP_LAYER = +(process.env.RESOLUME_TEST_GROUP_LAYER ?? 2)
